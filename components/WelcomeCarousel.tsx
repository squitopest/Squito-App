"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { haptics } from "@/lib/haptics";

const slides = [
  {
    id: "welcome",
    emoji: "📱",
    title: "Welcome to PestTok",
    desc: "Swipe through our engaging feed to see real Squito squad action.",
    color: "bg-squito-green/10",
    iconColor: "text-squito-green",
  },
  {
    id: "ai",
    emoji: "📸",
    title: "AI Pest Identifier",
    desc: "Found a creepy crawler? Snap a pic and our AI will immediately identify the threat.",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "booking",
    emoji: "🗓️",
    title: "Smart Booking",
    desc: "Book a premium, same-day treatment plan with just a few taps.",
    color: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: "rewards",
    emoji: "🎁",
    title: "Earn PestPoints",
    desc: "Earn rewards and free treatments when you book or refer neighbors. Ready to protect your home?",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
];

export function WelcomeCarousel() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use an effect to cleanly read localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const hasSeen = localStorage.getItem("squito_welcomed");
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    haptics.light();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Finished
      localStorage.setItem("squito_welcomed", "true");
      setIsVisible(false);
    }
  };

  const handleSkip = () => {
    haptics.light();
    localStorage.setItem("squito_welcomed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col bg-white"
        >
          {/* Header / Skip */}
          <div className="flex items-center justify-end px-6 pt-safe-top mt-4">
            <button
              onClick={handleSkip}
              className="text-[14px] font-bold text-gray-400 active:text-gray-600 transition"
            >
              Skip
            </button>
          </div>

          {/* Slides */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
              >
                {/* Big Icon / Emoji Box */}
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className={`flex h-40 w-40 items-center justify-center rounded-[40px] ${slides[currentSlide].color} shadow-sm border border-black/5`}
                >
                  <span className={`text-[80px] drop-shadow-md`}>
                    {slides[currentSlide].emoji}
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-10 font-display text-3xl font-bold text-gray-900"
                >
                  {slides[currentSlide].title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-[16px] font-medium leading-relaxed text-gray-500 max-w-[280px]"
                >
                  {slides[currentSlide].desc}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-8 pb-safe-bottom mb-8">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "w-8 bg-squito-green"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Button */}
            <GlassButton
              variant="primary"
              onClick={handleNext}
              className="w-full py-4 text-[16px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {currentSlide === slides.length - 1 ? "Let's Go! 🚀" : "Next"}
            </GlassButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
