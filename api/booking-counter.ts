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
    // single-row counter table; increment safely and return new value
    const { data, error } = await supabase
      .from("booking_counter")
      .update({}) // we need to run a raw SQL to be atomic; use RPC via SQL
      .select();

    // Using a SQL function is cleaner; since we don’t have one yet, call via REST:
    // We'll do a one-shot RPC with Postgres function to increment atomically.

    // Create the function once in your DB (add to your schema file):
    // create or replace function public.next_booking_counter()
    // returns integer
    // language plpgsql
    // as $$
    // declare v integer;
    // begin
    //   update public.booking_counter
    //   set current_value = current_value + 1
    //   where id = 1
    //   returning current_value into v;
    //   return v;
    // end;
    // $$;

    // Then call it here:
    const rpc = await supabase.rpc("next_booking_counter");
    if (rpc.error) throw rpc.error;

    const nextCounter = rpc.data as number;
    return res.json({ nextCounter });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send("Failed to get next booking counter");
  }
}
