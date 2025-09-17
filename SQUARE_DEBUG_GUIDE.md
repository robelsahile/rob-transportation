# Square Payment Debug Guide

## Issues Fixed

1. **Square API Version**: Updated from `2024-10-18` to `2023-10-18` for better compatibility
2. **Payment Link Configuration**: Added proper order structure with taxes, discounts, and checkout options
3. **Error Logging**: Enhanced error reporting to help identify issues
4. **Webhook Logging**: Added detailed logging to track payment processing

## Testing Steps

### 1. Test Square Configuration

Visit: `https://your-domain.vercel.app/api/test-square`

This will verify:

- Square API credentials are correct
- Location ID is valid
- API connection is working

### 2. Check Environment Variables

Ensure these are set in your Vercel dashboard:

**Required:**

- `SQUARE_ACCESS_TOKEN` - Your Square API access token
- `SQUARE_LOCATION_ID` - Your Square location ID
- `SQUARE_ENV` - Set to "sandbox" for testing, "production" for live

**Optional:**

- `SQUARE_WEBHOOK_SIGNATURE_KEY` - For webhook verification

### 3. Common Issues & Solutions

#### Issue: "Your order didn't go through"

**Possible Causes:**

1. **Wrong Environment**: Make sure `SQUARE_ENV` matches your Square account type
2. **Invalid Location ID**: Verify the location ID in your Square dashboard
3. **API Token Issues**: Ensure the token has proper permissions
4. **Amount Issues**: Very small amounts (like $0.66) might be rejected

#### Issue: Payment Link Creation Fails

**Check:**

1. Visit `/api/test-square` to verify configuration
2. Check Vercel function logs for detailed error messages
3. Ensure all required environment variables are set

#### Issue: Webhook Not Working

**Check:**

1. Webhook URL should be: `https://your-domain.vercel.app/api/square/webhook`
2. Set `SQUARE_WEBHOOK_SIGNATURE_KEY` in Vercel
3. Check Vercel function logs for webhook events

### 4. Debugging Steps

1. **Check Vercel Function Logs:**

   - Go to Vercel Dashboard → Functions
   - Look for errors in `create-payment-link` function
   - Check webhook logs for payment events

2. **Test with Different Amounts:**

   - Try with a larger amount (e.g., $10.00) instead of $0.66
   - Very small amounts might be rejected by Square

3. **Verify Square Dashboard:**
   - Check if payments appear in your Square dashboard
   - Look for any error messages or declined payments

### 5. Square Dashboard Configuration

1. **Webhook Setup:**

   - Go to Square Dashboard → Developer → Webhooks
   - Add webhook URL: `https://your-domain.vercel.app/api/square/webhook`
   - Subscribe to: `payment.updated` events
   - Copy the webhook signature key to `SQUARE_WEBHOOK_SIGNATURE_KEY`

2. **API Permissions:**
   - Ensure your API token has these permissions:
     - `PAYMENTS_WRITE`
     - `PAYMENTS_READ`
     - `ORDERS_WRITE`
     - `ORDERS_READ`

### 6. Testing with Real Cards

**Sandbox Testing:**

- Use Square's test card numbers
- Test card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**Production Testing:**

- Use real cards with small amounts
- Test with different card types (Visa, Mastercard, etc.)

## Next Steps

1. Deploy these changes to Vercel
2. Test the `/api/test-square` endpoint
3. Try a payment with a larger amount ($10+)
4. Check Vercel function logs for any errors
5. Verify webhook is receiving events

## Support

If issues persist:

1. Check Vercel function logs for detailed error messages
2. Verify Square dashboard for payment attempts
3. Test with Square's sandbox environment first
4. Contact Square support if API errors persist
