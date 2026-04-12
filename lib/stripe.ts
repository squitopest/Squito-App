import Stripe from "stripe";

// Lazy-init so the module doesn't crash during Next.js static build
// (STRIPE_SECRET_KEY is only available at request-time on Vercel, not at build time)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      // Return a dummy object during static export build — API routes are
      // excluded from the bundle and only run on the Vercel server.
      return null as unknown as Stripe;
    }
    _stripe = new Stripe(key, { apiVersion: "2026-03-25.dahlia" as any });
  }
  return _stripe;
}
