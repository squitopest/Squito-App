"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { pestsData, pestCategories, Pest, PestCategory } from "@/lib/pests-data";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
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
  const [activeCategory, setActiveCategory] = useState<PestCategory | "All">("All");
  const [identifyMode, setIdentifyMode] = useState(false);
  const [identifyImage, setIdentifyImage] = useState<string | null>(null);
  const [identifyResult, setIdentifyResult] = useState<any>(null);
  const [identifying, setIdentifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPests = useMemo(() => {
    let results = pestsData;

    if (activeCategory !== "All") {
      results = results.filter((pest) => pest.category === activeCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter(
        (pest) =>
          pest.name.toLowerCase().includes(lowerQuery) ||
          pest.description.toLowerCase().includes(lowerQuery) ||
          pest.category.toLowerCase().includes(lowerQuery) ||
          pest.scientificName.toLowerCase().includes(lowerQuery),
      );
    }

    return results;
  }, [searchQuery, activeCategory]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIdentifyImage(base64);
      setIdentifying(true);
      setIdentifyResult(null);

      try {
        const API_BASE = (typeof window !== "undefined" && (window as any).Capacitor) ? "https://squito-app.vercel.app" : "";
        const res = await fetch(`${API_BASE}/api/identify-pest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        setIdentifyResult(data);
      } catch {
        setIdentifyResult({ error: "Failed to identify. Please try again." });
      } finally {
        setIdentifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-squito-green">
              Long Island, NY
            </span>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-tight text-gray-900">
              Pest Library
            </h1>
            <p className="mt-1 text-[13px] text-gray-500 font-medium">
              {pestsData.length} species identified across Nassau & Suffolk
            </p>
          </div>
          <button
            onClick={() => setIdentifyMode(true)}
            className="flex items-center gap-2 rounded-2xl bg-squito-green px-4 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-squito-green/30 transition-all hover:shadow-xl hover:shadow-squito-green/40 active:scale-95"
          >
            <span className="text-lg">📸</span>
            ID a Pest
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            type="text"
            id="pest-search"
            className="block w-full rounded-2xl border-0 py-3.5 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-squito-green bg-white/60 backdrop-blur-md transition-all text-[15px] font-medium"
            placeholder="Search by name, species, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          {pestCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value as PestCategory | "All")}
              className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                activeCategory === cat.value
                  ? "bg-squito-green text-white shadow-md shadow-squito-green/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pest Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={activeCategory + searchQuery}
        className="mt-6 grid grid-cols-2 gap-4"
      >
        {filteredPests.map((pest) => (
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelectedPest(pest)}
            key={pest.id}
            className="flex cursor-pointer flex-col items-center p-4 rounded-[24px] bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition hover:border-squito-green/30 hover:shadow-[0_8px_20px_rgba(107,158,17,0.1)] relative overflow-hidden"
          >
            {/* Circular Image Portrait */}
            <div className="relative h-[88px] w-[88px] rounded-full overflow-hidden border-[3px] border-gray-100 shadow-md bg-gray-50">
              <Image
                src={pest.image}
                alt={pest.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <h3 className="mt-3 font-display text-[14px] font-bold text-gray-900 leading-snug text-center">
              {pest.name}
            </h3>
            <p className="text-[10px] italic text-gray-400 mt-0.5 text-center truncate w-full">
              {pest.scientificName}
            </p>

            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
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
              Try adjusting your search or filter.
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
              className="relative flex h-[90vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl"
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <div className="h-1.5 w-12 rounded-full bg-gray-300"></div>
              </div>

              {/* Hero Image */}
              <div className="flex items-center justify-center pt-10 pb-4 bg-gradient-to-b from-gray-50 to-white">
                <div className="relative h-[120px] w-[120px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src={selectedPest.image}
                    alt={selectedPest.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="text-center px-6 pb-4">
                <h2 className="font-display text-xl font-bold text-gray-900 leading-tight">
                  {selectedPest.name}
                </h2>
                <p className="text-[12px] italic text-gray-500 mt-0.5">
                  {selectedPest.scientificName}
                </p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                    {selectedPest.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border ${getRiskColor(selectedPest.riskLevel)}`}
                  >
                    🛡️ {selectedPest.riskLevel}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
                <div className="space-y-5">
                  {/* Overview */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Overview
                    </h3>
                    <p className="text-[14px] leading-relaxed text-gray-700">
                      {selectedPest.description}
                    </p>
                  </div>

                  {/* Danger */}
                  <div className="rounded-2xl bg-red-50 p-4 border border-red-100">
                    <h3 className="flex items-center text-[12px] font-bold text-red-700 mb-1.5 uppercase tracking-wide">
                      <span className="mr-2 text-lg">⚠️</span> Danger to Family
                    </h3>
                    <p className="text-[13px] font-medium leading-relaxed text-gray-800">
                      {selectedPest.dangerToFamily}
                    </p>
                  </div>

                  {/* Signs of Infestation */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      🔎 Signs of Infestation
                    </h3>
                    <div className="space-y-2">
                      {selectedPest.signs.map((sign, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-red-400 text-[12px]">●</span>
                          <p className="text-[13px] text-gray-700 leading-snug">{sign}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prevention Tips */}
                  <div className="rounded-2xl bg-[#f4fae6] p-4 border border-squito-green/20">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-squito-green mb-2">
                      ✅ Prevention Tips
                    </h3>
                    <div className="space-y-2">
                      {selectedPest.prevention.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-squito-green text-[12px]">✓</span>
                          <p className="text-[13px] text-gray-700 leading-snug">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Season & Life Cycle */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        📅 Seasonality
                      </h3>
                      <p className="text-[13px] font-medium text-gray-800">
                        {selectedPest.season}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        🔄 Life Cycle
                      </h3>
                      <p className="text-[13px] font-medium text-gray-800">
                        {selectedPest.lifeCycle}
                      </p>
                    </div>
                  </div>

                  {/* Fun Fact */}
                  <div className="rounded-2xl bg-gradient-to-br from-squito-green/5 to-squito-green/10 p-4 border border-squito-green/15">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-squito-green mb-1.5">
                      💡 Did You Know?
                    </h3>
                    <p className="text-[13px] font-medium leading-relaxed text-gray-800 italic">
                      {selectedPest.funFact}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
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

      {/* AI Pest Identifier Modal */}
      <AnimatePresence>
        {identifyMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setIdentifyMode(false);
              setIdentifyImage(null);
              setIdentifyResult(null);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl"
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-gray-300"></div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 px-6 pb-4 pt-8">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900">
                    Pest Identifier<span className="text-squito-green">✦</span>
                  </h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    Powered by AI • Photos processed securely
                  </p>
                </div>
                <GlassButton
                  variant="icon"
                  onClick={() => {
                    setIdentifyMode(false);
                    setIdentifyImage(null);
                    setIdentifyResult(null);
                  }}
                  className="!h-8 !w-8 bg-gray-100 !border-transparent text-gray-500 text-sm hover:bg-gray-200 shadow-none"
                >
                  ✕
                </GlassButton>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                {!identifyImage ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gradient-to-br from-squito-green/10 to-squito-green/5 border-2 border-dashed border-squito-green/30">
                      <span className="text-7xl">🔬</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-lg font-bold text-gray-900">
                        Snap or upload a photo
                      </h3>
                      <p className="text-[13px] text-gray-500 mt-1 max-w-[250px]">
                        Our AI will analyze the image and identify the pest species instantly.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-2xl bg-squito-green px-6 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-squito-green/30 active:scale-95 transition"
                      >
                        📸 Take Photo
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-2xl bg-gray-100 px-6 py-3.5 text-[14px] font-bold text-gray-700 active:scale-95 transition"
                      >
                        🖼️ Upload
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    {/* Preview */}
                    <div className="relative h-[200px] w-[200px] rounded-3xl overflow-hidden border-2 border-gray-200 shadow-lg">
                      <Image
                        src={identifyImage}
                        alt="Uploaded pest"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {identifying && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <motion.div
                              animate={{ y: [0, 180, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute top-2 left-0 right-0 h-1 bg-squito-green shadow-[0_0_20px_rgba(107,158,17,1)]"
                            />
                            <span className="text-white text-sm font-bold">Analyzing...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Result */}
                    {identifyResult && !identifyResult.error && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full rounded-2xl bg-white border border-gray-200 shadow-lg p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-squito-green/10 text-3xl">
                            🎯
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-bold text-gray-900">
                              {identifyResult.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${getRiskColor(identifyResult.dangerLevel || "Nuisance")}`}>
                                {identifyResult.dangerLevel || "Unknown Risk"}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {identifyResult.confidence}% match
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-600 mt-3 leading-relaxed">
                          {identifyResult.description}
                        </p>
                        {identifyResult.matchedPestId && (
                          <button
                            onClick={() => {
                              const match = pestsData.find(p => p.id === identifyResult.matchedPestId);
                              if (match) {
                                setIdentifyMode(false);
                                setIdentifyImage(null);
                                setIdentifyResult(null);
                                setSelectedPest(match);
                              }
                            }}
                            className="mt-4 w-full rounded-xl bg-squito-green/10 py-3 text-[13px] font-bold text-squito-green transition hover:bg-squito-green/20"
                          >
                            View Full Profile →
                          </button>
                        )}
                        <Link href="/book" className="block mt-2">
                          <GlassButton variant="primary" className="w-full py-3 text-[13px]">
                            Book Treatment Now
                          </GlassButton>
                        </Link>
                      </motion.div>
                    )}

                    {identifyResult?.error && (
                      <div className="w-full rounded-2xl bg-red-50 border border-red-100 p-5 text-center">
                        <span className="text-3xl">😕</span>
                        <p className="text-[13px] text-red-700 mt-2 font-medium">
                          {identifyResult.error}
                        </p>
                      </div>
                    )}

                    {!identifying && (
                      <button
                        onClick={() => {
                          setIdentifyImage(null);
                          setIdentifyResult(null);
                        }}
                        className="text-[13px] font-bold text-gray-400 hover:text-gray-600 transition"
                      >
                        Try another photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
