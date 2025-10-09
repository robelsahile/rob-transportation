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

// Helper: Format currency
function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

// Helper: Format date/time
function formatDateTime(dateTime: string): string {
  try {
    return new Date(dateTime).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return dateTime;
  }
}

// Fetch booking details from Supabase
async function getBookingDetails(bookingId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) {
      console.error('Failed to fetch booking details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception fetching booking:', error);
    return null;
  }
}

// Generate professional HTML email template
function generatePaymentConfirmationHTML({ 
  customerName,
  bookingId,
  amount,
  paymentId,
  booking
}: {
  customerName?: string;
  bookingId?: string;
  amount: number;
  paymentId: string;
  booking?: any;
}): string {
  const amountFormatted = formatCurrency(amount / 100);
  
  // Extract booking details if available
  const pickupLocation = booking?.pickup_location || 'N/A';
  const dropoffLocation = booking?.dropoff_location || 'N/A';
  const dateTime = booking?.date_time ? formatDateTime(booking.date_time) : 'N/A';
  const vehicleType = booking?.vehicle_type || 'Selected Vehicle';
  const passengers = booking?.passengers;
  const notes = booking?.notes;
  const pricing = booking?.pricing;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - ROB Transportation</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Fixed light mode only - no dark mode switching */
    .email-wrapper {
      background-color: #F3F4F6 !important;
    }
    
    .email-container {
      background-color: #FFFFFF !important;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .header {
      background-color: #1E3A8A !important;
      color: #FFFFFF !important;
      padding: 32px 24px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      color: #FFFFFF;
    }
    
    .header p {
      margin: 0;
      font-size: 14px;
      color: #E5E7EB;
      opacity: 0.95;
    }
    
    .content {
      padding: 32px 24px;
      color: #1F2937 !important;
    }
    
    .success-badge {
      background-color: #10B981;
      color: #FFFFFF;
      padding: 10px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1F2937 !important;
      margin: 0 0 16px 0;
    }
    
    .booking-summary {
      background-color: #F9FAFB !important;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #E5E7EB !important;
    }
    
    .detail-row {
      display: table;
      width: 100%;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #6B7280 !important;
      display: table-cell;
      width: 40%;
      vertical-align: top;
    }
    
    .detail-value {
      color: #1F2937 !important;
      display: table-cell;
      text-align: right;
      vertical-align: top;
    }
    
    .payment-box {
      background: #1E3A8A;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      color: #FFFFFF;
      text-align: center;
    }
    
    .payment-box .amount {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #FFFFFF;
    }
    
    .payment-box .payment-id {
      font-size: 15px;
      color: #FFFFFF;
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }
    
    .footer {
      background-color: #F9FAFB !important;
      padding: 32px 24px;
      text-align: center;
      color: #6B7280 !important;
      font-size: 14px;
    }
    
    .footer-links {
      margin: 16px 0;
    }
    
    .footer-links a {
      color: #1E3A8A !important;
      text-decoration: none;
      margin: 0 12px;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #6B7280 !important;
      text-decoration: none;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .header h1 {
        font-size: 24px !important;
      }
      
      .payment-box .amount {
        font-size: 28px !important;
      }
      
      .content {
        padding: 24px 16px !important;
      }
      
      .footer-links a {
        display: block;
        margin: 8px 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0;">
  <div class="email-wrapper" style="background-color: #F3F4F6; padding: 20px 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF;">
            
            <!-- Header -->
            <tr>
              <td class="header" style="background-color: #1E3A8A; color: #FFFFFF; padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #FFFFFF;">ROB Transportation</h1>
                <p style="margin: 0; font-size: 14px; color: #E5E7EB;">Premium Transportation Services</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td class="content" style="padding: 32px 24px; color: #1F2937;">
                
                <!-- Success Badge -->
                <div class="success-badge" style="background-color: #10B981; color: #FFFFFF; padding: 10px 20px; border-radius: 24px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 24px;">
                  Payment Confirmed
                </div>
                
                <h2 class="section-title" style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0; text-align: center;">
                  Thank You${customerName ? ', ' + customerName : ''}!
                </h2>
                
                <p style="margin: 0 0 16px 0; color: #4B5563; line-height: 1.6;">
                  Your payment has been successfully processed. We're excited to provide you with exceptional transportation service!
                </p>
                
                <!-- Payment Amount Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="payment-box" style="background: #1E3A8A; border-radius: 12px; padding: 24px; margin: 24px 0; color: #FFFFFF; text-align: center;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; color: #E5E7EB; font-weight: 600;">AMOUNT PAID</p>
                      <p class="amount" style="font-size: 32px; font-weight: 700; margin: 0 0 12px 0; color: #FFFFFF;">${amountFormatted}</p>
                      <p class="payment-id" style="font-size: 15px; color: #FFFFFF; font-family: 'Courier New', monospace; font-weight: 500; margin: 0;">
                        Payment ID: ${paymentId}
                      </p>
                    </td>
                  </tr>
                </table>
                
                ${booking ? `
                <!-- Booking Summary -->
                <h3 class="section-title" style="font-size: 18px; font-weight: 700; color: #1F2937; margin: 24px 0 16px 0;">
                  Booking Details
                </h3>
                
                <div class="booking-summary" style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #E5E7EB;">
                  
                  ${bookingId ? `
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%;">Booking ID</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right; font-family: monospace; font-weight: 600;">${bookingId}</span>
                  </div>
                  ` : ''}
                  
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%;">Service</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right;">${vehicleType}</span>
                  </div>
                  
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%; vertical-align: top;">Pickup</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right; vertical-align: top;">${pickupLocation}</span>
                  </div>
                  
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%; vertical-align: top;">Drop-off</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right; vertical-align: top;">${dropoffLocation}</span>
                  </div>
                  
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%;">Date & Time</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right;">${dateTime}</span>
                  </div>
                  
                  ${passengers ? `
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%;">Passengers</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right;">${passengers}</span>
                  </div>
                  ` : ''}
                  
                  ${notes ? `
                  <div class="detail-row" style="display: table; width: 100%; padding: 12px 0;">
                    <span class="detail-label" style="font-weight: 600; color: #6B7280; display: table-cell; width: 40%; vertical-align: top;">Notes</span>
                    <span class="detail-value" style="color: #1F2937; display: table-cell; text-align: right; vertical-align: top; white-space: pre-wrap;">${notes}</span>
                  </div>
                  ` : ''}
                  
                  ${!notes && !passengers ? '<div style="border-bottom: none;"></div>' : ''}
                </div>
                ` : ''}
                
                <!-- Contact Info -->
                <div style="margin-top: 32px; padding: 20px; background-color: #FEF3C7; border-left: 4px solid #FBBF24; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400E;">Need Help?</p>
                  <p style="margin: 0; color: #78350F; font-size: 14px; line-height: 1.5;">
                    If you have any questions or need to modify your booking, please contact us at least 2 hours before your scheduled pickup time.
                  </p>
                </div>
                
                <p style="margin-top: 24px; color: #6B7280; font-size: 14px; line-height: 1.6;">
                  We look forward to serving you and ensuring you have a comfortable, safe journey!
                </p>
                
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td class="footer" style="background-color: #F9FAFB; padding: 32px 24px; text-align: center; color: #6B7280; font-size: 14px;">
                <p style="margin: 0 0 16px 0; font-weight: 600; color: #1F2937;">ROB Transportation</p>
                
                <div class="footer-links" style="margin: 16px 0;">
                  <a href="https://robtransportation.com" style="color: #1E3A8A; text-decoration: none; margin: 0 12px;">Website</a>
                  <a href="mailto:info@robtransportation.com" style="color: #1E3A8A; text-decoration: none; margin: 0 12px;">Contact</a>
                  <a href="tel:+1234567890" style="color: #1E3A8A; text-decoration: none; margin: 0 12px;">Call Us</a>
                </div>
                
                <div class="social-links" style="margin: 16px 0;">
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6B7280; text-decoration: none;">Facebook</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6B7280; text-decoration: none;">Twitter</a>
                  <a href="#" style="display: inline-block; margin: 0 8px; color: #6B7280; text-decoration: none;">Instagram</a>
                </div>
                
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #9CA3AF;">
                  This is an automated receipt. Please save this email for your records.<br>
                  © ${new Date().getFullYear()} ROB Transportation. All rights reserved.
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

// Send receipt email with proper error handling
async function sendReceiptEmail({ email, amount, paymentIntentId, sessionId, chargeId, bookingId }: {
  email: string;
  amount: number;
  paymentIntentId?: string;
  sessionId?: string;
  chargeId?: string;
  bookingId?: string;
}): Promise<void> {
  try {
    const amountFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);

    // Fetch booking details if bookingId is available
    let booking: any = null;
    if (bookingId) {
      booking = await getBookingDetails(bookingId);
      console.log('Booking details fetched:', booking ? 'success' : 'not found');
    }

    const paymentId = paymentIntentId || sessionId || chargeId || 'N/A';
    const customerName = booking ? booking.name : undefined;

    const html = generatePaymentConfirmationHTML({
      customerName,
      bookingId,
      amount,
      paymentId,
      booking
    });

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

        // Get booking ID from metadata
        const bookingId = pi.metadata?.booking_id || pi.metadata?.bookingId;

        if (email && pi.amount_received) {
          await sendReceiptEmail({ 
            email, 
            amount: pi.amount_received, 
            paymentIntentId: pi.id,
            bookingId
          });
        }

        // Update booking status if bookingId exists in metadata
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

        // Get booking ID from session
        const bookingId = getBookingIdFromSession(sess);

        if (email && sess.amount_total) {
          await sendReceiptEmail({ 
            email, 
            amount: sess.amount_total, 
            sessionId: sess.id,
            bookingId
          });
        }

        // Update booking status if bookingId exists
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

        // Try to get booking ID from charge metadata
        const bookingId = ch.metadata?.booking_id || ch.metadata?.bookingId;

        if (email) {
          await sendReceiptEmail({ 
            email, 
            amount: ch.amount, 
            chargeId: ch.id,
            bookingId
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
