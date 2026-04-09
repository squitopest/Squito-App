import { supabase } from "./supabase";

// ──────────────────────────────────────────────
// Tier Definitions (inspired by Starbucks / Sephora)
// ──────────────────────────────────────────────

export interface TierInfo {
  name: string;
  minPoints: number;
  maxPoints: number | null; // null = unlimited
  multiplier: number;
  perks: string[];
  color: string;
}

export const TIERS: TierInfo[] = [
  {
    name: "Starter",
    minPoints: 0,
    maxPoints: 249,
    multiplier: 1,
    perks: ["Base earn rate"],
    color: "#9ca3af", // gray
  },
  {
    name: "Silver",
    minPoints: 250,
    maxPoints: 499,
    multiplier: 1.25,
    perks: ["1.25x earn multiplier", "Priority scheduling"],
    color: "#94a3b8", // silver
  },
  {
    name: "Gold",
    minPoints: 500,
    maxPoints: 999,
    multiplier: 1.5,
    perks: ["1.5x earn multiplier", "Free callback visits", "Birthday bonus"],
    color: "#eab308", // gold
  },
  {
    name: "Elite",
    minPoints: 1000,
    maxPoints: null,
    multiplier: 2,
    perks: [
      "2x earn multiplier",
      "Free annual termite inspection",
      "VIP same-day routing",
      "Exclusive promotions",
    ],
    color: "#6b9e11", // squito green
  },
];

export function getTierForPoints(points: number): TierInfo {
  // Walk backwards so we match the highest qualifying tier
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].minPoints) return TIERS[i];
  }
  return TIERS[0];
}

export function getProgressToNextTier(points: number): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progress: number; // 0 to 1
  pointsToNext: number;
} {
  const currentTier = getTierForPoints(points);
  const currentIdx = TIERS.indexOf(currentTier);
  const nextTier = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;

  if (!nextTier) {
    return { currentTier, nextTier: null, progress: 1, pointsToNext: 0 };
  }

  const tierRange = nextTier.minPoints - currentTier.minPoints;
  const pointsIntoTier = points - currentTier.minPoints;
  const progress = Math.min(pointsIntoTier / tierRange, 1);
  const pointsToNext = nextTier.minPoints - points;

  return { currentTier, nextTier, progress, pointsToNext };
}

// ──────────────────────────────────────────────
// Point Operations (Supabase-backed)
// ──────────────────────────────────────────────

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  metadata: Record<string, unknown> = {}
) {
  if (!supabase) return { error: "Supabase not configured" };

  // 1. Insert the transaction
  const { error: txError } = await supabase
    .from("points_transactions")
    .insert({
      user_id: userId,
      amount,
      type: "earn",
      reason,
      metadata,
    });

  if (txError) return { error: txError.message };

  // 2. Update the user's total points
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", userId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const newTotal = (profile.total_points || 0) + amount;
  const newTier = getTierForPoints(newTotal);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      total_points: newTotal,
      tier: newTier.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  return { success: true, newTotal, newTier: newTier.name };
}

export async function redeemPoints(userId: string, rewardId: string) {
  if (!supabase) return { error: "Supabase not configured" };

  // 1. Get the reward cost
  const { data: reward, error: rewardError } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", rewardId)
    .single();

  if (rewardError || !reward) return { error: "Reward not found" };

  // 2. Get user's current balance
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return { error: "Profile not found" };

  if (profile.total_points < reward.cost_points) {
    return { error: "Insufficient points" };
  }

  // 3. Deduct points
  const newTotal = profile.total_points - reward.cost_points;
  const newTier = getTierForPoints(newTotal);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      total_points: newTotal,
      tier: newTier.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  // 4. Record the transaction
  await supabase.from("points_transactions").insert({
    user_id: userId,
    amount: -reward.cost_points,
    type: "redeem",
    reason: `Redeemed: ${reward.name}`,
    metadata: { reward_id: rewardId },
  });

  // 5. Record the redemption
  await supabase.from("redemptions").insert({
    user_id: userId,
    reward_id: rewardId,
    points_spent: reward.cost_points,
  });

  return { success: true, newTotal, reward };
}

export async function getPointsHistory(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return data || [];
}

export async function getRewardsCatalog() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("cost_points", { ascending: true });

  if (error) return [];
  return data || [];
}
