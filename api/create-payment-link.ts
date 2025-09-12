import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const {
  SQUARE_ACCESS_TOKEN,
  SQUARE_LOCATION_ID,
  SQUARE_ENV, // "sandbox" | "production"
} = process.env;

const SQUARE_BASE =
  SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
      return res
        .status(500)
        .send("Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID).");
    }

    const {
      amount,           // cents (subtotal)
      bookingId,        // your custom ID e.g. 20250911-SAH-0001
      customerName,
      customerEmail,
      redirectUrl,
    } = req.body as {
      amount: number;
      bookingId?: string;
      customerName?: string;
      customerEmail?: string;
      redirectUrl?: string;
    };

    const finalCents = Math.max(50, Number(amount) | 0); // keep >= $0.50
    const idempotencyKey = crypto.randomUUID();

    // Make the booking ID visible in 3 places:
    // 1) payment_note -> appears on the Payment in Dashboard
    // 2) order.note   -> appears on the Order
    // 3) line item name -> visible on the hosted checkout and in Orders
    const bookingLabel = bookingId ? `Booking ${bookingId}` : "Booking N/A";

    const payload = {
      idempotency_key: idempotencyKey,
      // Shows on the Payment object in Dashboard (easiest place to find it)
      payment_note: bookingLabel,

      // Build the Order
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: bookingId || undefined, // stored with order (not always surfaced in UI)
        note: bookingLabel,                   // visible on the order
        line_items: [
          {
            // Put the ID in the line item title so it’s also visible on the checkout page
            name: bookingId ? `Ride Booking — ${bookingId}` : "Ride Booking",
            quantity: "1",
            base_price_money: {
              amount: finalCents,
              currency: "USD",
            },
          },
        ],
      },

      // Hosted checkout options
      checkout_options: {
        redirect_url: redirectUrl,
        ask_for_shipping_address: false,
      },

      // Pre-fill buyer email (optional)
      pre_populated_data: {
        buyer_email: customerEmail || undefined,
      },
    };

    const resp = await fetch(`${SQUARE_BASE}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        // Use a current version so notes display reliably in Dashboard
        "Square-Version": "2025-08-20",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Square create-payment-link error:", data);
      return res.status(resp.status).send(typeof data === "string" ? data : JSON.stringify(data));
    }

    const url: string | undefined =
      data?.payment_link?.url || data?.payment_link?.long_url;

    if (!url) {
      console.error("Square response missing payment_link.url", data);
      return res.status(500).send("No payment link returned from Square.");
    }

    return res.status(200).json({ url, idempotencyKey });
  } catch (err: any) {
    console.error(err);
    return res.status(500).send("Server error creating payment link.");
  }
}
