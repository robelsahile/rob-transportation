// /api/booking-counter.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");
  try {
    const { data, error } = await supabase.rpc("next_booking_counter");
    if (error) throw error;
    const nextCounter =
      typeof data === "number" ? data : parseInt(String(data), 10) || 1;
    return res.status(200).json({ nextCounter });
  } catch (e) {
    console.error(e);
    // Don’t break checkout if RPC is missing — just return 1
    return res.status(200).json({ nextCounter: 1 });
  }
}
