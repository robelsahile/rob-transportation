// /api/create-payment-link.ts
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
      discountCents,    // optional cents to subtract
      bookingId,        // custom ID (YYYYMMDD-XXX-NNNN)
      customerName,
      customerEmail,
      redirectUrl,      // where Square redirects after payment
      couponCode,       // optional; for reference
    } = req.body as {
      amount: number;
      discountCents?: number;
      bookingId?: string;
      customerName?: string;
      customerEmail?: string;
      redirectUrl?: string;
      couponCode?: string;
    };

    const safeAmount = Math.max(0, Number(amount) | 0);
    const safeDiscount = Math.max(0, Number(discountCents || 0) | 0);
    const finalCents = Math.max(safeAmount - safeDiscount, 50); // keep >= $0.50

    const noteParts = [`Booking ${bookingId || "N/A"}`];
    if (couponCode) noteParts.push(`Coupon ${couponCode}`);
    const orderNote = noteParts.join(" | ");

    const idempotencyKey = crypto.randomUUID();

    const payload = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: bookingId || undefined,
        line_items: [
          {
            name: "Ride Booking",
            quantity: "1",
            base_price_money: {
              amount: finalCents,
              currency: "USD",
            },
          },
        ],
        note: orderNote,
      },
      checkout_options: {
        redirect_url: redirectUrl,
        ask_for_shipping_address: false,
      },
      pre_populated_data: {
        buyer_email: customerEmail || undefined,
      },
    };

    const resp = await fetch(`${SQUARE_BASE}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-08-21",
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Square create-payment-link error:", data);
      return res.status(resp.status).send(typeof data === "string" ? data : JSON.stringify(data));
    }

    const url = data?.payment_link?.url as string | undefined;
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
