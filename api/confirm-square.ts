export const config = { runtime: "edge" };

type ConfirmBody = {
  orderId?: string;
  transactionId?: string; // legacy param Square sometimes sends
  bookingId?: string;
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

  const { orderId, transactionId } = (await req.json()) as ConfirmBody;

  const token = process.env.SQUARE_ACCESS_TOKEN;
  const env = process.env.SQUARE_ENV || "production";
  const locationId = process.env.SQUARE_LOCATION_ID;

  if (!token || !locationId) {
    return Response.json(
      { error: "Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID)." },
      { status: 500 }
    );
  }

  const host = squareHost(env);

  let paymentId = "";
  let resolvedOrderId = orderId || "";

  try {
    if (orderId) {
      // Prefer: Search Payments by order_id to obtain a canonical payment id
      const search = await fetch(`${host}/v2/payments/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-10-18",
        },
        body: JSON.stringify({ query: { filter: { order_ids: [orderId] } }, limit: 1 }),
      });
      const s = await search.json();
      paymentId = s?.payments?.[0]?.id || "";
      resolvedOrderId = s?.payments?.[0]?.order_id || resolvedOrderId;
    }

    // Fallback: if Square redirected with transactionId only (older behavior)
    if (!paymentId && transactionId) {
      // We cannot reliably translate transactionId -> paymentId across all accounts;
      // return it as-is so the UI still shows an ID.
      paymentId = transactionId;
    }
  } catch (e) {
    // swallow and let UI proceed with whatever ID we have
  }

  return Response.json({
    ok: true,
    orderId: resolvedOrderId || null,
    paymentId: paymentId || null,
  });
}
