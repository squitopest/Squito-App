"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { haptics } from "@/lib/haptics";
import { CartBadge } from "@/components/ui/CartBadge";

const navItems = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Pests", href: "/pests", icon: "🔍" },
  { name: "Services", href: "/plans", icon: "🛡️" },
  { name: "Cart", href: "#cart", icon: "🛒" },
  { name: "Profile", href: "/me", icon: "👤" },
];

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isGuest } = useAuth();
  const { itemCount, toggleDrawer } = useCart();
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const currentPath = `${pathname}${query}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9000] flex justify-center px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <nav className="flex h-12 w-full max-w-xs items-center justify-around rounded-full border border-squito-greenLight/30 bg-squito-green/90 backdrop-blur-2xl shadow-[0_4px_20px_rgba(107,158,17,0.35)] pointer-events-auto px-2">
        {navItems.map((item) => {
          const isCart = item.name === "Cart";
          const isActive = isCart
            ? false // Cart drawer doesn't have a "page"
            : item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProfile = item.name === "Profile";

          // Cart button opens the drawer instead of navigating
          if (isCart) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  toggleDrawer();
                  haptics.light();
                }}
                className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
              >
                <span className="relative z-10 text-2xl opacity-60 grayscale translate-y-0.5 mix-blend-luminosity transition-all duration-300">
                  {item.icon}
                </span>
                <CartBadge count={itemCount} />
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => haptics.light()}
              className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
            >
              <div
                className={`absolute inset-0 m-auto h-12 w-12 rounded-full transition-all duration-300 ${
                  isActive ? "bg-white/25 scale-100" : "scale-0"
                }`}
              />
              <span
                className={`relative z-10 text-2xl transition-all duration-300 ${
                  isActive
                    ? "opacity-100 scale-110 drop-shadow-md -translate-y-1"
                    : "opacity-60 grayscale translate-y-0.5 mix-blend-luminosity"
                }`}
              >
                {item.icon}
              </span>
              {isActive && (
                <span className="absolute bottom-1 text-[9px] font-bold tracking-wide text-white drop-shadow-sm">
                  {item.name}
                </span>
              )}
              {/* Guest indicator on Profile tab */}
              {isProfile && isGuest && (
                <span className="absolute top-1 right-2 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-black text-[8px] shadow-sm">
                  🔒
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function BottomNav() {
  return (
    <Suspense
      fallback={
        <nav className="fixed bottom-0 left-0 right-0 z-[9000] flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
          <div className="h-12 w-full max-w-xs rounded-full bg-squito-green/90 backdrop-blur-2xl" />
        </nav>
      }
    >
      <BottomNavContent />
    </Suspense>
  );
}
