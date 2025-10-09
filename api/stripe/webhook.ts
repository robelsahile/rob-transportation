// api/stripe/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ---------- Stripe / Resend / Supabase setup ----------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any, // Using valid API version
});

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const resend = new Resend(process.env.RESEND_API_KEY as string);
const FROM_EMAIL = process.env.FROM_EMAIL || "Rob Transportation <noreply@robtransportation.com>";
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

// Idempotency: Check if we've already processed this event
async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('processed_events')
      .select('id')
      .eq('id', eventId)
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
}

// Idempotency: Mark event as processed
async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await supabase
      .from('processed_events')
      .upsert({ id: eventId, processed_at: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to mark event as processed:', error);
  }
}

// Send receipt email with proper error handling
async function sendReceiptEmail({ email, amount, paymentIntentId, sessionId, chargeId }: {
  email: string;
  amount: number;
  paymentIntentId?: string;
  sessionId?: string;
  chargeId?: string;
}): Promise<void> {
  try {
    const amountFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2 style="margin:0 0 8px">Payment Received 🎉</h2>
        <p style="margin:0 0 12px">Thank you for your payment to Rob Transportation.</p>
        
        <div style="border-top:1px solid #eee;margin:16px 0"></div>
        
        <p style="margin:0 0 6px"><strong>Amount:</strong> ${amountFormatted}</p>
        ${paymentIntentId ? `<p style="margin:0 0 6px"><strong>Payment ID:</strong> ${paymentIntentId}</p>` : ''}
        ${sessionId ? `<p style="margin:0 0 6px"><strong>Session ID:</strong> ${sessionId}</p>` : ''}
        ${chargeId ? `<p style="margin:0 0 6px"><strong>Charge ID:</strong> ${chargeId}</p>` : ''}
        
        <div style="border-top:1px solid #eee;margin:16px 0"></div>
        
        <p style="color:#666;margin:16px 0 0">If you have any questions, please contact us.</p>
        <p style="margin:4px 0 0">— Rob Transportation</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      ...(ADMIN_EMAIL ? { bcc: [ADMIN_EMAIL] } : {}),
      subject: `Payment Confirmed - ${amountFormatted} | ROB Transportation`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Resend failed: ${String(error)}`);
    }

    console.log('Receipt email sent successfully:', data?.id);
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    throw error;
  }
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
    // Idempotency: Check if we've already processed this event
    const eventId = event.id;
    if (await isEventProcessed(eventId)) {
      console.log('Event already processed, returning 200:', eventId);
      return res.json({ received: true, already_processed: true });
    }

    console.log('Processing webhook event:', event.type, eventId);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const email =
          pi.receipt_email ||
          (typeof pi.customer !== 'string' && pi.customer && 'email' in pi.customer ? pi.customer.email : null);

        console.log('payment_intent.succeeded:', { id: pi.id, email, amount: pi.amount_received });

        if (email && pi.amount_received) {
          await sendReceiptEmail({ 
            email, 
            amount: pi.amount_received, 
            paymentIntentId: pi.id 
          });
        }

        // Update booking status if bookingId exists in metadata
        const bookingId = pi.metadata?.booking_id || pi.metadata?.bookingId;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ payment_status: "paid", paid_at: new Date().toISOString() })
            .eq("id", bookingId);
          console.log('Booking updated:', bookingId);
        }
        break;
      }

      case 'checkout.session.completed': {
        const sess = event.data.object as Stripe.Checkout.Session;
        const email =
          sess.customer_details?.email ||
          (typeof sess.customer !== 'string' && sess.customer && 'email' in sess.customer ? sess.customer.email : null) ||
          sess.customer_email || null;

        console.log('checkout.session.completed:', { id: sess.id, email, amount: sess.amount_total });

        if (email && sess.amount_total) {
          await sendReceiptEmail({ 
            email, 
            amount: sess.amount_total, 
            sessionId: sess.id 
          });
        }

        // Update booking status if bookingId exists
        const bookingId = getBookingIdFromSession(sess);
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ payment_status: "paid", paid_at: new Date().toISOString() })
            .eq("id", bookingId);
          console.log('Booking updated:', bookingId);
        }
        break;
      }

      case 'charge.succeeded': {
        const ch = event.data.object as Stripe.Charge;
        const email = ch.billing_details?.email || null;
        
        console.log('charge.succeeded:', { id: ch.id, email, amount: ch.amount });

        if (email) {
          await sendReceiptEmail({ 
            email, 
            amount: ch.amount, 
            chargeId: ch.id 
          });
        }
        break;
      }

      default: {
        console.log('Unhandled event type:', event.type);
        break;
      }
    }

    // Mark event as processed for idempotency
    await markEventProcessed(eventId);

    return res.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return res.status(500).json({ error: "Internal webhook error" });
  }
}
