"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "TikTok", href: "/", icon: "🏠" },
  { name: "Book", href: "/book", icon: "🗓️" },
  { name: "Pests", href: "/pests", icon: "🔍" },
  { name: "Plans", href: "/plans", icon: "🛡️" },
  { name: "Points", href: "/points", icon: "⭐" },
  { name: "AI", href: "/ai", icon: "🤖" },
  { name: "Me", href: "/me", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-gray-200 bg-white px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 p-2"
          >
            <span
              className={`text-2xl transition ${
                isActive ? "opacity-100 scale-110 drop-shadow-sm" : "opacity-40 grayscale"
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                isActive ? "text-squito-green" : "text-gray-400"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
