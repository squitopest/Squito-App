"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Essential",
    price: "$59/mo",
    desc: "Basic perimeter defense for the season.",
    features: ["Quarterly exterior sprays", "Ant & Roach control", "Basic web dusting"],
    popular: false,
  },
  {
    name: "Premium Shield",
    price: "$89/mo",
    desc: "Complete yard and home barrier.",
    features: ["Bi-monthly service", "Mosquito & Tick coverage", "Indoor treatments as needed", "Free callbacks"],
    popular: true,
  },
  {
    name: "Ultimate",
    price: "$149/mo",
    desc: "Total property domination.",
    features: ["Monthly service", "Termite bait stations", "Wildlife exclusion", "Priority same-day routing"],
    popular: false,
  }
];

export default function PlansPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-[2rem] font-bold leading-tight text-gray-900">
          Shield Plans
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
          Subscribe to break the pest life cycle forever.
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
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: idx * 0.1 }}
            key={idx}
            className={`relative flex flex-col rounded-[32px] border ${
              plan.popular 
                ? "border-squito-green bg-white shadow-[0_10px_30px_rgba(107,158,17,0.15)]" 
                : "border-gray-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
            } p-6 pb-8`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-squito-green px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                <span>⭐</span> Most Popular
              </div>
            )}
            
            <div className={`mt-2 ${plan.popular ? "text-squito-green" : "text-gray-900"}`}>
              <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
              </div>
              <p className={`mt-3 text-[13px] font-medium ${plan.popular ? "text-squito-green/80" : "text-gray-500"}`}>
                {plan.desc}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6">
              {plan.features.map((feat, fidx) => (
                <div key={fidx} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4fae6] text-[10px] text-squito-green">✓</span>
                  <span className="text-[13px] font-medium text-gray-700">{feat}</span>
                </div>
              ))}
            </div>

            <button className={`mt-8 rounded-2xl py-4 text-[15px] font-bold transition active:scale-95 ${
              plan.popular 
                ? "bg-squito-green text-white shadow-md shadow-squito-green/20" 
                : "bg-gray-50 text-gray-900 border border-gray-200"
            }`}>
              Select Plan
            </button>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
