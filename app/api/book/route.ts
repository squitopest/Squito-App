
import { NextResponse } from "next/server";
import { processBooking, type BookingData } from "@/lib/bookingEngine";

interface BookRoutePayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  userId?: string;
  coordinates?: { lat: number; lng: number } | null;
  isPaid?: boolean;
}

function isBookRoutePayload(value: unknown): value is BookRoutePayload {
  return typeof value === "object" && value !== null;
}

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

  if (!isBookRoutePayload(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = body;

  // This route should ONLY be called for Free Estimates now
  if (data.service !== "Free Estimate / Custom Quote") {
    return NextResponse.json(
      { error: "Paid services must go through Stripe Checkout." },
      { status: 400 }
    );
  }

  const required: Array<keyof BookRoutePayload> = ["name", "email", "phone", "address", "service"];
  for (const key of required) {
    const v = data[key];
    if (typeof v !== "string" || !v.trim()) {
      return NextResponse.json(
        { error: `Missing or invalid: ${key}` },
        { status: 400 },
      );
    }
  }

  const bookingData: BookingData = {
    name: data.name!,
    email: data.email!,
    phone: data.phone!,
    address: data.address!,
    service: data.service!,
    preferredDate: data.preferredDate ?? null,
    preferredTime: data.preferredTime ?? null,
    userId: data.userId ?? null,
    coordinates: data.coordinates ?? null,
    isPaid: false,
  };

  const result = await processBooking(bookingData);
  return NextResponse.json(result);
}
