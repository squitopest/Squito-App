"use client";

import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { haptics } from "@/lib/haptics";

const plans = [
  {
    id: "essential-defense",
    name: "Essential Defense",
    price: "$199.99",
    billing: "initial service fee",
    desc: "Perfect for smaller homes or first-time customers.",
    features: [
      "Quarterly exterior perimeter spray",
      "Ant & Roach control",
      "Basic web removal",
      "Re-service guarantee",
    ],
    popular: false,
  },
  {
    id: "premium-shield",
    name: "Premium Shield",
    price: "$299.99",
    billing: "initial service fee",
    desc: "Most popular — full protection, inside and out.",
    features: [
      "Bi-monthly service",
      "Full interior & exterior",
      "Mosquito & Tick barrier",
      "Rodent monitoring",
      "Free callbacks",
    ],
    popular: true,
  },
  {
    id: "ultimate-fortress",
    name: "Ultimate Fortress",
    price: "$399.99",
    billing: "initial service fee",
    desc: "Total coverage — yard, interior, and everything in between.",
    features: [
      "Monthly service",
      "Termite bait stations",
      "Wildlife exclusion",
      "Attic & crawl space treatment",
      "Same-day priority routing",
      "Year-round coverage",
    ],
    popular: false,
  },
];

export default function PlansPage() {
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, staggerChildren: 0.1 }}
        className="mt-8 flex flex-col gap-6"
      >
        {plans.map((plan, idx) => (
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
            } p-6 pb-8`}
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
                <span className="text-[2rem] leading-none font-bold">{plan.price}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mt-1">
                  {plan.billing}
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

            <Link href={`/book?plan=${plan.id}&billing=monthly`} className="mt-8 block w-full" onClick={() => haptics.light()}>
              <GlassButton
                variant={plan.popular ? "primary" : "secondary"}
                className={`w-full py-4 text-[15px] ${plan.popular ? "bg-squito-green/90 dark:bg-squito-green shadow-lg shadow-squito-green/20" : "border-gray-200 text-gray-900"}`}
              >
                Get Protected
              </GlassButton>
            </Link>
          </motion.div>
        ))}
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
