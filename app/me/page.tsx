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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

export default function MePage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      
      {/* Header Avatar Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center pt-8"
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-squito-green bg-[#111] shadow-md">
          <span className="text-[40px]">🏡</span>
        </div>
        <h1 className="mt-4 font-display text-[22px] font-bold text-gray-900">Marc&apos;s Account</h1>
        <p className="text-[13px] font-medium text-gray-500">Premium Shield Member <span className="mx-1">•</span> Gold Points</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-col gap-6"
      >
        
        {/* Squito Points Card */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Squito Points</h2>
            <span className="text-2xl font-bold text-squito-green">620 pts</span>
          </div>
          <p className="mt-3 text-[12px] font-medium text-gray-500">380 pts until Elite tier</p>
          
          {/* Progress Bar */}
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "62%" }}
              transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 }}
              className="h-full rounded-full bg-squito-green shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
            />
          </div>

          <button className="mt-6 w-full rounded-2xl border border-squito-green py-3.5 text-sm font-bold text-squito-green transition hover:bg-squito-green/5 active:scale-[0.98]">
            View Points & Rewards <span className="ml-1">→</span>
          </button>
        </motion.div>

        {/* Service History Card */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Service history</h2>
          
          <div className="flex flex-col gap-0">
             {[
               { title: "Mosquito barrier spray", date: "March 14, 2026", status: "Complete" },
               { title: "General pest control", date: "Jan 22, 2026", status: "Complete", borderTop: true },
               { title: "Termite inspection", date: "Dec 5, 2025", status: "Complete", borderTop: true },
             ].map((service, idx) => (
               <div key={idx} className={`flex items-center justify-between py-4 ${service.borderTop ? 'border-t border-gray-100' : ''}`}>
                 <div>
                   <h3 className="font-bold text-[14px] text-gray-900">{service.title}</h3>
                   <p className="text-[12px] text-gray-500 mt-0.5">{service.date}</p>
                 </div>
                 <div className="rounded-full bg-[#f4fae6] px-3 py-1 text-[11px] font-bold text-squito-green">
                   {service.status}
                 </div>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Contact Card */}
        <motion.div variants={itemVariants} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Contact Squito</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 rounded-2xl bg-[#f4fae6] p-4 text-squito-green">
              <span className="text-xl">📞</span>
              <div>
                <h3 className="font-bold text-[14px] text-gray-900">(631) 203-1000</h3>
                <p className="text-[11px] font-medium text-squito-green">Call us — same-day available</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <span className="text-xl opacity-60">✉️</span>
              <div>
                <h3 className="font-bold text-[14px] text-gray-900">service@getsquito.com</h3>
                <p className="text-[11px] font-medium text-gray-500">We respond within the hour</p>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
