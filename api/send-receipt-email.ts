// /api/send-receipt-email.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReceiptData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  vehicleType: string;
  vehicleName?: string;
  flightNumber?: string;
  passengers?: number;
  notes?: string;
  pricing: {
    total: number;
    currency: string;
    baseFare?: number;
    distanceFee?: number;
    timeFee?: number;
    airportFee?: number;
    tax?: number;
    distanceMi?: number;
    durationMin?: number;
  } | null;
  paymentId: string;
}

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

function generateEmailHTML(data: ReceiptData): string {
  const totalAmount = data.pricing?.total ? formatCurrency(data.pricing.total, data.pricing.currency) : "N/A";
  const formattedDateTime = formatDateTime(data.dateTime);
  const vehicleDisplayName = data.vehicleName || data.vehicleType || "Selected Vehicle";
  
  // Helper function to safely display values
  const safeDisplay = (value: string | undefined | null, fallback: string = "N/A"): string => {
    if (!value || value.trim() === "") return fallback;
    return value.trim();
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - ROB Transportation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 30px; }
    .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
    .booking-details { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #1f2937; text-align: right; }
    .pricing-breakdown { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .pricing-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .pricing-total { border-top: 2px solid #0ea5e9; margin-top: 12px; padding-top: 12px; font-weight: 700; font-size: 18px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    .contact-info { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .contact-info h3 { margin: 0 0 10px 0; color: #1f2937; }
    .contact-info p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 ROB Transportation</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Premium Transportation Services</p>
    </div>
    
    <div class="content">
      <div class="success-badge">✅ Payment Successful</div>
      
      <h2 style="margin: 0 0 20px 0; color: #1f2937;">Booking Confirmation</h2>
      
      <p>Dear ${data.customerName},</p>
      
      <p>Thank you for choosing ROB Transportation! Your booking has been confirmed and payment has been processed successfully.</p>
      
      <div class="booking-details">
        <h3 style="margin: 0 0 15px 0; color: #1f2937;">Trip Details</h3>
        
        <div class="detail-row">
          <span class="detail-label">Booking ID</span>
          <span class="detail-value" style="font-family: monospace; font-weight: 600;">${data.bookingId}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${safeDisplay(vehicleDisplayName, "Selected Vehicle")}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Pickup</span>
          <span class="detail-value">${safeDisplay(data.pickupLocation)}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Drop-off</span>
          <span class="detail-value">${safeDisplay(data.dropoffLocation)}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Date & Time</span>
          <span class="detail-value">${safeDisplay(formattedDateTime)}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Passengers</span>
          <span class="detail-value">${data.passengers ? data.passengers.toString() : "N/A"}</span>
        </div>
        
        ${data.flightNumber ? `
        <div class="detail-row">
          <span class="detail-label">Flight Number</span>
          <span class="detail-value">${safeDisplay(data.flightNumber)}</span>
        </div>
        ` : ''}
        
        <div class="detail-row">
          <span class="detail-label">Notes</span>
          <span class="detail-value" style="white-space: pre-wrap;">${safeDisplay(data.notes)}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Payment ID</span>
          <span class="detail-value" style="font-family: monospace;">${data.paymentId}</span>
        </div>
      </div>
      
      ${data.pricing ? `
      <div class="pricing-breakdown">
        <h3 style="margin: 0 0 15px 0; color: #1f2937;">Payment Summary</h3>
        
        ${data.pricing.baseFare ? `
        <div class="pricing-row">
          <span>Base Fare</span>
          <span>${formatCurrency(data.pricing.baseFare, data.pricing.currency)}</span>
        </div>
        ` : ''}
        
        ${data.pricing.distanceFee ? `
        <div class="pricing-row">
          <span>Distance Fee (${data.pricing.distanceMi?.toFixed(1) || 0} mi)</span>
          <span>${formatCurrency(data.pricing.distanceFee, data.pricing.currency)}</span>
        </div>
        ` : ''}
        
        ${data.pricing.timeFee ? `
        <div class="pricing-row">
          <span>Time Fee (${data.pricing.durationMin || 0} min)</span>
          <span>${formatCurrency(data.pricing.timeFee, data.pricing.currency)}</span>
        </div>
        ` : ''}
        
        ${data.pricing.airportFee ? `
        <div class="pricing-row">
          <span>Airport Fee</span>
          <span>${formatCurrency(data.pricing.airportFee, data.pricing.currency)}</span>
        </div>
        ` : ''}
        
        ${data.pricing.tax ? `
        <div class="pricing-row">
          <span>Tax</span>
          <span>${formatCurrency(data.pricing.tax, data.pricing.currency)}</span>
        </div>
        ` : ''}
        
        <div class="pricing-row pricing-total">
          <span>Total</span>
          <span>${totalAmount}</span>
        </div>
      </div>
      ` : `
      <div class="pricing-breakdown">
        <h3 style="margin: 0 0 15px 0; color: #1f2937;">Payment Summary</h3>
        <div class="pricing-row pricing-total">
          <span>Total</span>
          <span>${totalAmount}</span>
        </div>
      </div>
      `}
      
      <div class="contact-info">
        <h3>Need Help?</h3>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p style="margin-top: 15px; font-size: 13px; color: #6b7280;">
          If you have any questions or need to modify your booking, please contact us at least 2 hours before your scheduled pickup time.
        </p>
      </div>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        We look forward to providing you with excellent service!
      </p>
    </div>
    
    <div class="footer">
      <p>ROB Transportation - Premium Transportation Services</p>
      <p>This is an automated receipt. Please save this email for your records.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Export function for direct use
export async function sendEmailReceipt(data: ReceiptData) {
  console.log("🔍 Email function called with data:", {
    customerEmail: data.customerEmail,
    bookingId: data.bookingId,
    customerName: data.customerName,
    hasResendKey: !!process.env.RESEND_API_KEY
  });

  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured - simulating email send in development");
    // In development, simulate successful email sending
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      return { 
        success: true, 
        messageId: "dev_simulated_" + Date.now(),
        message: "Email simulated in development (RESEND_API_KEY not configured)" 
      };
    }
    return { success: false, error: "Email service not configured" };
  }

  try {
    // Validate required fields
    if (!data.customerEmail || !data.bookingId || !data.customerName) {
      console.error("❌ Missing required fields for email:", {
        customerEmail: !!data.customerEmail,
        bookingId: !!data.bookingId,
        customerName: !!data.customerName
      });
      return { success: false, error: "Missing required fields" };
    }

    const emailHtml = generateEmailHTML(data);

    const result = await resend.emails.send({
      from: "Rob Transportation <noreply@robtransportation.com>",
      to: [data.customerEmail],
      subject: `Booking Confirmation - ${data.bookingId} | ROB Transportation`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", result.data?.id);
    console.log("✅ Full Resend result:", result);

    return { 
      success: true, 
      messageId: result.data?.id,
      message: "Receipt email sent successfully" 
    };

  } catch (error) {
    console.error("❌ Failed to send receipt email:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return { 
      success: false,
      error: "Failed to send receipt email",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS / preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const data: ReceiptData = req.body;

    // Validate required fields
    if (!data.customerEmail || !data.bookingId || !data.customerName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailHtml = generateEmailHTML(data);

    const result = await resend.emails.send({
      from: "Rob Transportation <noreply@robtransportation.com>",
      to: [data.customerEmail],
      subject: `Booking Confirmation - ${data.bookingId} | ROB Transportation`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", result.data?.id);

    return res.status(200).json({ 
      success: true, 
      messageId: result.data?.id,
      message: "Receipt email sent successfully" 
    });

  } catch (error) {
    console.error("Failed to send receipt email:", error);
    return res.status(500).json({ 
      error: "Failed to send receipt email",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
