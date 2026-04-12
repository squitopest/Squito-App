"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { useState } from "react";
import Image from "next/image";

// ── One-time services (Starbucks model: buy one, earn points) ───────────────
const services = [
  {
    id: "mosquito-barrier",
    name: "Mosquito Barrier Spray",
    image: "/images/services/mosquito-spray.png",
    price: "$119",
    priceNum: 119,
    points: 75,
    desc: "Full-yard barrier treatment that keeps mosquitoes away for up to 21 days.",
    popular: true,
  },
  {
    id: "organic-treatment",
    name: "Organic Mosquito & Tick Treatment",
    image: "/images/services/organic-treatment.png",
    price: "$99",
    priceNum: 99,
    points: 75,
    desc: "Premium organic treatment for mosquitoes and ticks.",
  },
  {
    id: "tick-treatment",
    name: "Tick Treatment",
    image: "/images/services/tick-treatment.png",
    price: "$99",
    priceNum: 99,
    points: 75,
    desc: "Targeted tick elimination for your lawn, garden beds, and wooded border.",
  },
  {
    id: "general-pest",
    name: "General & Full Property Pest Control",
    image: "/images/services/general-pest.png",
    price: "$299",
    priceNum: 299,
    points: 125,
    desc: "Our most comprehensive single visit — full interior, exterior, and yard defense against all pests.",
  },
  {
    id: "hornet-wasp",
    name: "Hornet & Wasp Removal",
    image: "/images/services/hornet-wasp.png",
    price: "$349",
    priceNum: 349,
    points: 150,
    desc: "Safe professional removal of hornet nests, wasp nests, and yellow jacket colonies.",
  },
  {
    id: "termite-inspection",
    name: "Termite Inspection",
    image: "/images/services/termite-inspection.png",
    price: "$199",
    priceNum: 199,
    points: 100,
    desc: "Comprehensive property inspection with a detailed termite activity report.",
  },
  {
    id: "free-estimate",
    name: "Free Estimate",
    image: "/images/services/free-estimate.png",
    price: "Free",
    priceNum: 0,
    points: 0,
    desc: "Not sure what you need? We'll come out and assess your property at no cost.",
  },
];

// ── Seasonal plans (optional upsell) ────────────────────────────────────────
type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    id: "essential-defense",
    name: "Essential Defense",
    prices: {
      monthly: "$49.99",
      yearly: "$539.89",
    },
    desc: "Quarterly service for smaller homes.",
    savings: "Save ~10%",
    features: [
      "Interior/Exterior Defense",
      "Granular repellent application",
      "Crack and crevice treatment",
      "Quarterly service visits",
      "100% Satisfaction Guarantee",
    ],
  },
  {
    id: "premium-shield",
    name: "Premium Shield",
    prices: {
      monthly: "$79.99",
      yearly: "$863.89",
    },
    desc: "Full protection — most popular for families.",
    savings: "Save ~15%",
    popular: true,
    features: [
      "Everything in Essential",
      "Rodent Exclusion/Baiting",
      "Bi-Monthly Mosquito/Tick (Apr–Sept)",
      "Termite Monitoring",
      "Routine web brushing",
    ],
  },
  {
    id: "ultimate-fortress",
    name: "Ultimate Fortress",
    prices: {
      monthly: "$129.99",
      yearly: "$1,403.89",
    },
    desc: "Total coverage — yard, interior, and everything.",
    savings: "Save ~20%",
    features: [
      "Everything in Premium",
      "Targeted Flea Treatment",
      "Stink Bug/Overwintering Barrier",
      "Monthly Check-Ins",
      "Free emergency callbacks",
    ],
  },
];

export default function ServicesPage() {
  const [showPlans, setShowPlans] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-squito-green">
          Book Once. Earn Points. Get Rewarded.
        </span>
        <h1 className="mt-2 font-display text-[2rem] font-bold leading-tight text-gray-900">
          Our Services
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
          Every service earns you PestPoints toward free treatments.
        </p>
      </motion.div>

      {/* One-time Services */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-8 flex flex-col gap-5"
      >
        {services.map((service, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: idx * 0.06,
            }}
            key={service.id}
            className={`relative overflow-hidden rounded-[28px] border transition-all ${
              service.popular
                ? "border-squito-green bg-white shadow-[0_8px_24px_rgba(107,158,17,0.12)]"
                : "border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
            }`}
          >
            {service.popular && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-squito-green px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-md">
                ⭐ Popular
              </div>
            )}

            {/* Service Image */}
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 500px"
              />
              {/* Dark gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Price badge on image */}
              <div className="absolute bottom-3 left-4">
                <span className="rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-[18px] font-bold text-gray-900 shadow-md">
                  {service.price}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 pt-4">
              <h3 className="font-display text-[16px] font-bold text-gray-900 leading-snug">
                {service.name}
              </h3>

              <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
                {service.desc}
              </p>

              <div className="mt-4 flex items-center justify-between">
                {service.points > 0 ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.3 + idx * 0.06,
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#f7fbe8] border border-squito-green/15 px-3.5 py-1.5 text-[12px] font-bold text-squito-green"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{
                        repeat: Infinity,
                        repeatDelay: 3,
                        duration: 0.6,
                        delay: idx * 0.5,
                      }}
                    >
                      ⭐
                    </motion.span>
                    Earn {service.points} pts
                  </motion.span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-[12px] font-bold text-gray-400">
                    No commitment
                  </span>
                )}

                <Link
                  href={`/book?service=${service.id}`}
                  onClick={() => haptics.light()}
                >
                  <GlassButton
                    variant={service.popular ? "primary" : "secondary"}
                    className={`text-[13px] py-2.5 px-5 ${
                      service.popular
                        ? "bg-squito-green/90 dark:bg-squito-green shadow-sm"
                        : "border-gray-200 text-gray-900"
                    }`}
                  >
                    {service.priceNum === 0 ? "Schedule" : "Book Now"}
                  </GlassButton>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Plans Upsell Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10"
      >
        <button
          onClick={() => {
            setShowPlans(!showPlans);
            haptics.light();
          }}
          className="w-full flex items-center justify-between rounded-2xl border border-squito-green/20 bg-[#f7fbe8] px-5 py-4 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div className="text-left">
              <h3 className="text-[14px] font-bold text-gray-900">
                Want to save more?
              </h3>
              <p className="text-[11px] font-medium text-squito-green">
                Seasonal plans save up to 20% + earn bonus points
              </p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: showPlans ? 180 : 0 }}
            className="text-squito-green font-bold text-lg"
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence>
          {showPlans && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Billing Toggle */}
              <div className="mt-6 mx-auto flex items-center rounded-full bg-gray-100 p-1 shadow-inner max-w-xs w-full">
                {(["monthly", "yearly"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => {
                      setBillingCycle(cycle);
                      haptics.light();
                    }}
                    className={`flex-1 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      billingCycle === cycle
                        ? "bg-white text-squito-green shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-5">
                {plans.map((plan, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={plan.id}
                    className={`relative rounded-[28px] border p-6 ${
                      plan.popular
                        ? "border-squito-green bg-white shadow-[0_8px_24px_rgba(107,158,17,0.12)]"
                        : "border-gray-100 bg-white shadow-sm"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-squito-green px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
                        ⭐ Most Popular
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="font-display text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mt-2">
                        <span className="text-[2rem] font-bold text-gray-900 tabular-nums">
                          {plan.prices[billingCycle]}
                        </span>
                        <span className="text-[11px] font-bold uppercase text-gray-400 ml-1">
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                      <span className="mt-2 inline-block rounded-full bg-squito-green/10 px-3 py-1 text-[11px] font-bold text-squito-green">
                        {plan.savings} vs. one-time
                      </span>
                      <p className="mt-3 text-[12px] font-medium text-gray-500">
                        {plan.desc}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-2.5 border-t border-gray-100 pt-5">
                      {plan.features.map((feat, fidx) => (
                        <div key={fidx} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4fae6] text-[10px] text-squito-green mt-0.5">
                            ✓
                          </span>
                          <span className="text-[12px] font-medium text-gray-700 leading-snug">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/book?plan=${plan.id}&billing=${billingCycle}`}
                      className="mt-6 block w-full"
                      onClick={() => haptics.light()}
                    >
                      <GlassButton
                        variant={plan.popular ? "primary" : "secondary"}
                        className={`w-full py-3.5 text-[14px] ${
                          plan.popular
                            ? "bg-squito-green/90 dark:bg-squito-green shadow-lg shadow-squito-green/20"
                            : "border-gray-200 text-gray-900"
                        }`}
                      >
                        Get Plan
                      </GlassButton>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Call CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
