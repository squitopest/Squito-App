import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getErrorMessage } from "@/lib/errors";

// ── Service-role Supabase client (bypasses RLS — server-only) ───────────────
function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── NYS Sales Tax by county ─────────────────────────────────────────────────
// NYS base 4% + county rates
const COUNTY_TAX: Record<string, number> = {
  nassau:  0.0825,  // 8.25%
  suffolk: 0.08625, // 8.625%
};
const DEFAULT_NY_TAX = 0.08; // fallback NYC/other NY = 8%

export function detectCountyTax(address: string): { county: string; rate: number } {
  const lower = address.toLowerCase();
  if (lower.includes("nassau") || /\b(garden city|hempstead|long beach|great neck|mineola|valley stream|freeport|oceanside|lynbrook|malverne|rockville centre|hewlett|merrick|bellmore|wantagh|seaford|massapequa|levittown|hicksville|syosset|plainview|farmingdale|bethpage|westbury|new hyde park|floral park|elmont|uniondale|east meadow|franklin square|north valley stream)\b/.test(lower)) {
    return { county: "Nassau", rate: COUNTY_TAX.nassau };
  }
  if (lower.includes("suffolk") || /\b(brentwood|central islip|bay shore|islip|patchogue|riverhead|smithtown|hauppauge|commack|north babylon|babylon|west babylon|deer park|amityville|lindenhurst|copiague|huntington|melville|bethpage|bohemia|ronkonkoma|holbrook|lake grove|stony brook|port jefferson|setauket|centereach|coram|middle island|ridge|moriches|hampton bays|southampton|east hampton|montauk|greenport|cutchogue|mattituck|shelter island)\b/.test(lower)) {
    return { county: "Suffolk", rate: COUNTY_TAX.suffolk };
  }
  return { county: "NY", rate: DEFAULT_NY_TAX };
}

export function calculateTax(priceUSD: number, address: string): {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  county: string;
} {
  const { county, rate } = detectCountyTax(address);
  const taxAmount = Math.round(priceUSD * rate * 100) / 100;
  return {
    subtotal: priceUSD,
    taxAmount,
    total: Math.round((priceUSD + taxAmount) * 100) / 100,
    taxRate: rate,
    county,
  };
}

// ── Points per service ───────────────────────────────────────────────────────
function determinePoints(serviceName: string): number {
  if (!serviceName) return 50;
  const svc = serviceName.toLowerCase();
  // Plans — monthly: earn points every payment cycle
  if (svc.includes("ultimate") && svc.includes("monthly")) return 200;
  if (svc.includes("premium") && svc.includes("monthly")) return 125;
  if ((svc.includes("essential") || svc.includes("plan")) && svc.includes("monthly")) return 75;
  // Plans — yearly: bulk point bonus upfront
  if (svc.includes("ultimate") && svc.includes("yearly")) return 2100;
  if (svc.includes("premium") && svc.includes("yearly")) return 1350;
  if ((svc.includes("essential") || svc.includes("plan")) && svc.includes("yearly")) return 800;
  // One-time services
  if (svc.includes("hornet") || svc.includes("wasp")) return 150;
  if (svc.includes("general") || svc.includes("property")) return 125;
  if (svc.includes("termite")) return 100;
  if (svc.includes("mosquito") || svc.includes("tick")) return 75;
  if (svc.includes("free estimate") || svc.includes("quote")) return 0;
  return 50;
}

// ── Tier multiplier lookup (mirrors pointsEngine.ts) ────────────────────────
function getTierMultiplier(totalPoints: number): { multiplier: number; tier: string } {
  if (totalPoints >= 1000) return { multiplier: 2,    tier: "Elite" };
  if (totalPoints >= 500)  return { multiplier: 1.5,  tier: "Gold" };
  if (totalPoints >= 250)  return { multiplier: 1.25, tier: "Silver" };
  return                          { multiplier: 1,    tier: "Starter" };
}

interface BookingCoordinates {
  lat: number;
  lng: number;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  userId?: string | null;
  county?: string | null;
  taxRate?: number | null;
  subtotal?: string | number | null;
  taxAmount?: string | number | null;
  totalCharged?: string | number | null;
  discountCents?: number | null;
  isPaid?: boolean;
  isStripeWebhook?: boolean;
  coordinates?: BookingCoordinates | null;
}

export interface CartBookingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredDate?: string | null;
  preferredTime?: string | null;
  userId?: string | null;
  county?: string | null;
  taxRate?: number | null;
  subtotal?: string | number | null;
  taxAmount?: string | number | null;
  totalCharged?: string | number | null;
  discountCents?: number | null;
  isPaid?: boolean;
  isStripeWebhook?: boolean;
  coordinates?: BookingCoordinates | null;
}

interface CartBookingItem {
  service: string;
  priceCents: number;
  points: number;
}

// ── Main processBooking ──────────────────────────────────────────────────────
export async function processBooking(data: BookingData) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const supabase = getServiceSupabase();

  if (!resendApiKey) {
    console.error("[BookingEngine] RESEND_API_KEY not found.");
    return { ok: true, notice: "Logged locally" };
  }

  const resend = new Resend(resendApiKey);

  try {
    // ── 3. Write to service_bookings ────────────────────────────────────────
    const userId = data.userId;
    if (supabase && userId && typeof userId === "string" && userId.length > 0) {
      const { error: bookingErr } = await supabase.from("service_bookings").insert({
        user_id: userId,
        service_type: data.service,
        status: "scheduled",
        scheduled_date: data.preferredDate || null,
        notes: [
          data.preferredTime ? `Time: ${data.preferredTime}` : null,
          data.address ? `Address: ${data.address}` : null,
          data.county ? `County: ${data.county} (${((data.taxRate || 0) * 100).toFixed(3)}% tax)` : null,
          data.isPaid ? `Paid via Stripe — $${data.totalCharged}` : "Free Estimate",
        ].filter(Boolean).join(" | "),
      });
      if (bookingErr) console.error("[BookingEngine] service_bookings insert failed:", bookingErr.message);
    }

    // ── 4. CRM Integration (Zapier / GorillaDesk) ───────────────────────────
    const zapierWebhook = process.env.ZAPIER_WEBHOOK_URL;
    const gorillaDeskApiKey = process.env.GORILLADESK_API_KEY;
    
    // Formatting the lead payload
    const leadPayload = {
      first_name: data.name.split(" ")[0] || data.name,
      last_name: data.name.split(" ").slice(1).join(" ") || "",
      email: data.email,
      phone: data.phone,
      address: data.address,
      service: data.service,
      source: "app_booking",
      notes: `Service: ${data.service} | Date: ${data.preferredDate || "TBD"} ${data.preferredTime || ""} | County: ${data.county || "?"} | Tax: $${data.taxAmount ?? "?"} | Total: $${data.totalCharged ?? "?"} | ${data.isPaid ? "PAID via App" : "Free Estimate"}`,
    };

    if (zapierWebhook) {
      try {
        const zapierResponse = await fetch(zapierWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPayload),
        });
        if (!zapierResponse.ok) console.error("[Zapier]", zapierResponse.status);
      } catch (e) {
        console.error("[Zapier Error]", e);
      }
    } else if (gorillaDeskApiKey) {
      try {
        const gdResponse = await fetch("https://app.gorilladesk.com/api/v1/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${gorillaDeskApiKey}` },
          body: JSON.stringify(leadPayload),
        });
        if (!gdResponse.ok) console.error("[GorillaDesk]", gdResponse.status, await gdResponse.text());
      } catch (e) { console.error("[GorillaDesk Error]", e); }
    }

    // ── 5. Award PestPoints ────────────────────────────────────────────────
    let pointsAwarded = false;
    let earnedAmount = 0;

    if (supabase && data.isPaid && userId && typeof userId === "string" && userId.length > 0) {
      const basePoints = determinePoints(data.service);
      if (basePoints > 0) {
        try {
          // Dedup check (60s window)
          const cutoff = new Date(Date.now() - 60_000).toISOString();
          const { data: recentTx } = await supabase
            .from("points_transactions")
            .select("id")
            .eq("user_id", userId)
            .eq("reason", "Booked a service")
            .eq("type", "earn")
            .gte("created_at", cutoff)
            .limit(1);

          if (recentTx && recentTx.length > 0) {
            console.warn("[Points] Duplicate booking points award blocked within the dedupe window.");
          } else {
            // Get profile with service role (bypasses RLS)
            const { data: profile } = await supabase
              .from("profiles")
              .select("total_points, redeemable_points")
              .eq("id", userId)
              .single();

            if (profile) {
              const { multiplier, tier } = getTierMultiplier(profile.total_points || 0);
              const multiplied = Math.round(basePoints * multiplier);
              const newTotal = (profile.total_points || 0) + multiplied;
              const newRedeemable = (profile.redeemable_points ?? profile.total_points ?? 0) + multiplied;

              await supabase.from("points_transactions").insert({
                user_id: userId,
                amount: multiplied,
                type: "earn",
                reason: "Booked a service",
                metadata: { base_amount: basePoints, multiplier, tier_at_earn: tier, service: data.service, source: "stripe_webhook" },
              });

              await supabase.from("profiles").update({
                total_points: newTotal,
                redeemable_points: newRedeemable,
                tier: getTierMultiplier(newTotal).tier,
                updated_at: new Date().toISOString(),
              }).eq("id", userId);

              pointsAwarded = true;
              earnedAmount = multiplied;
            }
          }
        } catch (e) { console.error("[Points Error]", e); }
      }
    }

    // ── 6. Send Confirmation Emails (Resend) ───────────────────────────────
    try {

        // A. Customer Confirmation Email
        await resend.emails.send({
          from: "Squito <service@squitopestcontrol.com>",
          to: data.email,
          subject: data.isPaid ? "Payment Verified & Service Scheduled" : "Squito Estimate Request Received",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6a9c1e;">${data.isPaid ? "You're all set!" : "Waitlist Confirmed"}</h2>
              <p>Hi ${data.name.split(" ")[0]},</p>
              <p>${data.isPaid ? "Your payment was successful and your service is officially booked." : "We've received your request for a free estimate."}</p>
              
              <div style="background-color: #f7fbe8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Service Details</h3>
                <p><strong>Service:</strong> ${data.service}</p>
                <p><strong>Address:</strong> ${data.address}</p>
                ${data.preferredDate ? `<p><strong>Preferred:</strong> ${data.preferredDate} ${data.preferredTime ? `at ${data.preferredTime}` : ""}</p>` : ""}
                ${data.isPaid && data.totalCharged ? `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <p><strong>Subtotal:</strong> $${data.subtotal}</p>
                    <p><strong>${data.county} County Tax:</strong> $${data.taxAmount}</p>
                    <p><strong>Total Charged:</strong> $${data.totalCharged}</p>
                    ${pointsAwarded ? `<p style="color: #6a9c1e; font-weight: bold; margin-top: 10px;">🎁 You earned ${earnedAmount} PestPoints!</p>` : ""}
                  </div>
                ` : ""}
              </div>
              
              <p>Our team will reach out shortly. If you have questions, reply directly to this email or call (631) 203-1000.</p>
              <p>Best regards,<br>The Squito Team</p>
            </div>
          `,
        });

        // B. Admin Notification Email
        await resend.emails.send({
          from: "Squito App <app@squitopestcontrol.com>",
          to: "service@getsquito.com",
          subject: `New ${data.isPaid ? "PAID BOOKING" : "Estimate Lead"}: ${data.service}`,
          html: `
            <h2>New Request via App</h2>
            <p><strong>Customer:</strong> ${data.name}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Service:</strong> ${data.service}</p>
            <p><strong>Status:</strong> ${data.isPaid ? `PAID ($${data.totalCharged})` : "FREE ESTIMATE"}</p>
            ${pointsAwarded ? `<p><strong>Points Awarded:</strong> ${earnedAmount}</p>` : ""}
          `,
        });
    } catch (emailErr: unknown) {
      console.error("[Email Error] Failed to send Resend emails:", emailErr);
    }

    return { ok: true, pointsAwarded, earnedAmount, isPaid: data.isPaid };
  } catch (err: unknown) {
    console.error("[BookingEngine]", err);
    return { ok: false, error: getErrorMessage(err, "Failed to process booking") };
  }
}

// ── Cart order processing ────────────────────────────────────────────────────
// Handles multi-service cart orders: creates N booking rows, awards points per
// service, pushes to CRM once, sends one combined confirmation email.
export async function processCartBooking(
  data: CartBookingData,
  cartItems: CartBookingItem[]
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const supabase = getServiceSupabase();

  if (!resendApiKey) {
    console.error("[BookingEngine] RESEND_API_KEY not found.");
    return { ok: true, notice: "Logged locally" };
  }

  const resend = new Resend(resendApiKey);
  const userId = data.userId;
  const serviceNames = cartItems.map((i) => i.service.replace(/\s*\(.*\)$/, ""));

  try {
    // ── 1. Write service_bookings rows (one per service) ──────────────────
    if (supabase && userId && typeof userId === "string" && userId.length > 0) {
      for (const item of cartItems) {
        const { error: bookingErr } = await supabase.from("service_bookings").insert({
          user_id: userId,
          service_type: item.service,
          status: "scheduled",
          scheduled_date: data.preferredDate || null,
          notes: [
            data.preferredTime ? `Time: ${data.preferredTime}` : null,
            data.address ? `Address: ${data.address}` : null,
            data.county ? `County: ${data.county} (${((data.taxRate || 0) * 100).toFixed(3)}% tax)` : null,
            `Cart order — $${(item.priceCents / 100).toFixed(2)} | Total: $${data.totalCharged}`,
          ].filter(Boolean).join(" | "),
        });
        if (bookingErr) console.error(`[BookingEngine] service_bookings insert failed for ${item.service}:`, bookingErr.message);
      }
    }

    // ── 2. CRM Integration (Zapier / GorillaDesk) — one push with all services ──
    const zapierWebhook = process.env.ZAPIER_WEBHOOK_URL;
    const gorillaDeskApiKey = process.env.GORILLADESK_API_KEY;

    const leadPayload = {
      first_name: data.name.split(" ")[0] || data.name,
      last_name: data.name.split(" ").slice(1).join(" ") || "",
      email: data.email,
      phone: data.phone,
      address: data.address,
      service: serviceNames.join(", "),
      source: "app_cart_booking",
      notes: `Cart Order: ${serviceNames.join(", ")} | Date: ${data.preferredDate || "TBD"} ${data.preferredTime || ""} | County: ${data.county || "?"} | Tax: $${data.taxAmount ?? "?"} | Total: $${data.totalCharged ?? "?"} | PAID via App`,
    };

    if (zapierWebhook) {
      try {
        const zapierResponse = await fetch(zapierWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPayload),
        });
        if (!zapierResponse.ok) console.error("[Zapier]", zapierResponse.status);
      } catch (e) {
        console.error("[Zapier Error]", e);
      }
    } else if (gorillaDeskApiKey) {
      try {
        const gdResponse = await fetch("https://app.gorilladesk.com/api/v1/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${gorillaDeskApiKey}` },
          body: JSON.stringify(leadPayload),
        });
        if (!gdResponse.ok) console.error("[GorillaDesk]", gdResponse.status, await gdResponse.text());
      } catch (e) { console.error("[GorillaDesk Error]", e); }
    }

    // ── 3. Award PestPoints per service ───────────────────────────────────
    let totalPointsAwarded = 0;
    const pointsBreakdown: Array<{ service: string; earned: number }> = [];

    if (supabase && data.isPaid && userId && typeof userId === "string" && userId.length > 0) {
      for (const item of cartItems) {
        const basePoints = item.points || determinePoints(item.service);
        if (basePoints <= 0) continue;

        try {
          // Get current profile for tier multiplier
          const { data: profile } = await supabase
            .from("profiles")
            .select("total_points, redeemable_points")
            .eq("id", userId)
            .single();

          if (profile) {
            const { multiplier, tier } = getTierMultiplier(profile.total_points || 0);
            const multiplied = Math.round(basePoints * multiplier);
            const newTotal = (profile.total_points || 0) + multiplied;
            const newRedeemable = (profile.redeemable_points ?? profile.total_points ?? 0) + multiplied;

            // Use the service name as a unique reason for dedup purposes
            await supabase.from("points_transactions").insert({
              user_id: userId,
              amount: multiplied,
              type: "earn",
              reason: `Booked: ${item.service.replace(/\s*\(.*\)$/, "")}`,
              metadata: {
                base_amount: basePoints,
                multiplier,
                tier_at_earn: tier,
                service: item.service,
                source: "stripe_webhook_cart",
              },
            });

            await supabase.from("profiles").update({
              total_points: newTotal,
              redeemable_points: newRedeemable,
              tier: getTierMultiplier(newTotal).tier,
              updated_at: new Date().toISOString(),
            }).eq("id", userId);

            totalPointsAwarded += multiplied;
            pointsBreakdown.push({ service: item.service.replace(/\s*\(.*\)$/, ""), earned: multiplied });
          }
        } catch (e) {
          console.error(`[Points Error] Failed for ${item.service}:`, e);
        }
      }
    }

    // ── 4. Send combined confirmation emails ─────────────────────────────
    try {
      // Build service line items HTML
      const serviceRowsHtml = cartItems.map((item) => {
        const pointsForService = pointsBreakdown.find(
          (p) => p.service === item.service.replace(/\s*\(.*\)$/, "")
        );
        return `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <strong>${item.service.replace(/\s*\(.*\)$/, "")}</strong>
              ${pointsForService ? `<br/><span style="color: #6a9c1e; font-size: 12px;">+${pointsForService.earned} PestPoints</span>` : ""}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
              $${(item.priceCents / 100).toFixed(2)}
            </td>
          </tr>
        `;
      }).join("");

      const discountCents = data.discountCents || 0;

      // A. Customer Confirmation Email
      await resend.emails.send({
        from: "Squito <service@squitopestcontrol.com>",
        to: data.email,
        subject: "Payment Verified & Services Scheduled",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6a9c1e;">You're all set!</h2>
            <p>Hi ${data.name.split(" ")[0]},</p>
            <p>Your payment was successful and your ${cartItems.length} services are officially booked.</p>
            
            <div style="background-color: #f7fbe8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Services Booked</h3>
              <p><strong>Address:</strong> ${data.address}</p>
              ${data.preferredDate ? `<p><strong>Preferred:</strong> ${data.preferredDate} ${data.preferredTime ? `at ${data.preferredTime}` : ""}</p>` : ""}
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #6a9c1e;">Service</th>
                    <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #6a9c1e;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${serviceRowsHtml}
                </tbody>
              </table>
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                ${discountCents > 0 ? `<p><strong>🎁 PestPoints Discount:</strong> -$${(discountCents / 100).toFixed(2)}</p>` : ""}
                <p><strong>${data.county} County Tax:</strong> $${data.taxAmount}</p>
                <p style="font-size: 18px;"><strong>Total Charged:</strong> $${data.totalCharged}</p>
                ${totalPointsAwarded > 0 ? `<p style="color: #6a9c1e; font-weight: bold; margin-top: 10px;">🎁 You earned ${totalPointsAwarded} PestPoints total!</p>` : ""}
              </div>
            </div>
            
            <p>Our team will reach out shortly. If you have questions, reply directly to this email or call (631) 203-1000.</p>
            <p>Best regards,<br>The Squito Team</p>
          </div>
        `,
      });

      // B. Admin Notification Email
      await resend.emails.send({
        from: "Squito App <app@squitopestcontrol.com>",
        to: "service@getsquito.com",
        subject: `New PAID CART ORDER: ${serviceNames.join(", ")}`,
        html: `
          <h2>New Cart Order via App (${cartItems.length} services)</h2>
          <p><strong>Customer:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Address:</strong> ${data.address}</p>
          <p><strong>Services:</strong></p>
          <ul>${serviceNames.map((s) => `<li>${s}</li>`).join("")}</ul>
          <p><strong>Status:</strong> PAID ($${data.totalCharged})</p>
          ${totalPointsAwarded > 0 ? `<p><strong>Points Awarded:</strong> ${totalPointsAwarded}</p>` : ""}
        `,
      });
    } catch (emailErr: unknown) {
      console.error("[Email Error] Failed to send cart confirmation emails:", emailErr);
    }

    return { ok: true, totalPointsAwarded, pointsBreakdown, isPaid: true };
  } catch (err: unknown) {
    console.error("[BookingEngine] Cart processing error:", err);
    return { ok: false, error: getErrorMessage(err, "Failed to process cart booking") };
  }
}
