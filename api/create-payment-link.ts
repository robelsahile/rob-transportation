// api/create-payment-link.ts
export const config = { runtime: "edge" };

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  const SQUARE_ENV = (process.env.SQUARE_ENV || "sandbox").toLowerCase();

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return json(500, {
      error: "Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID).",
    });
  }

  const base =
    SQUARE_ENV === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const {
    amount, // cents
    bookingId,
    customerName,
    customerEmail,
    redirectUrl,
    vehicleName,      // NEW: from PaymentPage
    orderTitle,       // optional hint; hosted checkout uses line item + reference id for header
  } = body || {};

  if (!amount || !bookingId || !redirectUrl) {
    return json(400, { error: "amount, bookingId, and redirectUrl are required." });
  }

  // Build the Square order: show the selected vehicle in Order Summary
  const order = {
    location_id: SQUARE_LOCATION_ID,
    reference_id: bookingId, // shows after the dot in the header
    line_items: [
      {
        name: (vehicleName && String(vehicleName).trim()) || "Private Ride",
        quantity: "1",
        base_price_money: { amount: Number(amount), currency: "USD" },
      },
    ],
  };

  // Create the payment link
  const payload: any = {
    idempotency_key: crypto.randomUUID(),
    quick_pay: undefined, // keep undefined; we use full order so summary shows nicely
    order,
    checkout_options: {
      redirect_url: redirectUrl,
    },
    pre_populated_data: {
      buyer_email: customerEmail || undefined,
      buyer_phone_number: undefined,
      buyer_address: undefined,
      buyer_full_name: customerName || undefined,
    },
    // Note: Hosted checkout header comes from the order (line item + reference id).
    // We'll include a note field for your own reference, but it won't override the header text.
    description: orderTitle || undefined,
  };

  const r = await fetch(`${base}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-08-21",
    },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!r.ok) {
    const msg =
      (data && (data.errors?.[0]?.detail || data.message || data.error)) ||
      text ||
      "Failed to create payment link.";
    return json(r.status, { error: msg });
  }

  return json(200, data || {});
}
