// api/bookings.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! // server-side only
);

function isAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  return token && token === process.env.ADMIN_API_TOKEN;
}

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    if (req.method === "POST") {
      const body = await req.json();

      // Basic input normalization (matches your BookingData shape)
      const record = {
        pickup_location: body.pickupLocation,
        dropoff_location: body.dropoffLocation,
        date_time: body.dateTime,
        vehicle_type: body.vehicleType,
        name: body.name,
        phone: body.phone,
        email: body.email,
        flight_number: body.flightNumber ?? null,
        pricing: body.pricing ?? null,
      };

      const { error } = await supabase.from("bookings").insert(record);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 201 });
    }

    if (req.method === "GET") {
      if (!isAdmin(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 });
      }

      // Normalize to your frontend types
      const bookings = (data || []).map((r) => ({
        id: r.id,
        created_at: r.created_at,
        pickupLocation: r.pickup_location,
        dropoffLocation: r.dropoff_location,
        dateTime: r.date_time,
        vehicleType: r.vehicle_type,
        name: r.name,
        phone: r.phone,
        email: r.email,
        flightNumber: r.flight_number || undefined,
        pricing: r.pricing || undefined,
      }));

      return new Response(JSON.stringify({ bookings }), { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
}
