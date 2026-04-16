"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SplashScreenProps {
  onComplete?: () => void;
}

// ── Floating bokeh orb ─────────────────────────────────────────────────────
function BokehOrb({
  size,
  x,
  y,
  delay,
  duration,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: [0, 0.35, 0.15, 0.35, 0],
        scale: [0.4, 1, 0.8, 1, 0.4],
        y: [0, -30, -10, -40, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background:
          "radial-gradient(circle, rgba(107,158,17,0.4) 0%, rgba(107,158,17,0) 70%)",
        filter: `blur(${size * 0.3}px)`,
      }}
    />
  );
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete, router]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0d1208 50%, #0a0a0a 100%)" }}
        >
          {/* ── Background Bokeh Orbs ── */}
          <BokehOrb size={120} x="10%" y="15%" delay={0.2} duration={6} />
          <BokehOrb size={80} x="75%" y="20%" delay={0.8} duration={5} />
          <BokehOrb size={100} x="60%" y="65%" delay={0.5} duration={7} />
          <BokehOrb size={60} x="20%" y="72%" delay={1.0} duration={5.5} />
          <BokehOrb size={90} x="85%" y="55%" delay={0.3} duration={6.5} />
          <BokehOrb size={50} x="45%" y="85%" delay={1.2} duration={4.5} />

          {/* ── Content Container ── */}
          <div className="relative flex flex-col items-center justify-center -mt-8">
            {/* ── Glassmorphism Circle ── */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 18,
                delay: 0.15,
              }}
              className="relative flex items-center justify-center"
            >
              {/* Outer green glow ring */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  width: 185,
                  height: 185,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 40px 8px rgba(107,158,17,0.3), 0 0 80px 20px rgba(107,158,17,0.15)",
                  borderRadius: "50%",
                }}
              />

              {/* Frosted glass circle */}
              <div
                className="relative flex items-center justify-center rounded-full border border-white/10 overflow-hidden"
                style={{
                  width: 180,
                  height: 180,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                {/* Green accent border */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "1.5px solid rgba(107,158,17,0.35)",
                  }}
                />

                {/* Actual Logo */}
                <motion.img
                  src="/squito_logo_v2.png"
                  alt="Squito Logo"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-[120px] h-auto relative z-10"
                  style={{
                    filter: "drop-shadow(0 0 16px rgba(107,158,17,0.35))",
                  }}
                />
              </div>
            </motion.div>

            {/* ── Tagline ── */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              {/* Thin green separator line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-[1px] w-16"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(107,158,17,0.6), transparent)",
                }}
              />

              <motion.p
                initial={{ opacity: 0, letterSpacing: "0.05em" }}
                animate={{ opacity: 1, letterSpacing: "0.25em" }}
                transition={{ delay: 1.6, duration: 1, ease: "easeOut" }}
                className="text-xs font-bold uppercase text-white/50"
              >
                Pest Control
              </motion.p>
            </motion.div>

            {/* ── Bottom Tagline ── */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              className="mt-6 text-2xs font-medium tracking-[0.15em] text-white/30"
            >
              Smart. Safe. <span className="text-squito-green/60">Pest Control.</span>
            </motion.p>
          </div>

          {/* ── Bottom Loading Bar ── */}
          <motion.div
            className="absolute bottom-[15%] left-1/2 -translate-x-1/2 h-[2px] rounded-full overflow-hidden"
            style={{ width: "40%" }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(107,158,17,0.6), transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
