import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { calculateTax } from "@/lib/bookingEngine";

// Service ID → price in cents (Stripe uses cents)
const SERVICE_PRICES: Record<string, number> = {
  "Mosquito Barrier Spray ($119)": 11900,
  "Organic Mosquito & Tick Treatment ($99)": 9900,
  "Tick Treatment ($99)": 9900,
  "General & Full Property Pest Control ($299)": 29900,
  "Hornet & Wasp Removal ($349)": 34900,
  "Termite Inspection ($199)": 19900,
  "Free Estimate / Custom Quote": 0,
  // Plans — monthly
  "Essential Defense (monthly)": 4999,
  "Premium Shield (monthly)": 7999,
  "Ultimate Fortress (monthly)": 12999,
  // Plans — yearly
  "Essential Defense (yearly)": 53989,
  "Premium Shield (yearly)": 86389,
  "Ultimate Fortress (yearly)": 140389,
};

export async function POST(request: Request) {
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, address, service, preferredDate, preferredTime, coordinates, userId, discountCents, redemptionId } = body;

  if (!name || !email || !phone || !address || !service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Free estimates don't need payment
  if (service === "Free Estimate / Custom Quote") {
    return NextResponse.json({ free: true });
  }

  const priceInCents = SERVICE_PRICES[service];
  if (!priceInCents) {
    return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
  }

  // ── Server-side discount validation ──
  // NEVER trust the client's discountCents — always verify against the database.
  let validDiscount = 0;
  let verifiedRedemptionId = "";

  if (redemptionId && userId) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: redemption } = await supabaseAdmin
        .from("redemptions")
        .select("id, user_id, discount_cents, status, expires_at")
        .eq("id", redemptionId)
        .eq("user_id", userId)         // must belong to this user
        .eq("status", "pending")       // must not be already used
        .gt("expires_at", new Date().toISOString()) // must not be expired
        .single();

      if (redemption && redemption.discount_cents > 0) {
        // Use the DATABASE value — not the client's claimed amount
        validDiscount = Math.min(redemption.discount_cents, priceInCents);
        verifiedRedemptionId = redemption.id;
        console.log(`[Checkout] Verified discount: ${validDiscount} cents for user ${userId}`);
      } else {
        console.warn(`[Checkout] Discount rejected — invalid/expired/used redemption ${redemptionId}`);
      }
    } catch (err) {
      console.error("[Checkout] Discount validation error:", err);
      // Fail safe — charge full price if validation errors
    }
  }

  const discountedPriceInCents = priceInCents - validDiscount;

  // Calculate NYS county-level sales tax on the DISCOUNTED price
  const priceUSD = discountedPriceInCents / 100;
  const tax = calculateTax(priceUSD, address);
  const taxInCents = Math.round(tax.taxAmount * 100);

  try {
    const stripe = getStripe();

    // In Native iOS Capacitor, origin is capacitor://localhost — lock to Vercel
    let origin = request.headers.get("origin") || "https://squito-app.vercel.app";
    if (origin.includes("capacitor://")) {
      origin = "https://squito-app.vercel.app";
    }

    // Build line items
    const line_items: any[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: service.replace(/\s*\(.*\)$/, ""),
            description: `Service at ${address}${preferredDate ? ` on ${preferredDate}` : ""}${preferredTime ? ` at ${preferredTime}` : ""}`,
          },
          unit_amount: discountedPriceInCents,
        },
        quantity: 1,
      },
    ];

    // Show the PestPoints discount as a visible $0 line item for transparency
    if (validDiscount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "🎁 PestPoints Discount Applied",
            description: `$${(validDiscount / 100).toFixed(2)} off — redeemed from your PestPoints balance`,
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    }

    // Add tax as a separate transparent line item
    if (taxInCents > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tax.county} County Sales Tax (${(tax.taxRate * 100).toFixed(3)}%)`,
            description: "New York State + local sales tax",
          },
          unit_amount: taxInCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items,
      // Store all booking + tax + discount data in metadata for webhook processing
      metadata: {
        name,
        email,
        phone,
        address,
        service,
        preferredDate: preferredDate || "",
        preferredTime: preferredTime || "",
        userId: userId || "",
        coordinates: coordinates ? JSON.stringify(coordinates) : "",
        county: tax.county,
        taxRate: String(tax.taxRate),
        subtotal: String(priceUSD),
        taxAmount: String(tax.taxAmount),
        totalCharged: String(tax.total),
        // Discount tracking — used by success page to mark redemption as "used"
        discountCents: String(validDiscount),
        originalPriceCents: String(priceInCents),
        redemptionId: verifiedRedemptionId,
      },
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?cancelled=true`,
    });

    return NextResponse.json({ url: session.url, tax });
  } catch (err: any) {
    console.error("[Stripe Checkout Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

