"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useMemo } from "react";
import { pestsData, Pest } from "@/lib/pests-data";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function PestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);

  const filteredPests = useMemo(() => {
    if (!searchQuery) return pestsData;
    const lowerQuery = searchQuery.toLowerCase();
    return pestsData.filter(
      (pest) =>
        pest.name.toLowerCase().includes(lowerQuery) ||
        pest.description.toLowerCase().includes(lowerQuery) ||
        pest.category.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Severe Disease":
        return "bg-red-100 text-red-800 border-red-200";
      case "High Risk":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Stinging":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Structural":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Sanitary":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Nuisance":
      default:
        return "bg-[#f4fae6] text-squito-green border-squito-green/20";
    }
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-squito-green">
              Knowledge Base
            </span>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-tight text-gray-900">
              Island Pests
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            type="text"
            className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-squito-green bg-white/60 backdrop-blur-md transition-all text-[15px] font-medium"
            placeholder="Search by name, category, or symptom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 grid grid-cols-2 gap-4 pb-20"
      >
        {filteredPests.map((pest) => (
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelectedPest(pest)}
            key={pest.id}
            className="flex cursor-pointer flex-col p-4 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition hover:border-squito-green/30 hover:shadow-[0_8px_20px_rgba(107,158,17,0.1)] relative overflow-hidden"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-[26px]">
              {pest.icon}
            </div>
            <h3 className="mt-4 font-display text-[15px] font-bold text-gray-900 leading-snug">
              {pest.name}
            </h3>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${getRiskColor(pest.riskLevel)}`}
              >
                {pest.riskLevel}
              </span>
            </div>
          </motion.div>
        ))}
        {filteredPests.length === 0 && (
          <div className="col-span-2 text-center py-10">
            <span className="text-4xl opacity-50 mb-4 block">🧐</span>
            <h3 className="text-sm font-bold text-gray-900">No pests found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </motion.div>

      {/* Detail Modal Layer */}
      <AnimatePresence>
        {selectedPest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedPest(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl"
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-[32px] shadow-sm border border-gray-100">
                    {selectedPest.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-gray-900 leading-tight">
                      {selectedPest.name}
                    </h2>
                    <p className="text-[12px] italic text-gray-500">
                      {selectedPest.scientificName}
                    </p>
                  </div>
                </div>
                <GlassButton
                  variant="icon"
                  onClick={() => setSelectedPest(null)}
                  className="!h-8 !w-8 bg-gray-100 !border-transparent text-gray-500 text-sm hover:bg-gray-200 shadow-none -mt-4 -mr-2"
                >
                  ✕
                </GlassButton>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                    {selectedPest.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border ${getRiskColor(selectedPest.riskLevel)}`}
                  >
                    🛡️ {selectedPest.riskLevel}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Overview
                    </h3>
                    <p className="text-[14px] leading-relaxed text-gray-700">
                      {selectedPest.description}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f4fae6] p-4 border border-squito-green/20">
                    <h3 className="flex items-center text-[12px] font-bold text-squito-green mb-1.5 uppercase tracking-wide">
                      <span className="mr-2 text-lg">⚠️</span> Danger to Family
                    </h3>
                    <p className="text-[13px] font-medium leading-relaxed text-gray-800">
                      {selectedPest.dangerToFamily}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Seasonality
                      </h3>
                      <p className="text-[13px] font-medium text-gray-800">
                        {selectedPest.season}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Life Cycle
                      </h3>
                      <p className="text-[13px] font-medium text-gray-800">
                        {selectedPest.lifeCycle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white/80 p-5 backdrop-blur-xl pb-safe">
                <Link href="/book">
                  <GlassButton
                    variant="primary"
                    className="w-full py-4 text-[15px]"
                  >
                    Book Treatment Plan
                  </GlassButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
