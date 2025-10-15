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
  emailSent: boolean;
  smsSent: boolean;
  error: string | null;
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
    return res.status(405).json({ 
      success: false, 
      emailSent: false, 
      smsSent: false, 
      error: "Method Not Allowed" 
    });
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
      return res.status(400).json({ 
        success: false, 
        emailSent: false, 
        smsSent: false, 
        error: "Missing required fields" 
      });
    }

    let emailSent = false;
    let smsSent = false;
    let lastError: string | null = null;

    // Send email if email is provided
    try {
      const emailModule = await import('./send-receipt-email');
      emailSent = await emailModule.sendEmailReceipt(data);
    } catch (e: any) {
      console.error('Email import/send failed:', e);
      lastError = e?.message || 'Email send failed';
    }

    // Send SMS if phone is provided (optional - don't fail overall if SMS fails)
    try {
      if (data.customerPhone) {
        const smsModule = await import('./send-receipt-sms');
        smsSent = await smsModule.sendSMSReceipt(data);
      }
    } catch (e: any) {
      console.error('SMS import/send failed:', e);
      // SMS failures are non-critical - only set error if email also failed
      if (!emailSent && !smsSent) {
        lastError = e?.message || 'Failed to send any receipts';
      }
    }

    // Determine overall success - consider it successful if email OR SMS is sent
    const success = !!(emailSent || smsSent);

    // Log the final API JSON response for debugging
    console.log("🔍 Final API JSON:", { success, emailSent, smsSent, error: success ? null : (lastError || 'Failed to send any receipts') });
    
    return res.status(success ? 200 : 500).json({
      success,
      emailSent,
      smsSent,
      error: success ? null : (lastError || 'Failed to send any receipts')
    });

  } catch (error) {
    console.error("Failed to send receipts:", error);
    return res.status(500).json({ 
      success: false,
      emailSent: false,
      smsSent: false,
      error: "Failed to send receipts"
    });
  }
}
