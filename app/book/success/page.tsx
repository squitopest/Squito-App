"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { haptics } from "@/lib/haptics";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    // If there's a session ID, we assume payment was made and the Webhook is handling it.
    if (sessionId) {
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        haptics.success();
      }
      
      // Delay profile refresh slightly to give the webhook time to process
      // and award points before we fetch the user's new balance.
      const timer = setTimeout(() => {
        refreshProfile();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, refreshProfile]);

  if (!sessionId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          No session found
        </h1>
        <p className="mt-3 text-sm font-medium text-gray-500 max-w-xs">
          Please try booking again.
        </p>
        <Link href="/book" className="mt-8">
          <GlassButton variant="primary" className="bg-squito-green/90 dark:bg-squito-green px-8 py-3">
            Go Back
          </GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32"
    >
      {/* Success checkmark animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4fae6]"
      >
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="text-5xl"
        >
          ✅
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-3xl font-bold text-gray-900"
      >
        Payment Confirmed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 font-medium text-gray-500 max-w-xs"
      >
        Your booking is confirmed and a receipt has been sent to your email. We&apos;ll be in touch shortly!
      </motion.p>

      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex w-full max-w-sm items-center gap-2 rounded-2xl bg-[#f7fbe8] border border-squito-green/20 px-5 py-3 text-left shadow-sm"
        >
          <span className="text-lg">🎉</span>
          <p className="text-[12px] font-medium text-squito-green">
            Your <strong>PestPoints</strong> will be awarded automatically! Check your profile shortly.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex w-full max-w-sm items-center gap-2 rounded-2xl bg-gray-100 px-5 py-3 text-left"
        >
          <span className="text-lg">💡</span>
          <p className="text-[12px] font-medium text-gray-600">
            Create an account to earn <strong className="text-squito-green">PestPoints</strong> on every booking!
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-10 flex flex-col gap-3 w-full max-w-sm"
      >
        <Link href="/plans">
          <GlassButton
            variant="primary"
            className="w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
          >
            Browse More Services
          </GlassButton>
        </Link>
        <Link href="/">
          <GlassButton
            variant="ghost"
            className="w-full py-3 text-squito-green"
          >
            Back to Home
          </GlassButton>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function BookSuccessPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      <Suspense
        fallback={
          <div className="flex min-h-[70vh] items-center justify-center">
            <p className="text-gray-500 font-medium">Loading...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
