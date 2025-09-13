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
  const cents = Math.round(num * 100);
  return cents >= 0 ? cents : null;
}

function deriveAmountCents(form: Record<string, any>): number | null {
  // 1) Preferred: amountCents already provided
  if (form.amountCents != null) {
    const c = Number(form.amountCents);
    if (Number.isFinite(c) && Math.trunc(c) === c && c > 0) return c;
  }

  // 2) Accept common dollar fields and convert
  const dollarCandidates = [
    form.amount, form.total, form.price, form.grandTotal,
    form?.pricing?.total, form?.pricing?.grandTotal,
  ];
  for (const candidate of dollarCandidates) {
    const c = dollarsToCents(candidate);
    if (c && c > 0) return c;
  }

  // 3) Accept common cent fields nested in pricing
  const centCandidates = [
    form?.pricing?.totalCents,
    form?.pricing?.grandTotalCents,
  ];
  for (const candidate of centCandidates) {
    const c = Number(candidate);
    if (Number.isFinite(c) && Math.trunc(c) === c && c > 0) return c;
  }

  return null;
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
    const supa = getSupabase(); // may be null (we still let payment proceed)
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

    // Robust price derivation
    const amountCents = deriveAmountCents(form);
    if (!amountCents) {
      return res.status(400).json({
        error: "Invalid amountCents",
        hint:
          "Send amountCents (integer), OR amount/total/grandTotal in dollars, OR pricing.totalCents / pricing.total.",
      });
    }

    // Build bookingId (use DB counter if available, otherwise fallback)
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
      } catch (e) {
        console.error("Counter catch:", e);
        bookingId = fallbackBookingId(lastName);
      }
    } else {
      bookingId = fallbackBookingId(lastName);
      console.warn("Supabase env missing — proceeding without DB insert. bookingId:", bookingId);
    }

    // Try to save PENDING booking (non-fatal if it fails)
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

    // Create Square payment link
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
        reference_id: bookingId,
        line_items: [
          {
            name: "Private Ride",
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

    return res.status(200).json({ url, bookingId });
  } catch (e: any) {
    console.error("create-payment-link error:", e?.message || e);
    return res.status(500).json({ error: "Server error" });
  }
}
