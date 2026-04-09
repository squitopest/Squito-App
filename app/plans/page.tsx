"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { useState } from "react";

type BillingCycle = "monthly" | "yearly" | "initial";

const plans = [
  {
    id: "essential-defense",
    name: "Essential Defense",
    prices: {
      initial: "$199.99",
      monthly: "$49.99",
      yearly: "$599.88",
    },
    desc: "Perfect for smaller homes or first-time customers.",
    features: [
      "Interior/Exterior Defense",
      "Granular repellent application",
      "Crack and crevice treatment",
      "Quarterly Service",
      "Cobweb and Wasp Nest Removal",
      "Flexible Scheduling",
      "100% Satisfaction Guarantee",
    ],
    popular: false,
  },
  {
    id: "premium-shield",
    name: "Premium Shield",
    prices: {
      initial: "$299.99",
      monthly: "$79.99",
      yearly: "$959.88",
    },
    desc: "Most popular — full protection, inside and out.",
    features: [
      "Everything in Essential",
      "Rodent Exclusion/Baiting",
      "Bi-Monthly Mosquito/Tick prevention (April-Sept)",
      "Routine web brushing 1st floor",
      "Termite Monitoring",
    ],
    popular: true,
  },
  {
    id: "ultimate-fortress",
    name: "Ultimate Fortress",
    prices: {
      initial: "$399.99",
      monthly: "$129.99",
      yearly: "$1559.88",
    },
    desc: "Total coverage — yard, interior, and everything in between.",
    features: [
      "Everything in Premium",
      "Targeted Flea Treatment",
      "Stink Bug/Overwintering Pest Barrier",
      "Monthly Check-Ins",
      "Free emergency callbacks",
      "Exterior structure sealing",
    ],
    popular: false,
  },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const getPriceDisplay = (plan: any) => {
    switch (billingCycle) {
      case "monthly":
        return { amount: plan.prices.monthly, suffix: "/month" };
      case "yearly":
        return { amount: plan.prices.yearly, suffix: "/year" };
      case "initial":
        return { amount: plan.prices.initial, suffix: "initial fee" };
    }
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-squito-green">
          No Contracts. Cancel Anytime.
        </span>
        <h1 className="mt-2 font-display text-[2rem] font-bold leading-tight text-gray-900">
          Pick Your Plan
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
          100% Satisfaction Guaranteed. We eliminate pests, not peace of mind.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 mx-auto flex items-center rounded-full bg-gray-100 p-1 shadow-inner max-w-sm w-full"
      >
        {(["monthly", "yearly", "initial"] as const).map((cycle) => (
          <button
            key={cycle}
            onClick={() => {
              setBillingCycle(cycle);
              haptics.light();
            }}
            className={`flex-1 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
              billingCycle === cycle
                ? "bg-white text-squito-green shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {cycle === "initial" ? "One-Time" : cycle}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, staggerChildren: 0.1 }}
        className="mt-8 flex flex-col gap-6"
      >
        {plans.map((plan, idx) => {
          const pricing = getPriceDisplay(plan);
          return (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: idx * 0.1,
              }}
              key={idx}
              className={`relative flex flex-col rounded-[32px] border ${
                plan.popular
                  ? "border-squito-green bg-white shadow-[0_10px_30px_rgba(107,158,17,0.15)]"
                  : "border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
              } p-6 pb-8 transition-colors duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-squito-green px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                  <span>⭐</span> Most Popular
                </div>
              )}

              <div
                className={`mt-2 text-center items-center flex flex-col ${plan.popular ? "text-squito-green" : "text-gray-900"}`}
              >
                <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                <div className="mt-2 flex flex-col items-center justify-center">
                  {/* Notice that the amount changes smoothly (React handles text nodes usually well enough, but we could wrap in motion) */}
                  <span className="text-[2.2rem] leading-none font-bold tabular-nums">
                    {pricing.amount}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mt-1">
                    {pricing.suffix}
                  </span>
                </div>
                <p
                  className={`mt-4 text-[13px] font-medium leading-relaxed ${plan.popular ? "text-squito-green/80" : "text-gray-500"}`}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6">
                {plan.features.map((feat, fidx) => (
                  <div key={fidx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4fae6] text-[10px] text-squito-green mt-0.5">
                      ✓
                    </span>
                    <span className="text-[13px] font-medium text-gray-700 leading-snug">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/book?plan=${plan.id}&billing=${billingCycle}`} className="mt-8 block w-full" onClick={() => haptics.light()}>
                <GlassButton
                  variant={plan.popular ? "primary" : "secondary"}
                  className={`w-full py-4 text-[15px] ${plan.popular ? "bg-squito-green/90 dark:bg-squito-green shadow-lg shadow-squito-green/20" : "border-gray-200 text-gray-900"}`}
                >
                  Get Protected
                </GlassButton>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center"
      >
         <Link href="tel:6312031000" onClick={() => haptics.light()}>
            <GlassButton variant="ghost" className="text-squito-green px-8 font-bold">
              Call Now: (631) 203-1000
            </GlassButton>
         </Link>
      </motion.div>
    </div>
  );
}
