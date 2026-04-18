"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
}

// ── One drifting liquid blob ───────────────────────────────────────────────────
function LiquidBlob({
  width, height, color, blur,
  x, y, scale, opacity, duration, delay = 0,
}: {
  width: number; height: number;
  color: string; blur: number;
  x: string[]; y: string[];
  scale: number[]; opacity: number[];
  duration: number; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ x, y, scale, opacity }}
      transition={{
        opacity: { duration: 1.5, delay },
        x:       { duration, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        y:       { duration: duration * 1.15, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
        scale:   { duration: duration * 0.85, delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
      }}
      style={{
        position: "absolute",
        width,
        height,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Splash screen ─────────────────────────────────────────────────────────────
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [logoIn,     setLogoIn]     = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoIn(true), 500);
    const t2 = setTimeout(() => {
      setShowSplash(false);
      onComplete?.();
    }, 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(18px)" }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ background: "#09090b" }}
        >

          {/* ── Liquid blobs ── */}

          {/* Primary large blob — upper left */}
          <LiquidBlob
            width={420} height={420}
            color="rgba(107,158,17,0.2)"
            blur={72}
            x={["-22%", "4%", "-12%"]}
            y={["-32%", "-8%", "-24%"]}
            scale={[1, 1.22, 0.94]}
            opacity={[0.7, 1, 0.75]}
            duration={13}
            delay={0}
          />

          {/* Secondary blob — lower right */}
          <LiquidBlob
            width={320} height={320}
            color="rgba(80,124,8,0.22)"
            blur={65}
            x={["28%", "8%", "22%"]}
            y={["22%", "38%", "16%"]}
            scale={[1, 0.88, 1.12]}
            opacity={[0.55, 0.85, 0.65]}
            duration={16}
            delay={0.4}
          />

          {/* Bright accent blob — center, subtle */}
          <LiquidBlob
            width={180} height={180}
            color="rgba(149,201,62,0.28)"
            blur={48}
            x={["-6%", "12%", "2%"]}
            y={["4%", "-6%", "10%"]}
            scale={[1, 1.35, 0.82]}
            opacity={[0.45, 0.75, 0.5]}
            duration={10}
            delay={0.2}
          />

          {/* Deep dark-green mass — bottom */}
          <LiquidBlob
            width={380} height={280}
            color="rgba(35,62,4,0.35)"
            blur={85}
            x={["-8%", "6%", "-2%"]}
            y={["28%", "42%", "32%"]}
            scale={[1.1, 0.93, 1.02]}
            opacity={[0.8, 0.55, 0.9]}
            duration={19}
            delay={0.1}
          />

          {/* Oil-sheen teal whisper — floats top right */}
          <LiquidBlob
            width={220} height={220}
            color="rgba(0,155,110,0.09)"
            blur={58}
            x={["18%", "-18%", "6%"]}
            y={["-18%", "8%", "-6%"]}
            scale={[0.88, 1.18, 1.0]}
            opacity={[0.35, 0.65, 0.42]}
            duration={14}
            delay={0.6}
          />

          {/* Extra depth blob — far left */}
          <LiquidBlob
            width={260} height={200}
            color="rgba(60,95,8,0.15)"
            blur={60}
            x={["-38%", "-20%", "-30%"]}
            y={["0%", "15%", "-8%"]}
            scale={[1, 1.1, 0.9]}
            opacity={[0.5, 0.7, 0.55]}
            duration={11}
            delay={0.3}
          />

          {/* ── Logo — clean, centered, still ── */}
          <AnimatePresence>
            {logoIn && (
              <motion.img
                key="logo"
                src="/images/services/SquitoLogo1.png"
                alt="Squito"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: 148,
                  height: "auto",
                  position: "relative",
                  zIndex: 20,
                  filter: [
                    "drop-shadow(0 0 40px rgba(107,158,17,0.6))",
                    "drop-shadow(0 0 14px rgba(149,201,62,0.45))",
                    "drop-shadow(0 2px 24px rgba(0,0,0,0.8))",
                  ].join(" "),
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
