// /api/get-booking.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId } = req.query;

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    console.log("Fetching booking data for:", bookingId);

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(404).json({ 
        error: "Booking not found",
        details: error.message 
      });
    }

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("Booking found:", { 
      id: booking.id, 
      name: booking.name, 
      hasPricing: !!booking.pricing 
    });

    // Transform the database fields to match the frontend interface
    const transformedBooking = {
      id: booking.id,
      created_at: booking.created_at,
      pickupLocation: booking.pickup_location,
      dropoffLocation: booking.dropoff_location,
      dateTime: booking.date_time,
      vehicleType: booking.vehicle_type,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      flightNumber: booking.flight_number,
      passengers: booking.passengers,
      notes: booking.notes,
      pricing: booking.pricing,
      paymentId: booking.payment_id,
      paymentStatus: booking.payment_status,
      vehicleSelectionId: booking.vehicle_selection_id
    };

    return res.status(200).json({
      success: true,
      booking: transformedBooking
    });

  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return res.status(500).json({ 
      error: "Failed to fetch booking",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
