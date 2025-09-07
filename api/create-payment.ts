// api/create-payment.ts
import { SquareClient } from "square";

export default async function handler(req: any, res: any) {
  console.log("Square Backend Env:", {
    token: process.env.SQUARE_ACCESS_TOKEN?.slice(0, 6) + "...", // only log first few chars
    env: process.env.SQUARE_ENV,
    location: process.env.SQUARE_LOCATION_ID,
  });

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  try {
    const { sourceId, amount, bookingId, customerName, customerEmail } = req.body as {
      sourceId: string;
      amount: number;       // cents
      bookingId?: string;
      customerName?: string;
      customerEmail?: string;
    };

    if (!sourceId || !amount) {
      res.statusCode = 400;
      return res.end("Missing fields");
    }

    // New SDK client
    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!, // set in Vercel/your env
      // If you need to force Sandbox base URL, uncomment the next line:
      // baseUrl: "https://connect.squareupsandbox.com"
    });

    // (Optional) Create a customer
    let customerId: string | undefined;
    if (customerEmail) {
      try {
        const cust = await client.customers.create({
          emailAddress: customerEmail,
          givenName: customerName,
        });
        customerId = cust.customer?.id;
      } catch {
        // ignore customer creation errors and continue with payment
      }
    }

    const locationId =
      process.env.SQUARE_LOCATION_ID || process.env.VITE_SQUARE_LOCATION_ID;

    const payment = await client.payments.create({
      sourceId,
      idempotencyKey: `${bookingId ?? "booking"}-${Date.now()}`,
      amountMoney: { amount: BigInt(amount), currency: "USD" },
      locationId,
      customerId,
      note: bookingId ? `Rob Transportation booking ${bookingId}` : undefined,
    });

    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ payment: payment.payment }));
  } catch (e: any) {
    res.statusCode = 500;
    return res.end(e?.message || "Payment error");
  }
}
