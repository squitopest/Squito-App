"use client";

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

const pests = [
  { name: "Mosquitoes", icon: "🦟", risk: "High Risk", desc: "Active spring through fall. Carries West Nile." },
  { name: "Ticks", icon: "🕷️", risk: "Severe", desc: "High Lyme disease risk on Long Island." },
  { name: "Termites", icon: "🐜", risk: "Structural", desc: "Silent destroyers of home foundations." },
  { name: "Rodents", icon: "🐀", risk: "High Risk", desc: "Mice and rats seeking winter shelter." },
  { name: "Roaches", icon: "🪳", risk: "Sanitary", desc: "Year-round indoor invaders." },
  { name: "Wasps", icon: "🐝", risk: "Stinging", desc: "Aggressive late summer nesters." },
];

export default function PestsPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-squito-green">
          Library
        </span>
        <h1 className="mt-1 font-display text-[2rem] font-bold leading-tight text-gray-900">
          Island Pests
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
          Identify your pest. Click any card to learn more about our specific treatment formulas.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 grid grid-cols-2 gap-4"
      >
        {pests.map((pest, idx) => (
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.94 }}
            key={idx}
            className="flex cursor-pointer flex-col p-4 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition hover:border-squito-green/30"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-[26px]">
              {pest.icon}
            </div>
            <h3 className="mt-4 font-display text-[15px] font-bold text-gray-900">{pest.name}</h3>
            <span className="mt-1 w-max rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#fef3c7] text-[#92400e]">
              {pest.risk}
            </span>
            <p className="mt-3 text-[11px] font-medium leading-relaxed text-gray-500">
              {pest.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
