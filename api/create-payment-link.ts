// /api/create-payment-link.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const SQUARE_ENV = (process.env.SQUARE_ENV || 'sandbox').toLowerCase();
const API_BASE =
  SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

// IMPORTANT: keep using your existing env vars; nothing else changes.
const ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const LOCATION_ID  = process.env.SQUARE_LOCATION_ID;

// Square requires a version header. Use a recent, stable date.
const SQUARE_VERSION = '2024-08-21';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    if (!ACCESS_TOKEN || !LOCATION_ID) {
      res.status(500).json({
        error: 'Server missing Square credentials (SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID).',
      });
      return;
    }

    const {
      amount,           // cents (integer) or dollars (number) - we normalize below
      bookingId,        // "YYYYMMDD-XXX-NNNN"
      customerName,
      customerEmail,
      redirectUrl,
      vehicleName,      // e.g., "Luxury Sedan"
    } = (req.body ?? {}) as {
      amount: number;
      bookingId: string;
      customerName?: string;
      customerEmail?: string;
      redirectUrl?: string;
      vehicleName?: string;
    };

    if (!bookingId || typeof bookingId !== 'string') {
      res.status(400).json({ error: 'bookingId is required' });
      return;
    }

    if (!amount || Number.isNaN(Number(amount))) {
      res.status(400).json({ error: 'amount is required' });
      return;
    }

    // Normalize to integer cents in case the client sent dollars.
    const amountCents = Math.round(Number(amount));

    const payload = {
      idempotency_key: crypto.randomUUID(),
      // This is what Square shows at the very top:
      quick_pay: {
        name: `Selected Vehicle - ${bookingId}`, // <-- TOP TITLE (your ask)
        description: vehicleName || 'Selected Vehicle', // <-- keeps vehicle visible in the order
        price_money: { amount: amountCents, currency: 'USD' },
        location_id: LOCATION_ID,
      },
      // Helps you reconcile in the Square Dashboard/exports:
      reference_id: bookingId,
      // Page options / prefill (no UI changes in your app)
      checkout_options: {
        redirect_url: redirectUrl || undefined,
        ask_for_note: false,
        allow_tipping: false,
      },
      pre_populated_data: {
        buyer_email_address: customerEmail || undefined,
        buyer_given_name: customerName || undefined,
      },
    };

    const resp = await fetch(`${API_BASE}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': SQUARE_VERSION,
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    const json = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;

    if (!resp.ok) {
      const msg = (json && (json.errors?.[0]?.detail || json.message)) || text || 'Square error';
      res.status(resp.status).json({ error: msg });
      return;
    }

    res.status(200).json(json);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Unexpected server error' });
  }
}
