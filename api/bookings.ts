// /api/bookings.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * ENV required:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY  (preferred)  OR  ADMIN_API_TOKEN (legacy var you used)
 * Optional for GET auth:
 *  - ADMIN_API_TOKEN            (if set, GET requires Authorization: Bearer <token>)
 */

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ADMIN_API_TOKEN || // fallback for your previous naming
  "";

if (!SUPABASE_URL || !SERVICE_KEY) {
  // Fail fast on cold start so it's obvious in logs
  console.warn(
    "[/api/bookings] Missing SUPABASE_URL or service key env (SUPABASE_SERVICE_ROLE_KEY / ADMIN_API_TOKEN)"
  );
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Small helper to send JSON consistently
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

  // Allow simple CORS for browser calls
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "POST") {
    try {
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

      // Minimal validation
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
        return send(res, 400, { ok: false, error: "Missing required booking fields." });
      }

      // Whitelist + map to snake_case (your table columns)
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

      // Upsert by primary key id so multiple posts are safe/idempotent
      const { error } = await supabase.from("bookings").upsert(row, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

      if (error) {
        return send(res, 500, {
          ok: false,
          error: "Failed to save booking",
          error_detail: error.message,
        });
      }

      return send(res, 200, { ok: true });
    } catch (e: any) {
      return send(res, 500, {
        ok: false,
        error: "Exception while saving booking",
        error_detail: e?.message || String(e),
      });
    }
  }

  if (req.method === "GET") {
    try {
      // Optional bearer auth for Admin view
      const adminToken = process.env.ADMIN_API_TOKEN;
      if (adminToken) {
        const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
        if (!bearer || bearer !== adminToken) {
          return send(res, 401, { ok: false, error: "Unauthorized" });
        }
      }

      // Avoid 304/ETag confusion while testing
      res.setHeader("Cache-Control", "no-store");

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        return send(res, 500, { ok: false, error: error.message });
      }

      // Normalize keys that AdminDashboard expects (camelCase mirror)
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

      return send(res, 200, { ok: true, bookings });
    } catch (e: any) {
      return send(res, 500, { ok: false, error: e?.message || String(e) });
    }
  }

  return send(res, 405, { ok: false, error: "Method not allowed" });
}
