// /api/booking-counter.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supa: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!supa) {
    supa = createClient(url, key, { auth: { persistSession: false } });
  }
  return supa;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  const client = getSupabase();
  if (!client) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(200).json({ nextCounter: 1, note: "supabase_env_missing" });
  }

  try {
    const { data, error } = await client.rpc("next_booking_counter");
    if (error) {
      console.error("RPC next_booking_counter error:", error);
      return res.status(200).json({ nextCounter: 1, note: "rpc_error" });
    }
    const next = typeof data === "number" ? data : parseInt(String(data), 10) || 1;
    return res.status(200).json({ nextCounter: next });
  } catch (e) {
    console.error("booking-counter handler error:", e);
    return res.status(200).json({ nextCounter: 1, note: "handler_catch" });
  }
}
