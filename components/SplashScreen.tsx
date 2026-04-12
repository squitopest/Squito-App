"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SplashScreenProps {
  onComplete?: () => void;
}

const letterAnimationTop = {
  hidden: { y: "-100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const letterAnimationBottom = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const SplitLetter = ({ letter }: { letter: string }) => {
  return (
    <span className="relative inline-block leading-none">
      {/* Invisible anchor for layout sizing */}
      <span className="opacity-0">{letter}</span>

      {/* Top Half */}
      <motion.span
        variants={letterAnimationTop}
        className="absolute inset-0 flex text-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
      >
        {letter}
      </motion.span>

      {/* Bottom Half */}
      <motion.span
        variants={letterAnimationBottom}
        className="absolute inset-0 flex text-white"
        style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
      >
        {letter}
      </motion.span>
    </span>
  );
};

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("squito_splash_shown")) {
      setShowSplash(false);
      return;
    }
    sessionStorage.setItem("squito_splash_shown", "true");

    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete, router]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.5, // Start 'quito' right after 'S' pops in
      },
    },
  };

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Logo Container */}
          <div className="relative flex flex-col items-center justify-center -mt-10">
            <div className="flex items-center">
              {/* Anchor "S" */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 18,
                  delay: 0.1,
                }}
                className="font-display text-[5.5rem] font-black tracking-tighter text-squito-green leading-none mr-0.5"
                style={{ textShadow: "0px 0px 20px rgba(107,158,17,0.4)" }}
              >
                S
              </motion.div>

              {/* The "quito" Staggered Split Letters */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex font-display text-[5.5rem] font-bold tracking-tight text-white leading-none relative overflow-hidden"
              >
                {"quito".split("").map((letter, i) => (
                  <SplitLetter key={i} letter={letter} />
                ))}
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
