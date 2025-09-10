// api/create-payment-link.ts
// Creates a Square Hosted Checkout link (Payment Link) and returns its URL.

type CreateLinkBody = {
  amount: number;          // cents
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
  redirectUrl: string;     // where Square sends the buyer after payment
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("Method Not Allowed");
  }

  const { SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENV } = process.env;

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    res.statusCode = 500;
    return res.end("Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID).");
  }

  let body: CreateLinkBody;
  try {
    body = req.body ?? JSON.parse(req.body ?? "{}");
  } catch {
    res.statusCode = 400;
    return res.end("Invalid JSON body.");
  }

  const { amount, bookingId, customerName, customerEmail, redirectUrl } = body;
  if (typeof amount !== "number" || !redirectUrl) {
    res.statusCode = 400;
    return res.end("Missing required fields: amount (number, cents) and redirectUrl (string).");
  }

  const baseUrl =
    SQUARE_ENV === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  // Unique idempotency key for the link creation
  const idempotencyKey =
    (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`) + (bookingId ? `-${bookingId}` : "");

  // Use Quick Pay (simplest) — one line item for your booking
  const payload = {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: bookingId ? `Booking ${bookingId}` : "ROB Transportation Booking",
      price_money: { amount, currency: "USD" },
      location_id: SQUARE_LOCATION_ID,
      redirect_url: redirectUrl,
      // You can also add "reference_id" to help reconcile
      reference_id: bookingId || undefined,
    },
    pre_populated_data: {
      buyer_email: customerEmail || undefined,
      buyer_phone_number: undefined,
      buyer_address: undefined,
    }
  };

  try {
    const resp = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
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
      console.error("Square create payment link error:", data);
      res.statusCode = resp.status;
      return res.end(JSON.stringify({ error: data }));
    }

    const url = data?.payment_link?.url as string | undefined;
    if (!url) {
      res.statusCode = 500;
      return res.end("Failed to create payment link.");
    }

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify({ url }));
  } catch (err: any) {
    console.error("Square payment link request failed:", err?.message || err);
    res.statusCode = 500;
    return res.end("Payment link request failed.");
  }
}
