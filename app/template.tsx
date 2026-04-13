"use client";

import { motion } from "framer-motion";

// This template wraps every page and handles the slide/fade transitions
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.8 }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
