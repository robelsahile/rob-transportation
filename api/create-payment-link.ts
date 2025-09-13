// /api/create-payment-link.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const supa = getSupabase();
    if (!supa) return res.status(500).json({ error: "Supabase env missing" });

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const redirectBase = process.env.PUBLIC_BASE_URL;
    if (!accessToken || !locationId || !redirectBase) {
      return res.status(500).json({ error: "Square or PUBLIC_BASE_URL env missing" });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      rideISO,
      vehicleType,
      amountCents,
      pricing,
      discountCents,
      appliedCouponCode,
      flightNumber,
    } = (req.body || {}) as Record<string, any>;

    // 1) Get the next global suffix from Postgres sequence via RPC
    const { data: nextNum, error: rpcErr } = await supa.rpc("next_booking_counter");
    if (rpcErr) throw rpcErr;
    const n = typeof nextNum === "number" ? nextNum : parseInt(String(nextNum), 10) || 1;

    // 2) Build bookingId: YYYYMMDD-<LAST3>-#### (UTC date)
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const last3 = (lastName || "XXX").replace(/\s+/g, "").toUpperCase().slice(-3) || "XXX";
    const suffix = String(n).padStart(4, "0");
    const bookingId = `${y}${m}${d}-${last3}-${suffix}`;

    // 3) Insert/Upsert a PENDING booking immediately
    const { error: upErr } = await supa.from("bookings").upsert(
      {
        id: bookingId,
        status: "PENDING",
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        date_time: rideISO,
        vehicle_type: vehicleType,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
        phone,
        email,
        flight_number: flightNumber ?? null,
        pricing: pricing ?? null,
        discount_cents: Number(discountCents) || 0,
        applied_coupon_code: appliedCouponCode ?? null,
      },
      { onConflict: "id" }
    );
    if (upErr) throw upErr;

    // 4) Create the Square Payment Link
    const idempotencyKey = `link_${bookingId}_${crypto.randomUUID()}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-08-15",
    };

    // Make sure amountCents is a safe integer
    const cents = Number.isFinite(Number(amountCents)) ? Math.trunc(Number(amountCents)) : 0;
    if (cents <= 0) return res.status(400).json({ error: "Invalid amountCents" });

    const body = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        reference_id: bookingId,
        line_items: [
          {
            name: "Private Ride",
            quantity: "1",
            base_price_money: { amount: cents, currency: "USD" },
          },
        ],
        note: `Booking ${bookingId}`,
      },
      checkout_options: {
        redirect_url: `${redirectBase}/payment-success?bookingId=${encodeURIComponent(bookingId)}`,
      },
      description: `Booking ${bookingId}`,
    };

    const resp = await fetch(`${squareBase()}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await resp.json();

    if (!resp.ok) {
      console.error("Square create payment link error:", data);
      return res.status(502).json({ error: "Failed to create payment link", detail: data });
    }

    const url: string | undefined = data?.payment_link?.url || data?.payment_link?.long_url;
    if (!url) return res.status(500).json({ error: "No payment link returned from Square" });

    return res.status(200).json({ url, bookingId }); // client navigates to `url`
  } catch (e: any) {
    console.error("create-payment-link error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
}
