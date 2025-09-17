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

    // Validate required fields
    if (!data.bookingId || !data.customerName || (!data.customerEmail && !data.customerPhone)) {
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
        const emailResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-receipt-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          response.emailSent = true;
          response.emailMessageId = emailResult.messageId;
          console.log("Email sent successfully:", emailResult.messageId);
        } else {
          const errorText = await emailResponse.text();
          response.errors?.push(`Email failed: ${errorText}`);
          console.error("Email sending failed:", errorText);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown email error";
        response.errors?.push(`Email error: ${errorMsg}`);
        console.error("Email sending error:", error);
      }
    }

    // Send SMS if phone is provided
    if (data.customerPhone) {
      try {
        const smsResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-receipt-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (smsResponse.ok) {
          const smsResult = await smsResponse.json();
          response.smsSent = true;
          response.smsMessageId = smsResult.messageId;
          console.log("SMS sent successfully:", smsResult.messageId);
        } else {
          const errorText = await smsResponse.text();
          response.errors?.push(`SMS failed: ${errorText}`);
          console.error("SMS sending failed:", errorText);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown SMS error";
        response.errors?.push(`SMS error: ${errorMsg}`);
        console.error("SMS sending error:", error);
      }
    }

    // Determine overall success
    response.success = response.emailSent || response.smsSent;

    if (!response.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to send any receipts",
        details: response.errors
      });
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error("Failed to send receipts:", error);
    return res.status(500).json({ 
      error: "Failed to send receipts",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
