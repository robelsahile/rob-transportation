// api/stripe/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ---------- Stripe / Resend / Supabase setup ----------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-09-30.clover",
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const resend = new Resend(process.env.RESEND_API_KEY as string);
const FROM_EMAIL =
  process.env.FROM_EMAIL || "Rob Transportation <bookings@robtransportation.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// ---------- Helpers ----------
function getBookingIdFromSession(session: Stripe.Checkout.Session): string | undefined {
  // Try common metadata keys you may have used
  return (
    session.metadata?.booking_id ||
    session.metadata?.bookingId ||
    session.client_reference_id || // optional fallback
    undefined
  );
}

function formatLocal(dt: Date | string | number, opts: Intl.DateTimeFormatOptions) {
  const tz = "America/Los_Angeles";
  return new Date(dt).toLocaleString("en-US", { timeZone: tz, ...opts });
}

async function sendConfirmationEmail(booking: any) {
  const bookingId = booking.id;

  // Try to present a nice total if you store cents in pricing.* or a number column
  let amountStr: string | undefined = undefined;
  try {
    if (typeof booking.total_amount === "number") {
      // If you store dollars already, keep it; if cents, divide by 100.
      amountStr =
        booking.total_amount >= 1000
          ? `$${(booking.total_amount / 100).toFixed(2)}`
          : `$${booking.total_amount.toFixed(2)}`;
    } else if (booking.pricing && typeof booking.pricing.total === "number") {
      const cents = booking.pricing.total;
      amountStr = `$${(cents / 100).toFixed(2)}`;
    }
  } catch {
    /* ignore money formatting errors */
  }

  const dateStr = formatLocal(booking.date_time ?? booking.pickup_date, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = formatLocal(booking.date_time ?? booking.pickup_time, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const toEmail = booking.email;
  if (!toEmail) {
    console.warn("Booking has no email; skipping send.", { bookingId });
    return;
  }

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2 style="margin:0 0 8px">Your Booking is Confirmed 🎉</h2>
      <p style="margin:0 0 12px">Thank you for choosing Rob Transportation.</p>

      <p style="margin:0 0 12px"><strong>Booking ID:</strong> ${bookingId}</p>

      <div style="border-top:1px solid #eee;margin:16px 0"></div>

      <p style="margin:0 0 6px"><strong>Pickup:</strong> ${booking.pickup_location ?? ""}</p>
      <p style="margin:0 0 6px"><strong>Drop-off:</strong> ${booking.dropoff_location ?? ""}</p>
      <p style="margin:0 0 6px"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin:0 0 6px"><strong>Time:</strong> ${timeStr}</p>
      ${booking.vehicle_type ? `<p style="margin:0 0 6px"><strong>Vehicle:</strong> ${booking.vehicle_type}</p>` : ""}
      ${Number.isFinite(booking.passengers) ? `<p style="margin:0 0 6px"><strong>Passengers:</strong> ${booking.passengers}</p>` : ""}

      ${booking.notes ? `<div style="border-top:1px solid #eee;margin:16px 0"></div><p style="margin:0"><strong>Notes:</strong> ${booking.notes}</p>` : ""}

      <div style="border-top:1px solid #eee;margin:16px 0"></div>

      <p style="margin:0 0 12px"><strong>Payment:</strong> ${amountStr ? `${amountStr} (Paid)` : "Received"}</p>

      <p style="color:#666;margin:16px 0 0">If anything looks off, just reply to this email.</p>
      <p style="margin:4px 0 0">— Rob Transportation</p>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [toEmail],
    ...(ADMIN_EMAIL ? { bcc: [ADMIN_EMAIL] } : {}),
    subject: `Booking Confirmed – ${bookingId}`,
    html,
  });

  console.log("Confirmation email sent →", toEmail);
}

// ---------- Main handler ----------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let event: Stripe.Event;
  try {
    const buf = await getRawBody(req);
    const sig = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("Stripe signature verification failed:", err?.message);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }

  try {
    // We support either event based on how your Checkout was configured.
    if (
      event.type === "checkout.session.completed" ||
      event.type === "payment_intent.succeeded"
    ) {
      let bookingId: string | undefined;

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        bookingId = getBookingIdFromSession(session);
        console.log("checkout.session.completed → bookingId:", bookingId);
      } else {
        // payment_intent.succeeded path: if you attached metadata on the PI
        const pi = event.data.object as Stripe.PaymentIntent;
        bookingId =
          (pi.metadata?.booking_id as string | undefined) ||
          (pi.metadata?.bookingId as string | undefined);
        console.log("payment_intent.succeeded → bookingId:", bookingId);
      }

      if (!bookingId) {
        console.warn("No bookingId present; skipping.");
        return res.json({ received: true });
      }

      // -------- Fix #1: update Supabase using id (not booking_id) --------
      const { error: upErr } = await supabase
        .from("bookings")
        .update({ payment_status: "paid", paid_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (upErr) {
        console.error("Supabase update failed:", upErr);
      } else {
        console.log("Booking updated successfully:", bookingId);
      }

      // Fetch full row to email
      const { data: booking, error: fetchErr } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (fetchErr || !booking) {
        console.error("Failed to fetch booking for email:", fetchErr);
        return res.json({ received: true });
      }

      // -------- Fix #2: send the confirmation email via Resend --------
      try {
        await sendConfirmationEmail(booking);
      } catch (emailErr) {
        console.error("Resend send error:", emailErr);
      }

      return res.json({ received: true });
    }

    // You can handle failures/cancellations here if you want to mark them
    // else just acknowledge
    return res.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return res.status(500).json({ error: "Internal webhook error" });
  }
}
