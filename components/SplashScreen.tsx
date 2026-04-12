"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete, router]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Logo Container */}
          <div className="relative flex flex-col items-center justify-center -mt-10">
            <div className="relative flex h-[8rem] w-[70vw] max-w-[250px] items-center justify-center">
              {/* Top Half of PNG */}
              <motion.div
                initial={{ y: "-50%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="absolute inset-0 z-10"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
              >
                <img
                  src="/squito_logo_v2.png"
                  alt="Squito Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(107,158,17,0.2)]"
                />
              </motion.div>

              {/* Bottom Half of PNG */}
              <motion.div
                initial={{ y: "50%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="absolute inset-0 z-10"
                style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
              >
                <img
                  src="/squito_logo_v2.png"
                  alt="Squito Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(107,158,17,0.2)]"
                />
              </motion.div>
            </div>

            {/* Tagline */}
            <motion.h2
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.1, duration: 0.8, ease: "easeOut" }}
              className="mt-2 text-center font-display text-sm font-bold tracking-[0.2em] text-white/60 uppercase"
            >
              Smart. Safe. <span className="text-squito-green/90">Pest Control.</span>
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
