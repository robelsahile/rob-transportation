// api/create-payment-link.ts
export const config = { runtime: "edge" };

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(req: Request) {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

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
    amount,          // cents
    bookingId,       // e.g., 20250915-XXX-0027
    customerName,
    customerEmail,
    redirectUrl,
    vehicleName,     // from client; used for the order line item
  } = body || {};

  if (!amount || !bookingId || !redirectUrl) {
    return json(400, { error: "amount, bookingId, and redirectUrl are required." });
  }

  // 1) Order list shows the selected vehicle
  // 2) Booking Id appears prominently at the top area via "description"
  //    and is also stored in reference_id for your records.
  const order = {
    location_id: SQUARE_LOCATION_ID,
    reference_id: bookingId, // for merchant/Dashboard reconciliation
    line_items: [
      {
        name: (vehicleName && String(vehicleName).trim()) || "Private Ride",
        quantity: "1",
        base_price_money: { amount: Number(amount), currency: "USD" },
      },
    ],
  };

  const payload: any = {
    idempotency_key: crypto.randomUUID(),
    order,
    // The description is customer-visible on the hosted page (under the title)
    description: `Booking Id – ${bookingId}`,
    checkout_options: {
      redirect_url: redirectUrl,
    },
    pre_populated_data: {
      buyer_email: customerEmail || undefined,
      buyer_full_name: customerName || undefined,
    },
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
