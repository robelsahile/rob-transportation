// /api/validate-coupon.ts
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
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { code, subtotalCents } = (req.body ?? {}) as {
      code?: string;
      subtotalCents?: number;
    };

    if (!code || typeof subtotalCents !== "number" || subtotalCents <= 0) {
      return res.status(400).json({ ok: false, error: "Invalid inputs" });
    }

    const raw = String(code).trim();
    // Case-insensitive EXACT match (no lower() expression); ILIKE works without % for equality
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("active", true)
      .ilike("code", raw)   // <-- key change
      .limit(1)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ ok: false, error: "Coupon not found or inactive" });
    }

    // Expiry check
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ ok: false, error: "Coupon expired" });
    }

    // Max redemptions (if set)
    if (
      coupon.max_redemptions !== null &&
      typeof coupon.max_redemptions === "number" &&
      coupon.redemptions_used >= coupon.max_redemptions
    ) {
      return res.status(409).json({ ok: false, error: "Coupon usage limit reached" });
    }

    // Compute discount
    let discountCents = 0;
    let display = "";
    if (coupon.kind === "percent") {
      const pct = Number(coupon.percent_off || 0);
      discountCents = Math.floor((subtotalCents * pct) / 100);
      display = `${pct}% off`;
    } else if (coupon.kind === "fixed") {
      discountCents = Math.min(Number(coupon.value_cents || 0), subtotalCents);
      display = `$${(discountCents / 100).toFixed(2)} off`;
    } else {
      return res.status(400).json({ ok: false, error: "Invalid coupon kind" });
    }

    // Minimum charge safeguard
    const finalCents = Math.max(subtotalCents - discountCents, 50);

    return res.json({
      ok: true,
      coupon: {
        code: coupon.code,        // preserve original case
        kind: coupon.kind,
        percent_off: coupon.percent_off,
        value_cents: coupon.value_cents,
      },
      discountCents,
      finalCents,
      display,
    });
  } catch (e: any) {
    console.error("validate-coupon error", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
