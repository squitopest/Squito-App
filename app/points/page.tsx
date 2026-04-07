"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export default function PointsPage() {
  return (
    <div className="flex min-h-full flex-col">
      
      {/* Top Light Section */}
      <div className="bg-white px-5 pb-8 pt-12 border-b border-gray-100 shadow-sm sm:px-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-display text-xl font-bold tracking-widest text-[#111]">
            S<span className="text-squito-green">●</span>QUITO
          </div>
          <span className="text-sm font-bold tracking-wide text-squito-green">
            Points & Rewards
          </span>
        </header>

        {/* Points Display */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="mt-10"
        >
          <div className="inline-flex rounded-full border border-squito-green bg-squito-green/10 px-4 py-1.5 text-xs font-bold tracking-wide text-squito-green drop-shadow-sm">
            Squito Points
          </div>
          <div className="mt-2 font-display text-[5.5rem] font-bold leading-none tracking-tight text-[#111]">
            620
          </div>
          <div className="mt-2 text-sm font-medium text-gray-500">
            Your current balance <span className="mx-1.5">•</span> Gold member
          </div>
        </motion.div>

        {/* Tiers Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-4 gap-2"
        >
          {[
            { tag: "Starter", range: "0–249" },
            { tag: "Silver", range: "250–499" },
            { tag: "Gold", range: "500–999", active: true },
            { tag: "Elite", range: "1000+" },
          ].map((tier, idx) => (
            <motion.div
              variants={itemVariants}
              key={idx}
              className={`flex flex-col items-center justify-center rounded-xl py-3 border ${
                tier.active 
                  ? "border-squito-green bg-[#f7fbe8] shadow-[0_4px_15px_rgba(107,158,17,0.15)]" 
                  : "border-gray-100 bg-gray-50 shadow-sm"
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider sm:text-xs ${tier.active ? "text-squito-green" : "text-gray-400"}`}>
                {tier.tag}
              </span>
              <span className={`mt-1 text-xs font-bold sm:text-sm ${tier.active ? "text-[#111]" : "text-gray-700"}`}>
                {tier.range}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex justify-between text-xs font-bold text-gray-800">
            <span>Gold member</span>
            <span className="text-gray-500">380 pts to Elite</span>
          </div>
          {/* Bar Background */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
            {/* Animated Fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "62%" }}
              transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.7 }}
              className="h-full rounded-full bg-squito-green shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Light Section */}
      <div className="flex-1 px-5 pt-2 pb-10 sm:px-8">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-2 pt-2">
          {["Earn", "Redeem", "Gift", "History"].map((tab, idx) => (
            <div
              key={tab}
              className={`flex-1 pb-4 text-center text-[13px] font-bold tracking-wide transition-colors ${
                idx === 0 
                  ? "border-b-[3px] border-squito-green text-squito-green" 
                  : "text-gray-400 border-b-[3px] border-transparent hover:text-gray-600"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] font-medium leading-relaxed text-gray-600 pr-4">
          Every action earns you points toward free services and rewards.
        </p>

        {/* Action List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col gap-4"
        >
          {[
            {
              title: "Book a service",
              desc: "Any scheduled visit",
              pts: "+50 pts",
              icon: "🗓️",
              bg: "bg-[#f4fae6]",
            },
            {
              title: "Sign up for a plan",
              desc: "Essential, Premium, or Ultimate",
              pts: "+200 pts",
              icon: "📋",
              bg: "bg-[#f4fae6]",
            },
            {
              title: "Leave a Google review",
              desc: "Verified reviews only",
              pts: "+150 pts",
              icon: "⭐",
              bg: "bg-[#f4fae6]",
            },
            {
              title: "Refer a friend",
              desc: "When they complete their first service",
              pts: "+300 pts",
              icon: "👥",
              bg: "bg-[#f4fae6]",
            },
          ].map((action, idx) => (
            <motion.div 
              variants={itemVariants}
              whileTap={{ scale: 0.96 }}
              key={idx} 
              className="flex cursor-pointer items-center gap-4 rounded-3xl bg-white border border-gray-100 p-3 pr-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
            >
              <div className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ${action.bg}`}>
                <span className="text-[22px] drop-shadow-sm">{action.icon}</span>
              </div>
              <div className="flex-1 space-y-0.5">
                <h3 className="font-display font-bold text-[14px] text-gray-900">
                  {action.title}
                </h3>
                <p className="text-[11px] font-medium text-gray-500">{action.desc}</p>
              </div>
              <div className="font-bold tracking-wide text-squito-green">{action.pts}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pro Tip Card */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 20 }}
           className="mt-10 rounded-2xl bg-[#f7fbe8] border border-squito-green/20 p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <span className="text-2xl drop-shadow-sm">💡</span>
            <div>
              <h4 className="font-bold text-squito-green">Pro tip</h4>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-squito-green/80 pr-2">
                Sign up for a plan + leave a review + refer one friend = 650 bonus points. That's a free service visit!
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
