import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export const config = {
  api: {
    bodyParser: false, // Important: disable default body parsing for webhook verification
  },
};

async function buffer(readable: any) {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-12-18.acacia",
  });

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      console.error("Missing stripe-signature header");
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verify webhook signature if webhook secret is configured
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }
    } else {
      // If no webhook secret, parse the body directly (NOT recommended for production)
      console.warn("STRIPE_WEBHOOK_SECRET not set. Skipping signature verification.");
      event = JSON.parse(rawBody.toString());
    }

    console.log("Stripe webhook received:", {
      type: event.type,
      id: event.id,
    });

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;

        console.log("Payment succeeded:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          bookingId,
        });

        if (bookingId) {
          try {
            // Update booking status in Supabase
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                payment_status: "completed",
                payment_id: paymentIntent.id,
                updated_at: new Date().toISOString(),
              })
              .eq("booking_id", bookingId);

            if (updateError) {
              console.error("Failed to update booking in Supabase:", updateError);
            } else {
              console.log("Booking updated successfully:", bookingId);
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;

        console.log("Payment failed:", {
          paymentIntentId: paymentIntent.id,
          bookingId,
        });

        if (bookingId) {
          try {
            // Update booking status to failed
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                payment_status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("booking_id", bookingId);

            if (updateError) {
              console.error("Failed to update booking in Supabase:", updateError);
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error?.message || "Webhook processing failed" });
  }
}

