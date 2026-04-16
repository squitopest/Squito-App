
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/errors";
import { getStripe } from "@/lib/stripe";
import { calculateTax } from "@/lib/bookingEngine";
import { createRateLimiter } from "@/lib/rateLimit";

const checkoutRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

// Service ID → price in cents (Stripe uses cents)
const SERVICE_PRICES: Record<string, number> = {
  "Mosquito Barrier Spray ($119)": 11900,
  "Organic Mosquito & Tick Treatment ($99)": 9900,
  "Tick Treatment ($99)": 9900,
  "General & Full Property Pest Control ($299)": 29900,
  "Hornet & Wasp Removal ($349)": 34900,
  "Termite Inspection ($199)": 19900,
  "Free Estimate / Custom Quote": 0,
  // Plans — monthly (corrected to match squitopestcontrol.com)
  "Essential Defense (monthly)": 4999,
  "Premium Shield (monthly)": 8999,
  "Ultimate Fortress (monthly)": 12999,
  // Plans — yearly (corrected to match squitopestcontrol.com)
  "Essential Defense (yearly)": 47988,
  "Premium Shield (yearly)": 86388,
  "Ultimate Fortress (yearly)": 124788,
};

// Initial fees for monthly plans (waived for yearly)
const PLAN_INITIAL_FEES: Record<string, number> = {
  "Essential Defense (monthly)": 19999,
  "Premium Shield (monthly)": 29999,
  "Ultimate Fortress (monthly)": 39999,
};

// Points per service (subscription model: earn per payment cycle)
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

interface CheckoutCoordinates {
  lat: number;
  lng: number;
}

interface CheckoutCartInputItem {
  serviceKey?: string;
  service?: string;
}

interface CheckoutRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
  coordinates?: CheckoutCoordinates;
  userId?: string;
  discountCents?: number;
  redemptionId?: string;
  cartItems?: CheckoutCartInputItem[];
}

function isCheckoutRequestBody(value: unknown): value is CheckoutRequestBody {
  return typeof value === "object" && value !== null;
}

interface CheckoutLineItem {
  price_data: {
    currency: "usd";
    product_data: {
      name: string;
      description: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (checkoutRateLimit.isLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: CheckoutRequestBody;
  try {
    const parsedBody = await request.json();
    if (!isCheckoutRequestBody(parsedBody)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    body = parsedBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name, email, phone, address, service, preferredDate, preferredTime,
    coordinates, userId, discountCents, redemptionId,
    // Cart-specific fields
    cartItems: clientCartItems,
  } = body;

  if (!name || !email || !phone || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Determine if this is a cart order or single-service order ──
  const isCartOrder = Array.isArray(clientCartItems) && clientCartItems.length > 0;

  // For single-service, require the service field
  if (!isCartOrder && !service) {
    return NextResponse.json({ error: "Missing service or cartItems" }, { status: 400 });
  }

  // Free estimates don't need payment (single-service only)
  if (!isCartOrder && service === "Free Estimate / Custom Quote") {
    return NextResponse.json({ free: true });
  }

  // ── Build cart items with verified prices ──
  interface VerifiedCartItem {
    service: string;
    priceCents: number;
    points: number;
  }

  let verifiedCartItems: VerifiedCartItem[] = [];

  if (isCartOrder) {
    // Cart mode — validate each item against server-side price list
    for (const item of clientCartItems) {
      const serviceKey = item.serviceKey || item.service;
      if (!serviceKey) {
        return NextResponse.json(
          { error: "Cart item is missing a service identifier" },
          { status: 400 }
        );
      }
      const serverPrice = SERVICE_PRICES[serviceKey];
      if (serverPrice === undefined || serverPrice === 0) {
        return NextResponse.json(
          { error: `Unknown or free service in cart: ${serviceKey}` },
          { status: 400 }
        );
      }
      verifiedCartItems.push({
        service: serviceKey,
        priceCents: serverPrice,
        points: SERVICE_POINTS[serviceKey] || 0,
      });
    }

    if (verifiedCartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
  } else {
    // Single-service mode (backward compatible)
    if (!service) {
      return NextResponse.json({ error: "Missing service" }, { status: 400 });
    }
    const priceCents = SERVICE_PRICES[service];
    if (!priceCents) {
      return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
    }
    verifiedCartItems = [{
      service,
      priceCents,
      points: SERVICE_POINTS[service] || 0,
    }];
  }

  // ── Calculate subtotal ──
  let subtotalCents = verifiedCartItems.reduce((sum, item) => sum + item.priceCents, 0);

  // ── Server-side discount validation ──
  // NEVER trust the client's discountCents — always verify against the database.
  let validDiscount = 0;
  let verifiedRedemptionId = "";

  if (redemptionId && userId) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      const { data: redemption } = await supabaseAdmin
        .from("redemptions")
        .select("id, user_id, discount_cents, status, expires_at")
        .eq("id", redemptionId)
        .eq("user_id", userId)         // must belong to this user
        .eq("status", "pending")       // must not be already used
        .gt("expires_at", new Date().toISOString()) // must not be expired
        .single();

      if (redemption && redemption.discount_cents > 0) {
        // Use the DATABASE value — not the client's claimed amount
        validDiscount = Math.min(redemption.discount_cents, subtotalCents);
        verifiedRedemptionId = redemption.id;
      } else {
        console.warn("[Checkout] Discount rejected due to invalid, expired, or used redemption.");
      }
    } catch (err) {
      console.error("[Checkout] Discount validation error:", err);
      // Fail safe — charge full price if validation errors
    }
  }

  const discountedSubtotalCents = subtotalCents - validDiscount;

  // Calculate NYS county-level sales tax on the DISCOUNTED price
  const priceUSD = discountedSubtotalCents / 100;
  const tax = calculateTax(priceUSD, address);
  const taxInCents = Math.round(tax.taxAmount * 100);

  try {
    const stripe = getStripe();

    // In Native iOS Capacitor, origin is capacitor://localhost — lock to Vercel
    let origin = request.headers.get("origin") || "https://squito-app.vercel.app";
    if (origin.includes("capacitor://")) {
      origin = "https://squito-app.vercel.app";
    }

    // ── Build line items ──
    const line_items: CheckoutLineItem[] = verifiedCartItems.map((item) => {
      // If there's a discount, spread it proportionally across items for Stripe display
      const itemDiscountCents = validDiscount > 0
        ? Math.round((item.priceCents / subtotalCents) * validDiscount)
        : 0;
      const itemChargedCents = item.priceCents - itemDiscountCents;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.service.replace(/\s*\(.*\)$/, ""),
            description: `Service at ${address}${preferredDate ? ` on ${preferredDate}` : ""}${preferredTime ? ` at ${preferredTime}` : ""}`,
          },
          unit_amount: itemChargedCents,
        },
        quantity: 1,
      };
    });

    // ── Initial fee for monthly plans ──
    // Month 1 = initial setup fee ONLY. Recurring monthly starts month 2.
    // We REPLACE the plan's monthly price with the initial fee in the line items.
    let initialFeeCents = 0;
    if (!isCartOrder && service) {
      const fee = PLAN_INITIAL_FEES[service];
      if (fee && fee > 0) {
        initialFeeCents = fee;
        const planName = service.replace(/\s*\(.*\)$/, "");
        // Replace the first (plan) line item with the initial fee instead
        line_items[0] = {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planName} — Initial Setup & First Month`,
              description: `One-time setup fee. Recurring ${SERVICE_PRICES[service] ? "$" + (SERVICE_PRICES[service] / 100).toFixed(2) + "/mo" : ""} begins next month.`,
            },
            unit_amount: initialFeeCents,
          },
          quantity: 1,
        };
        // Update subtotal tracking to reflect the initial fee only (not monthly + fee)
        subtotalCents = initialFeeCents;
      }
    }

    // Show the PestPoints discount as a visible $0 line item for transparency
    if (validDiscount > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "🎁 PestPoints Discount Applied",
            description: `$${(validDiscount / 100).toFixed(2)} off — redeemed from your PestPoints balance`,
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    }

    // Recalculate tax on what's actually being charged
    const finalChargedCents = subtotalCents - validDiscount;
    const finalChargedUSD = finalChargedCents / 100;
    const taxWithFee = calculateTax(finalChargedUSD, address);
    const taxInCentsWithFee = Math.round(taxWithFee.taxAmount * 100);

    // Add tax as a separate transparent line item
    if (taxInCentsWithFee > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${taxWithFee.county} County Sales Tax (${(taxWithFee.taxRate * 100).toFixed(3)}%)`,
            description: "New York State + local sales tax",
          },
          unit_amount: taxInCentsWithFee,
        },
        quantity: 1,
      });
    }

    // ── Build metadata ──
    // Stripe metadata values must be strings and max 500 chars each
    const cartItemsForMeta = verifiedCartItems.map((item) => ({
      service: item.service,
      priceCents: item.priceCents,
      points: item.points,
    }));

    const metadata: Record<string, string> = {
      name,
      email,
      phone,
      address,
      preferredDate: preferredDate || "",
      preferredTime: preferredTime || "",
      userId: userId || "",
      coordinates: coordinates ? JSON.stringify(coordinates) : "",
      county: tax.county,
      taxRate: String(tax.taxRate),
      subtotal: String(priceUSD),
      taxAmount: String(initialFeeCents > 0 ? taxWithFee.taxAmount : tax.taxAmount),
      totalCharged: String(initialFeeCents > 0 ? taxWithFee.total : tax.total),
      discountCents: String(validDiscount),
      originalPriceCents: String(subtotalCents),
      initialFeeCents: String(initialFeeCents),
      redemptionId: verifiedRedemptionId,
    };

    if (isCartOrder) {
      metadata.isCartOrder = "true";
      metadata.cartItems = JSON.stringify(cartItemsForMeta);
      // Also store the primary service name for backward compat
      metadata.service = verifiedCartItems.map((i) => i.service.replace(/\s*\(.*\)$/, "")).join(", ");
    } else {
      metadata.service = service || "";
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items,
      metadata,
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?cancelled=true`,
    });

    return NextResponse.json({ url: session.url, tax });
  } catch (err: unknown) {
    console.error("[Stripe Checkout Error]", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Failed to create checkout session") },
      { status: 500 }
    );
  }
}
