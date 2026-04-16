import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendRedemptionAlert } from "@/lib/email";
import { getErrorMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { rewardName, pointsSpent, userEmail, userName, userPhone } = body ?? {};

    if (
      typeof rewardName !== "string" ||
      typeof userEmail !== "string" ||
      typeof userName !== "string" ||
      typeof pointsSpent !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required redemption alert parameters" },
        { status: 400 },
      );
    }

    if (user.email && userEmail !== user.email) {
      return NextResponse.json(
        { error: "Authenticated user does not match request email" },
        { status: 403 },
      );
    }

    const result = await sendRedemptionAlert({
      rewardName,
      pointsSpent,
      userEmail,
      userName,
      userPhone: typeof userPhone === "string" ? userPhone : "",
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (err: unknown) {
    console.error("[API /api/redeem-alert] Error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Internal error") },
      { status: 500 },
    );
  }
}
