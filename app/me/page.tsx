"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import {
  getTierForPoints,
  getProgressToNextTier,
  TIERS,
  getPointsHistory,
  getRewardsCatalog,
} from "@/lib/pointsEngine";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ── Avatar helper: resolves emoji:id or image URL ──
function ProfileAvatar({
  avatarUrl,
  size = 100,
  borderColor = "border-squito-green",
}: {
  avatarUrl: string | null;
  size?: number;
  borderColor?: string;
}) {
  // Check if it's an emoji avatar
  const BUG_EMOJI_MAP: Record<string, { emoji: string; bg: string }> = {
    caterpillar: { emoji: "🐛", bg: "bg-lime-100" },
    ant: { emoji: "🐜", bg: "bg-amber-100" },
    mosquito: { emoji: "🦟", bg: "bg-sky-100" },
    spider: { emoji: "🕷️", bg: "bg-purple-100" },
    bee: { emoji: "🐝", bg: "bg-yellow-100" },
    cricket: { emoji: "🦗", bg: "bg-emerald-100" },
    ladybug: { emoji: "🐞", bg: "bg-red-100" },
    butterfly: { emoji: "🦋", bg: "bg-indigo-100" },
    beetle: { emoji: "🪲", bg: "bg-orange-100" },
    tick: { emoji: "🦠", bg: "bg-teal-100" },
  };

  if (avatarUrl?.startsWith("emoji:")) {
    const bugId = avatarUrl.replace("emoji:", "");
    const bug = BUG_EMOJI_MAP[bugId];
    if (bug) {
      return (
        <div
          className={`flex items-center justify-center rounded-full border-4 ${borderColor} ${bug.bg} shadow-md`}
          style={{ width: size, height: size }}
        >
          <span style={{ fontSize: size * 0.4 }}>{bug.emoji}</span>
        </div>
      );
    }
  }

  if (avatarUrl && !avatarUrl.startsWith("emoji:")) {
    return (
      <img
        src={avatarUrl}
        alt="Avatar"
        className={`rounded-full border-4 ${borderColor} shadow-md object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Default fallback
  return (
    <div
      className={`flex items-center justify-center rounded-full border-4 ${borderColor} bg-[#111] shadow-md`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.4 }}>🏡</span>
    </div>
  );
}

// ── Guest CTA Component ──
function GuestCTA() {
  const { signOut } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8 bg-[#0a0a0a]"
    >
      <div className="flex flex-col items-center pt-12">
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-white/20 bg-white/5 shadow-md">
          <span className="text-[40px]">👤</span>
        </div>
        <h1 className="mt-4 font-display text-[22px] font-bold text-white">
          Guest Mode
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-white/50 max-w-[280px]">
          You&apos;re browsing as a guest. Create an account to unlock the full
          Squito experience.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-col gap-4"
      >
        {/* Points upsell */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-squito-green/20 bg-squito-green/10 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🎁</span>
            <h2 className="font-bold text-white">
              PestPoints Await You
            </h2>
          </div>
          <p className="text-[13px] text-white/60 leading-relaxed">
            Members earn points on every service, unlock exclusive rewards, and
            get priority routing. Sign up and get{" "}
            <strong className="text-squito-green">50 bonus points</strong>{" "}
            instantly.
          </p>
        </motion.div>

        {/* What you're missing */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl p-6 shadow-sm"
        >
          <h2 className="font-bold text-white mb-4">
            What you&apos;re missing
          </h2>
          {[
            {
              icon: "⭐",
              text: "Earn points on every booking",
            },
            {
              icon: "🏆",
              text: "Climb tiers: Starter → Silver → Gold → Elite",
            },
            {
              icon: "🎉",
              text: "Redeem for free services & exclusive swag",
            },
            {
              icon: "⚡",
              text: "Priority routing",
            },
            {
              icon: "💰",
              text: "Member-only promotions & discounts",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 py-3 ${idx > 0 ? "border-t border-white/5" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[13px] font-medium text-white/70">
                {item.text}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassButton
            variant="primary"
            onClick={() => signOut()} // clears guest, returns to AuthGate
            className="w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
          >
            Create an Account
          </GlassButton>
        </motion.div>

        {/* Contact Card (available to guests too) */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl p-6 shadow-sm"
        >
          <h2 className="font-bold text-white mb-4">Contact Squito</h2>
          <div className="flex flex-col gap-3">
            <a href="tel:6312031000" className="block outline-none">
              <div className="flex items-center gap-4 rounded-2xl bg-squito-green/10 border border-squito-green/20 p-4 text-squito-green transition-transform active:scale-95">
                <span className="text-xl">📞</span>
                <div>
                  <h3 className="font-bold text-[14px] text-white leading-none mb-1">
                    (631) 203-1000
                  </h3>
                  <p className="text-[11px] font-bold text-squito-green uppercase tracking-wide">
                    Tap to call
                  </p>
                </div>
              </div>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Authenticated Profile ──
function AuthenticatedProfile() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<"profile" | "points">(
    "profile"
  );
  const [pointsTab, setPointsTab] = useState<"Earn" | "Redeem" | "History">("Earn");
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, reward: any | null}>({isOpen: false, reward: null});
  const [serviceBookings, setServiceBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const totalPoints = profile?.total_points || 0;
  const redeemablePoints = profile?.redeemable_points ?? totalPoints;
  const tierInfo = getTierForPoints(totalPoints);
  const progress = getProgressToNextTier(totalPoints);

  // Read URL params
  useEffect(() => {
    if (searchParams.get("view") === "points") {
      setActiveView("points");
    } else {
      setActiveView("profile");
    }
  }, [searchParams]);

  // Load points data when viewing points
  useEffect(() => {
    if (activeView === "points" && user) {
      getPointsHistory(user.id).then(setPointsHistory);
      getRewardsCatalog().then(setRewards);
    }
  }, [activeView, user]);

  // Load service bookings
  useEffect(() => {
    async function loadBookings() {
      if (!supabase || !user) {
        setLoadingBookings(false);
        return;
      }
      const { data, error } = await supabase
        .from("service_bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: false })
        .limit(10);

      if (!error && data) setServiceBookings(data);
      setLoadingBookings(false);
    }
    loadBookings();
  }, [user]);

  const handleConfirmRedeem = async () => {
    if (!user || !confirmModal.reward) return;
    const reward = confirmModal.reward;
    setRedeemingId(reward.id);
                                  
    try {
      const { haptics } = await import("@/lib/haptics");
      await haptics.light();
    } catch (e) {}

    const { redeemPoints } = await import("@/lib/pointsEngine");
    const res = await redeemPoints(user.id, reward.id);
                                  
    if (res.success) {
      try {
        await fetch("/api/redeem-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rewardName: reward.name,
            pointsSpent: reward.cost_points,
            userEmail: user.email,
            userName: displayName,
            userPhone: profile?.phone || "",
          }),
        });
      } catch (err) {
        console.warn("[Redeem] Alert dispatch failed", err);
      }

      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6b9e11", "#a3e635", "#eab308"]
        });
      } catch (err) {
        console.warn("[Redeem] Confetti failed", err);
      }

      setConfirmModal({ isOpen: false, reward: null });

      // Different message for monetary vs non-monetary rewards
      const isMonetaryReward = res.isMonetary;
      setTimeout(() => {
        if (isMonetaryReward) {
          alert("🎁 Discount Redeemed! Your discount will automatically apply at checkout on your next booking. You have 90 days to use it.");
        } else {
          alert("🎉 Reward Redeemed! The Squito team has been notified.");
        }
      }, 500);

      await refreshProfile();
      getPointsHistory(user.id).then(setPointsHistory);
    } else {
      alert(res.error || "Failed to redeem reward.");
      setConfirmModal({ isOpen: false, reward: null });
    }
                                  
    setRedeemingId(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {activeView === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8"
        >
          {/* Header Avatar Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center pt-8"
          >
            <ProfileAvatar avatarUrl={profile?.avatar_url || null} size={100} />
            <h1 className="mt-4 font-display text-[22px] font-bold text-white">
              {displayName}&apos;s Account
            </h1>
            <p className="text-[13px] font-medium text-white/50">
              {tierInfo.name} Member{" "}
              <span className="mx-1">•</span> {totalPoints} pts
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-col gap-6"
          >
            {/* PestPoints Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">PestPoints</h2>
                <span className="text-2xl font-bold text-squito-green">
                  {totalPoints} pts
                </span>
              </div>
              <p className="mt-3 text-[12px] font-medium text-white/50">
                {progress.nextTier
                  ? `${progress.pointsToNext} pts until ${progress.nextTier.name} tier`
                  : "You've reached the highest tier! 🎉"}
              </p>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress * 100}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 50,
                    damping: 15,
                    delay: 0.5,
                  }}
                  className="h-full rounded-full bg-squito-green shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
                />
              </div>

              <GlassButton
                variant="secondary"
                className="mt-6 w-full py-3.5 text-sm"
                onClick={() => setActiveView("points")}
              >
                View Points & Rewards <span className="ml-1">→</span>
              </GlassButton>
            </motion.div>

            {/* Service History Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl p-6 shadow-sm"
            >
              <h2 className="font-bold text-white mb-4">Service history</h2>

              {loadingBookings ? (
                <div className="py-8 text-center">
                  <span className="text-3xl">⏳</span>
                  <p className="mt-2 text-[13px] text-white/40 font-medium">Loading...</p>
                </div>
              ) : serviceBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <span className="text-4xl">🏠</span>
                  <p className="mt-3 font-bold text-white">No services yet</p>
                  <p className="mt-1 text-[12px] text-white/50">
                    Book your first visit and it&apos;ll show here!
                  </p>
                  <Link href="/plans">
                    <GlassButton
                      variant="secondary"
                      className="mt-4 text-[13px]"
                    >
                      Book Now →
                    </GlassButton>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  {serviceBookings.map((booking: any, idx: number) => {
                    const statusColors: Record<string, string> = {
                      complete: "bg-squito-green/15 text-squito-green",
                      scheduled: "bg-blue-500/15 text-blue-400",
                      in_progress: "bg-amber-500/15 text-amber-400",
                      cancelled: "bg-red-500/15 text-red-400",
                    };
                    const statusColor = statusColors[booking.status] || statusColors.scheduled;
                    const displayDate = booking.scheduled_date
                      ? new Date(booking.scheduled_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "TBD";

                    return (
                      <div
                        key={booking.id}
                        className={`flex items-center justify-between py-4 ${idx > 0 ? "border-t border-white/10" : ""}`}
                      >
                        <div>
                          <h3 className="font-bold text-[14px] text-white">
                            {booking.service_type}
                          </h3>
                          <p className="text-[12px] text-white/50 mt-0.5">
                            {displayDate}
                          </p>
                        </div>
                        <div className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${statusColor}`}>
                          {booking.status.replace("_", " ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Account Settings Menu */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-[1px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm"
            >
              {[
                {
                  name: "Personal Information",
                  icon: "👤",
                  route: "/me/personal-info",
                },
                { name: "My Subscriptions", icon: "🛡️", route: "/me/billing" },
                {
                  name: "Notifications",
                  icon: "🔔",
                  route: "/me/notifications",
                },
                {
                  name: "Security & Privacy",
                  icon: "🔒",
                  route: "/me/security",
                },
                {
                  name: "Privacy Policy",
                  icon: "📄",
                  route: "/privacy",
                },
              ].map((setting, idx) => (
                <Link
                  key={idx}
                  href={setting.route}
                  className="flex items-center justify-between bg-[#1a1a1a] p-5 pr-6 transition-colors hover:bg-white/5 active:bg-white/10"
                >
                  <div className="flex items-center gap-4 text-white">
                    <span className="text-[18px] opacity-80">
                      {setting.icon}
                    </span>
                    <span className="font-bold text-[14px]">
                      {setting.name}
                    </span>
                  </div>
                  <span className="text-white/20 font-bold text-lg leading-none mb-0.5">
                    ›
                  </span>
                </Link>
              ))}
            </motion.div>

            {/* Sign Out Button (High Visibility) */}
            <motion.div
              variants={itemVariants}
              className="mt-2 overflow-hidden rounded-3xl border border-red-500/20 bg-[#1a1a1a] shadow-sm"
            >
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center bg-[#1a1a1a] p-4 text-[15px] font-bold text-red-400 transition-colors hover:bg-red-500/10 active:bg-red-500/20"
              >
                Sign Out
              </button>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-white/10 bg-[#1a1a1a]/90 backdrop-blur-xl p-6 shadow-sm"
            >
              <h2 className="font-bold text-white mb-4">Contact Squito</h2>
              <div className="flex flex-col gap-3">
                <a href="tel:6312031000" className="block outline-none">
                  <div className="flex items-center gap-4 rounded-2xl bg-squito-green/10 border border-squito-green/20 p-4 text-squito-green transition-transform active:scale-95">
                    <span className="text-xl">📞</span>
                    <div>
                      <h3 className="font-bold text-[14px] text-white leading-none mb-1">
                        (631) 203-1000
                      </h3>
                      <p className="text-[11px] font-bold text-squito-green uppercase tracking-wide">
                        Tap to call
                      </p>
                    </div>
                  </div>
                </a>

                <a href="mailto:service@getsquito.com" className="block outline-none">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-transform active:scale-95 hover:bg-white/10">
                    <span className="text-xl opacity-60">✉️</span>
                    <div>
                      <h3 className="font-bold text-[14px] text-white">
                        service@getsquito.com
                      </h3>
                      <p className="text-[11px] font-medium text-white/40">
                        We respond within the hour
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>

            {/* App Version Footer */}
            <motion.div variants={itemVariants} className="text-center pt-2">
              <p className="text-[11px] font-bold tracking-widest uppercase text-white/20">
                App Version 1.0.4 (Build 822)
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="points"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex min-h-full flex-col pt-12 pb-10 bg-[#0a0a0a]"
        >
          {/* Back Button */}
          <div className="px-5 pt-2 pb-2">
            <GlassButton
              variant="ghost"
              className="text-white border border-white/15"
              onClick={() => setActiveView("profile")}
            >
              ← Back to Profile
            </GlassButton>
          </div>

          <div className="bg-[#1a1a1a] px-5 pb-8 pt-4 border-b border-white/10 shadow-sm sm:px-8">
            <header className="flex items-center">
              <span className="text-xl font-display font-bold tracking-wide text-white">
                Points & Rewards
              </span>
            </header>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.1,
              }}
              className="mt-10"
            >
              <div className="inline-flex rounded-full border border-squito-green bg-squito-green/10 px-4 py-1.5 text-xs font-bold tracking-wide text-squito-green drop-shadow-sm">
                PestPoints
              </div>
              <div className="mt-2 font-display text-[5.5rem] font-bold leading-none tracking-tight text-white">
                {totalPoints}
              </div>
              <div className="mt-2 text-sm font-medium text-white/50">
                Your current balance <span className="mx-1.5">•</span>{" "}
                {tierInfo.name} member
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mt-8 grid grid-cols-4 gap-2"
            >
              {TIERS.map((tier, idx) => {
                const isActive = tier.name === tierInfo.name;
                return (
                  <motion.div
                    variants={itemVariants}
                    key={idx}
                    className={`flex flex-col items-center justify-center rounded-xl py-3 border ${
                      isActive
                        ? "border-squito-green bg-squito-green/10 shadow-[0_4px_15px_rgba(107,158,17,0.15)]"
                        : "border-white/10 bg-white/5 shadow-sm"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${isActive ? "text-squito-green" : "text-white/40"}`}
                    >
                      {tier.name}
                    </span>
                    <span
                      className={`mt-1 text-xs font-bold sm:text-sm ${isActive ? "text-white" : "text-white/50"}`}
                    >
                      {tier.maxPoints
                        ? `${tier.minPoints}–${tier.maxPoints}`
                        : `${tier.minPoints}+`}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8"
            >
              <div className="flex justify-between text-xs font-bold text-white/70">
                <span>{tierInfo.name} member</span>
                <span className="text-white/40">
                  {progress.nextTier
                    ? `${progress.pointsToNext} pts to ${progress.nextTier.name}`
                    : "Max tier reached!"}
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress * 100}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 50,
                    damping: 15,
                    delay: 0.7,
                  }}
                  className="h-full rounded-full bg-squito-green shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
                />
              </div>
            </motion.div>
          </div>

          <div className="flex-1 px-5 pt-2 pb-10 sm:px-8">
            <div className="flex border-b border-white/10 px-2 pt-2">
              {(["Earn", "Redeem", "History"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPointsTab(tab)}
                  className={`flex-1 pb-4 text-center text-[13px] font-bold tracking-wide transition-colors ${
                    pointsTab === tab
                      ? "border-b-[3px] border-squito-green text-squito-green"
                      : "text-white/30 border-b-[3px] border-transparent hover:text-white/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── EARN TAB ── */}
              {pointsTab === "Earn" && (
                <motion.div
                  key="earn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-white/50 pr-4">
                    Every action earns you points toward free services and rewards.
                    {tierInfo.multiplier > 1 && (
                      <span className="ml-1 font-bold text-squito-green">
                        Your {tierInfo.name} tier earns {tierInfo.multiplier}x!
                      </span>
                    )}
                  </p>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="mt-6 flex flex-col gap-4"
                  >
                    {[
                      {
                        title: "Book a service",
                        desc: "General Pest, Wasps, Ticks, etc.",
                        pts: "50 - 150 pts",
                        icon: "🗓️",
                        route: "/plans",
                      },
                      {
                        title: "Sign up for a plan",
                        desc: "Essential, Premium, or Ultimate",
                        pts: "150 - 300 pts",
                        icon: "📋",
                        route: "/plans",
                      },
                      {
                        title: "Refer a neighbor",
                        desc: "We both get $50 or 300 points!",
                        pts: "300 pts",
                        icon: "👥",
                        onClick: async () => {
                          try {
                            const { Share } = await import("@capacitor/share");
                            const refUrl = `https://squito-app.vercel.app/?ref=${encodeURIComponent(user?.email || "")}`;
                            await Share.share({
                              title: "Squito Pest Control",
                              text: `Get $50 off your first pest control service with Squito! Tap here:`,
                              url: refUrl,
                              dialogTitle: "Refer a Neighbor"
                            });
                          } catch (err) {
                            console.warn("Share failed:", err);
                          }
                        }
                      }
                    ].map((action, idx) => {
                      const InnerContent = (
                        <motion.div
                          variants={itemVariants}
                          whileTap={{ scale: 0.96 }}
                          onClick={action.onClick}
                          className="flex cursor-pointer items-center gap-4 rounded-3xl bg-[#1a1a1a] border border-white/10 p-3 pr-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-shadow hover:bg-white/5"
                        >
                          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-squito-green/10">
                            <span className="text-[22px] drop-shadow-sm">
                              {action.icon}
                            </span>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <h3 className="font-display font-bold text-[14px] text-white">
                              {action.title}
                            </h3>
                            <p className="text-[11px] font-medium text-white/40">
                              {action.desc}
                            </p>
                          </div>
                          <div className="font-bold text-[12px] text-squito-green">
                            {action.pts}
                          </div>
                        </motion.div>
                      );
                      
                      if (action.route) {
                        return <Link href={action.route} key={idx} className="block outline-none">{InnerContent}</Link>;
                      }
                      
                      return <div key={idx} className="block w-full text-left outline-none">{InnerContent}</div>;
                    })}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                    className="mt-10 rounded-2xl bg-squito-green/10 border border-squito-green/20 p-5 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <span className="text-2xl drop-shadow-sm">💡</span>
                      <div>
                        <h4 className="font-bold text-squito-green">Pro tip</h4>
                        <p className="mt-1 text-[13px] font-medium leading-relaxed text-squito-green/80 pr-2">
                          Sign up for a plan instead of a one-time service to earn 200 bonus points instantly!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ── REDEEM TAB ── */}
              {pointsTab === "Redeem" && (
                <motion.div
                  key="redeem"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-white/50 pr-4">
                    Use your PestPoints to redeem exclusive rewards and services.
                  </p>

                  <div className="mt-2 mb-2 inline-flex items-center gap-2 rounded-full bg-squito-green/10 border border-squito-green/15 px-4 py-2">
                    <span className="text-sm">💰</span>
                    <span className="text-[13px] font-bold text-squito-green">
                      Redeemable: {redeemablePoints} pts
                    </span>
                  </div>

                  {/* 90-day expiration notice */}
                  <div className="mb-6 flex items-start gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
                    <span className="text-base mt-0.5">⏳</span>
                    <p className="text-[11px] font-medium text-amber-400 leading-relaxed">
                      Redeemed discounts expire <strong>90 days</strong> after redemption. One discount per booking. Discounts automatically apply at checkout.
                    </p>
                  </div>

                  {rewards.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 text-center shadow-sm">
                      <span className="text-4xl">🎁</span>
                      <p className="mt-3 font-bold text-white">Check back later!</p>
                      <p className="mt-1 text-[12px] text-white/40">
                        New exclusive rewards are being added to the catalog soon.
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-4"
                    >
                      {rewards.map((reward: any) => {
                        const canAfford = redeemablePoints >= reward.cost_points;
                        const isRedeeming = redeemingId === reward.id;
                        return (
                          <motion.div
                            variants={itemVariants}
                            key={reward.id}
                            className={`flex items-center gap-4 rounded-3xl border p-4 pr-3 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all ${
                              canAfford
                                ? "border-squito-green/20 bg-[#1a1a1a]"
                                : "border-white/5 bg-white/5 opacity-60"
                            }`}
                          >
                            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-squito-green/10">
                              <span className="text-[22px]">{reward.icon}</span>
                            </div>
                            <div className="flex-1 space-y-0.5 min-w-0">
                              <h3 className="font-display font-bold text-[14px] text-white truncate">
                                {reward.name}
                              </h3>
                              <p className="text-[11px] font-medium text-white/40 line-clamp-2">
                                {reward.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[12px] font-bold text-squito-green">
                                {reward.cost_points} pts
                              </span>
                              <button
                                disabled={!canAfford || isRedeeming}
                                onClick={() => {
                                  if (!user) return;
                                  setConfirmModal({ isOpen: true, reward: reward });
                                }}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                  canAfford
                                    ? "bg-squito-green text-white shadow-sm active:scale-95"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                                }`}
                              >
                                {isRedeeming ? "..." : canAfford ? "Redeem" : "Locked"}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              )}


              {/* ── HISTORY TAB ── */}
              {pointsTab === "History" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-white/50 pr-4 mb-4">
                    Your recent points activity.
                  </p>

                  {pointsHistory.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#1a1a1a] p-8 text-center shadow-sm">
                      <span className="text-4xl">📜</span>
                      <p className="mt-3 font-bold text-white">No activity yet</p>
                      <p className="mt-1 text-[12px] text-white/40">
                        Book a service or refer a friend to start earning!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0 rounded-3xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-sm">
                      {pointsHistory.map((tx: any, idx: number) => (
                        <div
                          key={tx.id}
                          className={`flex items-center justify-between px-5 py-4 ${
                            idx > 0 ? "border-t border-white/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                                tx.type === "earn"
                                  ? "bg-squito-green/10 text-squito-green"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {tx.type === "earn" ? "+" : "−"}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-white">
                                {tx.reason}
                              </p>
                              <p className="text-[11px] text-white/30">
                                {new Date(tx.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-bold text-[14px] ${
                              tx.type === "earn"
                                ? "text-squito-green"
                                : "text-red-500"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── CUSTOM CONFIRM MODAL ── */}
    <AnimatePresence>
      {confirmModal.isOpen && confirmModal.reward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm rounded-[32px] bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-squito-green/10 shadow-inner">
              <span className="text-[40px] drop-shadow-sm">{confirmModal.reward.icon}</span>
            </div>
            <h3 className="text-center font-display text-xl font-bold text-white">
              Confirm Redemption
            </h3>
            <p className="mt-3 text-center text-[14px] font-medium leading-relaxed text-white/50 px-2">
              Are you sure you want to spend <strong className="text-squito-green">{confirmModal.reward.cost_points} points</strong> on{" "}
              <span className="text-white/80">{confirmModal.reward.name}</span>?
            </p>

            <div className="mt-8 flex gap-3">
              <button
                disabled={redeemingId !== null}
                onClick={() => setConfirmModal({ isOpen: false, reward: null })}
                className="flex-1 rounded-2xl bg-white/10 py-3.5 text-[14px] font-bold text-white/60 transition-colors active:bg-white/15"
              >
                Cancel
              </button>
              <button
                disabled={redeemingId !== null}
                onClick={handleConfirmRedeem}
                className="flex-1 rounded-2xl bg-squito-green py-3.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(107,158,17,0.25)] transition-transform active:scale-95 disabled:opacity-50"
              >
                {redeemingId ? "Processing..." : "Get Reward"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

function MeContent() {
  const { user, isGuest } = useAuth();

  // Guest view
  if (isGuest || !user) {
    return <GuestCTA />;
  }

  // Authenticated view
  return <AuthenticatedProfile />;
}

export default function MePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-white/30 font-bold">
          Loading...
        </div>
      }
    >
      <MeContent />
    </Suspense>
  );
}
