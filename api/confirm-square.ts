// /api/confirm-square.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Supa = SupabaseClient | null;

function getSupabase(): Supa {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function squareBase() {
  return process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

async function getPaymentStatusByPaymentId(paymentId: string, accessToken: string) {
  const r = await fetch(`${squareBase()}/v2/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": "2024-08-15",
    },
  });
  const j = await r.json();
  if (!r.ok) return { status: null, id: paymentId, raw: j };
  return { status: j?.payment?.status ?? null, id: j?.payment?.id ?? paymentId, raw: j };
}

async function getOrderByReference(bookingId: string, locationId: string, accessToken: string) {
  const r = await fetch(`${squareBase()}/v2/orders/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-08-15",
    },
    body: JSON.stringify({
      location_ids: [locationId],
      query: { filter: { reference_id: { exact: bookingId } } },
      limit: 1,
    }),
  });
  const j = await r.json();
  if (!r.ok) {
    return { ok: false, data: j };
  }
  const order = (j?.orders ?? [])[0];
  return { ok: true, order };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const supa = getSupabase();
    if (!supa) return res.status(500).json({ ok: false, error: "Supabase env missing" });

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    if (!accessToken || !locationId) {
      return res.status(500).json({ ok: false, error: "Square env missing" });
    }

    const { bookingId, transactionId, orderId } = (req.body || {}) as {
      bookingId?: string;
      transactionId?: string;
      orderId?: string;
    };

    if (!bookingId) return res.status(400).json({ ok: false, error: "bookingId required" });

    let paymentStatus: string | null = null;
    let paymentId: string | null = null;

    // 1) If we have a payment/transaction id, try it first
    if (transactionId) {
      const pr = await getPaymentStatusByPaymentId(transactionId, accessToken);
      paymentStatus = pr.status;
      paymentId = pr.id;
    }

    // 2) Otherwise, or if unknown, search the order by reference_id (bookingId)
    if (!paymentStatus || paymentStatus === "UNKNOWN") {
      // If orderId present, we could retrieve it directly; but search by reference_id
      const { ok, order } = await getOrderByReference(bookingId, locationId, accessToken);
      if (ok && order) {
        // Many Payment Link orders are marked COMPLETED on full payment
        const state = order?.state; // e.g. "COMPLETED"
        if (state === "COMPLETED") {
          paymentStatus = "COMPLETED";
        }
        // Try to extract a payment id from tenders (if provided)
        const paymentIds =
          (order?.tenders || [])
            .map((t: any) => t?.payment_id || t?.id)
            .filter(Boolean) || [];
        if (paymentIds.length > 0 && !paymentId) {
          paymentId = paymentIds[0];
        }
      }
    }

    // 3) Update the booking row accordingly
    await supa
      .from("bookings")
      .update({
        payment_id: paymentId ?? null,
        payment_status: paymentStatus ?? null,
        status: paymentStatus === "COMPLETED" ? "PAID" : "PENDING",
      })
      .eq("id", bookingId);

    return res.json({ ok: true, bookingId, paymentStatus: paymentStatus ?? "UNKNOWN", paymentId });
  } catch (e: any) {
    console.error("confirm-square error:", e?.message || e);
    return res.status(200).json({ ok: false, error: "confirm_failed" });
  }
}
