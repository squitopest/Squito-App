
import { NextResponse } from "next/server";
import { processBooking } from "@/lib/bookingEngine";

/**
 * POST /api/book
 * 
 * Handles direct "Free Estimate / Custom Quote" bookings.
 * Paid services are now entirely handled by Stripe Checkout + Webhooks.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, any>;

  // This route should ONLY be called for Free Estimates now
  if (data.service !== "Free Estimate / Custom Quote") {
    return NextResponse.json(
      { error: "Paid services must go through Stripe Checkout." },
      { status: 400 }
    );
  }

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

  // Tag it as unpaid for the engine
  data.isPaid = false;

  const result = await processBooking(data);
  return NextResponse.json(result);
}
