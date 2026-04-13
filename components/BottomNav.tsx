"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/lib/CartContext";
import { haptics } from "@/lib/haptics";
import { CartBadge } from "@/components/ui/CartBadge";
import {
  HomeIcon,
  ServicesIcon,
  CartIcon,
  PestsIcon,
  ProfileIcon,
} from "@/components/ui/NavIcons";

/*
 * Nav order: Home → Services → Cart (center) → Pests → Profile
 * Cart is centered as the primary CTA (conversion action).
 */
const navItems = [
  { name: "Home",     href: "/",     Icon: HomeIcon },
  { name: "Services", href: "/plans", Icon: ServicesIcon },
  { name: "Cart",     href: "#cart",  Icon: CartIcon },
  { name: "Pests",    href: "/pests", Icon: PestsIcon },
  { name: "Profile",  href: "/me",   Icon: ProfileIcon },
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
      <nav className="flex h-14 w-full max-w-xs items-center justify-around rounded-full border border-white/10 bg-[#1a1a1a]/95 backdrop-blur-2xl shadow-[0_-2px_24px_rgba(0,0,0,0.4)] pointer-events-auto px-1">
        {navItems.map((item) => {
          const isCart = item.name === "Cart";
          const isActive = isCart
            ? false
            : item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProfile = item.name === "Profile";
          const IconComponent = item.Icon;

          // Cart button opens the drawer instead of navigating
          if (isCart) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  toggleDrawer();
                  haptics.light();
                }}
                className="relative flex flex-col items-center justify-center w-14 h-full group"
              >
                {/* Center CTA glow ring */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-squito-green shadow-[0_0_16px_rgba(107,158,17,0.4)] transition-all duration-300 group-active:scale-90">
                  <IconComponent size={22} filled className="text-white" />
                </div>
                <CartBadge count={itemCount} />
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => haptics.light()}
              className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-full group"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-white/10 scale-105"
                    : "group-active:scale-90"
                }`}
              >
                <IconComponent
                  size={22}
                  filled={isActive}
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-squito-green drop-shadow-[0_0_6px_rgba(107,158,17,0.5)]"
                      : "text-white/50 group-hover:text-white/70"
                  }`}
                />
              </div>

              {/* Label — only shows when active */}
              <span
                className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "text-squito-green opacity-100 translate-y-0"
                    : "text-transparent opacity-0 -translate-y-1"
                }`}
              >
                {item.name}
              </span>

              {/* Guest indicator on Profile tab */}
              {isProfile && isGuest && (
                <span className="absolute top-1 right-1 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <rect x="7" y="11" width="10" height="10" rx="2" stroke="white" strokeWidth="3" />
                    <path d="M9 11V7C9 4.24 10.34 3 12 3C13.66 3 15 4.24 15 7V11" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
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
          <div className="h-14 w-full max-w-xs rounded-full bg-[#1a1a1a]/95 backdrop-blur-2xl" />
        </nav>
      }
    >
      <BottomNavContent />
    </Suspense>
  );
}
