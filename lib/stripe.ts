import Stripe from "stripe";

// Initialize Stripe with your secret key
// Lazy-init so the import doesn't break if the key isn't set yet
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set in .env.local");
    _stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" as any });
  }
  return _stripe;
}
