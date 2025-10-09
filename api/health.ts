// /api/health.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const has = (k: string) => !!(process.env[k] && String(process.env[k]).length > 5);
  // Do NOT leak values — only booleans
  return res.status(200).json({
    ok: true,
    report: {
      SUPABASE_URL: has("SUPABASE_URL"),
      SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY"),
      ADMIN_API_TOKEN: has("ADMIN_API_TOKEN"),
      VITE_ADMIN_API_TOKEN: has("VITE_ADMIN_API_TOKEN"),
      SQUARE_ENV: has("SQUARE_ENV"),
      SQUARE_ACCESS_TOKEN: has("SQUARE_ACCESS_TOKEN"),
      SQUARE_LOCATION_ID: has("SQUARE_LOCATION_ID"),
      SQUARE_WEBHOOK_SIGNATURE_KEY: has("SQUARE_WEBHOOK_SIGNATURE_KEY"),
      VITE_GOOGLE_MAPS_API_KEY: has("VITE_GOOGLE_MAPS_API_KEY"),
      PUBLIC_BASE_URL: has("PUBLIC_BASE_URL"),
      RESEND_API_KEY: has("RESEND_API_KEY"),
      TWILIO_ACCOUNT_SID: has("TWILIO_ACCOUNT_SID"),
      TWILIO_AUTH_TOKEN: has("TWILIO_AUTH_TOKEN"),
      TWILIO_PHONE_NUMBER: has("TWILIO_PHONE_NUMBER"),
      STRIPE_SECRET_KEY: has("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: has("STRIPE_WEBHOOK_SECRET"),
      FROM_EMAIL: has("FROM_EMAIL"),
      ADMIN_EMAIL: has("ADMIN_EMAIL"),
    },
  });
}
