import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[DELETE ACCOUNT] Missing Supabase service role key");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // 1. Verify the user's JWT to get their ID
    const supabaseAuth = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 },
      );
    }

    const userId = user.id;

    // 2. Delete user data from related tables (cascade should handle most,
    //    but explicit cleanup is safer)
    await supabaseAuth.from("points_transactions").delete().eq("user_id", userId);
    await supabaseAuth.from("redemptions").delete().eq("user_id", userId);
    await supabaseAuth.from("service_bookings").delete().eq("user_id", userId);
    await supabaseAuth.from("profiles").delete().eq("id", userId);

    // 3. Delete avatar from storage (if exists)
    const { data: avatarFiles } = await supabaseAuth.storage
      .from("avatars")
      .list(userId);

    if (avatarFiles && avatarFiles.length > 0) {
      const paths = avatarFiles.map((f) => `${userId}/${f.name}`);
      await supabaseAuth.storage.from("avatars").remove(paths);
    }

    // 4. Delete the auth user itself
    const { error: deleteError } = await supabaseAuth.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[DELETE ACCOUNT] Failed to delete auth user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE ACCOUNT] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 },
    );
  }
}
