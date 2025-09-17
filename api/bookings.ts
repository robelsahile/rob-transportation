// /api/bookings.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * ENV required:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY  (preferred)  OR  ADMIN_API_TOKEN (legacy fallback)
 * Optional for GET auth:
 *  - ADMIN_API_TOKEN            (if set, GET requires Authorization: Bearer <token>)
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ADMIN_API_TOKEN || // fallback to your previous var
  "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn(
    "[/api/bookings] Missing SUPABASE_URL or service key env (SUPABASE_SERVICE_ROLE_KEY / ADMIN_API_TOKEN)"
  );
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function send(res: VercelResponse, status: number, body: any) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(body));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "POST") {
    try {
      console.log("POST /api/bookings - Booking request received");
      
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
        pricing, // JSON (optional)
      } = (req.body ?? {}) as Record<string, any>;

      console.log("Booking data received:", { 
        bookingId, 
        name, 
        email, 
        vehicleType, 
        hasPricing: !!pricing 
      });

      // minimal validation
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
        console.log("Validation failed - missing required fields");
        return send(res, 400, { ok: false, error: "Missing required booking fields." });
      }

      // map camelCase -> snake_case for DB
      const row: any = {
        id: String(bookingId),
        pickup_location: String(pickupLocation),
        dropoff_location: String(dropoffLocation),
        date_time: new Date(dateTime).toISOString(),
        vehicle_type: String(vehicleType),
        name: String(name),
        phone: String(phone),
        email: String(email),
        flight_number: flightNumber ? String(flightNumber) : null,
        pricing: pricing ?? null, // must be JSON-serializable for jsonb
      };

      console.log("Saving booking to Supabase:", { id: row.id, name: row.name });

      // upsert by id (idempotent)
      const { error } = await supabase.from("bookings").upsert(row, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error("Supabase upsert error:", error);
        return send(res, 500, {
          ok: false,
          error: "Failed to save booking",
          error_detail: error.message,
        });
      }

      console.log("Booking saved successfully:", bookingId);
      return send(res, 200, { ok: true });
    } catch (e: any) {
      console.error("POST /api/bookings error:", e);
      return send(res, 500, {
        ok: false,
        error: "Exception while saving booking",
        error_detail: e?.message || String(e),
      });
    }
  }

  if (req.method === "GET") {
    try {
      console.log("GET /api/bookings - Admin request received");
      
      // Optional bearer auth for Admin
      const adminToken = process.env.ADMIN_API_TOKEN;
      console.log("Admin token check:", { hasToken: !!adminToken, tokenLength: adminToken?.length });
      
      if (adminToken) {
        const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
        console.log("Bearer token check:", { hasBearer: !!bearer, bearerLength: bearer?.length, matches: bearer === adminToken });
        if (!bearer || bearer !== adminToken) {
          console.log("Admin auth failed - returning 401");
          return send(res, 401, { ok: false, error: "Unauthorized" });
        }
      }

      res.setHeader("Cache-Control", "no-store"); // avoid 304 during testing

      console.log("Querying Supabase for bookings...");
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Supabase error:", error);
        return send(res, 500, { ok: false, error: error.message });
      }

      console.log("Supabase query successful:", { count: data?.length || 0, data: data?.slice(0, 2) });

      // normalize to camelCase that AdminDashboard expects
      const bookings =
        (data || []).map((r: any) => ({
          id: r.id,
          created_at: r.created_at,
          pickupLocation: r.pickup_location,
          dropoffLocation: r.dropoff_location,
          dateTime: r.date_time,
          vehicleType: r.vehicle_type,
          name: r.name,
          phone: r.phone,
          email: r.email,
          flightNumber: r.flight_number,
          pricing: r.pricing ?? null,
          paymentId: r.payment_id ?? null,
          paymentStatus: r.payment_status ?? null,
        })) ?? [];

      console.log("Returning bookings to admin:", { count: bookings.length });
      return send(res, 200, { ok: true, bookings });
    } catch (e: any) {
      console.error("GET /api/bookings error:", e);
      return send(res, 500, { ok: false, error: e?.message || String(e) });
    }
  }

  return send(res, 405, { ok: false, error: "Method not allowed" });
}
