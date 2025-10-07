# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payments for the Rob Transportation website.

## Overview

Square has been completely removed and replaced with Stripe Payment Element. The payment form now appears directly on your website without redirecting users to another page.

## Required Environment Variables

You need to add these environment variables to your Vercel project:

### 1. Stripe Publishable Key (Frontend)

- **Variable Name**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Where to Find**: Stripe Dashboard → Developers → API keys → Publishable key
- **Format**: `pk_test_...` (for test mode) or `pk_live_...` (for live mode)
- **Add to**: Vercel Environment Variables

### 2. Stripe Secret Key (Backend)

- **Variable Name**: `STRIPE_SECRET_KEY`
- **Where to Find**: Stripe Dashboard → Developers → API keys → Secret key
- **Format**: `sk_test_...` (for test mode) or `sk_live_...` (for live mode)
- **Add to**: Vercel Environment Variables
- **⚠️ IMPORTANT**: Keep this secret! Never expose it in frontend code.

### 3. Stripe Webhook Secret (Optional but Recommended)

- **Variable Name**: `STRIPE_WEBHOOK_SECRET`
- **Where to Find**: Stripe Dashboard → Developers → Webhooks → Add endpoint
- **Webhook URL**: `https://your-domain.vercel.app/api/stripe/webhook`
- **Events to listen for**:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- **Format**: `whsec_...`
- **Add to**: Vercel Environment Variables

## Step-by-Step Setup

### Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the test mode keys (toggle in top right)

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

4. Make sure to select all environments (Production, Preview, Development)
5. Click **Save**

### Step 3: Set Up Webhook (Recommended)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

### Step 4: Redeploy Your Application

After adding environment variables:

1. Go to Vercel Dashboard → Deployments
2. Find your latest deployment
3. Click the **...** menu → **Redeploy**
4. This ensures the new environment variables are loaded

## Testing the Integration

### Test in Development

1. Make sure your `.env.local` file has:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

2. Run `npm run dev`
3. Fill out a booking form
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Test in Production

1. Use the same test card details
2. Check Stripe Dashboard → Payments to see test transactions
3. Verify the booking appears in your Admin Dashboard
4. Check that confirmation email is sent

## Stripe Test Cards

| Card Number           | Scenario                            |
| --------------------- | ----------------------------------- |
| `4242 4242 4242 4242` | Success                             |
| `4000 0000 0000 9995` | Declined (insufficient funds)       |
| `4000 0000 0000 0002` | Declined (card declined)            |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

More test cards: [Stripe Testing Documentation](https://stripe.com/docs/testing)

## Payment Flow

1. **Customer fills booking form** → Clicks "Review Booking"
2. **Reviews details** → Clicks "Confirm & Book Now"
3. **Payment page loads** → Stripe Payment Element appears on same page
4. **Customer enters card details** → Clicks "Pay $X.XX"
5. **Payment processes** → Redirects to "Payment Successful 🎉" page
6. **Success page shows** → Booking details + payment confirmation
7. **Customer clicks "Done"** → Email sent + saved to Supabase

## What Changed from Square

### ✅ Removed

- Square payment redirect (no more leaving your site)
- All Square API endpoints (`create-payment-link`, `confirm-square`, etc.)
- Square webhook handler
- Square environment variables

### ✅ Added

- Stripe Payment Element (embedded payment form)
- Stripe API endpoints (`create-payment-intent`, `stripe/webhook`)
- Stripe environment variables

### ✅ Kept Exactly the Same

- Booking form and flow
- Review booking page
- Supabase integration
- Email confirmation system
- Admin dashboard
- All design and UI
- Payment success page

## Troubleshooting

### Payment form doesn't appear

- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Make sure you redeployed after adding environment variables

### Payment fails silently

- Check Vercel function logs for errors
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check Stripe Dashboard → Logs for error details

### Booking doesn't save to Supabase

- Check Vercel function logs for `/api/bookings`
- Verify Supabase environment variables are correct
- Check webhook is receiving events (if configured)

### Email not sending

- This is handled the same way as before (Resend/Twilio)
- Check `/api/send-receipt-email` logs
- Verify email service environment variables

## Going Live

When you're ready to accept real payments:

1. Complete Stripe account activation
2. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
3. Copy your **live** API keys:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)
4. Update Vercel environment variables with live keys
5. Update webhook endpoint with live mode secret
6. Redeploy your application
7. Test with a real card (small amount first!)

## Support

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in your Stripe Dashboard
- **Test Mode**: Always test thoroughly before going live!

---

**Note**: Your site is live and connected to GitHub → Vercel auto-deploy. Any changes you push will automatically deploy to production.
