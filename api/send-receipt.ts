// /api/send-receipt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

interface ReceiptResponse {
  success: boolean;
  emailSent?: boolean;
  smsSent?: boolean;
  emailMessageId?: string;
  smsMessageId?: string;
  errors?: string[];
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

  try {
    const data: ReceiptData = req.body;
    console.log("🔍 Receipt API called with data:", {
      bookingId: data.bookingId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      hasPricing: !!data.pricing
    });

    // Validate required fields
    if (!data.bookingId || !data.customerName || (!data.customerEmail && !data.customerPhone)) {
      console.error("❌ Missing required fields:", {
        bookingId: !!data.bookingId,
        customerName: !!data.customerName,
        customerEmail: !!data.customerEmail,
        customerPhone: !!data.customerPhone
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response: ReceiptResponse = {
      success: true,
      emailSent: false,
      smsSent: false,
      errors: []
    };

    // Send email if email is provided
    if (data.customerEmail) {
      try {
        // Import and call the email function directly instead of using fetch
        const { sendEmailReceipt } = await import('./send-receipt-email');
        const emailResult = await sendEmailReceipt(data);
        
        if (emailResult.success) {
          response.emailSent = true;
          response.emailMessageId = emailResult.messageId;
          console.log("Email sent successfully:", emailResult.messageId);
        } else {
          response.errors?.push(`Email failed: ${emailResult.error}`);
          console.error("Email sending failed:", emailResult.error);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown email error";
        response.errors?.push(`Email error: ${errorMsg}`);
        console.error("Email sending error:", error);
      }
    }

    // Send SMS if phone is provided (optional - don't fail overall if SMS fails)
    if (data.customerPhone) {
      try {
        // Import and call the SMS function directly instead of using fetch
        const { sendSMSReceipt } = await import('./send-receipt-sms');
        const smsResult = await sendSMSReceipt(data);
        
        if (smsResult.success) {
          response.smsSent = true;
          response.smsMessageId = smsResult.messageId;
          console.log("SMS sent successfully:", smsResult.messageId);
        } else {
          // SMS failure is not critical - just log it but don't add to errors
          console.warn("SMS sending failed (non-critical):", smsResult.error);
          // Only add to errors if it's a critical configuration issue
          if (smsResult.error?.includes("not configured")) {
            response.errors?.push(`SMS not configured: ${smsResult.error}`);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown SMS error";
        console.warn("SMS sending error (non-critical):", errorMsg);
        // Don't add SMS errors to critical errors list
      }
    }

    // Determine overall success - consider it successful if email OR SMS is sent
    response.success = Boolean(response.emailSent || response.smsSent);

    if (!response.success) {
      console.error("Failed to send any receipts:", response.errors);
      return res.status(500).json({
        success: false,
        error: "Failed to send any receipts",
        details: response.errors
      });
    }

    // Log successful receipt sending
    console.log("✅ Receipt sent successfully:", {
      emailSent: response.emailSent,
      smsSent: response.smsSent,
      errors: response.errors,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error("Failed to send receipts:", error);
    return res.status(500).json({ 
      error: "Failed to send receipts",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
