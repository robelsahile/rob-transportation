import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

type CreateIntentBody = {
  amount: number; // in cents
  bookingId: string;
  customerEmail: string;
  customerName?: string;
  vehicleName?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return res.status(500).json({
      error: "Server missing Stripe credentials (STRIPE_SECRET_KEY).",
    });
  }

  try {
    const { amount, bookingId, customerEmail, customerName, vehicleName } = req.body as CreateIntentBody;

    if (!amount || !bookingId || !customerEmail) {
      return res.status(400).json({
        error: "Missing required fields: amount, bookingId, or customerEmail",
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-09-30.clover",
    });

    // Create a PaymentIntent with the order details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure it's an integer
      currency: "usd",
      receipt_email: customerEmail,
      metadata: {
        bookingId,
        customerName: customerName || "Guest",
        vehicleName: vehicleName || "Private Ride",
      },
      description: `Booking ${bookingId} - ${vehicleName || "Private Ride"}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment Intent created:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      bookingId,
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe PaymentIntent creation error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to create payment intent",
    });
  }
}

