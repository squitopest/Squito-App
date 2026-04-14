"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import { useCart, SERVICE_CATALOG } from "@/lib/CartContext";
import { haptics } from "@/lib/haptics";
import { Capacitor } from "@capacitor/core";
import { usePlacesAutocomplete } from "@/lib/usePlacesAutocomplete";

// ── Phone number formatting ─────────────────────────────────────────────────
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ── Today's date as YYYY-MM-DD for the date picker min ─────────────────────
function todayISO(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// ── Price lookup (mirrors the API so the UI can preview costs) ──────────────
const SERVICE_PRICES: Record<string, number> = {
  "Mosquito Barrier Spray ($119)": 119,
  "Organic Mosquito & Tick Treatment ($99)": 99,
  "Tick Treatment ($99)": 99,
  "General & Full Property Pest Control ($299)": 299,
  "Hornet & Wasp Removal ($349)": 349,
  "Termite Inspection ($199)": 199,
  "Free Estimate / Custom Quote": 0,
  // Plans — monthly (corrected to match squitopestcontrol.com)
  "Essential Defense (monthly)": 49.99,
  "Premium Shield (monthly)": 89.99,
  "Ultimate Fortress (monthly)": 129.99,
  // Plans — yearly
  "Essential Defense (yearly)": 479.88,
  "Premium Shield (yearly)": 863.88,
  "Ultimate Fortress (yearly)": 1247.88,
};

// Initial fees for monthly plans (waived for yearly)
const PLAN_INITIAL_FEES: Record<string, number> = {
  "Essential Defense (monthly)": 199.99,
  "Premium Shield (monthly)": 299.99,
  "Ultimate Fortress (monthly)": 399.99,
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  "Mosquito Barrier Spray ($119)": "Perimeter barrier spray — keeps your yard bite-free",
  "Organic Mosquito & Tick Treatment ($99)": "Eco-safe treatment, pet & kid friendly",
  "Tick Treatment ($99)": "21-day tick elimination barrier",
  "General & Full Property Pest Control ($299)": "Complete interior + exterior treatment",
  "Hornet & Wasp Removal ($349)": "Professional nest removal, zero risk to family",
  "Termite Inspection ($199)": "Full property inspection with written report",
  "Free Estimate / Custom Quote": "A technician will assess & quote on-site",
  "Essential Defense (monthly)": "Quarterly exterior protection — 15+ pests covered",
  "Premium Shield (monthly)": "Interior & exterior — 30+ pests, rodent exclusion",
  "Ultimate Fortress (monthly)": "Total coverage — mosquito/tick + quarterly pest",
  "Essential Defense (yearly)": "Annual plan — save $120 vs monthly, fee waived",
  "Premium Shield (yearly)": "Annual plan — save $216 vs monthly, fee waived",
  "Ultimate Fortress (yearly)": "Annual plan — save $312 vs monthly, fee waived",
};

// ── Points per service (subscription model: earn per payment cycle) ──────────
const SERVICE_POINTS: Record<string, number> = {
  "Mosquito Barrier Spray ($119)": 75,
  "Organic Mosquito & Tick Treatment ($99)": 75,
  "Tick Treatment ($99)": 75,
  "General & Full Property Pest Control ($299)": 125,
  "Hornet & Wasp Removal ($349)": 150,
  "Termite Inspection ($199)": 100,
  "Free Estimate / Custom Quote": 0,
  // Plans — monthly: earn points every month
  "Essential Defense (monthly)": 75,
  "Premium Shield (monthly)": 125,
  "Ultimate Fortress (monthly)": 200,
  // Plans — yearly: bulk point bonus upfront
  "Essential Defense (yearly)": 800,
  "Premium Shield (yearly)": 1350,
  "Ultimate Fortress (yearly)": 2100,
};

function BookForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPlan = searchParams.get("plan");
  const initialService = searchParams.get("service");
  const billingCycle = searchParams.get("billing") || "monthly";
  const wasCancelled = searchParams.get("cancelled") === "true";

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { user, isGuest, profile } = useAuth();
  const { items: cartItems, subtotal: cartSubtotal, totalPoints: cartTotalPoints, hasItems, clearCart, removeItem } = useCart();

  // ── Determine mode: "cart" or "single" ──
  const isSingleServiceMode = !!initialService || !!initialPlan;
  const isCartMode = hasItems && !isSingleServiceMode;

  // ── PestPoints Discount ──
  const [pendingDiscount, setPendingDiscount] = useState<{
    redemptionId: string;
    discountCents: number;
    discountDollars: number;
    expiresAt: string;
    rewardName: string;
  } | null>(null);

  useEffect(() => {
    if (!user || isGuest) return;
    import("@/lib/pointsEngine").then(({ getPendingDiscount }) => {
      getPendingDiscount(user.id).then((d) => setPendingDiscount(d));
    });
  }, [user, isGuest]);

  const addressInputRef = usePlacesAutocomplete({
    onSelect: (address, coords) => {
      setFormData((f) => ({ ...f, address }));
      if (coords) setCoordinates(coords);
      setGpsAccuracy(null);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service: "Mosquito Barrier Spray ($119)",
    preferredDate: "",
    preferredTime: "",
  });

  // Auto-fill from profile once available
  useEffect(() => {
    if (profile) {
      setFormData((f) => ({
        ...f,
        name: f.name || profile.display_name || "",
        email: f.email || profile.email || user?.email || "",
        phone: f.phone || (profile.phone ? formatPhone(profile.phone) : ""),
        address: f.address || profile.service_address || profile.address || "",
      }));
    } else if (user?.email) {
      setFormData((f) => ({
        ...f,
        email: f.email || user.email || "",
        name: f.name || user.user_metadata?.display_name || "",
      }));
    }
  }, [profile, user]);

  // Set service from query params (single-service mode only)
  const SERVICE_MAP: Record<string, string> = {
    "mosquito-barrier": "Mosquito Barrier Spray ($119)",
    "organic-treatment": "Organic Mosquito & Tick Treatment ($99)",
    "tick-treatment": "Tick Treatment ($99)",
    "general-pest": "General & Full Property Pest Control ($299)",
    "hornet-wasp": "Hornet & Wasp Removal ($349)",
    "termite-inspection": "Termite Inspection ($199)",
    "free-estimate": "Free Estimate / Custom Quote",
  };

  useEffect(() => {
    if (initialService && SERVICE_MAP[initialService]) {
      setFormData((f) => ({ ...f, service: SERVICE_MAP[initialService] }));
    } else if (initialPlan) {
      if (initialPlan === "essential-defense") setFormData((f) => ({ ...f, service: `Essential Defense (${billingCycle})` }));
      if (initialPlan === "premium-shield") setFormData((f) => ({ ...f, service: `Premium Shield (${billingCycle})` }));
      if (initialPlan === "ultimate-fortress") setFormData((f) => ({ ...f, service: `Ultimate Fortress (${billingCycle})` }));
    }
  }, [initialPlan, initialService, billingCycle]);

  // Redirect to services if cart is empty and no single-service param
  useEffect(() => {
    if (!isSingleServiceMode && !hasItems && status === "idle") {
      // Small delay to prevent flash during initial load
      const t = setTimeout(() => {
        if (!hasItems) router.replace("/plans");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isSingleServiceMode, hasItems, status, router]);

  // Trigger confetti when a Free Estimate completes successfully!
  useEffect(() => {
    if (status === "success") {
      if (typeof window !== "undefined" && (window as any).Capacitor) {
        haptics.success();
      }
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
    }
  }, [status]);


  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage("GPS not available on this device.");
      return;
    }
    setLocating(true);
    setGpsAccuracy(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          // Store coordinates for precise CRM routing
          setCoordinates({ lat: latitude, lng: longitude });
          setGpsAccuracy(Math.round(accuracy));

          // Use Nominatim (free, no API key needed) for reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
            { headers: { "User-Agent": "SquitoApp/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            // Build a clean US street address
            const parts = [
              addr.house_number,
              addr.road,
            ].filter(Boolean).join(" ");
            const cityState = [
              addr.city || addr.town || addr.village || addr.hamlet,
              addr.state,
              addr.postcode,
            ].filter(Boolean).join(", ");
            const fullAddress = [parts, cityState].filter(Boolean).join(", ");
            setFormData((f) => ({ ...f, address: fullAddress || data.display_name || "" }));
          }
        } catch (err) {
          console.error("Reverse geocode failed:", err);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("GPS error:", err);
        setErrorMessage("Could not get your location. Please enter your address manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    if (typeof window !== "undefined" && (window as any).Capacitor) {
      haptics.light();
    }

    try {
      const API_BASE = Capacitor.isNativePlatform() ? "https://squito-app.vercel.app" : "";

      if (isCartMode) {
        // ── Cart checkout ──
        // Separate free estimates from paid services
        const freeEstimateInCart = cartItems.find((i) => i.serviceKey === "Free Estimate / Custom Quote");
        const paidItems = cartItems.filter((i) => i.serviceKey !== "Free Estimate / Custom Quote");

        // Submit free estimate separately (no Stripe needed)
        if (freeEstimateInCart) {
          await fetch(`${API_BASE}/api/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              service: "Free Estimate / Custom Quote",
              coordinates: coordinates || undefined,
              userId: user && !isGuest ? user.id : undefined,
            }),
          });
        }

        if (paidItems.length === 0) {
          // All items were free estimates
          clearCart();
          setStatus("success");
          return;
        }

        // Create Stripe Checkout session with cart items
        const res = await fetch(`${API_BASE}/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            cartItems: paidItems.map((item) => ({
              serviceKey: item.serviceKey,
              service: item.serviceKey,
            })),
            coordinates: coordinates || undefined,
            userId: user && !isGuest ? user.id : undefined,
            ...(pendingDiscount ? {
              discountCents: pendingDiscount.discountCents,
              redemptionId: pendingDiscount.redemptionId,
            } : {}),
          }),
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          throw new Error(result.error || "Failed to start checkout");
        }

        // Clear cart before redirecting to Stripe
        clearCart();
        window.location.href = result.url;
        return;
      }

      // ── Single-service checkout (existing flow) ──
      const isFreeEstimate = formData.service === "Free Estimate / Custom Quote";

      if (isFreeEstimate) {
        // Free estimates skip payment — process directly
        const res = await fetch(`${API_BASE}/api/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            coordinates: coordinates || undefined,
            userId: user && !isGuest ? user.id : undefined,
          }),
        });
        if (!res.ok) throw new Error("Failed to submit");
        setStatus("success");
        return;
      }

      // Paid services → create Stripe Checkout session and redirect
      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          coordinates: coordinates || undefined,
          userId: user && !isGuest ? user.id : undefined,
          // Pass pending PestPoints discount if available
          ...(pendingDiscount ? {
            discountCents: pendingDiscount.discountCents,
            redemptionId: pendingDiscount.redemptionId,
          } : {}),
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || "Failed to start checkout");
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred");
      setStatus("error");
    }
  };

  if (status === "success") {
    // Only free estimates land here — paid bookings redirect to /book/success
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center pb-32"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-squito-green/10">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-white">
          Estimate Request Sent!
        </h1>
        <p className="mt-4 font-medium text-white/50">
          We&apos;ve received your request and will contact you at <strong className="text-white">{formData.email}</strong> to schedule your free estimate.
        </p>
        <Link href="/plans" onClick={() => { if (typeof window !== "undefined" && (window as any).Capacitor) haptics.light() }}>
          <GlassButton
            variant="ghost"
            className="mt-10 text-squito-green dark:text-squito-green py-2 px-6"
          >
            Book another service
          </GlassButton>
        </Link>
      </motion.div>
    );
  }

  // Derived price + NYS tax for the selected service (single-service mode)
  const selectedPrice = isCartMode ? cartSubtotal : (SERVICE_PRICES[formData.service] ?? 0);
  const isFree = !isCartMode && formData.service === "Free Estimate / Custom Quote";
  const isRecurring = !isCartMode && (formData.service.includes("monthly") || formData.service.includes("yearly"));

  // PestPoints discount (only applies to paid services)
  const discountDollars = (!isFree && pendingDiscount) ? Math.min(pendingDiscount.discountDollars, selectedPrice) : 0;
  const priceAfterDiscount = selectedPrice - discountDollars;

  // Client-side tax preview (mirrors bookingEngine.detectCountyTax)
  const NASSAU_CITIES = /\b(garden city|hempstead|long beach|great neck|mineola|valley stream|freeport|oceanside|lynbrook|malverne|rockville centre|hewlett|merrick|bellmore|wantagh|seaford|massapequa|levittown|hicksville|syosset|plainview|farmingdale|bethpage|westbury|new hyde park|floral park|elmont|uniondale|east meadow|franklin square|north valley stream)\b/i;
  const SUFFOLK_CITIES = /\b(brentwood|central islip|bay shore|islip|patchogue|riverhead|smithtown|hauppauge|commack|north babylon|babylon|west babylon|deer park|amityville|lindenhurst|copiague|huntington|melville|bohemia|ronkonkoma|holbrook|lake grove|stony brook|port jefferson|setauket|centereach|coram|ridge|moriches|hampton bays|southampton|east hampton|montauk|greenport|cutchogue|mattituck|shelter island)\b/i;
  const taxRate = !formData.address ? 0 :
    formData.address.toLowerCase().includes("nassau") || NASSAU_CITIES.test(formData.address) ? 0.0825 :
    formData.address.toLowerCase().includes("suffolk") || SUFFOLK_CITIES.test(formData.address) ? 0.08625 : 0.08;
  const taxCounty = !formData.address ? "" :
    formData.address.toLowerCase().includes("nassau") || NASSAU_CITIES.test(formData.address) ? "Nassau" :
    formData.address.toLowerCase().includes("suffolk") || SUFFOLK_CITIES.test(formData.address) ? "Suffolk" : "NY";
  // Initial fee for monthly plans (waived for yearly)
  // Month 1 = initial fee ONLY. Monthly recurring starts month 2.
  const initialFee = !isCartMode ? (PLAN_INITIAL_FEES[formData.service] ?? 0) : 0;
  const isMonthlyPlan = !isCartMode && formData.service.includes("(monthly)");

  // For monthly plans: charge only initial fee. For everything else: charge the service price.
  const chargedPrice = isMonthlyPlan ? initialFee : priceAfterDiscount;
  const taxAmount = !isFree ? Math.round(chargedPrice * taxRate * 100) / 100 : 0;
  const totalWithTax = chargedPrice + taxAmount;

  // Points preview
  const pointsPreview = isCartMode ? cartTotalPoints : (SERVICE_POINTS[formData.service] ?? 50);

  return (
    <>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-2 text-sm font-medium text-white/50"
      >
        {user && !isGuest
          ? `Earn ${pointsPreview} PestPoints with this booking! 🎉`
          : "Fast guest routing. No account required."}
      </motion.p>

      {/* Cancellation Recovery Banner */}
      {wasCancelled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-3.5"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-[13px] font-bold text-amber-400">Payment was cancelled</p>
            <p className="text-[12px] text-amber-500 mt-0.5">No charge was made. Your form is still filled in &mdash; just hit &ldquo;Proceed to Payment&rdquo; again when ready.</p>
          </div>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 rounded-xl bg-red-500/10 p-4 border border-red-500/20"
        >
          <p className="text-sm font-bold text-red-500">{errorMessage}</p>
        </motion.div>
      )}

      {/* ── Cart Summary (cart mode only) ── */}
      {isCartMode && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
          className="mt-6 rounded-2xl border border-white/10 bg-[#1a1a1a] px-5 py-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
            🛒 Cart ({cartItems.length} {cartItems.length === 1 ? "service" : "services"})
          </p>
          <div className="divide-y divide-white/5">
            {cartItems.map((item) => (
              <div key={item.serviceKey} className="flex items-center justify-between py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white truncate">{item.serviceName}</p>
                  {item.points > 0 && (
                    <span className="text-[10px] font-bold text-squito-green">⭐ +{item.points} pts</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[14px] font-bold text-white">${item.price}</span>
                  <button
                    type="button"
                    onClick={() => { removeItem(item.serviceKey); haptics.light(); }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-[11px] active:scale-90 transition-transform"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/plans" className="mt-3 block text-center text-[12px] font-bold text-squito-green active:opacity-70">
            + Add more services
          </Link>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-5">
           <div>
            <label className="mb-1.5 block pl-1 text-[13px] font-bold text-white/70">
              Full Name
            </label>
            <input
              id="booking-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            />
          </div>
          
          <div>
            <label className="mb-1.5 block pl-1 text-[13px] font-bold text-white/70">
              Email Address
            </label>
            <input
              id="booking-email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-white/70">
            Phone
          </label>
          <input
            id="booking-phone"
            required
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
            className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
        </div>

        {/* Address with GPS button */}
        <div>
          <div className="flex items-center justify-between mb-1.5 pl-1">
            <label className="text-[13px] font-bold text-white/70">
              Service Address
            </label>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1 text-[12px] font-bold text-squito-green active:scale-95 transition-transform disabled:opacity-50"
            >
              {locating ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  Locating…
                </>
              ) : (
                <>📍 Use My Location</>
              )}
            </button>
          </div>
          <input
            ref={addressInputRef}
            id="booking-address"
            required
            autoComplete="off"
            placeholder="Start typing your address…"
            value={formData.address}
            onChange={(e) => {
              setFormData({ ...formData, address: e.target.value });
              if (coordinates) {
                setCoordinates(null);
                setGpsAccuracy(null);
              }
            }}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
          />
          {gpsAccuracy !== null && coordinates && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-center gap-1.5 pl-1"
            >
              <span className="text-[11px]">✅</span>
              <span className="text-[11px] font-medium text-squito-green">
                GPS location captured (±{gpsAccuracy}m accuracy)
              </span>
            </motion.div>
          )}
        </div>

        {/* Service selector (single-service mode only) */}
        {!isCartMode && (
          <div>
            <label className="mb-1.5 block pl-1 text-[13px] font-bold text-white/70">
              Service Needed
            </label>
            <select
              id="booking-service"
              required
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            >
              <optgroup label="One-Time Services">
                <option value="Mosquito Barrier Spray ($119)">Mosquito Barrier Spray — $119</option>
                <option value="Organic Mosquito & Tick Treatment ($99)">Organic Mosquito & Tick Treatment — $99</option>
                <option value="Tick Treatment ($99)">Tick Treatment — $99</option>
                <option value="General & Full Property Pest Control ($299)">General & Full Property Pest Control — $299</option>
                <option value="Hornet & Wasp Removal ($349)">Hornet & Wasp Removal — $349</option>
                <option value="Termite Inspection ($199)">Termite Inspection — $199</option>
                <option value="Free Estimate / Custom Quote">Free Estimate / Custom Quote</option>
              </optgroup>
              <optgroup label="Protection Plans">
                <option value="Essential Defense (monthly)">Essential Defense ($49.99/mo + $199.99 setup)</option>
                <option value="Premium Shield (monthly)">Premium Shield ($89.99/mo + $299.99 setup)</option>
                <option value="Ultimate Fortress (monthly)">Ultimate Fortress ($129.99/mo + $399.99 setup)</option>
                <option value="Essential Defense (yearly)">Essential Defense ($479.88/yr — fee waived)</option>
                <option value="Premium Shield (yearly)">Premium Shield ($863.88/yr — fee waived)</option>
                <option value="Ultimate Fortress (yearly)">Ultimate Fortress ($1,247.88/yr — fee waived)</option>
              </optgroup>
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block pl-1 text-[13px] font-bold text-white/70">
            Preferred Date & Time
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              id="booking-date"
              required
              type="date"
              min={todayISO()}
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            />
            <select
              id="booking-time"
              required
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-sm text-white shadow-sm outline-none transition focus:border-squito-green focus:ring-1 focus:ring-squito-green"
            >
              <option value="" disabled>Window</option>
              <option value="Morning (8am - 12pm)">Morning (8am - 12pm)</option>
              <option value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</option>
              <option value="Evening (4pm - 8pm)">Evening (4pm - 8pm)</option>
            </select>
          </div>
        </div>

        {/* PestPoints Discount Applied Banner */}
        {pendingDiscount && !isFree && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 18 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 px-5 py-4"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
            />
            <div className="relative flex items-center gap-3">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3 }}
              >
                🎁
              </motion.span>
              <div>
                <p className="text-[13px] font-bold text-emerald-700">
                  ${discountDollars} PestPoints discount applied!
                </p>
                <p className="text-[11px] font-medium text-emerald-600/70 mt-0.5">
                  From: {pendingDiscount.rewardName} &mdash; expires {new Date(pendingDiscount.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {user && !isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 18 }}
            className="relative overflow-hidden rounded-2xl border border-squito-green/20 bg-gradient-to-r from-[#f7fbe8] to-[#eef6d6] px-5 py-4"
          >
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
            />
            <div className="relative flex items-center gap-3">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              >
                ⭐
              </motion.span>
              <div>
                <p className="text-[13px] font-bold text-squito-green">
                  Earn up to <motion.span
                    className="inline-block text-[15px]"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 4 }}
                  >+{pointsPreview} PestPoints</motion.span> on this booking!
                </p>
                <p className="text-[11px] font-medium text-squito-green/70 mt-0.5">
                  {isCartMode
                    ? `Earn points for each of your ${cartItems.length} services!`
                    : "Points increase with your tier. Higher tier = bigger rewards!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      {/* Live Order Summary Card */}
      {!isFree && (
        <motion.div
          key={isCartMode ? "cart-summary" : formData.service + formData.address}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="mt-2 rounded-2xl border border-white/10 bg-[#1a1a1a] px-5 py-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Order Summary</p>
          
          {isCartMode ? (
            // Cart mode: show all items
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.serviceKey} className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-white leading-snug">
                      {item.serviceName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-bold text-white">${item.price}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-white/50">Subtotal ({cartItems.length} services)</p>
                  <p className="text-[14px] font-bold text-white">
                    ${selectedPrice.toLocaleString("en-US", { minimumFractionDigits: selectedPrice % 1 === 0 ? 0 : 2 })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Single-service mode: show one item
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-[14px] font-bold text-white leading-snug">
                  {formData.service.replace(/\s*\(.*\)$/, "")}
                </p>
                <p className="text-[11px] text-white/50 mt-0.5">
                  {SERVICE_DESCRIPTIONS[formData.service]}
                </p>
                {isMonthlyPlan && (
                  <span className="mt-1.5 inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                    📋 Initial setup — first month
                  </span>
                )}
                {isRecurring && !isMonthlyPlan && (
                  <span className="mt-1.5 inline-block rounded-full bg-squito-green/15 px-2 py-0.5 text-[10px] font-bold text-squito-green">
                    🔄 Annual plan
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-[22px] font-bold text-white">
                  ${isMonthlyPlan
                    ? initialFee.toFixed(2)
                    : selectedPrice.toLocaleString("en-US", { minimumFractionDigits: selectedPrice % 1 === 0 ? 0 : 2 })}
                </p>
                <p className="text-[10px] text-white/40">
                  {isMonthlyPlan ? "due today" : isRecurring ? "/year" : "subtotal"}
                </p>
              </div>
            </div>
          )}

          {/* PestPoints discount line */}
          {discountDollars > 0 && !isMonthlyPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-emerald-500">🎁 PestPoints Discount</p>
                <p className="text-[11px] font-bold text-emerald-500">-${discountDollars.toFixed(2)}</p>
              </div>
            </motion.div>
          )}
          {/* Recurring note for monthly plans */}
          {isMonthlyPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-white/50">🔄 Recurring starts next month</p>
                <p className="text-[11px] font-bold text-white/70">${selectedPrice.toFixed(2)}/mo</p>
              </div>
              <p className="text-[9px] text-white/40 mt-0.5">Today you only pay the initial fee. Monthly billing begins next month.</p>
            </motion.div>
          )}
          {/* Tax breakdown — shown once address has enough data */}
          {formData.address.length > 5 && taxRate > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-white/40">{taxCounty} County Tax ({(taxRate * 100).toFixed(3)}%)</p>
                <p className="text-[11px] text-white/50">+${taxAmount.toFixed(2)}</p>
              </div>
            </motion.div>
          )}
          <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between">
            <p className="text-[11px] text-white/50">Total charged today</p>
            <p className="text-[14px] font-bold text-squito-green">
              ${formData.address.length > 5 ? totalWithTax.toFixed(2) : priceAfterDiscount.toLocaleString("en-US", { minimumFractionDigits: priceAfterDiscount % 1 === 0 ? 0 : 2 })} {formData.address.length > 5 && taxRate > 0 ? "(incl. tax)" : ""}
            </p>
          </div>
        </motion.div>
      )}

        <GlassButton
          variant="primary"
          type="submit"
          className={`mt-4 flex w-full py-4 text-[15px] shadow-[0_8px_20px_rgba(107,158,17,0.25)] transition-all ${status === "submitting" ? "bg-squito-green/50" : "bg-squito-green/90 dark:bg-squito-green hover:bg-squito-green"}`}
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Processing..."
            : isFree
            ? "Schedule Free Estimate →"
            : isCartMode
            ? `Pay $${(formData.address.length > 5 ? totalWithTax : priceAfterDiscount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for ${cartItems.length} Services →`
            : `Pay $${(formData.address.length > 5 ? totalWithTax : priceAfterDiscount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Securely →`}
        </GlassButton>
        {!isFree && (
          <p className="mt-2 text-center text-[11px] font-medium text-gray-400">
            🔒 Secure payment via Stripe
          </p>
        )}
      </motion.form>
    </>
  );
}

export default function BookPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 font-display text-[2rem] font-bold leading-tight text-gray-900"
      >
        Book a Service
      </motion.h1>
      <Suspense fallback={<div className="mt-8 text-center text-sm text-gray-500">Loading form...</div>}>
        <BookForm />
      </Suspense>
    </div>
  );
}
