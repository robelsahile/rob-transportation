// /api/bookings.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_API_TOKEN } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST") {
      const {
        bookingId,
        pickupLocation,
        dropoffLocation,
        dateTime,
        vehicleType,
        name,
        phone,
        email,
        flightNumber,
        pricing,
        appliedCouponCode,
        discountCents,
      } = req.body || {};

      if (
        !bookingId ||
        !pickupLocation ||
        !dropoffLocation ||
        !dateTime ||
        !vehicleType ||
        !name ||
        !phone ||
        !email
      ) {
        return res
          .status(400)
          .json({ ok: false, error: "Missing required fields" });
      }

      // Upsert by id so the thank-you page can safely repeat the call
      const { error } = await supabase.from("bookings").upsert(
        {
          id: bookingId,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          date_time: dateTime,
          vehicle_type: vehicleType,
          name,
          phone,
          email,
          flight_number: flightNumber || null,
          pricing: pricing ?? null,
          applied_coupon_code: appliedCouponCode ?? null,
          discount_cents: Number.isFinite(discountCents)
            ? Number(discountCents)
            : 0,
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error(error);
        return res
          .status(500)
          .json({ ok: false, error: "Failed to insert booking" });
      }
      return res.json({ ok: true });
    }

    if (req.method === "GET") {
      // Admin auth via server token
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
        console.error(error);
        return res
          .status(500)
          .json({ ok: false, error: "Failed to fetch bookings" });
      }

      return res.json({ ok: true, bookings: data });
    }

    return res.status(405).send("Method Not Allowed");
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
