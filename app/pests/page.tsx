"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { pestsData, pestCategories, Pest, PestCategory } from "@/lib/pests-data";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { getApiBase } from "@/lib/runtimeConfig";

interface PestIdentifyResult {
  name: string;
  scientificName?: string;
  dangerLevel?: string;
  confidence: number;
  description: string;
  isProtected?: boolean;
  visualClues?: string;
  recommendation?: string;
  error?: string;
}

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
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);
  const [activeCategory, setActiveCategory] = useState<PestCategory | "All">("All");
  const [identifyMode, setIdentifyMode] = useState(false);
  const [identifyImage, setIdentifyImage] = useState<string | null>(null);
  const [identifyResult, setIdentifyResult] = useState<PestIdentifyResult | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const filteredPests = useMemo(() => {
    let results = pestsData;
    if (activeCategory !== "All") {
      results = results.filter((pest) => pest.category === activeCategory);
    }
    return results;
  }, [activeCategory]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Severe Disease":
        return "bg-red-500/15 text-red-400 border-red-500/20";
      case "High Risk":
        return "bg-orange-500/15 text-orange-400 border-orange-500/20";
      case "Stinging":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
      case "Structural":
      case "Wood Damage":
        return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      case "Sanitary":
        return "bg-purple-500/15 text-purple-400 border-purple-500/20";
      case "Protected Species":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "Beneficial":
      case "None":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";
      case "Nuisance":
      default:
        return "bg-squito-green/15 text-squito-green border-squito-green/20";
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Could not read image file"));
      };
      reader.onerror = () => reject(new Error("Could not read image file"));
      reader.readAsDataURL(file);
    });

  // Compress & normalize any image (HEIC, PNG, BMP, WebP) to JPEG < 1MB
  // so GPT-4o vision never throws "unsupported image" errors.
  // Falls back to raw data URL if canvas rendering fails (e.g., HEIF on some iOS WKWebViews).
  const compressToJpeg = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      // Fallback: read file as raw data URL (skips canvas compression)
      const fallbackRead = () => readFileAsDataUrl(file).then(resolve).catch(reject);

      try {
        const img = new window.Image();
        const objectUrl = URL.createObjectURL(file);

        // If image doesn't load within 8s, use fallback
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
          fallbackRead();
        }, 8000);

        img.onload = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          try {
            const MAX = 1024;
            let { width, height } = img;
            if (width > MAX || height > MAX) {
              if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
              else { width = Math.round((width * MAX) / height); height = MAX; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { fallbackRead(); return; }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            // Sanity check — canvas may produce an empty/tiny result for some formats
            if (dataUrl && dataUrl.length > 100) {
              resolve(dataUrl);
            } else {
              fallbackRead();
            }
          } catch {
            fallbackRead();
          }
        };
        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          fallbackRead();
        };
        img.src = objectUrl;
      } catch {
        fallbackRead();
      }
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    setIdentifying(true);
    setIdentifyResult(null);

    try {
      // Preserve the preview immediately so native photo-picker hiccups
      // don't kick the user back to the empty upload state.
      const preview = await readFileAsDataUrl(file);
      setIdentifyImage(preview);

      const jpeg = await compressToJpeg(file);

      const { Capacitor } = await import("@capacitor/core");
      const API_BASE = getApiBase(Capacitor.isNativePlatform());
      const res = await fetch(`${API_BASE}/api/identify-pest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: jpeg }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setIdentifyResult({
          name: "",
          confidence: 0,
          description: "",
          error: errorData?.error || `Server error (${res.status}). Please try again.`,
        });
        return;
      }

      const data: PestIdentifyResult = await res.json();
      if ((!data.name || !data.description) && !data.error) {
        throw new Error("AI identification returned an incomplete result.");
      }
      setIdentifyResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : "Failed to process image. Please try again.";
      // DON'T clear identifyImage — keep the preview visible so the user
      // sees their photo + the error, instead of snapping back to upload screen.
      setIdentifyResult({
        name: "",
        confidence: 0,
        description: "",
        error: message,
      });
    } finally {
      setIdentifying(false);
    }
  };


  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8 bg-squito-appBlack">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-squito-green">
              Long Island, NY
            </span>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-tight text-white">
              Pest Library
            </h1>
            <p className="mt-1 text-base text-white/65 font-medium">
              Most commonly identified across Nassau &amp; Suffolk
            </p>
          </div>
        </div>

        {/* ── Pest Identifier Hero Card ── */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setIdentifyMode(true)}
          className="mt-5 cursor-pointer relative overflow-hidden rounded-[24px] bg-gradient-to-br from-squito-green via-[#7ec518] to-[#5a9e0f] p-5 shadow-xl shadow-squito-green/30"
        >
          {/* Animated glow blob */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl pointer-events-none"
          />
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-inner">
              <span className="text-3xl">📸</span>
            </div>
            <div className="flex-1">
              <p className="text-2xs font-bold uppercase tracking-[0.2em] text-white/70">AI-Powered • Instant Results</p>
              <h2 className="mt-0.5 font-display text-2xl font-bold text-white leading-tight">
                Pest Identifier
              </h2>
              <p className="mt-1 text-sm font-medium text-white/80">
                Snap or upload a photo for an instant expert ID
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/30">
              <span className="text-white font-bold text-sm">→</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {["🦟 Mosquito", "🕷️ Spider", "🐜 Ant", "🐝 Wasp", "🪲 Beetle"].map((tag) => (
              <span key={tag} className="rounded-full bg-white/15 border border-white/20 px-2.5 py-1 text-2xs font-bold text-white backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Category Filters */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          {pestCategories.map((cat) => (
            <button
              key={cat.value}
              aria-pressed={activeCategory === cat.value}
              aria-label={`Filter by ${cat.label}`}
              onClick={() => {
                if (cat.value !== "Stinging") {
                  setActiveCategory(cat.value);
                }
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                activeCategory === cat.value
                  ? "bg-squito-green text-white shadow-md shadow-squito-green/30"
                  : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
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
        key={activeCategory}
        className="mt-6 grid grid-cols-2 gap-4"
      >
        {filteredPests.map((pest) => (
          <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.94 }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${pest.name}`}
            onClick={() => setSelectedPest(pest)}
            onKeyDown={(e) => e.key === "Enter" && setSelectedPest(pest)}
            key={pest.id}
            className="flex cursor-pointer flex-col items-center p-4 rounded-[24px] bg-squito-cardDark/90 backdrop-blur-xl border border-white/8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition hover:border-squito-green/30 hover:shadow-[0_8px_20px_rgba(107,158,17,0.1)] relative overflow-hidden active:scale-[0.96]"
          >
            {/* Circular Image Portrait */}
            <div className="relative h-[88px] w-[88px] rounded-full overflow-hidden border-[3px] border-white/10 shadow-md bg-squito-appDark">
              <Image
                src={pest.image}
                alt={pest.name}
                fill
                sizes="88px"
                className="object-cover"
                unoptimized
              />
            </div>

            <h3 className="mt-3 font-display text-md font-bold text-white leading-snug text-center">
              {pest.name}
            </h3>
            <p className="text-2xs italic text-white/30 mt-0.5 text-center truncate w-full">
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
            <h3 className="text-sm font-bold text-white">No pests found</h3>
            <p className="text-xs text-white/40 mt-1">
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
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedPest.name} details`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[90vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-squito-cardDark/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl"
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
                <div className="h-1.5 w-12 rounded-full bg-white/20"></div>
              </div>

              {/* Hero Image */}
              <div className="flex items-center justify-center pt-10 pb-4 bg-gradient-to-b from-white/5 to-transparent">
                <div className="relative h-[120px] w-[120px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src={selectedPest.image}
                    alt={selectedPest.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="text-center px-6 pb-4">
                <h2 className="font-display text-xl font-bold text-white leading-tight">
                  {selectedPest.name}
                </h2>
                <p className="text-sm italic text-white/40 mt-0.5">
                  {selectedPest.scientificName}
                </p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-white/10 text-white/60">
                    {selectedPest.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide border ${getRiskColor(selectedPest.riskLevel)}`}
                  >
                    🛡️ {selectedPest.riskLevel}
                  </span>
                </div>
                
                <Link href={selectedPest.category === "Wildlife" ? "tel:6312031000" : "/plans"} className="block mt-5 outline-none">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mx-auto max-w-[260px] relative overflow-hidden rounded-full bg-gradient-to-r from-squito-green to-[#88c520] p-[2px] shadow-xl shadow-squito-green/30"
                  >
                    {/* Shimmer animation bar passing through */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"
                    />
                    <div className="relative flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md">
                      <span className="text-base font-bold text-white tracking-wide drop-shadow-md">
                        {selectedPest.category === "Wildlife" ? "📞 Call for Wildlife control" : "View Treatment Options 🛡️"}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 pb-12">
                <div className="space-y-5">
                  {/* Overview */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-1.5">
                      Overview
                    </h3>
                    <p className="text-md leading-relaxed text-white/80">
                      {selectedPest.description}
                    </p>
                  </div>

                  {/* Danger */}
                  <div className="rounded-2xl bg-red-500/10 p-4 border border-red-500/20">
                    <h3 className="flex items-center text-sm font-bold text-red-400 mb-1.5 uppercase tracking-wide">
                      <span className="mr-2 text-lg">⚠️</span> Danger to Family
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-white/70">
                      {selectedPest.dangerToFamily}
                    </p>
                  </div>

                  {/* Signs of Infestation */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">
                      🔎 Signs of Infestation
                    </h3>
                    <div className="space-y-2">
                      {selectedPest.signs.map((sign, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-red-400 text-sm">●</span>
                          <p className="text-base text-white/70 leading-snug">{sign}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prevention Tips */}
                  <div className="rounded-2xl bg-squito-green/10 p-4 border border-squito-green/20">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-squito-green mb-2">
                      ✅ Prevention Tips
                    </h3>
                    <div className="space-y-2">
                      {selectedPest.prevention.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 text-squito-green text-sm">✓</span>
                          <p className="text-base text-white/70 leading-snug">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Season & Life Cycle */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-1.5">
                        📅 Seasonality
                      </h3>
                      <p className="text-base font-medium text-white/70">
                        {selectedPest.season}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-1.5">
                        🔄 Life Cycle
                      </h3>
                      <p className="text-base font-medium text-white/70">
                        {selectedPest.lifeCycle}
                      </p>
                    </div>
                  </div>

                  {/* Fun Fact */}
                  <div className="rounded-2xl bg-squito-green/5 p-4 border border-squito-green/15">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-squito-green mb-1.5">
                      💡 Did You Know?
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-white/60 italic">
                      {selectedPest.funFact}
                    </p>
                  </div>
                </div>
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
              role="dialog"
              aria-modal="true"
              aria-label="AI Pest Identifier"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-squito-cardDark/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl"
            >
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/20"></div>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 px-6 pb-4 pt-8">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Pest Identifier<span className="text-squito-green">✦</span>
                  </h2>
                  <p className="text-sm text-white/40 mt-0.5">
                    Powered by AI • Photos processed securely
                  </p>
                </div>
                <button
                  aria-label="Close pest identifier"
                  onClick={() => {
                    setIdentifyMode(false);
                    setIdentifyImage(null);
                    setIdentifyResult(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition text-sm"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                {!identifyImage ? (
                  <div className="flex flex-col items-center justify-center h-full gap-6">
                    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-gradient-to-br from-squito-green/10 to-squito-green/5 border-2 border-dashed border-squito-green/30">
                      <span className="text-7xl">🔬</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-lg font-bold text-white">
                        Snap or upload a photo
                      </h3>
                      <p className="text-base text-white/40 mt-1 max-w-[250px]">
                        Our AI will analyze the image and identify the pest species instantly.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        aria-label="Take photo with camera"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-2xl bg-squito-green px-6 py-3.5 text-md font-bold text-white shadow-lg shadow-squito-green/30 active:scale-95 transition"
                      >
                        📸 Take Photo
                      </button>
                      <button
                        aria-label="Upload photo from gallery"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-6 py-3.5 text-md font-bold text-white active:scale-95 transition"
                      >
                        🖼️ Upload
                      </button>
                    </div>
                    {/* Camera input (native camera on iOS) */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {/* Gallery/file picker (no capture) */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    {/* Preview */}
                    <div className="relative h-[200px] w-[200px] rounded-3xl overflow-hidden border-2 border-white/10 shadow-lg">
                      <Image
                        src={identifyImage}
                        alt="Uploaded pest photo for identification"
                        fill
                        sizes="200px"
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
                        className="w-full rounded-2xl bg-squito-cardDark border border-white/10 shadow-lg p-5"
                      >
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-squito-green/10 text-3xl">
                            🎯
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-bold text-white">
                              {identifyResult.name}
                            </h3>
                            {identifyResult.scientificName && (
                              <p className="text-xs italic text-white/30 mt-0.5">{identifyResult.scientificName}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`rounded-full px-2.5 py-0.5 text-2xs font-bold uppercase border ${getRiskColor(identifyResult.dangerLevel || "Nuisance")}`}>
                                {identifyResult.dangerLevel || "Unknown Risk"}
                              </span>
                              <span className="text-xs text-white/30 font-medium">
                                {identifyResult.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-base text-white/60 mt-3 leading-relaxed">
                          {identifyResult.description}
                        </p>

                        {/* Protected Bee Banner */}
                        {identifyResult.isProtected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 px-3.5 py-3"
                          >
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">🐝 Protected Species — New York State Law</p>
                            <p className="text-sm text-emerald-800 leading-snug font-medium">
                              This is a protected bee species. Extermination may be illegal. Do NOT spray or poison. Contact a licensed beekeeper for free or low-cost safe relocation.
                            </p>
                          </motion.div>
                        )}

                        {/* Visual Clues */}
                        {identifyResult.visualClues && (
                          <div className="mt-3 rounded-xl bg-white/5 border border-white/10 px-3.5 py-3">
                            <p className="text-2xs font-bold uppercase tracking-wider text-white/30 mb-1">🔬 What the AI Observed</p>
                            <p className="text-sm text-white/60 leading-snug">{identifyResult.visualClues}</p>
                          </div>
                        )}

                        {/* Recommendation */}
                        {identifyResult.recommendation && (
                          <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-3">
                            <p className="text-2xs font-bold uppercase tracking-wider text-amber-400 mb-1">⚠️ Recommendation</p>
                            <p className="text-sm text-white/70 leading-snug font-medium">{identifyResult.recommendation}</p>
                          </div>
                        )}

                        <Link href="/plans" className="block mt-4">
                          <GlassButton variant="primary" className="w-full py-3 text-base bg-squito-green dark:bg-squito-green text-white font-bold">
                            View Treatment Options 🛡️
                          </GlassButton>
                        </Link>
                      </motion.div>
                    )}


                    {identifyResult?.error && (
                      <div className="w-full rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-center">
                        <span className="text-3xl">😕</span>
                        <p className="text-base text-red-400 mt-2 font-medium">
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
                        className="text-base font-bold text-white/30 hover:text-white/60 transition"
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
