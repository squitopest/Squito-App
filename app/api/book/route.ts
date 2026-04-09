import { NextResponse } from "next/server";

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

  const data = body as Record<string, unknown>;
  const required = ["name", "email", "phone", "address", "cityZip", "service"];
  for (const key of required) {
    const v = data[key];
    if (typeof v !== "string" || !v.trim()) {
      return NextResponse.json(
        { error: `Missing or invalid: ${key}` },
        { status: 400 },
      );
    }
  }

  // TODO: Connect to email (Resend, SendGrid), CRM, or scheduling tool.
  // For now, log server-side in development only.
  if (process.env.NODE_ENV === "development") {
    console.log("[book request]", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      cityZip: data.cityZip,
      service: data.service,
      preferredDate: data.preferredDate,
      notes: data.notes,
    });
  }

  return NextResponse.json({ ok: true });
}
