
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { processBooking, processCartBooking } from "@/lib/bookingEngine";

export async function POST(req: Request) {
  const stripe = getStripe();
  const signature = headers().get("stripe-signature");
  
  // NOTE: In production, set STRIPE_WEBHOOK_SECRET in your Vercel/environment settings
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
  }

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // We only handle checkout.session.completed right now
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      // 1. Deduplication using Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase credentials for Deduplication");
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      });

      // Attempt to record this webhook to prevent duplicate processing
      const { data: insertData, error: dbError } = await supabase
        .from("stripe_webhooks")
        .insert({
          id: event.id,
          session_id: session.id,
          status: "processed"
        });

      if (dbError) {
        // Assuming duplicate id (PostgreSQL error code 23505)
        if (dbError.code === "23505") {
          console.log(`[Stripe Webhook] Event ${event.id} already processed. Skipping.`);
          return NextResponse.json({ received: true, notice: "Already processed" });
        }
        throw new Error(`Database error: ${dbError.message}`);
      }

      // 2. Extract booking data from metadata
      const meta = session.metadata || {};
      const isCartOrder = meta.isCartOrder === "true";

      if (isCartOrder && meta.cartItems) {
        // ── Cart order: process all services ──
        console.log(`[Stripe Webhook] Processing CART order with session ${session.id}`);

        let cartItems: Array<{ service: string; priceCents: number; points: number }>;
        try {
          cartItems = JSON.parse(meta.cartItems);
        } catch {
          console.error("[Stripe Webhook] Failed to parse cartItems metadata");
          cartItems = [];
        }

        if (cartItems.length > 0) {
          const customerData = {
            name: meta.name || "",
            email: meta.email || session.customer_details?.email || "",
            phone: meta.phone || "",
            address: meta.address || "",
            preferredDate: meta.preferredDate || "",
            preferredTime: meta.preferredTime || "",
            userId: meta.userId || "",
            coordinates: meta.coordinates ? JSON.parse(meta.coordinates) : null,
            county: meta.county || "",
            taxRate: meta.taxRate ? parseFloat(meta.taxRate) : null,
            subtotal: meta.subtotal || null,
            taxAmount: meta.taxAmount || null,
            totalCharged: meta.totalCharged || null,
            discountCents: meta.discountCents ? parseInt(meta.discountCents) : 0,
            isPaid: true,
            isStripeWebhook: true,
          };

          const result = await processCartBooking(customerData, cartItems);

          if (!result.ok) {
            console.error("[Stripe Webhook] Cart booking processor failed:", result.error);
            return NextResponse.json({ error: "Booking processing failed" }, { status: 500 });
          }

          console.log(`[Stripe Webhook] Successfully processed cart order with ${cartItems.length} services`);
        }
      } else {
        // ── Single-service order (backward compatible) ──
        const bookingData = {
          name: meta.name || "",
          email: meta.email || session.customer_details?.email || "",
          phone: meta.phone || "",
          address: meta.address || "",
          service: meta.service || "",
          preferredDate: meta.preferredDate || "",
          preferredTime: meta.preferredTime || "",
          userId: meta.userId || "",
          coordinates: meta.coordinates ? JSON.parse(meta.coordinates) : null,
          // Tax fields
          county: meta.county || "",
          taxRate: meta.taxRate ? parseFloat(meta.taxRate) : null,
          subtotal: meta.subtotal || null,
          taxAmount: meta.taxAmount || null,
          totalCharged: meta.totalCharged || null,
          isPaid: true,
          isStripeWebhook: true,
        };

        // 3. Process backend (CRM, Emails, Points)
        const result = await processBooking(bookingData);
        
        if (!result.ok) {
          console.error("[Stripe Webhook] Booking processor failed:", result.error);
          return NextResponse.json({ error: "Booking processing failed" }, { status: 500 });
        }
      }

      console.log(`[Stripe Webhook] Successfully processed session ${session.id}`);
    } catch (err: any) {
      console.error("[Stripe Webhook] Error processing event:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
