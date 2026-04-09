"use client";

import { motion, useAnimation } from "framer-motion";
import { useState } from "react";
import { GlassButton } from "@/components/ui/GlassButton";

export default function AIPage() {
  const [scanning, setScanning] = useState(false);
  const controls = useAnimation();

  const handleScan = async () => {
    setScanning(true);
    // Fake the scanning process
    await controls.start({
      y: [0, 200, 0],
      transition: { duration: 1.5, repeat: 2, ease: "linear" },
    });
    setScanning(false);
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-10 pt-12 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-[2rem] font-bold leading-tight text-gray-900">
          Squito AI<span className="text-squito-green">✦</span>
        </h1>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
          Point your camera at a bug, and our AI will immediately identify it
          and dispatch the correct treatment.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="mt-8 flex-1 flex flex-col items-center"
      >
        {/* Fake Camera Viewfinder */}
        <div className="relative flex aspect-[3/4] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-[32px] bg-gray-900 shadow-xl">
          {/* Scanning Line overlay */}
          {scanning && (
            <motion.div
              animate={controls}
              className="absolute top-10 left-0 right-0 h-1 w-full bg-squito-green shadow-[0_0_20px_rgba(107,158,17,1)] z-10"
            />
          )}

          <div className="absolute inset-8 rounded-[20px] border-2 border-dashed border-white/20" />

          <div className="z-10 text-center">
            <span className="text-6xl opacity-50">🕷️</span>
            <p className="mt-4 text-[13px] font-bold tracking-widest text-white/50 uppercase">
              {scanning ? "Analyzing Threat..." : "Align bug here"}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <GlassButton
          variant="icon"
          onClick={handleScan}
          disabled={scanning}
          className={`mt-10 flex h-20 w-20 items-center justify-center !rounded-full border-4 transition-transform ${
            scanning
              ? "border-squito-green bg-squito-green/20 animate-pulse"
              : "border-gray-200 bg-white shadow-lg"
          }`}
        >
          <div className="h-14 w-14 rounded-full bg-squito-green shadow-inner" />
        </GlassButton>
      </motion.div>
    </div>
  );
}
