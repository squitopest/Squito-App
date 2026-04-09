"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import { awardPoints } from "@/lib/pointsEngine";

export default function BookPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { user, isGuest, refreshProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Award points if user is logged in (not guest)
    if (user && !isGuest) {
      const result = await awardPoints(user.id, 50, "Booked a service", {
        source: "booking_form",
      });
      if (result && "success" in result && result.success) {
        setPointsAwarded(true);
        await refreshProfile(); // Refresh profile to update point count in nav/profile
      }
    }

    setStatus("success");
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4fae6]">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Booking Requested
        </h1>
        <p className="mt-4 font-medium text-gray-500">
          We will verify via text and dispatch a truck on your preferred date!
        </p>

        {/* Points earned notification */}
        {pointsAwarded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="mt-6 flex items-center gap-3 rounded-2xl border border-squito-green/20 bg-[#f7fbe8] px-5 py-4 shadow-sm"
            >
              <motion.span
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="text-3xl"
              >
                🎉
              </motion.span>
              <div className="text-left">
                <p className="font-bold text-squito-green text-[15px]">+50 PestPoints!</p>
                <p className="text-[12px] font-medium text-squito-green/70">
                  Earned for booking a service
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gray-100 px-5 py-3"
          >
            <span className="text-lg">💡</span>
            <p className="text-[12px] font-medium text-gray-600">
              Create an account to earn <strong className="text-squito-green">50 points</strong> on every booking!
            </p>
          </motion.div>
        )}

        <GlassButton
          variant="ghost"
          onClick={() => {
            setStatus("idle");
            setPointsAwarded(false);
          }}
          className="mt-10 text-squito-green dark:text-squito-green py-2 px-6"
        >
          Book another property
        </GlassButton>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 font-display text-[2rem] font-bold leading-tight text-gray-900"
      >
        Book a Service
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-2 text-sm font-medium text-gray-500"
      >
        {user && !isGuest
          ? "Earn 50 PestPoints with every booking! 🎉"
          : "Fast guest routing. No account required."}
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Full Name
          </label>
          <input
            required
            placeholder="Jane Smith"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Phone
          </label>
          <input
            required
            type="tel"
            placeholder="(555) 555-5555"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Address (Long Island)
          </label>
          <input
            required
            placeholder="123 Main St, Huntington"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            What do you need?
          </label>
          <select
            required
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          >
            <option>General inspection &amp; treatment</option>
            <option>Mosquitoes &amp; Ticks</option>
            <option>Ants / Roaches</option>
            <option>Termites / WDO</option>
            <option>Rodents / Wildlife</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            When can we come?
          </label>
          <input
            required
            placeholder="Anytime next week"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        {/* Points incentive banner for logged in users */}
        {user && !isGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-squito-green/15 bg-[#f7fbe8] px-4 py-3"
          >
            <span className="text-xl">⭐</span>
            <p className="text-[12px] font-medium text-squito-green">
              You&apos;ll earn <strong>+50 PestPoints</strong> when this booking is confirmed!
            </p>
          </motion.div>
        )}

        <GlassButton
          variant="primary"
          type="submit"
          className="mt-6 flex w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
        >
          {status === "submitting" ? "Processing..." : "Confirm Booking"}
        </GlassButton>
      </motion.form>
    </div>
  );
}
