# Local Development Setup

## Environment Variables for Local Development

Create a file named `.env.local` in the project root with these variables:

```bash
# Stripe API Keys (Frontend)
# Get from: https://dashboard.stripe.com/developers/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Google Maps API Key (Frontend)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Admin Token (Frontend)
VITE_ADMIN_API_TOKEN=your_admin_token_here
```

## Important Notes

1. **`.env.local` is gitignored** - This file will not be committed to your repository (for security)

2. **Frontend vs Backend Variables**:

   - `VITE_*` variables are for frontend (accessible in browser)
   - Other variables (like `STRIPE_SECRET_KEY`, `SUPABASE_*`) are for backend only
   - Backend variables should be set in Vercel, not in `.env.local`

3. **For Local API Testing**:
   - Vercel CLI can be used: `vercel dev`
   - This will prompt you for environment variables on first run
   - Or you can create `.env` file for Vercel dev (see Vercel docs)

## Getting Your Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle to **Test mode** (top right)
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Paste it into `.env.local` as `VITE_STRIPE_PUBLISHABLE_KEY`

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Visit: http://localhost:5173
```

## Testing Payments Locally

Use these Stripe test cards:

| Card Number           | Result        |
| --------------------- | ------------- |
| `4242 4242 4242 4242` | Success       |
| `4000 0000 0000 9995` | Declined      |
| `4000 0000 0000 0002` | Card declined |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Troubleshooting

### Payment form doesn't load

- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Restart dev server after adding environment variables

### API errors in console

- API routes need to run on Vercel or with `vercel dev`
- Simple `npm run dev` only runs frontend
- Backend APIs won't work without Vercel environment

### Google Maps not working

- Verify `VITE_GOOGLE_MAPS_API_KEY` is correct
- Check Google Cloud Console for API restrictions
- Make sure Places API is enabled

## Production Deployment

When you push to GitHub:

1. Changes auto-deploy to Vercel (already configured)
2. Make sure Vercel has all required environment variables
3. See `STRIPE_SETUP_GUIDE.md` for production setup

---

**Quick Start**: Just add your Stripe test key to `.env.local` and run `npm run dev`!
