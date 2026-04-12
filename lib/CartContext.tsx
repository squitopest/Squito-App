"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// ── Cart Item shape ──────────────────────────────────────────────────────────
export interface CartItem {
  serviceKey: string;    // e.g. "Mosquito Barrier Spray ($119)"
  serviceName: string;   // e.g. "Mosquito Barrier Spray"
  price: number;         // e.g. 119
  points: number;        // e.g. 75
  description: string;   // e.g. "Perimeter barrier spray…"
}

// ── Price lookup (single source of truth) ────────────────────────────────────
export const SERVICE_CATALOG: Record<string, { name: string; price: number; points: number; description: string }> = {
  "Mosquito Barrier Spray ($119)": {
    name: "Mosquito Barrier Spray",
    price: 119,
    points: 75,
    description: "Perimeter barrier spray — keeps your yard bite-free",
  },
  "Organic Mosquito & Tick Treatment ($99)": {
    name: "Organic Mosquito & Tick Treatment",
    price: 99,
    points: 75,
    description: "Eco-safe treatment, pet & kid friendly",
  },
  "Tick Treatment ($99)": {
    name: "Tick Treatment",
    price: 99,
    points: 75,
    description: "21-day tick elimination barrier",
  },
  "General & Full Property Pest Control ($299)": {
    name: "General & Full Property Pest Control",
    price: 299,
    points: 125,
    description: "Complete interior + exterior treatment",
  },
  "Hornet & Wasp Removal ($349)": {
    name: "Hornet & Wasp Removal",
    price: 349,
    points: 150,
    description: "Professional nest removal, zero risk to family",
  },
  "Termite Inspection ($199)": {
    name: "Termite Inspection",
    price: 199,
    points: 100,
    description: "Full property inspection with written report",
  },
  "Free Estimate / Custom Quote": {
    name: "Free Estimate / Custom Quote",
    price: 0,
    points: 0,
    description: "A technician will assess & quote on-site",
  },
};

// ── Max items in cart ────────────────────────────────────────────────────────
const MAX_CART_ITEMS = 10;

// ── Context shape ────────────────────────────────────────────────────────────
interface CartContextValue {
  items: CartItem[];
  addItem: (serviceKey: string) => { success: boolean; message: string };
  removeItem: (serviceKey: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  totalPoints: number;
  hasItems: boolean;
  isInCart: (serviceKey: string) => boolean;
  // Cart drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addItem = useCallback((serviceKey: string): { success: boolean; message: string } => {
    const catalog = SERVICE_CATALOG[serviceKey];
    if (!catalog) {
      return { success: false, message: "Unknown service" };
    }

    // Don't allow Free Estimate in cart — it goes through its own flow
    if (serviceKey === "Free Estimate / Custom Quote") {
      return { success: false, message: "Free Estimates book directly — no payment needed!" };
    }

    // Check for duplicates
    const alreadyInCart = items.some((item) => item.serviceKey === serviceKey);
    if (alreadyInCart) {
      return { success: false, message: `${catalog.name} is already in your cart` };
    }

    // Check max items
    if (items.length >= MAX_CART_ITEMS) {
      return { success: false, message: `Cart is full (max ${MAX_CART_ITEMS} services)` };
    }

    const newItem: CartItem = {
      serviceKey,
      serviceName: catalog.name,
      price: catalog.price,
      points: catalog.points,
      description: catalog.description,
    };

    setItems((prev) => [...prev, newItem]);
    return { success: true, message: `${catalog.name} added to cart!` };
  }, [items]);

  const removeItem = useCallback((serviceKey: string) => {
    setItems((prev) => prev.filter((item) => item.serviceKey !== serviceKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((serviceKey: string) => {
    return items.some((item) => item.serviceKey === serviceKey);
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const itemCount = items.length;
  const hasItems = items.length > 0;

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((p) => !p), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        totalPoints,
        hasItems,
        isInCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
