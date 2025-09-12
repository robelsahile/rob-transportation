// /api/square/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SQUARE_WEBHOOK_SIGNATURE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase env");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const signature = req.headers["x-square-hmacsha256-signature"];
    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || typeof signature !== "string") return res.status(401).send("No signature");

    const raw = await getRawBody(req);
    const valid = verifySquareSignature(signature, fullUrl(req), raw, SQUARE_WEBHOOK_SIGNATURE_KEY);
    if (!valid) return res.status(401).send("Invalid signature");

    const body = JSON.parse(raw.toString("utf8"));
    const type: string = body?.type ?? "";

    if (type.startsWith("payment.")) {
      const p = body?.data?.object?.payment;
      const paymentId: string | undefined = p?.id;
      const status: string | undefined = p?.status;
      const amount: number | undefined = p?.amount_money?.amount;
      const currency: string | undefined = p?.amount_money?.currency;
      const note: string = p?.note || "";

      // Try to extract a bookingId if you put it in `note` (e.g., "bookingId=20250912-ROB-0001")
      const match = /bookingId\s*[:=]\s*([A-Za-z0-9\-]+)/.exec(note);
      const bookingId = match?.[1];

      if (bookingId) {
        // Update the existing booking row (idempotent if already updated)
        await supabase
          .from("bookings")
          .update({ payment_id: paymentId || null, payment_status: status || null })
          .eq("id", bookingId);
      }

      // Optional: you can also store a payments log table (uncomment if you have it)
      // await supabase.from("square_payments").upsert(
      //   { id: paymentId, status, amount, currency, note },
      //   { onConflict: "id" }
      // );
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Webhook error");
  }
}

/* helpers */
function fullUrl(req: VercelRequest) {
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = req.headers.host;
  return `${proto}://${host}${req.url}`;
}
function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
function verifySquareSignature(signature: string, url: string, rawBody: Buffer, secret: string) {
  const h = crypto.createHmac("sha256", secret);
  h.update(url);
  h.update(rawBody);
  const expected = h.digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
