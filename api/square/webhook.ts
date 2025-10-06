// /api/square/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SQUARE_WEBHOOK_SIGNATURE_KEY,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // 1) Verify Square signature
    const signature = req.headers["x-square-hmacsha256-signature"];
    if (!SQUARE_WEBHOOK_SIGNATURE_KEY || typeof signature !== "string") {
      return res.status(401).send("No signature");
    }

    const raw = await getRawBody(req);
    const url = fullUrl(req);
    if (!verifySquareSignature(signature, url, raw, SQUARE_WEBHOOK_SIGNATURE_KEY)) {
      return res.status(401).send("Bad signature");
    }

    // 2) Parse event
    const body = JSON.parse(raw.toString("utf8"));
    const type: string = body?.type ?? "";

    // Only care about payment events
    if (type.startsWith("payment.")) {
      const p = body?.data?.object?.payment;
      if (!p) return res.status(200).json({ ok: true });

      const paymentId: string | undefined = p.id;
      const status: string | undefined = p.status; // e.g. 'COMPLETED'
      const amount = p?.amount_money?.amount;
      const currency = p?.amount_money?.currency;

      console.log("Square webhook received:", {
        type,
        paymentId,
        status,
        amount,
        currency,
        order: body?.data?.object?.order
      });

      // Recover booking id:
      // We injected "Booking <ID>" in payment note when creating the link.
      const note: string = p?.note || "";
      const fromNote = /Booking\s+([A-Z0-9\-]+)/i.exec(note || "");
      let bookingId = fromNote?.[1];

      // Fallbacks (sometimes order reference is present in webhook)
      const ref1 = body?.data?.object?.order?.reference_id;
      const ref2 = p?.order?.referenceId;
      const orderId = p?.order_id || body?.data?.object?.order?.id || body?.data?.object?.payment?.order_id;
      bookingId = bookingId || ref1 || ref2 || null;

      // If still missing but we have an order_id, fetch the order to read reference_id
      if (!bookingId && orderId) {
        try {
          const token = process.env.SQUARE_ACCESS_TOKEN;
          const env = process.env.SQUARE_ENV || "production";
          if (token) {
            const host = (env === "sandbox")
              ? "https://connect.squareupsandbox.com"
              : "https://connect.squareup.com";
            const r = await fetch(`${host}/v2/orders/${orderId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "Square-Version": "2023-10-18",
              },
            });
            const j = await r.json();
            const ref = j?.order?.reference_id || j?.order?.referenceId || null;
            if (ref) bookingId = ref;
          }
        } catch (e) {
          console.warn("Failed to fetch order for reference_id", { orderId, err: String(e) });
        }
      }

      console.log("Booking ID extracted:", { bookingId, note, ref1, ref2, orderId });

      if (bookingId) {
        const { error } = await supabase
          .from("bookings")
          .update({
            payment_id: paymentId || null,
            payment_status: status || null,
          })
          .eq("id", bookingId);

        if (error) {
          console.error("Supabase update error:", error);
        } else {
          console.log("Successfully updated booking:", bookingId);
        }
      } else {
        console.warn("No booking ID found in webhook data");
      }

      // (Optional) you could insert a payment log table here if you want.
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Webhook error");
  }
}

/* helpers */
function fullUrl(req: VercelRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string) ||
    (req.headers["x-forwarded-protocol"] as string) ||
    "https";
  const host = req.headers.host;
  return `${proto}://${host}${req.url}`;
}

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (c: Uint8Array) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifySquareSignature(
  signature: string,
  url: string,
  rawBody: Buffer,
  secret: string
) {
  const h = crypto.createHmac("sha256", secret);
  h.update(url);
  h.update(rawBody);
  const expected = h.digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
