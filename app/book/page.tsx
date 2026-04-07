"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function BookPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
    }, 1500); // Faking submission for the UX demo
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4fae6]">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900">Booking Requested</h1>
        <p className="mt-4 font-medium text-gray-500">We will verify via text and dispatch a truck on your preferred date!</p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-10 rounded-full font-bold text-squito-green"
        >
          Book another property
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 font-display text-[2rem] font-bold leading-tight text-gray-900"
      >
        Book a Service
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-2 text-sm font-medium text-gray-500"
      >
        Fast guest routing. No account required.
      </motion.p>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">Full Name</label>
          <input 
            required 
            placeholder="Jane Smith" 
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">Phone</label>
          <input 
            required 
            type="tel"
            placeholder="(555) 555-5555" 
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">Address (Long Island)</label>
          <input 
            required 
            placeholder="123 Main St, Huntington" 
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">What do you need?</label>
          <select 
            required 
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          >
            <option>General inspection & treatment</option>
            <option>Mosquitoes & Ticks</option>
            <option>Ants / Roaches</option>
            <option>Termites / WDO</option>
            <option>Rodents / Wildlife</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">When can we come?</label>
          <input 
            required 
            placeholder="Anytime next week" 
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        <button 
          type="submit"
          className="mt-6 flex w-full items-center justify-center rounded-[20px] bg-squito-green py-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(107,158,17,0.25)] transition hover:scale-[1.02] active:scale-95"
        >
          {status === "submitting" ? "Processing..." : "Confirm Booking"}
        </button>
      </motion.form>
    </div>
  );
}
