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
      className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8"
    >
      <div className="flex flex-col items-center pt-12">
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-gray-300 bg-gray-100 shadow-md">
          <span className="text-[40px]">👤</span>
        </div>
        <h1 className="mt-4 font-display text-[22px] font-bold text-gray-900">
          Guest Mode
        </h1>
        <p className="mt-2 text-center text-[13px] font-medium text-gray-500 max-w-[280px]">
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
          className="rounded-3xl border border-squito-green/20 bg-[#f7fbe8] p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🎁</span>
            <h2 className="font-bold text-gray-900">
              PestPoints Await You
            </h2>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Members earn points on every service, unlock exclusive rewards, and
            get priority routing. Sign up and get{" "}
            <strong className="text-squito-green">50 bonus points</strong>{" "}
            instantly.
          </p>
        </motion.div>

        {/* What you're missing */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-gray-900 mb-4">
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
              text: "Priority same-day routing",
            },
            {
              icon: "💰",
              text: "Member-only promotions & discounts",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 py-3 ${idx > 0 ? "border-t border-gray-100" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[13px] font-medium text-gray-700">
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
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-gray-900 mb-4">Contact Squito</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 rounded-2xl bg-[#f4fae6] p-4 text-squito-green">
              <span className="text-xl">📞</span>
              <div>
                <h3 className="font-bold text-[14px] text-gray-900">
                  (631) 203-1000
                </h3>
                <p className="text-[11px] font-medium text-squito-green">
                  Call us — same-day available
                </p>
              </div>
            </div>
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
  const [pointsTab, setPointsTab] = useState<"Earn" | "Redeem" | "Gift" | "History">("Earn");
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [serviceBookings, setServiceBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const totalPoints = profile?.total_points || 0;
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

  return (
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
            <h1 className="mt-4 font-display text-[22px] font-bold text-gray-900">
              {displayName}&apos;s Account
            </h1>
            <p className="text-[13px] font-medium text-gray-500">
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
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">PestPoints</h2>
                <span className="text-2xl font-bold text-squito-green">
                  {totalPoints} pts
                </span>
              </div>
              <p className="mt-3 text-[12px] font-medium text-gray-500">
                {progress.nextTier
                  ? `${progress.pointsToNext} pts until ${progress.nextTier.name} tier`
                  : "You've reached the highest tier! 🎉"}
              </p>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
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
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold text-gray-900 mb-4">Service history</h2>

              {loadingBookings ? (
                <div className="py-8 text-center">
                  <span className="text-3xl">⏳</span>
                  <p className="mt-2 text-[13px] text-gray-400 font-medium">Loading...</p>
                </div>
              ) : serviceBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <span className="text-4xl">🏠</span>
                  <p className="mt-3 font-bold text-gray-900">No services yet</p>
                  <p className="mt-1 text-[12px] text-gray-500">
                    Book your first visit and it&apos;ll show here!
                  </p>
                  <Link href="/book">
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
                      complete: "bg-[#f4fae6] text-squito-green",
                      scheduled: "bg-blue-50 text-blue-600",
                      in_progress: "bg-amber-50 text-amber-600",
                      cancelled: "bg-red-50 text-red-500",
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
                        className={`flex items-center justify-between py-4 ${idx > 0 ? "border-t border-gray-100" : ""}`}
                      >
                        <div>
                          <h3 className="font-bold text-[14px] text-gray-900">
                            {booking.service_type}
                          </h3>
                          <p className="text-[12px] text-gray-500 mt-0.5">
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
              className="flex flex-col gap-[1px] overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 shadow-sm"
            >
              {[
                {
                  name: "Personal Information",
                  icon: "👤",
                  route: "/me/personal-info",
                },
                { name: "Payment Methods", icon: "💳", route: "/me/billing" },
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
                  name: "App Preferences",
                  icon: "⚙️",
                  route: "/me/preferences",
                },
              ].map((setting, idx) => (
                <Link
                  key={idx}
                  href={setting.route}
                  className="flex items-center justify-between bg-white p-5 pr-6 transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center gap-4 text-gray-900">
                    <span className="text-[18px] opacity-80">
                      {setting.icon}
                    </span>
                    <span className="font-bold text-[14px]">
                      {setting.name}
                    </span>
                  </div>
                  <span className="text-gray-300 font-bold text-lg leading-none mb-0.5">
                    ›
                  </span>
                </Link>
              ))}
            </motion.div>

            {/* Sign Out Button (High Visibility) */}
            <motion.div
              variants={itemVariants}
              className="mt-2 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-sm"
            >
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center bg-white p-4 text-[15px] font-bold text-red-500 transition-colors hover:bg-red-50 active:bg-red-100"
              >
                Sign Out
              </button>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h2 className="font-bold text-gray-900 mb-4">Contact Squito</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 rounded-2xl bg-[#f4fae6] p-4 text-squito-green">
                  <span className="text-xl">📞</span>
                  <div>
                    <h3 className="font-bold text-[14px] text-gray-900">
                      (631) 203-1000
                    </h3>
                    <p className="text-[11px] font-medium text-squito-green">
                      Call us — same-day available
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <span className="text-xl opacity-60">✉️</span>
                  <div>
                    <h3 className="font-bold text-[14px] text-gray-900">
                      service@getsquito.com
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500">
                      We respond within the hour
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="points"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="flex min-h-full flex-col pt-12 pb-10"
        >
          {/* Back Button */}
          <div className="px-5 pt-2 pb-2">
            <GlassButton
              variant="ghost"
              className="text-gray-900 border border-gray-200"
              onClick={() => setActiveView("profile")}
            >
              ← Back to Profile
            </GlassButton>
          </div>

          <div className="bg-white px-5 pb-8 pt-4 border-b border-gray-100 shadow-sm sm:px-8">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-display text-xl font-bold tracking-widest text-[#111]">
                S<span className="text-squito-green">●</span>QUITO
              </div>
              <span className="text-sm font-bold tracking-wide text-squito-green">
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
              <div className="mt-2 font-display text-[5.5rem] font-bold leading-none tracking-tight text-[#111]">
                {totalPoints}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-500">
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
                        ? "border-squito-green bg-[#f7fbe8] shadow-[0_4px_15px_rgba(107,158,17,0.15)]"
                        : "border-gray-100 bg-gray-50 shadow-sm"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${isActive ? "text-squito-green" : "text-gray-400"}`}
                    >
                      {tier.name}
                    </span>
                    <span
                      className={`mt-1 text-xs font-bold sm:text-sm ${isActive ? "text-[#111]" : "text-gray-700"}`}
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
              <div className="flex justify-between text-xs font-bold text-gray-800">
                <span>{tierInfo.name} member</span>
                <span className="text-gray-500">
                  {progress.nextTier
                    ? `${progress.pointsToNext} pts to ${progress.nextTier.name}`
                    : "Max tier reached!"}
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
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
            <div className="flex border-b border-gray-200 px-2 pt-2">
              {(["Earn", "Redeem", "Gift", "History"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPointsTab(tab)}
                  className={`flex-1 pb-4 text-center text-[13px] font-bold tracking-wide transition-colors ${
                    pointsTab === tab
                      ? "border-b-[3px] border-squito-green text-squito-green"
                      : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
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
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-gray-600 pr-4">
                    Every action earns you points toward free services and rewards.
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
                        desc: "Any scheduled visit",
                        pts: "+50 pts",
                        icon: "🗓️",
                      },
                      {
                        title: "Sign up for a plan",
                        desc: "Essential, Premium, or Ultimate",
                        pts: "+200 pts",
                        icon: "📋",
                      },
                      {
                        title: "Leave a Google review",
                        desc: "Verified reviews only",
                        pts: "+150 pts",
                        icon: "⭐",
                      },
                      {
                        title: "Refer a friend",
                        desc: "When they complete their first service",
                        pts: "+300 pts",
                        icon: "👥",
                      },
                    ].map((action, idx) => (
                      <motion.div
                        variants={itemVariants}
                        whileTap={{ scale: 0.96 }}
                        key={idx}
                        className="flex cursor-pointer items-center gap-4 rounded-3xl bg-white border border-gray-100 p-3 pr-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                      >
                        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#f4fae6]">
                          <span className="text-[22px] drop-shadow-sm">
                            {action.icon}
                          </span>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <h3 className="font-display font-bold text-[14px] text-gray-900">
                            {action.title}
                          </h3>
                          <p className="text-[11px] font-medium text-gray-500">
                            {action.desc}
                          </p>
                        </div>
                        <div className="font-bold tracking-wide text-squito-green">
                          {action.pts}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                    className="mt-10 rounded-2xl bg-[#f7fbe8] border border-squito-green/20 p-5 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <span className="text-2xl drop-shadow-sm">💡</span>
                      <div>
                        <h4 className="font-bold text-squito-green">Pro tip</h4>
                        <p className="mt-1 text-[13px] font-medium leading-relaxed text-squito-green/80 pr-2">
                          Sign up for a plan + leave a review + refer one friend = 650
                          bonus points. That&apos;s a free service visit!
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
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-gray-600 pr-4">
                    Use your PestPoints to redeem exclusive rewards and services.
                  </p>

                  <div className="mt-2 mb-6 inline-flex items-center gap-2 rounded-full bg-[#f7fbe8] border border-squito-green/15 px-4 py-2">
                    <span className="text-sm">💰</span>
                    <span className="text-[13px] font-bold text-squito-green">
                      Your balance: {totalPoints} pts
                    </span>
                  </div>

                  {rewards.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                      <span className="text-4xl">🎁</span>
                      <p className="mt-3 font-bold text-gray-900">Loading rewards...</p>
                      <p className="mt-1 text-[12px] text-gray-500">
                        Connect Supabase to see the rewards catalog.
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
                        const canAfford = totalPoints >= reward.cost_points;
                        const isRedeeming = redeemingId === reward.id;
                        return (
                          <motion.div
                            variants={itemVariants}
                            key={reward.id}
                            className={`flex items-center gap-4 rounded-3xl border p-4 pr-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all ${
                              canAfford
                                ? "border-squito-green/20 bg-white"
                                : "border-gray-100 bg-gray-50 opacity-60"
                            }`}
                          >
                            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#f4fae6]">
                              <span className="text-[22px]">{reward.icon}</span>
                            </div>
                            <div className="flex-1 space-y-0.5 min-w-0">
                              <h3 className="font-display font-bold text-[14px] text-gray-900 truncate">
                                {reward.name}
                              </h3>
                              <p className="text-[11px] font-medium text-gray-500 line-clamp-2">
                                {reward.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[12px] font-bold text-squito-green">
                                {reward.cost_points} pts
                              </span>
                              <button
                                disabled={!canAfford || isRedeeming}
                                onClick={async () => {
                                  if (!user) return;
                                  setRedeemingId(reward.id);
                                  const { redeemPoints } = await import("@/lib/pointsEngine");
                                  await redeemPoints(user.id, reward.id);
                                  await refreshProfile();
                                  // Reload rewards and history
                                  getPointsHistory(user.id).then(setPointsHistory);
                                  setRedeemingId(null);
                                }}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                                  canAfford
                                    ? "bg-squito-green text-white shadow-sm active:scale-95"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
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

              {/* ── GIFT TAB ── */}
              {pointsTab === "Gift" && (
                <motion.div
                  key="gift"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-12 flex flex-col items-center text-center px-4"
                >
                  <span className="text-5xl mb-4">🎁</span>
                  <h3 className="font-display text-xl font-bold text-gray-900">
                    Gift Points
                  </h3>
                  <p className="mt-3 text-[13px] font-medium text-gray-500 max-w-[260px] leading-relaxed">
                    Send PestPoints to friends and family so they can enjoy
                    pest-free living too. Coming soon!
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Coming Soon
                    </span>
                  </div>
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
                  <p className="mt-6 text-[13px] font-medium leading-relaxed text-gray-600 pr-4 mb-4">
                    Your recent points activity.
                  </p>

                  {pointsHistory.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                      <span className="text-4xl">📜</span>
                      <p className="mt-3 font-bold text-gray-900">No activity yet</p>
                      <p className="mt-1 text-[12px] text-gray-500">
                        Book a service or refer a friend to start earning!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0 rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                      {pointsHistory.map((tx: any, idx: number) => (
                        <div
                          key={tx.id}
                          className={`flex items-center justify-between px-5 py-4 ${
                            idx > 0 ? "border-t border-gray-100" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                                tx.type === "earn"
                                  ? "bg-[#f4fae6] text-squito-green"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {tx.type === "earn" ? "+" : "−"}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-gray-900">
                                {tx.reason}
                              </p>
                              <p className="text-[11px] text-gray-400">
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
        <div className="p-8 text-center text-gray-500 font-bold">
          Loading...
        </div>
      }
    >
      <MeContent />
    </Suspense>
  );
}
