"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { haptics } from "@/lib/haptics";

const navItems = [
  { name: "Home", href: "/", icon: "🏠" },
  { name: "Pests", href: "/pests", icon: "🔍" },
  { name: "Services", href: "/plans", icon: "🛡️" },
  { name: "Profile", href: "/me", icon: "👤" },
];

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isGuest } = useAuth();
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const currentPath = `${pathname}${query}`;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[9000] flex justify-center px-4 pointer-events-none">
      <nav className="flex h-16 w-full max-w-sm items-center justify-around rounded-full border border-squito-greenLight/30 bg-squito-green/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(107,158,17,0.4)] pointer-events-auto px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isProfile = item.name === "Profile";
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
        <nav className="fixed bottom-6 left-0 right-0 z-[9000] flex justify-center px-4">
          <div className="h-16 w-full max-w-sm rounded-full bg-squito-green/85 backdrop-blur-2xl" />
        </nav>
      }
    >
      <BottomNavContent />
    </Suspense>
  );
}
