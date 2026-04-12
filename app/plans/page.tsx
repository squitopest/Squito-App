"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { useState, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";

// ── One-time services (Starbucks model: buy one, earn points) ───────────────
const services = [
  {
    id: "mosquito-barrier",
    serviceKey: "Mosquito Barrier Spray ($119)",
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
    serviceKey: "Organic Mosquito & Tick Treatment ($99)",
    name: "Organic Mosquito & Tick Treatment",
    image: "/images/services/organic-treatment.png",
    price: "$99",
    priceNum: 99,
    points: 75,
    desc: "Premium organic treatment for mosquitoes and ticks.",
  },
  {
    id: "tick-treatment",
    serviceKey: "Tick Treatment ($99)",
    name: "Tick Treatment",
    image: "/images/services/tick-treatment.png",
    price: "$99",
    priceNum: 99,
    points: 75,
    desc: "Targeted tick elimination for your lawn, garden beds, and wooded border.",
  },
  {
    id: "general-pest",
    serviceKey: "General & Full Property Pest Control ($299)",
    name: "General & Full Property Pest Control",
    image: "/images/services/general-pest.png",
    price: "$299",
    priceNum: 299,
    points: 125,
    desc: "Our most comprehensive single visit — full interior, exterior, and yard defense against all pests.",
  },
  {
    id: "hornet-wasp",
    serviceKey: "Hornet & Wasp Removal ($349)",
    name: "Hornet & Wasp Removal",
    image: "/images/services/hornet-wasp.png",
    price: "$349",
    priceNum: 349,
    points: 150,
    desc: "Safe professional removal of hornet nests, wasp nests, and yellow jacket colonies.",
  },
  {
    id: "termite-inspection",
    serviceKey: "Termite Inspection ($199)",
    name: "Termite Inspection",
    image: "/images/services/termite-inspection.png",
    price: "$199",
    priceNum: 199,
    points: 100,
    desc: "Comprehensive property inspection with a detailed termite activity report.",
  },
  {
    id: "free-estimate",
    serviceKey: "Free Estimate / Custom Quote",
    name: "Free Estimate",
    image: "/images/services/free-estimate.png",
    price: "Free",
    priceNum: 0,
    points: 0,
    desc: "Not sure what you need? We'll come out and assess your property at no cost.",
  },
];

// ── Protection Plans (corrected pricing from squitopestcontrol.com) ──────────
type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    id: "essential-defense",
    name: "Essential Defense",
    icon: "🛡️",
    prices: {
      monthly: "$49.99",
      yearly: "$479.88",
    },
    initialFee: "$199.99",
    desc: "Great for first-time customers & smaller homes.",
    yearSavings: "Save $120",
    pestsCount: "15+",
    coverage: "Exterior",
    frequency: "Quarterly",
    monthlyPoints: 75,
    yearlyPoints: 800,
    features: [
      "Quarterly exterior perimeter treatments",
      "Coverage for 15+ pest types",
      "Free re-service guarantee",
      "Digital inspection reports",
      "24/7 online portal access",
    ],
  },
  {
    id: "premium-shield",
    name: "Premium Shield",
    icon: "⭐",
    prices: {
      monthly: "$89.99",
      yearly: "$863.88",
    },
    initialFee: "$299.99",
    desc: "Our most popular plan — full protection, inside and out.",
    yearSavings: "Save $216",
    popular: true,
    pestsCount: "30+",
    coverage: "Interior & Exterior",
    frequency: "Quarterly",
    monthlyPoints: 125,
    yearlyPoints: 1350,
    features: [
      "Everything in Essential Defense",
      "Interior & exterior treatments",
      "Rodent baiting & exclusion",
      "Free yearly termite inspection ($150 value)",
      "Priority scheduling",
      "Unlimited re-service",
    ],
  },
  {
    id: "ultimate-fortress",
    name: "Ultimate Fortress",
    icon: "⚡",
    prices: {
      monthly: "$129.99",
      yearly: "$1,247.88",
    },
    initialFee: "$399.99",
    desc: "Total domination — yard, interior, and everything in between.",
    yearSavings: "Save $312",
    pestsCount: "40+",
    coverage: "Interior, Exterior & Yard",
    frequency: "Monthly + Quarterly",
    monthlyPoints: 200,
    yearlyPoints: 2100,
    features: [
      "Everything in Premium Shield",
      "Monthly mosquito & tick barrier spray",
      "Termite monitoring system",
      "Bed bug alert service",
      "Same-day service guarantee",
      "Dedicated personal technician",
      "Priority emergency response",
    ],
  },
];

// ── Trust badges ─────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: "📝", label: "No Contracts" },
  { icon: "🔄", label: "Free Re-Service" },
  { icon: "✅", label: "100% Satisfaction" },
  { icon: "🐾", label: "Pet & Kid Safe" },
];

export default function ServicesPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const { addItem, isInCart, hasItems, itemCount, subtotal, openDrawer } = useCart();

  // Track "just added" animation state per service
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});

  const handleAddToCart = useCallback((serviceKey: string) => {
    const result = addItem(serviceKey);
    haptics.medium();

    if (result.success) {
      setJustAdded((prev) => ({ ...prev, [serviceKey]: true }));
      setTimeout(() => {
        setJustAdded((prev) => ({ ...prev, [serviceKey]: false }));
      }, 1500);
    }
  }, [addItem]);

  const isMonthly = billingCycle === "monthly";

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
          Add services to your cart and book them all at once.
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
           ONE-TIME SERVICES
         ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mt-8 flex flex-col gap-5"
      >
        {services.map((service, idx) => {
          const inCart = isInCart(service.serviceKey);
          const wasJustAdded = justAdded[service.serviceKey];
          const isFreeEstimate = service.priceNum === 0;

          return (
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
                  : inCart
                  ? "border-squito-green/50 bg-white shadow-[0_4px_16px_rgba(107,158,17,0.08)]"
                  : "border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              }`}
            >
              {service.popular && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-squito-green px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-md">
                  ⭐ Popular
                </div>
              )}

              {inCart && !service.popular && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-squito-green/15 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-squito-green">
                  ✓ In Cart
                </div>
              )}

              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="rounded-full bg-white/95 backdrop-blur-sm px-4 py-1.5 text-[18px] font-bold text-gray-900 shadow-md">
                    {service.price}
                  </span>
                </div>
              </div>

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
                      transition={{ delay: 0.3 + idx * 0.06, type: "spring", stiffness: 300, damping: 15 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#f7fbe8] border border-squito-green/15 px-3.5 py-1.5 text-[12px] font-bold text-squito-green"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6, delay: idx * 0.5 }}
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

                  {isFreeEstimate ? (
                    <Link href={`/book?service=${service.id}`} onClick={() => haptics.light()}>
                      <GlassButton variant="secondary" className="text-[13px] py-2.5 px-5 border-gray-200 text-gray-900">
                        Schedule
                      </GlassButton>
                    </Link>
                  ) : inCart ? (
                    <GlassButton
                      variant="secondary"
                      className="text-[13px] py-2.5 px-5 border-squito-green/30 text-squito-green bg-squito-green/5"
                      disabled
                    >
                      ✓ In Cart
                    </GlassButton>
                  ) : (
                    <motion.div animate={wasJustAdded ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.3 }}>
                      <GlassButton
                        variant={service.popular ? "primary" : "secondary"}
                        className={`text-[13px] py-2.5 px-5 ${
                          service.popular
                            ? "bg-squito-green/90 dark:bg-squito-green shadow-sm"
                            : "border-gray-200 text-gray-900"
                        }`}
                        onClick={() => handleAddToCart(service.serviceKey)}
                      >
                        {wasJustAdded ? "✓ Added!" : "Add to Cart"}
                      </GlassButton>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
           PROTECTION PLANS
         ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-14"
      >
        {/* Section Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-squito-green/10 border border-squito-green/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-squito-green">
            🛡️ Protection Plans
          </span>
          <h2 className="mt-4 font-display text-[1.75rem] font-bold text-gray-900 leading-tight">
            Pick your plan.<br/>
            <span className="text-squito-green">We handle the rest.</span>
          </h2>
          <p className="mt-2 text-[12px] font-medium text-gray-500 max-w-xs mx-auto leading-relaxed">
            Every plan includes free re-service, no contracts, and the Squito Pest Control guarantee.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mx-auto flex items-center rounded-full bg-gray-100 p-1 shadow-inner max-w-xs w-full mb-6">
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => { setBillingCycle(cycle); haptics.light(); }}
              className={`flex-1 rounded-full py-2.5 text-[12px] font-bold transition-all duration-300 ${
                billingCycle === cycle
                  ? "bg-white text-squito-green shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {cycle === "monthly" ? "Monthly" : (
                <span className="flex items-center justify-center gap-1.5">
                  Yearly
                  <span className="rounded-full bg-squito-green/15 px-1.5 py-0.5 text-[9px] font-bold text-squito-green">
                    SAVE 20%
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan Cards */}
        <div className="flex flex-col gap-5">
          {plans.map((plan, idx) => {
            const price = isMonthly ? plan.prices.monthly : plan.prices.yearly;
            const points = isMonthly ? plan.monthlyPoints : plan.yearlyPoints;
            const billingLabel = isMonthly ? "/mo" : "/yr";

            return (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                key={plan.id}
                className={`relative rounded-[28px] border overflow-hidden ${
                  plan.popular
                    ? "border-squito-green bg-white shadow-[0_8px_24px_rgba(107,158,17,0.15)]"
                    : "border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-squito-green to-[#5a8c10] px-5 py-2.5 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      ⭐ Most Popular — Recommended
                    </span>
                  </div>
                )}

                <div className="p-5">
                  {/* Plan header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{plan.icon}</span>
                        <h3 className="font-display text-xl font-bold text-gray-900">{plan.name}</h3>
                      </div>
                      <p className="mt-1 text-[12px] font-medium text-gray-500 max-w-[200px]">{plan.desc}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[2.2rem] font-bold text-gray-900 tabular-nums tracking-tight">{price}</span>
                      <span className="text-[13px] font-bold text-gray-400">{billingLabel}</span>
                    </div>

                    {isMonthly ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                          <span className="line-through opacity-60">{plan.initialFee}</span> Initial fee
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          ✓ Initial fee waived · {plan.yearSavings}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                      <p className="text-[14px] font-bold text-squito-green">{plan.pestsCount}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Pests</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                      <p className="text-[11px] font-bold text-gray-900">{plan.coverage}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Coverage</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                      <p className="text-[11px] font-bold text-gray-900">{plan.frequency}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Visits</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4 flex flex-col gap-2">
                    {plan.features.map((feat, fidx) => (
                      <div key={fidx} className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f4fae6] text-[10px] text-squito-green mt-0.5">
                          ✓
                        </span>
                        <span className="text-[12px] font-medium text-gray-700 leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Points preview */}
                  <div className="mt-4 rounded-xl bg-[#f7fbe8] border border-squito-green/10 px-3.5 py-2.5 flex items-center gap-2">
                    <span className="text-sm">⭐</span>
                    <span className="text-[11px] font-bold text-squito-green">
                      Earn {points} PestPoints {isMonthly ? "every month" : "upfront"}
                      {isMonthly && <span className="text-squito-green/50"> ({points * 12}/yr)</span>}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/plans/${plan.id}`}
                      className="flex-1"
                      onClick={() => haptics.light()}
                    >
                      <GlassButton
                        variant="secondary"
                        className="w-full py-3 text-[13px] border-gray-200 text-gray-700"
                      >
                        View Details
                      </GlassButton>
                    </Link>
                    <Link
                      href={`/book?plan=${plan.id}&billing=${billingCycle}`}
                      className="flex-1"
                      onClick={() => haptics.light()}
                    >
                      <GlassButton
                        variant={plan.popular ? "primary" : "secondary"}
                        className={`w-full py-3 text-[13px] ${
                          plan.popular
                            ? "bg-squito-green/90 dark:bg-squito-green shadow-lg shadow-squito-green/20"
                            : "border-squito-green text-squito-green"
                        }`}
                      >
                        Get Plan
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 flex justify-center gap-3 flex-wrap"
        >
          {trustBadges.map((badge) => (
            <span
              key={badge.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-100 px-3.5 py-2 text-[11px] font-bold text-gray-600"
            >
              {badge.icon} {badge.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Call CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mt-10 text-center"
      >
        <Link href="tel:6312031000" onClick={() => haptics.light()}>
          <GlassButton variant="ghost" className="text-squito-green px-8 font-bold">
            Call Now: (631) 203-1000
          </GlassButton>
        </Link>
      </motion.div>

      {/* Sticky Cart Bar */}
      <AnimatePresence>
        {hasItems && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-16 left-0 right-0 z-[8500] flex justify-center px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none"
          >
            <button
              onClick={() => { openDrawer(); haptics.medium(); }}
              className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-2xl border border-squito-green/30 bg-white/95 backdrop-blur-xl px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-squito-green text-white text-[13px] font-bold">
                  {itemCount}
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-gray-900">
                    {itemCount} {itemCount === 1 ? "service" : "services"} in cart
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">
                    Tap to review & checkout
                  </p>
                </div>
              </div>
              <span className="text-[16px] font-bold text-squito-green">
                ${subtotal.toLocaleString("en-US", { minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2 })}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
