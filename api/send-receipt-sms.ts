// /api/send-receipt-sms.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface ReceiptData {
  bookingId: string;
  customerName: string;
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
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return dateTime;
  }
}

function generateSMSMessage(data: ReceiptData): string {
  const totalAmount = data.pricing?.total ? formatCurrency(data.pricing.total, data.pricing.currency) : "N/A";
  const formattedDateTime = formatDateTime(data.dateTime);
  const vehicleDisplayName = data.vehicleName || data.vehicleType || "Selected Vehicle";
  
  // Truncate locations if too long for SMS
  const truncateLocation = (location: string, maxLength: number = 30) => {
    return location.length > maxLength ? location.substring(0, maxLength - 3) + "..." : location;
  };

  const pickup = truncateLocation(data.pickupLocation);
  const dropoff = truncateLocation(data.dropoffLocation);

  let message = `🚗 ROB Transportation\n\n`;
  message += `✅ Payment Successful!\n\n`;
  message += `Booking: ${data.bookingId}\n`;
  message += `From: ${pickup}\n`;
  message += `To: ${dropoff}\n`;
  message += `When: ${formattedDateTime}\n`;
  message += `Vehicle: ${vehicleDisplayName}\n`;
  
  if (data.flightNumber) {
    message += `Flight: ${data.flightNumber}\n`;
  }
  
  message += `Total: ${totalAmount}\n`;
  message += `Payment ID: ${data.paymentId}\n\n`;
  message += `Thank you for choosing ROB Transportation! We'll contact you before pickup.`;

  return message;
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

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("Twilio credentials not configured");
    return res.status(500).json({ error: "SMS service not configured" });
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error("TWILIO_PHONE_NUMBER not configured");
    return res.status(500).json({ error: "SMS service not configured" });
  }

  try {
    const data: ReceiptData = req.body;

    // Validate required fields
    if (!data.customerPhone || !data.bookingId || !data.customerName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Clean phone number (remove any non-digit characters except +)
    const cleanPhone = data.customerPhone.replace(/[^\d+]/g, "");
    
    // Add +1 if it's a 10-digit US number
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : cleanPhone;

    const message = generateSMSMessage(data);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log("SMS sent successfully:", result.sid);

    return res.status(200).json({ 
      success: true, 
      messageId: result.sid,
      message: "Receipt SMS sent successfully" 
    });

  } catch (error) {
    console.error("Failed to send receipt SMS:", error);
    return res.status(500).json({ 
      error: "Failed to send receipt SMS",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
