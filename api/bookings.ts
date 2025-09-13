// /api/bookings.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Supa = SupabaseClient | null;

function getSupabase(): Supa {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const supa = getSupabase();
    if (!supa) return res.status(500).json({ ok: false, error: "Supabase env missing" });

    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const serverToken = process.env.ADMIN_API_TOKEN || "";
    if (!serverToken || token !== serverToken) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { data, error } = await supa
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return res.json({ ok: true, bookings: data });
  } catch (e: any) {
    console.error("bookings GET error:", e?.message || e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
