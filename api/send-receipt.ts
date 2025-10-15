// /api/send-receipt.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEmailReceipt } from './send-receipt-email';
import { sendSMSReceipt } from './send-receipt-sms';

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
  console.log("🔍 Receipt API handler called with method:", req.method);
  
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
    
    console.log("🔍 Full request body:", JSON.stringify(data, null, 2));

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
      console.log("🔍 Attempting to send email with data:", {
        customerEmail: data.customerEmail,
        bookingId: data.bookingId,
        customerName: data.customerName
      });
      emailSent = await sendEmailReceipt(data);
      console.log("🔍 Email send result:", emailSent);
    } catch (e: any) {
      console.error('❌ Email send failed:', e);
      console.error('❌ Email error details:', {
        message: e?.message,
        stack: e?.stack,
        name: e?.name
      });
      lastError = e?.message || 'Email send failed';
    }

    // Send SMS if phone is provided (optional - don't fail overall if SMS fails)
    try {
      if (data.customerPhone) {
        smsSent = await sendSMSReceipt(data);
      }
    } catch (e: any) {
      console.error('SMS send failed:', e);
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
    console.error("❌ Failed to send receipts:", error);
    console.error("❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    try {
      return res.status(500).json({ 
        success: false,
        emailSent: false,
        smsSent: false,
        error: "Failed to send receipts"
      });
    } catch (responseError) {
      console.error("❌ Failed to send error response:", responseError);
      return res.status(500).end("Internal Server Error");
    }
  }
}
