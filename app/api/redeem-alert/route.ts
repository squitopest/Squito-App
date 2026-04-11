import { NextRequest, NextResponse } from "next/server";
import { sendRedemptionAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { rewardName, pointsSpent, userEmail, userName, userPhone } = await req.json();

    if (!rewardName || !pointsSpent || !userEmail || !userName) {
      return NextResponse.json(
        { error: "Missing required redemption alert parameters" },
        { status: 400 },
      );
    }

    const result = await sendRedemptionAlert({
      rewardName,
      pointsSpent,
      userEmail,
      userName,
      userPhone,
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (err: any) {
    console.error("[API /api/redeem-alert] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
