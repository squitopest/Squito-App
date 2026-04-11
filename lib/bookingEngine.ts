import { Resend } from "resend";
import { awardPoints } from "@/lib/pointsEngine";

function determinePoints(serviceName: string): number {
  if (!serviceName) return 50;
  const svc = serviceName.toLowerCase();
  
  if (svc.includes("ultimate")) return 300;
  if (svc.includes("premium")) return 200;
  if (svc.includes("essential") || svc.includes("plan")) return 150;
  
  if (svc.includes("hornet") || svc.includes("wasp")) return 150;
  if (svc.includes("general") || svc.includes("property")) return 125;
  if (svc.includes("termite")) return 100;
  if (svc.includes("mosquito") || svc.includes("tick")) return 75;
  
  if (svc.includes("free estimate") || svc.includes("quote")) return 0;
  
  return 50;
}

export async function processBooking(data: Record<string, any>) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not found. Logging booking to console:");
    console.log(data);
    return { ok: true, notice: "Logged locally" };
  }

  const resend = new Resend(resendApiKey);

  try {
    // 1. Send Email Notification to Squito Admin
    await resend.emails.send({
      from: "Squito App <onboarding@resend.dev>",
      to: "service@getsquito.com",
      subject: `New App Booking: ${data.service}`,
      html: `
        <h2 style="color: #6B9E11;">New Booking Request from App</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        ${data.coordinates ? `<p><strong>GPS:</strong> <a href="https://maps.google.com/?q=${data.coordinates.lat},${data.coordinates.lng}">${data.coordinates.lat.toFixed(6)}, ${data.coordinates.lng.toFixed(6)}</a></p>` : ''}
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Preferred Date:</strong> ${data.preferredDate || 'Not specified'}</p>
        <p><strong>Preferred Time:</strong> ${data.preferredTime || 'Not specified'}</p>
        <p><strong>Payment:</strong> ${data.isPaid ? '✅ Paid via Stripe' : '🆓 Free Estimate Request'}</p>
      `,
    });

    // 2. Send Confirmation Email to Customer
    await resend.emails.send({
      from: "Squito Pest Control <onboarding@resend.dev>",
      to: data.email,
      subject: "Your Squito booking is confirmed! ✅",
      html: `
        <h2>Hi ${data.name},</h2>
        <p>Thank you for choosing Squito Pest Control! ${data.isPaid ? 'Your payment has been received.' : 'Your free estimate request has been received.'}</p>
        <p>We've confirmed your request for <strong>${data.service}</strong> at <strong>${data.address}</strong>.</p>
        ${data.preferredDate ? `<p>Your preferred appointment: <strong>${data.preferredDate}${data.preferredTime ? ` at ${data.preferredTime}` : ''}</strong></p>` : ''}
        <p>Our team will contact you shortly at ${data.phone} to finalize scheduling.</p>
        <br/>
        <p>Stay Safe,</p>
        <p>The Squito Team</p>
      `,
    });

    // 3. GorillaDesk CRM Integration
    const gorillaDeskApiKey = process.env.GORILLADESK_API_KEY;
    if (gorillaDeskApiKey) {
      try {
        const gdResponse = await fetch('https://app.gorilladesk.com/api/v1/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gorillaDeskApiKey}`
          },
          body: JSON.stringify({
            first_name: data.name.split(' ')[0] || data.name,
            last_name: data.name.split(' ').slice(1).join(' ') || '',
            email: data.email,
            phone: data.phone,
            address: data.address,
            source: 'app_booking',
            notes: `Service: ${data.service} | Date: ${data.preferredDate || 'TBD'} ${data.preferredTime || ''} | GPS: ${data.coordinates ? `${data.coordinates.lat},${data.coordinates.lng}` : 'N/A'} | ${data.isPaid ? 'PAID via App' : 'Free Estimate'}`,
          })
        });

        if (gdResponse.ok) {
          console.log("[GorillaDesk] Successfully pushed customer to CRM");
        } else {
          const gdError = await gdResponse.text();
          console.error("[GorillaDesk] API returned error:", gdResponse.status, gdError);
        }
      } catch (gdError) {
        console.error("[GorillaDesk Error]", gdError);
      }
    }

    // 4. Award PestPoints server-side (only for paid)
    let pointsAwarded = false;
    let earnedAmount = 0;
    const userId = data.userId;
    
    // Don't award points for free estimates
    if (data.isPaid && userId && typeof userId === "string" && userId.length > 0) {
      try {
        const basePoints = determinePoints(data.service);
        const reason = basePoints >= 150 ? "Signed up for a premium service or plan" : "Booked a service";

        if (basePoints > 0) {
          const pointsResult = await awardPoints(userId, basePoints, reason, {
          source: data.isStripeWebhook ? "stripe_webhook" : "booking_form",
          service: data.service,
          address: data.address,
        });
        if (pointsResult && "success" in pointsResult && pointsResult.success) {
          pointsAwarded = true;
          earnedAmount = pointsResult.earnedAmount;
          console.log(`[Points] Awarded ${pointsResult.earnedAmount} points to user ${userId} (50 base × ${pointsResult.multiplier}x ${pointsResult.newTier})`);
        } else if (pointsResult && "duplicate" in pointsResult) {
          console.warn("[Points] Duplicate booking submission blocked");
        } else {
           console.warn("[Points] Award failed:", pointsResult);
          }
        } else {
          console.log(`[Points] Ignored 0 point un-billable estimate for user ${userId}`);
        }
      } catch (pointsError) {
        console.error("[Points Error]", pointsError);
      }
    }

    return { ok: true, pointsAwarded, earnedAmount, isPaid: data.isPaid };
  } catch (err: any) {
    console.error("[Booking Error]", err);
    return { ok: false, error: "Failed to process booking. Please try again." };
  }
}
