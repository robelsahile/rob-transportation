// api/create-payment.ts

type Incoming = {
  sourceId?: string;       // token from Square Web Payments SDK
  amount?: number;         // in cents
  bookingId?: string;
  customerName?: string;
  customerEmail?: string;
};

export default async function handler(req: any, res: any) {
  // 🔎 Backend ENV quick check via GET /api/create-payment?debug=1
  if (req.method === "GET") {
    const debug = (req.query?.debug ?? req.query?.DEBUG ?? "").toString();
    if (debug === "1" || debug.toLowerCase() === "true") {
      const out = {
        token: (process.env.SQUARE_ACCESS_TOKEN || "").slice(0, 6) + (process.env.SQUARE_ACCESS_TOKEN ? "…" : ""),
        env: process.env.SQUARE_ENV || "(missing)",
        location: process.env.SQUARE_LOCATION_ID || "(missing)",
      };
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, backendEnv: out }));
    }
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("Method Not Allowed");
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end("Method Not Allowed");
  }

  // Normal POST handler continues:
  const {
    SQUARE_ACCESS_TOKEN,
    SQUARE_ENV,
    SQUARE_LOCATION_ID,
  } = process.env as Record<string, string | undefined>;

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    res.statusCode = 500;
    return res.end("Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID).");
  }

  const baseUrl =
    (SQUARE_ENV === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com");

  let body: Incoming;
  try {
    body = req.body ?? JSON.parse(req.body ?? "{}");
  } catch {
    body = {};
  }

  const { sourceId, amount, bookingId, customerName, customerEmail } = body;

  if (!sourceId || typeof amount !== "number") {
    res.statusCode = 400;
    return res.end("Missing required fields: sourceId (string), amount (number in cents).");
  }

  const idempotencyKey =
    (globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`) + `-${bookingId || "no-booking"}`;

  const payload = {
    idempotency_key: idempotencyKey,
    source_id: sourceId,
    amount_money: {
      amount,
      currency: "USD",
    },
    location_id: SQUARE_LOCATION_ID,
    autocomplete: true,
    note: bookingId ? `ROB Transportation booking ${bookingId}` : "ROB Transportation payment",
    buyer_email_address: customerEmail || undefined,
  };

  try {
    const resp = await fetch(`${baseUrl}/v2/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-08-21"
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Square create payment error:", data);
      res.statusCode = resp.status;
      return res.end(
        typeof data === "string" ? data : JSON.stringify({ error: data })
      );
    }

    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify({ payment: data.payment }));
  } catch (err: any) {
    console.error("Square request failed:", err?.message || err);
    res.statusCode = 500;
    return res.end("Payment request failed.");
  }
}
