"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

export default function BillingPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0a] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]/80 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-[15px] font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-white">
          My Subscriptions
        </span>
        <div className="w-16" />
      </div>

      <div className="px-5 pt-8">
        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-white/30">
          Active Subscription
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-sm p-8 text-center mb-10">
          <span className="text-3xl">🛡️</span>
          <h3 className="mt-3 font-bold text-white text-[15px]">
            No Active Plans
          </h3>
          <p className="mt-1 text-[13px] font-medium text-white/40">
            Book a recurring service to activate a Squito protection plan.
          </p>
          <div className="mt-6">
            <Link href="/plans">
              <GlassButton variant="secondary" className="w-full py-3.5 text-sm">
                View Treatment Plans →
              </GlassButton>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
