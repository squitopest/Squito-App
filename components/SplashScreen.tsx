"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("squito_splash_shown");
    }
    return true;
  });
  const router = useRouter();

  useEffect(() => {
    // Check if we already showed it this session
    if (sessionStorage.getItem("squito_splash_shown")) {
      setShowSplash(false);
      return;
    }

    // Mark as shown
    sessionStorage.setItem("squito_splash_shown", "true");

    // Force the app back to the home route (PestTok feed) upon restart/refresh
    router.replace("/");

    // Hide the splash screen after the animation comfortably runs (2.5 seconds)
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
        >
          {/* Squito Wrapper */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Squito Logo Appearance Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1], // Custom beautiful cubic bezier (similar to Apple's spring)
              }}
              className="relative flex h-[8rem] w-[70vw] max-w-[220px] items-center justify-center p-4 drop-shadow-[0_0_30px_rgba(107,158,17,0.3)]"
            >
              <Image
                src="/squito_logo_v2.png"
                alt="Squito Logo"
                fill
                className="object-contain z-[2] relative"
                priority
                unoptimized
              />
            </motion.div>

            {/* Subtitle / Tagline */}
            <motion.h2
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="-mt-2 text-center font-display text-lg font-bold tracking-wider text-white/90 drop-shadow-md"
            >
              Smart. Safe. <span className="text-squito-green">Pest Control.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute bottom-16 flex flex-col items-center gap-3"
          >
            <div className="relative flex items-center justify-center h-8 w-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute w-full h-full rounded-full border-2 border-white/10 border-t-squito-green/80"
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-squito-green/80">
              Initializing
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
