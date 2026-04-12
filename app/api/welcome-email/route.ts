
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, displayName } = await req.json();

    if (!email || !displayName) {
      return NextResponse.json(
        { error: "Missing email or displayName" },
        { status: 400 },
      );
    }

    const result = await sendWelcomeEmail({ to: email, displayName });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (err: any) {
    console.error("[API /api/welcome-email] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
