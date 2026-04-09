import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = body as Record<string, string>;
  const required = ["name", "email", "phone", "address", "service"];
  for (const key of required) {
    const v = data[key];
    if (typeof v !== "string" || !v.trim()) {
      return NextResponse.json(
        { error: `Missing or invalid: ${key}` },
        { status: 400 },
      );
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    // If running without Resend configured, fallback to console log
    console.warn("RESEND_API_KEY not found. Logging booking to console:");
    console.log(data);
    return NextResponse.json({ ok: true, notice: "Logged locally" });
  }

  const resend = new Resend(resendApiKey);

  try {
    // 1. Send Email Notification to Squito Admin
    await resend.emails.send({
      from: "Squito App <onboarding@resend.dev>", // "onboarding@resend.dev" works for free accounts testing
      to: "service@getsquito.com",
      subject: `New App Booking: ${data.service}`,
      html: `
        <h2 style="color: #6B9E11;">New Booking Request from App</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Preferred Date:</strong> ${data.preferredDate || 'Not specified'}</p>
      `,
    });

    // 2. Send Confirmation Email to Customer
    // (Note: unless domain is verified on Resend, "onboarding@resend.dev" can only send to the verified email. 
    // Usually in prod you send from "service@squitopestcontrol.com" to the user's email)
    await resend.emails.send({
      from: "Squito Pest Control <onboarding@resend.dev>", 
      to: data.email, // This works if they verified domain, otherwise Resend blocks it unless it's the verified email
      subject: "We received your Squito booking request!",
      html: `
        <h2>Hi ${data.name},</h2>
        <p>Thank you for choosing Squito Pest Control!</p>
        <p>We've received your request for <strong>${data.service}</strong> at <strong>${data.address}</strong>.</p>
        <p>Our team will contact you shortly at ${data.phone} to confirm your appointment details.</p>
        <br/>
        <p>Stay Safe,</p>
        <p>The Squito Team</p>
      `,
    });

    // 3. GorillaDesk CRM Integration
    const gorillaDeskApiKey = process.env.GORILLADESK_API_KEY;
    if (gorillaDeskApiKey) {
      try {
        await fetch('https://app.gorilladesk.com/api/v2/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gorillaDeskApiKey}`
          },
          body: JSON.stringify({
            contact_name: data.name,
            email: data.email,
            custom_fields: {
              service_address: data.address,
              preferred_plan: data.service,
              phone: data.phone,
              preferred_date: data.preferredDate || 'Not specified'
            }
          })
        });
        console.log("[GorillaDesk] - Successfully pushed to CRM");
      } catch (gdError) {
        console.error("[GorillaDesk Error]", gdError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Booking Error]", err);
    return NextResponse.json(
      { error: "Failed to process booking. Please try again." },
      { status: 500 }
    );
  }
}
