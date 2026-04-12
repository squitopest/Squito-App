"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CartBadgeProps {
  count: number;
  className?: string;
}

export function CartBadge({ count, className = "" }: CartBadgeProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key="cart-badge"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`absolute -top-0.5 -right-0.5 z-20 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ${className}`}
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
