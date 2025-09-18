# Square Payment Debug Steps

## ✅ What We Fixed

1. **Enhanced Payment Success Handling**: Added support for `paymentId` parameter from Square redirects
2. **Added Debug Logging**: Console logs will show what parameters Square sends back
3. **Improved Payment Resolution**: Better handling of different Square redirect scenarios
4. **Updated API**: Enhanced `confirm-square` API to handle direct payment IDs

## 🔍 Debugging Steps

### Step 1: Test Payment Again

1. Go to your booking form
2. Create a new booking with $49.50
3. Complete the payment with your real credit card
4. **Open browser console** (F12 → Console tab) before completing payment

### Step 2: Check Console Logs

After payment, look for this log in the console:

```
Payment success redirect params: {
  orderId: "...",
  transactionId: "...",
  paymentId: "...",
  allParams: {...}
}
```

### Step 3: Check Vercel Function Logs

1. Go to Vercel Dashboard → Functions
2. Look for `confirm-square` function logs
3. Check for any error messages

### Step 4: Check Square Dashboard

1. Go to Square Dashboard → Payments
2. Look for the payment attempt
3. Check if it shows as "Completed" or "Failed"

## 🚨 Common Issues & Solutions

### Issue: Still Getting "Sorry. Your order didn't go through"

**Possible Causes:**

1. **Square Payment Rules**: Your Square account might have specific business rules
2. **Card Issues**: Some cards are rejected for test transactions
3. **Webhook Issues**: Payment completion not being processed

**Solutions:**

1. Try with a different credit card
2. Check Square Dashboard for payment status
3. Look at Vercel function logs for errors

### Issue: Console Shows No Parameters

**This means Square isn't redirecting properly**
**Solutions:**

1. Check your Square webhook configuration
2. Verify redirect URL in Square dashboard
3. Check if Square is sending webhook events

### Issue: Payment Shows in Square but Not in Your App

**This means webhook isn't working**
**Solutions:**

1. Check webhook URL in Square dashboard
2. Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` in Vercel
3. Check webhook function logs

## 🔧 Next Steps

1. **Test the payment again** with the new debugging
2. **Check console logs** to see what Square sends back
3. **Check Vercel function logs** for any errors
4. **Check Square dashboard** for payment status

## 📞 If Still Not Working

If the payment still fails after these fixes:

1. **Check Square Support**: Contact Square support about payment processing rules
2. **Try Different Card**: Use a different credit card
3. **Check Business Settings**: Verify your Square business account settings
4. **Test with Sandbox**: Switch to sandbox mode for testing

The debugging logs will help us identify exactly where the issue is occurring!
