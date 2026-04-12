"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { haptics } from "@/lib/haptics";
import { useState } from "react";

// ── Plan deep-dive data (matches squitopestcontrol.com/plans exactly) ────────
interface PlanData {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  popular?: boolean;
  prices: { monthly: string; yearly: string };
  monthlyCents: number;
  yearlyCents: number;
  initialFee: string;
  initialFeeCents: number;
  savings: string;
  // Points
  monthlyPoints: number;
  yearlyPoints: number;
  // Deep dive
  bestFor: string[];
  pestsCount: string;
  pestsList: string[];
  treatments: string;
  coverageArea: string;
  responseTime: string;
  included: string[];
  // Comparison
  tier: number; // 1, 2, 3
}

const PLANS: Record<string, PlanData> = {
  "essential-defense": {
    id: "essential-defense",
    name: "Essential Defense",
    tagline: "Great for first-time customers & smaller homes.",
    icon: "🛡️",
    prices: { monthly: "$49.99", yearly: "$479.88" },
    monthlyCents: 4999,
    yearlyCents: 47988,
    initialFee: "$199.99",
    initialFeeCents: 19999,
    savings: "Save $120.00 vs monthly",
    monthlyPoints: 75,
    yearlyPoints: 800,
    bestFor: [
      "Apartments & condos",
      "Budget-conscious homeowners",
      "Low-infestation areas",
      "First-time pest control customers",
    ],
    pestsCount: "15+",
    pestsList: [
      "Ants", "Spiders", "Stink bugs", "Earwigs", "Centipedes",
      "Beetles", "Wasps (exterior nests)", "Crickets", "Silverfish",
    ],
    treatments: "Quarterly (4x per year)",
    coverageArea: "Exterior only",
    responseTime: "Standard scheduling",
    included: [
      "Quarterly exterior perimeter treatments",
      "Coverage for 15+ common pest types",
      "Free re-service if pests return between visits",
      "Digital inspection report after each visit",
      "24/7 online account & service portal access",
    ],
    tier: 1,
  },
  "premium-shield": {
    id: "premium-shield",
    name: "Premium Shield",
    tagline: "Our most popular plan — full protection, inside and out.",
    icon: "⭐",
    popular: true,
    prices: { monthly: "$89.99", yearly: "$863.88" },
    monthlyCents: 8999,
    yearlyCents: 86388,
    initialFee: "$299.99",
    initialFeeCents: 29999,
    savings: "Save $216.00 vs monthly",
    monthlyPoints: 125,
    yearlyPoints: 1350,
    bestFor: [
      "Single-family homes",
      "Pet & kid households",
      "Year-round full coverage",
      "Anyone who's had rodent issues",
    ],
    pestsCount: "30+",
    pestsList: [
      "Everything in Essential", "Cockroaches", "Mice & Rats",
      "Termite inspection", "Fleas (interior)", "Bed bugs (initial check)",
      "Carpenter ants", "Hornets & yellow jackets",
    ],
    treatments: "Quarterly (4x per year)",
    coverageArea: "Interior & Exterior",
    responseTime: "Priority scheduling",
    included: [
      "Quarterly interior & exterior treatments",
      "Coverage for 30+ pest types",
      "Free re-service guarantee — unlimited",
      "Rodent baiting & exterior exclusion",
      "Free yearly termite inspection ($150 value)",
      "Priority scheduling — skip the queue",
      "Digital inspection report after each visit",
      "24/7 online account & service portal access",
    ],
    tier: 2,
  },
  "ultimate-fortress": {
    id: "ultimate-fortress",
    name: "Ultimate Fortress",
    tagline: "Total domination — yard, interior, and everything in between.",
    icon: "⚡",
    prices: { monthly: "$129.99", yearly: "$1,247.88" },
    monthlyCents: 12999,
    yearlyCents: 124788,
    initialFee: "$399.99",
    initialFeeCents: 39999,
    savings: "Save $312.00 vs monthly",
    monthlyPoints: 200,
    yearlyPoints: 2100,
    bestFor: [
      "Large properties & estates",
      "Families with young children or pets",
      "Homeowners near wooded or marshy areas",
      "Anyone wanting total peace of mind",
    ],
    pestsCount: "40+",
    pestsList: [
      "Everything in Premium Shield", "Mosquitoes (monthly spray)",
      "Ticks (monthly spray)", "Fleas (outdoor seasonal)",
      "Termites (monitoring)", "Bed bugs (full alert service)",
    ],
    treatments: "Monthly mosquito & tick + Quarterly pest visits",
    coverageArea: "Interior, Exterior & Yard",
    responseTime: "Same-day guarantee",
    included: [
      "Everything in Premium Shield",
      "Monthly mosquito & tick yard barrier spray",
      "Termite monitoring system installed",
      "Bed bug alert & early detection service",
      "Seasonal outdoor flea & tick coverage",
      "Dedicated personal service technician",
      "Same-day service guarantee (bookings before 2 PM)",
      "Priority emergency response",
      "Annual whole-home pest audit report",
    ],
    tier: 3,
  },
};

// ── Guarantees ───────────────────────────────────────────────────────────────
const guarantees = [
  {
    icon: "✅",
    title: "100% Satisfaction Guarantee",
    desc: "If you're not happy after your first service, we'll refund your first month — no questions asked.",
  },
  {
    icon: "🔄",
    title: "Free Re-Service Promise",
    desc: "If covered pests return between scheduled visits, we come back at no charge. Every single time.",
  },
  {
    icon: "📝",
    title: "No Contracts. Ever.",
    desc: "Cancel anytime with zero fees. We earn your business every month through results, not fine print.",
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Are there any contracts or cancellation fees?",
    a: "No Contracts. Ever. Cancel anytime with zero fees. We earn your business every month through results, not fine print.",
  },
  {
    q: "What happens if pests come back between visits?",
    a: "We come back — for free. All plans include unlimited re-service calls if covered pests return between your scheduled treatments. Just call or submit a request online.",
  },
  {
    q: "Are your treatments safe for pets and children?",
    a: "Yes. We use EPA-registered, low-toxicity products with dry times under 30 minutes for interior treatments. We'll walk you through any precautions before every service.",
  },
  {
    q: "How quickly can I get my first appointment?",
    a: "We offer same-day service for bookings placed before 2 PM (Ultimate Fortress plan) and next-day availability for all other plans in most Nassau and Suffolk County zip codes.",
  },
  {
    q: "Can I switch plans after signing up?",
    a: "Of course. You can upgrade or downgrade your plan at any time from your account portal or by calling us. Changes take effect at your next service visit.",
  },
];

type BillingCycle = "monthly" | "yearly";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const plan = PLANS[planId];
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!plan) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32">
        <span className="text-5xl mb-4">🤔</span>
        <h1 className="font-display text-2xl font-bold text-gray-900">Plan not found</h1>
        <Link href="/plans" className="mt-6">
          <GlassButton variant="primary" className="bg-squito-green/90 dark:bg-squito-green px-8 py-3">
            ← Back to Services
          </GlassButton>
        </Link>
      </div>
    );
  }

  const isMonthly = billing === "monthly";
  const price = isMonthly ? plan.prices.monthly : plan.prices.yearly;
  const points = isMonthly ? plan.monthlyPoints : plan.yearlyPoints;
  const billingLabel = isMonthly ? "/mo" : "/yr";

  // Gradient for each tier
  const gradientClass = plan.tier === 3
    ? "from-amber-600 via-amber-500 to-yellow-400"
    : plan.tier === 2
    ? "from-squito-green via-[#5a8c10] to-[#7db818]"
    : "from-gray-700 via-gray-600 to-gray-500";

  return (
    <div className="flex min-h-full flex-col pb-32">
      {/* ── Hero ── */}
      <div className={`relative bg-gradient-to-br ${gradientClass} px-5 pt-14 pb-8 sm:px-8`}>
        {/* Back button */}
        <button
          onClick={() => { router.back(); haptics.light(); }}
          className="absolute top-12 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl text-white active:scale-90 transition-transform"
        >
          ←
        </button>

        {plan.popular && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex justify-center"
          >
            <span className="rounded-full bg-white/25 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              ⭐ Most Popular — Recommended
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="text-4xl mb-3 block">{plan.icon}</span>
          <h1 className="font-display text-3xl font-bold text-white">{plan.name}</h1>
          <p className="mt-2 text-[13px] font-medium text-white/80 max-w-xs mx-auto">
            {plan.tagline}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 mx-auto flex items-center rounded-full bg-white/15 backdrop-blur-lg p-1 max-w-[260px] w-full"
        >
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => { setBilling(cycle); haptics.light(); }}
              className={`flex-1 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-300 ${
                billing === cycle
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-white/70"
              }`}
            >
              {cycle === "yearly" ? "Yearly (Save 20%)" : "Monthly"}
            </button>
          ))}
        </motion.div>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-center"
        >
          {isMonthly ? (
            <>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-[2.8rem] font-bold text-white tabular-nums tracking-tight">{plan.initialFee}</span>
                <span className="text-[14px] font-bold text-white/60">due today</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold text-white/90">
                  📋 Initial setup fee — first month
                </span>
                <p className="mt-1.5 text-[10px] text-white/50">
                  Then {plan.prices.monthly}/mo starting next month
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-baseline gap-1">
                <span className="text-[2.8rem] font-bold text-white tabular-nums tracking-tight">{plan.prices.yearly}</span>
                <span className="text-[14px] font-bold text-white/60">/yr</span>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/25 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold text-emerald-100">
                  ✓ Initial fee waived — {plan.savings}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 sm:px-8">

        {/* PestPoints */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl border border-squito-green/20 bg-[#f7fbe8] px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              ⭐
            </motion.span>
            <div>
              <p className="text-[13px] font-bold text-squito-green">
                Earn {points} PestPoints {isMonthly ? "every month" : "upfront"}
              </p>
              <p className="text-[10px] font-medium text-squito-green/60 mt-0.5">
                {isMonthly
                  ? `${points * 12} pts/year — unlock rewards & tier upgrades faster`
                  : `Bulk point bonus — instant tier boost!`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Best For */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Best For
          </h2>
          <div className="flex flex-wrap gap-2">
            {plan.bestFor.map((item, idx) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-[12px] font-medium text-gray-700 shadow-sm"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-[2rem] font-bold text-squito-green">{plan.pestsCount}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">Pests Covered</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-[14px] font-bold text-gray-900 leading-tight">{plan.treatments.split("(")[0].trim()}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">Treatment Frequency</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-[14px] font-bold text-gray-900">{plan.coverageArea}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">Coverage Area</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className="text-[14px] font-bold text-gray-900">{plan.responseTime}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">Response Time</p>
          </div>
        </motion.div>

        {/* Pests Covered */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            🐛 Pests Covered
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {plan.pestsList.map((pest, idx) => {
                const isInherited = pest.startsWith("Everything in");
                return (
                  <motion.span
                    key={pest}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.03 }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                      isInherited
                        ? "bg-squito-green/10 text-squito-green border border-squito-green/20"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {isInherited ? `✓ ${pest}` : pest}
                  </motion.span>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            ✅ What&apos;s Included
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            {plan.included.map((item, idx) => {
              const isInherited = item.startsWith("Everything in");
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + idx * 0.04 }}
                  className="flex items-start gap-3 px-4 py-3.5"
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] mt-0.5 ${
                    isInherited
                      ? "bg-squito-green/15 text-squito-green"
                      : "bg-[#f4fae6] text-squito-green"
                  }`}>
                    ✓
                  </span>
                  <span className={`text-[13px] leading-snug ${
                    isInherited ? "font-bold text-squito-green" : "font-medium text-gray-700"
                  }`}>
                    {item}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Our Promise to You
          </h2>
          <div className="flex flex-col gap-3">
            {guarantees.map((g, idx) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + idx * 0.05 }}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <span className="text-lg shrink-0">{g.icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{g.title}</p>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-relaxed">{g.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden divide-y divide-gray-50">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <button
                  onClick={() => {
                    setOpenFaq(openFaq === idx ? null : idx);
                    haptics.light();
                  }}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
                >
                  <span className="text-[13px] font-bold text-gray-900 pr-4 leading-snug">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === idx ? 180 : 0 }}
                    className="text-gray-400 text-[14px] shrink-0"
                  >
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-[12px] font-medium text-gray-500 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] text-gray-400 mb-2">Have questions? We&apos;re here to help.</p>
          <Link href="tel:6312031000" onClick={() => haptics.light()}>
            <GlassButton variant="ghost" className="text-squito-green px-6 font-bold text-[13px]">
              📞 Call (631) 203-1000
            </GlassButton>
          </Link>
        </motion.div>
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <div className="fixed bottom-16 left-0 right-0 z-[8500] px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 25 }}
          className="pointer-events-auto mx-auto max-w-sm rounded-2xl border border-squito-green/30 bg-white/95 backdrop-blur-xl px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-[14px] font-bold text-gray-900">{plan.name}</p>
              <p className="text-[11px] text-gray-500">
                {isMonthly
                  ? `${plan.initialFee} today · then ${plan.prices.monthly}/mo`
                  : `${plan.prices.yearly}/yr · Fee waived`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-squito-green">
                ⭐ +{points} pts{isMonthly ? "/mo" : ""}
              </p>
            </div>
          </div>
          <Link
            href={`/book?plan=${plan.id}&billing=${billing}`}
            className="block"
            onClick={() => haptics.medium()}
          >
            <GlassButton
              variant="primary"
              className="w-full py-3.5 text-[14px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
            >
              {isMonthly
                ? `Subscribe · ${plan.initialFee} today`
                : `Subscribe · ${plan.prices.yearly}/yr`}
            </GlassButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
