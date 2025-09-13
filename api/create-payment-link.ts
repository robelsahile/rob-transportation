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

function dollarsToCents(n: any): number | null {
  if (n === null || n === undefined) return null;
  const num = typeof n === "string" ? Number(n.replace(/[^0-9.\-]/g, "")) : Number(n);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100);
}

/**
 * Robustly derive amount (in CENTS) from various shapes,
 * and normalize if the client already sent cents.
 * Examples that should all resolve to 4950:
 *  - amountCents: 4950
 *  - amount: 49.5
 *  - pricing.total: "49.50"
 *  - pricing.totalCents: 4950
 * Guards against 100x errors (e.g., 495000).
 */
function deriveAndNormalizeAmountCents(form: Record<string, any>): number | null {
  const centsCandidates: (number | null)[] = [];

  // 1) If amountCents provided, treat it as CENTS
  if (form.amountCents != null) {
    const c = Number(form.amountCents);
    if (Number.isFinite(c)) centsCandidates.push(Math.trunc(c));
  }

  // 2) Known CENT fields
  const centFields = [form?.pricing?.totalCents, form?.pricing?.grandTotalCents];
  for (const v of centFields) {
    const c = Number(v);
    if (Number.isFinite(c)) centsCandidates.push(Math.trunc(c));
  }

  // 3) Known DOLLAR fields → convert
  const dollarFields = [form.amount, form.total, form.price, form.grandTotal, form?.pricing?.total, form?.pricing?.grandTotal];
  for (const v of dollarFields) {
    const c = dollarsToCents(v);
    if (c != null) centsCandidates.push(c);
  }

  // Pick first positive candidate
  let cents = centsCandidates.find((x) => typeof x === "number" && x > 0) ?? null;
  if (cents == null) return null;

  // Normalize obvious 100x mistakes:
  // If cents is suspiciously large (e.g., >= 100_000 for small rides) and divisible by 100, scale down.
  // Example: 4,95 0 0 0 (495000) becomes 4950.
  if (cents >= 100000 && cents % 100 === 0) {
    const scaled = Math.round(cents / 100);
    // Only accept scaling if the result is a sane ride price (<= $10,000)
    if (scaled > 0 && scaled <= 1_000_000) cents = scaled;
  }

  return cents;
}

function fallbackBookingId(lastName?: string) {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const last3 = (lastName || "XXX").replace(/\s+/g, "").toUpperCase().slice(-3) || "XXX";
  const rnd = crypto.randomBytes(1).toString("hex").toUpperCase();
  const t = `${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}`;
  return `${y}${m}${d}-${last3}-${t}${rnd}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const supa = getSupabase(); // may be null (we still allow payment)
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;
    const redirectBase = process.env.PUBLIC_BASE_URL;

    if (!accessToken || !locationId || !redirectBase) {
      return res.status(500).json({ error: "Square or PUBLIC_BASE_URL env missing" });
    }

    const form = (req.body || {}) as Record<string, any>;
    const {
      firstName,
      lastName,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      rideISO,
      vehicleType,
      pricing,
      discountCents,
      appliedCouponCode,
      flightNumber,
    } = form;

    // === PRICE (in cents), robust + normalized ===
    const amountCents = deriveAndNormalizeAmountCents(form);
    if (!amountCents) {
      return res.status(400).json({
        error: "Invalid amountCents",
        hint: "Send amountCents (integer cents) or amount/total in dollars, or pricing.total/totalCents.",
      });
    }

    // === BOOKING ID ===
    let bookingId: string;
    if (supa) {
      try {
        const { data: nextNum, error: rpcErr } = await supa.rpc("next_booking_counter");
        if (rpcErr) {
          console.error("RPC next_booking_counter error:", rpcErr);
          bookingId = fallbackBookingId(lastName);
        } else {
          const n = typeof nextNum === "number" ? nextNum : parseInt(String(nextNum), 10) || 1;
          const now = new Date();
          const y = now.getUTCFullYear();
          const m = String(now.getUTCMonth() + 1).padStart(2, "0");
          const d = String(now.getUTCDate()).padStart(2, "0");
          const last3 = (lastName || "XXX").replace(/\s+/g, "").toUpperCase().slice(-3) || "XXX";
          const suffix = String(n).padStart(4, "0");
          bookingId = `${y}${m}${d}-${last3}-${suffix}`;
        }
      } catch {
        bookingId = fallbackBookingId(lastName);
      }
    } else {
      bookingId = fallbackBookingId(lastName);
    }

    // Try to save PENDING booking (non-fatal)
    if (supa) {
      try {
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
        if (upErr) console.error("DB upsert error:", upErr);
      } catch (e) {
        console.error("DB upsert catch:", e);
      }
    }

    // === Create Square Payment Link ===
    const idempotencyKey = `link_${bookingId}_${crypto.randomUUID()}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-08-15",
    };

    const body = {
      idempotency_key: idempotencyKey,
      order: {
        location_id: locationId,
        reference_id: bookingId,                           // keep for reconciliation
        line_items: [
          {
            // Show bookingId on the hosted page:
            name: `Private Ride • ${bookingId}`,
            quantity: "1",
            base_price_money: { amount: amountCents, currency: "USD" },
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

    return res.status(200).json({ url, bookingId, amountCents });
  } catch (e: any) {
    console.error("create-payment-link error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
}
