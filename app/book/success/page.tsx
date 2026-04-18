"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { Capacitor } from "@capacitor/core";
import { getApiBase } from "@/lib/runtimeConfig";

interface CartItemDetails {
  service: string;
  priceCents: number;
  points: number;
}

interface BookingDetails {
  name: string;
  email: string;
  service: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  amountTotal: number;
  currency: string;
  // Cart order fields
  isCartOrder?: boolean;
  cartItems?: CartItemDetails[] | null;
  discountCents?: number;
}

/** Format cents → "$119.00" */
function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/** Build a Google Calendar add-event link */
function googleCalendarUrl(details: BookingDetails): string {
  if (!details.preferredDate) return "";
  const dateStr = details.preferredDate.replace(/-/g, ""); // YYYYMMDD
  const serviceLabel = details.isCartOrder && details.cartItems
    ? `${details.cartItems.length} Services`
    : details.service.replace(/\s*\(.*\)$/, "");
  const title = encodeURIComponent(`Squito Pest Control — ${serviceLabel}`);
  const loc = encodeURIComponent(details.address);
  const desc = encodeURIComponent(
    details.isCartOrder && details.cartItems
      ? `Services: ${details.cartItems.map((i) => i.service.replace(/\s*\(.*\)$/, "")).join(", ")}\nAddress: ${details.address}\nContact: ${details.email}`
      : `Service: ${details.service}\nAddress: ${details.address}\nContact: ${details.email}`
  );
  // Use all-day event (no time component) if time not provided
  const dates = `${dateStr}/${dateStr}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&location=${loc}&details=${desc}`;
}

/** Build an Apple/ICS calendar link */
function appleCalendarUrl(details: BookingDetails): string {
  if (!details.preferredDate) return "";
  const dateStr = details.preferredDate.replace(/-/g, "");
  const serviceLabel = details.isCartOrder && details.cartItems
    ? `${details.cartItems.length} Services`
    : details.service.replace(/\s*\(.*\)$/, "");
  const title = encodeURIComponent(`Squito Pest Control — ${serviceLabel}`);
  const loc = encodeURIComponent(details.address);
  const desc = encodeURIComponent(`Services booked via Squito App`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&location=${loc}&details=${desc}`;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user, refreshProfile } = useAuth();
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    if (Capacitor.isNativePlatform()) haptics.success();

    // Trigger success confetti animation
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6b9e11", "#a3e635", "#eab308"],
        zIndex: 9999
      });
    }).catch(err => console.warn("Confetti load failed", err));

    // Fetch booking details from Stripe session
    const API_BASE = getApiBase(Capacitor.isNativePlatform());
    fetch(`${API_BASE}/api/checkout/session?id=${sessionId}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data.error) {
          throw new Error(data.error || "We couldn't load your booking details.");
        }
        return data;
      })
      .then((data) => {
        setDetails(data);
        setLoadError(null);
      })
      .catch((err) => {
        console.error(err);
        setDetails(null);
        setLoadError(err instanceof Error ? err.message : "We couldn't load your booking details.");
      })
      .finally(() => setLoading(false));

    // Give webhook 3s to process then refresh points
    const timer = setTimeout(() => refreshProfile(), 3000);
    return () => clearTimeout(timer);
  }, [sessionId, refreshProfile, reloadKey]);

  if (!sessionId) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-white">No session found</h1>
        <p className="mt-3 text-sm font-medium text-white/50 max-w-xs">Please try booking again.</p>
        <Link href="/book" className="mt-8">
          <GlassButton variant="primary" className="bg-squito-green/90 dark:bg-squito-green px-8 py-3">
            Book Again
          </GlassButton>
        </Link>
      </div>
    );
  }

  const isCartOrder = details?.isCartOrder && details?.cartItems && details.cartItems.length > 1;
  const totalCartPoints = details?.cartItems?.reduce((sum, item) => sum + (item.points || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] flex-col items-center pb-32"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mt-8 mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-squito-green/10"
      >
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="text-5xl"
        >
          ✅
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-3xl font-bold text-white text-center"
      >
        Payment Confirmed!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-sm font-medium text-white/50 text-center max-w-xs"
      >
        {isCartOrder
          ? `A receipt for your ${details.cartItems!.length} services has been sent to your email.`
          : "A receipt has been sent to your email. We\u0027ll be in touch shortly!"}
      </motion.p>

      {/* Booking Details Card */}
      {!loading && details && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          className="mt-6 w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1a1a] shadow-lg overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-squito-green to-[#5a8c10] px-5 py-4">
            <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
              {isCartOrder ? `${details.cartItems!.length} Services Booked` : "Booking Confirmed"}
            </p>
            <p className="text-[17px] font-bold text-white mt-0.5 leading-snug">
              {isCartOrder
                ? details.cartItems!.map((i) => i.service.replace(/\s*\(.*\)$/, "")).join(", ")
                : details.service.replace(/\s*\(.*\)$/, "")}
            </p>
          </div>

          {/* Detail Rows */}
          <div className="divide-y divide-white/5 px-5">
            {details.name && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-white/40 font-medium">Name</span>
                <span className="text-base font-bold text-white">{details.name}</span>
              </div>
            )}
            {details.address && (
              <div className="flex items-start justify-between gap-3 py-3">
                <span className="text-sm text-white/40 font-medium shrink-0">Address</span>
                <span className="text-base font-bold text-white text-right">{details.address}</span>
              </div>
            )}
            {details.preferredDate && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-white/40 font-medium">Appointment</span>
                <span className="text-base font-bold text-white">
                  {new Date(details.preferredDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  {details.preferredTime && ` at ${details.preferredTime}`}
                </span>
              </div>
            )}

            {/* Cart items breakdown */}
            {isCartOrder && details.cartItems && (
              <div className="py-3">
                <p className="text-2xs font-bold uppercase tracking-widest text-white/40 mb-2">Services</p>
                {details.cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5">
                    <span className="text-sm font-medium text-white/70">
                      {item.service.replace(/\s*\(.*\)$/, "")}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.points > 0 && (
                        <span className="text-2xs font-bold text-squito-green">+{item.points} pts</span>
                      )}
                      <span className="text-sm font-bold text-white">
                        ${(item.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Discount applied */}
            {details.discountCents && details.discountCents > 0 && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-emerald-500 font-medium">🎁 PestPoints Discount</span>
                <span className="text-base font-bold text-emerald-500">
                  -{formatAmount(details.discountCents, details.currency)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-white/40 font-medium">Amount Paid</span>
              <span className="text-md font-bold text-squito-green">
                {formatAmount(details.amountTotal, details.currency)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1a1a] p-5 animate-pulse h-44" />
      )}

      {!loading && loadError && !details && (
        <div className="mt-6 w-full max-w-sm rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="mt-4 font-bold text-white">Payment received, but details are still syncing</p>
          <p className="mt-2 text-sm text-white/70">
            {loadError}
          </p>
          <button
            onClick={() => {
              setLoadError(null);
              setLoading(true);
              setReloadKey((current) => current + 1);
            }}
            className="mt-4 rounded-full bg-squito-green px-4 py-2 text-sm font-bold text-white"
          >
            Retry details
          </button>
        </div>
      )}

      {/* PestPoints Banner */}
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex w-full max-w-sm items-center gap-3 rounded-2xl bg-squito-green/10 border border-squito-green/20 px-5 py-3.5"
        >
          <span className="text-xl">🎉</span>
          <p className="text-sm font-medium text-squito-green">
            {isCartOrder && totalCartPoints > 0
              ? <>You&apos;re earning <strong>{totalCartPoints} PestPoints</strong> across all {details!.cartItems!.length} services! Check your profile shortly.</>
              : <>Your <strong>PestPoints</strong> will be awarded automatically! Check your profile shortly.</>}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 flex w-full max-w-sm items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5"
        >
          <span className="text-xl">💡</span>
          <p className="text-sm font-medium text-white/50">
            Create an account to earn <strong className="text-squito-green">PestPoints</strong> on every booking!
          </p>
        </motion.div>
      )}

      {/* Calendar CTAs */}
      {details?.preferredDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-4 flex w-full max-w-sm gap-2"
        >
          <a
            href={googleCalendarUrl(details)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-[#1a1a1a] py-3 text-sm font-bold text-white shadow-sm active:scale-95 transition-transform"
          >
            📅 Google Calendar
          </a>
          <a
            href={appleCalendarUrl(details)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-[#1a1a1a] py-3 text-sm font-bold text-white shadow-sm active:scale-95 transition-transform"
          >
            🍎 Apple Calendar
          </a>
        </motion.div>
      )}

      {/* Navigation CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-6 flex flex-col gap-3 w-full max-w-sm"
      >
        {user && (
          <Link href="/me">
            <GlassButton
              variant="secondary"
              className="w-full py-3 text-base"
            >
              View My Visits
            </GlassButton>
          </Link>
        )}
        <Link href="/plans">
          <GlassButton
            variant="primary"
            className="w-full py-4 text-lg bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
          >
            Browse More Services
          </GlassButton>
        </Link>
        <Link href="/">
          <GlassButton variant="ghost" className="w-full py-3 text-squito-green">
            Back to Home
          </GlassButton>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function BookSuccessPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8 bg-[#0a0a0a]">
      <Suspense
        fallback={
          <div className="flex min-h-[70vh] items-center justify-center">
            <p className="text-white/50 font-medium">Loading...</p>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
