export const config = { runtime: "edge" };

type CreateLinkBody = {
  amount: number;            // cents
  bookingId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  redirectUrl: string;
  vehicleName?: string | null;
};

function squareHost(env: string | undefined) {
  return (env || "production") === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const {
    amount,
    bookingId,
    customerEmail,
    redirectUrl,
    vehicleName,
  } = (await req.json()) as CreateLinkBody;

  const token = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENV || "production";
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!token || !locationId) {
    return Response.json(
      { error: "Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID)." },
      { status: 500 }
    );
  }

  const idempotencyKey = `${bookingId}-${amount}-${Date.now()}`;

  const body = {
    idempotency_key: idempotencyKey,
    order: {
      location_id: locationId,
      reference_id: bookingId,
      line_items: [
        {
          name: `${vehicleName || "Selected Vehicle"} - ${bookingId}`,
          quantity: "1",
          base_price_money: { amount, currency: "USD" },
        },
      ],
    },
    checkout_options: {
      redirect_url: redirectUrl, // clean, no bookingId query string
    },
    pre_populated_data: customerEmail ? { buyer_email_address: customerEmail } : undefined,
  };

  const host = squareHost(env);
  const r = await fetch(`${host}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-10-18",
    },
    body: JSON.stringify(body),
  });

  const text = await r.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!r.ok) {
    return Response.json({ error: data?.errors?.[0]?.detail || text || "Failed to create payment link." }, { status: 500 });
  }

  // Normalize shape for the client
  const url = data?.payment_link?.url || data?.url;
  return Response.json({ url, payment_link: data?.payment_link ?? null });
}
