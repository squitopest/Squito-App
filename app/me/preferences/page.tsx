"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

function Toggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? "bg-squito-green" : "bg-gray-300"}`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${active ? "translate-x-5" : "translate-x-0"}`}
      />
    </div>
  );
}

export default function PreferencesPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDark = localStorage.getItem("squito_pref_darkmode");
      if (savedDark !== null) setDarkMode(savedDark === "true");

      const savedAnim = localStorage.getItem("squito_pref_animations");
      if (savedAnim !== null) setAnimations(savedAnim === "true");
    }
  }, []);

  const handleDarkMode = (val: boolean) => {
    setDarkMode(val);
    if (typeof window !== "undefined") localStorage.setItem("squito_pref_darkmode", String(val));
    // Implementation Note: the root layout would read this class to set dark mode. 
    // We are just saving the state cleanly.
  };

  const handleAnimations = (val: boolean) => {
    setAnimations(val);
    if (typeof window !== "undefined") localStorage.setItem("squito_pref_animations", String(val));
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/70 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-[15px] font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-gray-900">
          Preferences
        </span>
        <div className="w-16" />
      </div>

      <div className="px-5 pt-8">
        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Appearance
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <span className="block text-[15px] font-bold text-gray-900">
                Dark Mode
              </span>
              <span className="block text-[12px] font-medium text-gray-500 mt-0.5">
                Toggle dark app theme
              </span>
            </div>
            <Toggle active={darkMode} onChange={() => handleDarkMode(!darkMode)} />
          </div>

          <button className="flex w-full items-center justify-between px-5 py-4 text-left active:bg-gray-50">
            <div>
              <span className="block text-[15px] font-bold text-gray-900">
                Language
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-gray-400">
                English (US)
              </span>
              <span className="text-gray-300 font-bold text-lg leading-none">
                ›
              </span>
            </div>
          </button>
        </div>

        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Accessibility
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <span className="block text-[15px] font-bold text-gray-900">
                Reduce Motion
              </span>
              <span className="block text-[12px] font-medium text-gray-500 mt-0.5">
                Limit UI animations
              </span>
            </div>
            <Toggle
              active={!animations}
              onChange={() => handleAnimations(!animations)}
            />
          </div>
        </div>

        <div className="mt-8 px-2">
          <p className="text-center text-[11px] font-bold text-gray-400">
            App Version 1.0.4 (Build 822)
          </p>
        </div>
      </div>
    </div>
  );
}
