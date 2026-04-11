import { NextResponse, NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not confirmed" }, { status: 402 });
    }

    const meta = session.metadata || {};
    const lineItem = session.line_items?.data[0];
    const amountTotal = session.amount_total ?? 0;

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email ?? meta.email ?? "",
      amountTotal,                        // in cents
      currency: session.currency ?? "usd",
      // Booking details from metadata
      name: meta.name ?? "",
      email: meta.email ?? "",
      phone: meta.phone ?? "",
      address: meta.address ?? "",
      service: meta.service ?? (lineItem as any)?.description ?? "",
      preferredDate: meta.preferredDate ?? "",
      preferredTime: meta.preferredTime ?? "",
    });
  } catch (err: any) {
    console.error("[GET /api/checkout/session]", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
