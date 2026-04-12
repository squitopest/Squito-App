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
      "VIP priority routing",
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
//
// KEY DESIGN — dual-balance system:
//   total_points     = lifetime earn total (only goes UP, determines tier)
//   redeemable_points = spendable balance (goes DOWN on redeem)
//
// This means redeeming points never drops your tier.
// ──────────────────────────────────────────────

// Duplicate guard window (ms) — same user + reason within this window is rejected
const DEDUP_WINDOW_MS = 60_000; // 60 seconds

/**
 * Award points with tier multiplier applied automatically.
 * A Gold member earning 50 base points actually receives 50 × 1.5 = 75.
 * Includes a 60-second duplicate guard (same user + same reason).
 */
export async function awardPoints(
  userId: string,
  baseAmount: number,
  reason: string,
  metadata: Record<string, unknown> = {}
) {
  if (!supabase) return { error: "Supabase not configured" };

  // ── Duplicate guard ──
  // Check if this exact user+reason was awarded in the last 60 seconds
  const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
  const { data: recentTx } = await supabase
    .from("points_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reason", reason)
    .eq("type", "earn")
    .gte("created_at", cutoff)
    .limit(1);

  if (recentTx && recentTx.length > 0) {
    console.warn(`[Points] Duplicate blocked: "${reason}" for user ${userId} within ${DEDUP_WINDOW_MS / 1000}s`);
    return { error: "Duplicate transaction blocked", duplicate: true };
  }

  // ── Fetch current profile ──
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("total_points, redeemable_points, tier")
    .eq("id", userId)
    .single();

  if (fetchError) return { error: fetchError.message };

  // ── Apply tier multiplier ──
  const currentTier = getTierForPoints(profile.total_points || 0);
  const multipliedAmount = Math.round(baseAmount * currentTier.multiplier);

  // ── Insert the transaction (record the actual multiplied amount) ──
  const { error: txError } = await supabase
    .from("points_transactions")
    .insert({
      user_id: userId,
      amount: multipliedAmount,
      type: "earn",
      reason,
      metadata: {
        ...metadata,
        base_amount: baseAmount,
        multiplier: currentTier.multiplier,
        tier_at_earn: currentTier.name,
      },
    });

  if (txError) return { error: txError.message };

  // ── Update both balances ──
  const newTotal = (profile.total_points || 0) + multipliedAmount;
  const newRedeemable = (profile.redeemable_points ?? profile.total_points ?? 0) + multipliedAmount;
  const newTier = getTierForPoints(newTotal);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      total_points: newTotal,
      redeemable_points: newRedeemable,
      tier: newTier.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  return {
    success: true,
    baseAmount,
    multiplier: currentTier.multiplier,
    earnedAmount: multipliedAmount,
    newTotal,
    newRedeemable,
    newTier: newTier.name,
  };
}

/**
 * Redeem points — deducts from redeemable_points only.
 * total_points is never reduced, so tier status is preserved.
 * Monetary rewards (discount_value > 0) are saved as "pending" with a 90-day expiry.
 */
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
    .select("total_points, redeemable_points")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return { error: "Profile not found" };

  // Use redeemable_points for spending (fallback to total_points for legacy)
  const spendable = profile.redeemable_points ?? profile.total_points ?? 0;

  if (spendable < reward.cost_points) {
    return { error: "Insufficient points" };
  }

  // 3. Deduct from redeemable only — total_points stays intact
  const newRedeemable = spendable - reward.cost_points;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      redeemable_points: newRedeemable,
      // total_points stays the same — tier is preserved!
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  // 4. Record the transaction
  const { error: txError } = await supabase.from("points_transactions").insert({
    user_id: userId,
    amount: -reward.cost_points,
    type: "redeem",
    reason: `Redeemed: ${reward.name}`,
    metadata: { reward_id: rewardId },
  });

  if (txError) {
    console.error("[PointsEngine] Tx Error: ", txError);
    return { error: "Failed to record ledger transaction: " + txError.message };
  }

  // 5. Record the redemption with status + expiration
  const discountDollars = Number(reward.discount_value) || 0;
  const discountCents = Math.round(discountDollars * 100);
  const isMonetary = discountCents > 0;

  // 90-day expiration for monetary rewards
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  const { error: rError } = await supabase.from("redemptions").insert({
    user_id: userId,
    reward_id: rewardId,
    points_spent: reward.cost_points,
    status: isMonetary ? "pending" : "used",  // non-monetary rewards are fulfilled immediately
    discount_cents: discountCents,
    expires_at: isMonetary ? expiresAt.toISOString() : null,
  });

  if (rError) {
    console.error("[PointsEngine] Redemptions Error: ", rError);
    return { error: "Failed to secure redemption log: " + rError.message };
  }

  return { success: true, newRedeemable, reward, isMonetary, discountCents };
}

/**
 * Get the oldest pending monetary discount for a user.
 * Returns null if no pending discount exists or all are expired.
 * Only returns ONE — no stacking allowed.
 */
export async function getPendingDiscount(userId: string) {
  if (!supabase) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("redemptions")
    .select("id, discount_cents, expires_at, points_spent, reward_id, rewards(name)")
    .eq("user_id", userId)
    .eq("status", "pending")
    .gt("discount_cents", 0)
    .gt("expires_at", now)   // not expired
    .order("created_at", { ascending: true })  // oldest first
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    redemptionId: data.id,
    discountCents: data.discount_cents,
    discountDollars: data.discount_cents / 100,
    expiresAt: data.expires_at,
    rewardName: (data as any).rewards?.name || "PestPoints Discount",
  };
}

/**
 * Mark a redemption as "used" after successful Stripe payment.
 */
export async function markRedemptionUsed(redemptionId: string) {
  if (!supabase) return { error: "Supabase not configured" };

  const { error } = await supabase
    .from("redemptions")
    .update({ status: "used" })
    .eq("id", redemptionId);

  if (error) {
    console.error("[PointsEngine] Failed to mark redemption used:", error);
    return { error: error.message };
  }

  return { success: true };
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
