"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/CartContext";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";
import { haptics } from "@/lib/haptics";

export function CartDrawer() {
  const {
    items,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    totalPoints,
    hasItems,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9500] bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[9600] flex max-h-[85vh] flex-col rounded-t-[28px] border-t border-white/10 bg-[#1a1a1a]/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.3)]"
          >
            {/* Handle + Header */}
            <div className="flex flex-col items-center px-5 pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-white/20 mb-4" />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛒</span>
                  <h2 className="font-display text-lg font-bold text-white">
                    Your Cart
                  </h2>
                  {hasItems && (
                    <span className="rounded-full bg-squito-green/15 px-2.5 py-0.5 text-[11px] font-bold text-squito-green">
                      {itemCount} {itemCount === 1 ? "service" : "services"}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { closeDrawer(); haptics.light(); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/50 active:scale-90 transition-transform"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Empty state */}
            {!hasItems && (
              <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
                <span className="text-5xl mb-4">🦟</span>
                <h3 className="font-display text-lg font-bold text-white">
                  Cart is empty
                </h3>
                <p className="mt-2 text-[13px] font-medium text-white/40 max-w-xs">
                  Browse our services and add the ones you need. Book them all at once!
                </p>
                <Link href="/plans" onClick={() => { closeDrawer(); haptics.light(); }}>
                  <GlassButton
                    variant="primary"
                    className="mt-6 bg-squito-green/90 dark:bg-squito-green px-8 py-3 text-[14px]"
                  >
                    Browse Services
                  </GlassButton>
                </Link>
              </div>
            )}

            {/* Cart Items */}
            {hasItems && (
              <>
                <div className="flex-1 overflow-y-auto px-5 pb-2 divide-y divide-white/10">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.serviceKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 py-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white leading-snug truncate">
                          {item.serviceName}
                        </p>
                        <p className="text-[11px] font-medium text-white/40 mt-0.5 truncate">
                          {item.description}
                        </p>
                        {item.points > 0 && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-squito-green">
                            ⭐ +{item.points} pts
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[16px] font-bold text-white">
                          ${item.price}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.serviceKey);
                          haptics.light();
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 transition-all active:scale-90 active:bg-red-500/20"
                      >
                        <span className="text-[13px]">✕</span>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Summary + Actions */}
                <div className="border-t border-white/10 bg-white/5 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-white/40">
                      Subtotal ({itemCount} {itemCount === 1 ? "service" : "services"})
                    </span>
                    <span className="text-[16px] font-bold text-white">
                      ${subtotal.toLocaleString("en-US", { minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2 })}
                    </span>
                  </div>
                  {totalPoints > 0 && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold text-squito-green">
                        ⭐ Total PestPoints earned
                      </span>
                      <span className="text-[11px] font-bold text-squito-green">
                        +{totalPoints} pts
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] text-white/20 mb-3">
                    Tax calculated at checkout based on your service address.
                  </p>

                  <Link
                    href="/book"
                    onClick={() => { closeDrawer(); haptics.medium(); }}
                    className="block"
                  >
                    <GlassButton
                      variant="primary"
                      className="w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
                    >
                      Checkout · ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </GlassButton>
                  </Link>

                  <button
                    onClick={() => {
                      clearCart();
                      haptics.light();
                    }}
                    className="mt-3 w-full text-center text-[12px] font-bold text-red-400 active:opacity-70 transition-opacity"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
