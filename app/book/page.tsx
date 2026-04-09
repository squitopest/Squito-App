"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import { awardPoints } from "@/lib/pointsEngine";
import { haptics } from "@/lib/haptics";

function BookForm() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan");
  const billingCycle = searchParams.get("billing") || "monthly";

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const { user, isGuest, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    service: "Essential Defense",
    preferredDate: "",
  });

  useEffect(() => {
    if (initialPlan) {
      if (initialPlan === "essential-defense") setFormData((f) => ({ ...f, service: `Essential Defense (${billingCycle})` }));
      if (initialPlan === "premium-shield") setFormData((f) => ({ ...f, service: `Premium Shield (${billingCycle})` }));
      if (initialPlan === "ultimate-fortress") setFormData((f) => ({ ...f, service: `Ultimate Fortress (${billingCycle})` }));
    }
  }, [initialPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    if (typeof window !== "undefined" && (window as any).Capacitor) {
        haptics.light();
    }

    try {
      const API_BASE = (typeof window !== "undefined" && (window as any).Capacitor) ? "https://squito-app.vercel.app" : "";
      const res = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cityZip: formData.address // Simplified for UI form matching
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit booking");
      }

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
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4fae6]">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Booking Confirmed!
        </h1>
        <p className="mt-4 font-medium text-gray-500">
          We&apos;ve received your request and sent a confirmation email to <strong className="text-gray-800">{formData.email}</strong>. We&apos;ll be in touch shortly!
        </p>

        {pointsAwarded && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-squito-green/20 bg-[#f7fbe8] px-5 py-4 shadow-sm"
            >
              <motion.span
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="text-3xl"
              >
                🎉
              </motion.span>
              <div className="text-left w-full">
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
            className="mt-6 flex w-full items-center gap-2 rounded-2xl bg-gray-100 px-5 py-3 text-left"
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
    <>
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

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 rounded-xl bg-red-50 p-4 border border-red-100"
        >
          <p className="text-sm font-bold text-red-600">{errorMessage}</p>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-5">
           <div>
            <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
              Full Name
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jane Smith"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
              Email Address
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Phone
          </label>
          <input
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 555-5555"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Service Address (Long Island)
          </label>
          <input
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, Huntington NY 11743"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            Plan Required
          </label>
          <select
            required
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          >
            {/* If they came from the plans page with a billing cycle, render that exact string */}
            {initialPlan && <option value={formData.service}>{formData.service}</option>}
            <optgroup label="Monthly Plans">
              <option value="Essential Defense (monthly)">Essential Defense ($49.99/mo)</option>
              <option value="Premium Shield (monthly)">Premium Shield ($79.99/mo)</option>
              <option value="Ultimate Fortress (monthly)">Ultimate Fortress ($129.99/mo)</option>
            </optgroup>
            <optgroup label="Yearly Plans">
              <option value="Essential Defense (yearly)">Essential Defense ($599.88/yr)</option>
              <option value="Premium Shield (yearly)">Premium Shield ($959.88/yr)</option>
              <option value="Ultimate Fortress (yearly)">Ultimate Fortress ($1559.88/yr)</option>
            </optgroup>
            <optgroup label="Other Services">
              <option value="One-time Inspection">One-time Inspection / Custom Quote</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
            When can we come?
          </label>
          <input
            required
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            placeholder="Anytime next week"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

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
          className={`mt-4 flex w-full py-4 text-[15px] shadow-[0_8px_20px_rgba(107,158,17,0.25)] transition-all ${status === "submitting" ? "bg-squito-green/50" : "bg-squito-green/90 dark:bg-squito-green hover:bg-squito-green"}`}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Processing..." : "Confirm Booking"}
        </GlassButton>
      </motion.form>
    </>
  );
}

export default function BookPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 font-display text-[2rem] font-bold leading-tight text-gray-900"
      >
        Complete Booking
      </motion.h1>
      <Suspense fallback={<div className="mt-8 text-center text-sm text-gray-500">Loading form...</div>}>
        <BookForm />
      </Suspense>
    </div>
  );
}
