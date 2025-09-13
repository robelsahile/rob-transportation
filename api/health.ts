// /api/health.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const has = (k: string) => Boolean(process.env[k] && String(process.env[k]).length > 5);

  const report = {
    SUPABASE_URL: has("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY"),
    ADMIN_API_TOKEN: has("ADMIN_API_TOKEN"),
    VITE_ADMIN_API_TOKEN: has("VITE_ADMIN_API_TOKEN"),
    SQUARE_ENV: has("SQUARE_ENV"),
    SQUARE_ACCESS_TOKEN: has("SQUARE_ACCESS_TOKEN"),
    SQUARE_LOCATION_ID: has("SQUARE_LOCATION_ID"),
    SQUARE_WEBHOOK_SIGNATURE_KEY: has("SQUARE_WEBHOOK_SIGNATURE_KEY"),
    PUBLIC_BASE_URL: has("PUBLIC_BASE_URL"),
  };

  // Do NOT include actual values. Just booleans.
  return res.status(200).json({ ok: true, report });
}
