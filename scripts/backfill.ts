// scripts/backfill.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillWelcomeBonus() {
  console.log("Starting points backfill process...");

  // Get all profiles
  const { data: profiles, error: profileErr } = await supabase.from("profiles").select("id");
  if (profileErr) {
    console.error("Failed to fetch profiles:", profileErr);
    return;
  }

  // Get all welcome bonus transactions
  const { data: txs, error: txErr } = await supabase
    .from("points_transactions")
    .select("user_id")
    .eq("reason", "Welcome Bonus");

  if (txErr) {
    console.error("Failed to fetch transactions:", txErr);
    return;
  }

  const usersWithBonus = new Set(txs.map((t) => t.user_id));
  const missingBonusUsers = profiles.filter((p) => !usersWithBonus.has(p.id));

  console.log(`Found ${missingBonusUsers.length} users missing the Welcome Bonus transaction.`);

  if (missingBonusUsers.length === 0) {
    console.log("All up to date. No backfill needed.");
  } else {
    const payloads = missingBonusUsers.map((user) => ({
      user_id: user.id,
      amount: 50,
      type: "earn",
      reason: "Welcome Bonus",
      metadata: { source: "signup_backfill", base_amount: 50, multiplier: 1 }
    }));

    const { error: insertErr } = await supabase.from("points_transactions").insert(payloads);
    if (insertErr) {
      console.error("Failed to insert backfill transactions:", insertErr);
    } else {
      console.log(`Successfully backfilled Welcome Bonus for ${payloads.length} users! ✅`);
    }
  }

  // Also update the reward name programatically
  const { error: rewardErr } = await supabase
    .from("rewards")
    .update({ name: "VIP Priority Service" })
    .eq("name", "Priority Same-Day Service");

  if (rewardErr) {
    console.error("Failed to update rewards text:", rewardErr);
  } else {
    console.log("Verified rewards text mapping! ✅");
  }

  console.log("Backfill complete.");
}

backfillWelcomeBonus();
