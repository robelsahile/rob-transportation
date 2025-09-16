// /api/bookings.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_API_TOKEN } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Surface this early — it’s a common 500 cause
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type PostBody = {
  bookingId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  dateTime?: string; // ISO string OK
  vehicleType?: string;
  name?: string;
  phone?: string;
  email?: string;
  flightNumber?: string | null;
  pricing?: any | null;
  appliedCouponCode?: string | null;
  discountCents?: number | null;
};

function missing(fields: Record<string, unknown>): string[] {
  return Object.entries(fields)
    .filter(([, v]) => v === undefined || v === null || (typeof v === "string" && v.trim() === ""))
    .map(([k]) => k);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      const b = (req.body || {}) as PostBody;

      // Validate required fields (these are NOT NULL in your DB)
      const required = {
        bookingId: b.bookingId,
        pickupLocation: b.pickupLocation,
        dropoffLocation: b.dropoffLocation,
        dateTime: b.dateTime,
        vehicleType: b.vehicleType,
        name: b.name,
        phone: b.phone,
        email: b.email,
      };
      const missingFields = missing(required);
      if (missingFields.length) {
        return res
          .status(400)
          .json({ ok: false, error: "Missing required fields", fields: missingFields });
      }

      // Build row for DB (snake_case columns)
      const row = {
        id: b.bookingId!,
        pickup_location: b.pickupLocation!,
        dropoff_location: b.dropoffLocation!,
        date_time: b.dateTime!, // ISO string is fine for timestamptz
        vehicle_type: String(b.vehicleType!),
        name: b.name!,
        phone: b.phone!,
        email: b.email!,
        flight_number: b.flightNumber ?? null,
        pricing: b.pricing ?? null, // jsonb nullable
        applied_coupon_code: b.appliedCouponCode ?? null,
        discount_cents:
          typeof b.discountCents === "number" && Number.isFinite(b.discountCents)
            ? Math.trunc(b.discountCents)
            : 0, // your schema has default 0, but we normalize here
      };

      const { error } = await supabase.from("bookings").upsert(row, { onConflict: "id" });

      if (error) {
        // Return the real error so you can see it in DevTools -> Network -> Preview
        return res
          .status(500)
          .json({ ok: false, error: "Failed to insert booking", error_detail: error.message });
      }

      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      // Admin-protected list
      const auth = req.headers.authorization || "";
      const token = auth.replace(/^Bearer\s+/i, "");
      if (!ADMIN_API_TOKEN || token !== ADMIN_API_TOKEN) {
        return res.status(401).json({ ok: false, error: "Unauthorized" });
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        return res
          .status(500)
          .json({ ok: false, error: "Failed to fetch bookings", error_detail: error.message });
      }

      return res.status(200).json({ ok: true, bookings: data });
    }

    return res.status(405).send("Method Not Allowed");
  } catch (e: any) {
    // Final catch-all with message
    return res.status(500).json({ ok: false, error: "Server error", error_detail: String(e?.message || e) });
  }
}
