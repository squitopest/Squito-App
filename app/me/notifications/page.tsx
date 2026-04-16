"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

// Mock toggle functional component
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
      className={`flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? "bg-squito-green" : "bg-white/15"}`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${active ? "translate-x-5" : "translate-x-0"}`}
      />
    </div>
  );
}

export default function NotificationsPage() {
  const [toggles, setToggles] = useState({
    push: true,
    sms: true,
    email: false,
    marketing: false,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("squito_notification_prefs");
      if (saved) {
        try {
          setToggles(JSON.parse(saved));
        } catch (e) {
          // ignore parse errors
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== "undefined") {
        localStorage.setItem("squito_notification_prefs", JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0a] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]/80 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-lg font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-white">
          Notifications
        </span>
        <div className="w-16" />
      </div>

      <div className="px-5 pt-8">
        <h2 className="mb-2 px-2 text-sm font-bold uppercase tracking-wider text-white/30">
          Service Reminders
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-sm mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <span className="block text-lg font-bold text-white">
                Push Notifications
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Route updates, tech tracking
              </span>
            </div>
            <Toggle
              active={toggles.push}
              onChange={() => handleToggle("push")}
            />
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <span className="block text-lg font-bold text-white">
                SMS Alerts
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Gate codes, ETA text alerts
              </span>
            </div>
            <Toggle active={toggles.sms} onChange={() => handleToggle("sms")} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <span className="block text-lg font-bold text-white">
                Email
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Invoices and detailed service reports
              </span>
            </div>
            <Toggle
              active={toggles.email}
              onChange={() => handleToggle("email")}
            />
          </div>
        </div>

        <h2 className="mb-2 px-2 text-sm font-bold uppercase tracking-wider text-white/30">
          Promotions
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <span className="block text-lg font-bold text-white">
                Marketing & Offers
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5 pr-4">
                Receive discounts on preventative pest add-ons
              </span>
            </div>
            <Toggle
              active={toggles.marketing}
              onChange={() => handleToggle("marketing")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
