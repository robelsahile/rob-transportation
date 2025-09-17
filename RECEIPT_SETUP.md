# Receipt System Setup

This document explains how to set up the automatic receipt system that sends email and SMS confirmations to customers after successful payment.

## Features

- **Automatic Email Receipts**: Beautiful HTML email receipts with trip details, pricing breakdown, and booking information
- **SMS Receipts**: Concise text message receipts with essential trip information
- **Dual Delivery**: Sends both email and SMS automatically after payment success
- **Error Handling**: Graceful fallback if one service fails, continues with the other
- **Real-time Status**: Shows sending status and success/error messages in the UI

## Required Environment Variables

Add these environment variables to your Vercel deployment or `.env.local` file:

### Email Service (Resend)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SMS Service (Twilio)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Service Setup

### 1. Resend (Email Service)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key in your dashboard
3. Add the API key to your environment variables as `RESEND_API_KEY`
4. Verify your domain (optional but recommended for production)

### 2. Twilio (SMS Service)

1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number for sending SMS
4. Add all three values to your environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## How It Works

1. **Payment Success**: When a customer completes payment, the `PaymentSuccess` component loads
2. **Automatic Sending**: The component automatically triggers receipt sending via the `/api/send-receipt` endpoint
3. **Dual Delivery**: The system attempts to send both email and SMS receipts
4. **Status Display**: Users see real-time status of receipt delivery
5. **Error Handling**: If one service fails, the other still works

## API Endpoints

### `/api/send-receipt`

Main endpoint that coordinates both email and SMS sending.

**Request Body:**

```json
{
  "bookingId": "2024-01-15-SMITH-001",
  "customerName": "John Smith",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "pickupLocation": "123 Main St, City, State",
  "dropoffLocation": "456 Airport Blvd, City, State",
  "dateTime": "2024-01-15T10:00:00Z",
  "vehicleType": "sedan",
  "vehicleName": "Luxury Sedan",
  "flightNumber": "AA1234",
  "pricing": {
    "total": 85.5,
    "currency": "USD",
    "baseFare": 15.0,
    "distanceFee": 45.0,
    "timeFee": 12.5,
    "airportFee": 5.0,
    "tax": 8.0
  },
  "paymentId": "payment_123456789"
}
```

**Response:**

```json
{
  "success": true,
  "emailSent": true,
  "smsSent": true,
  "emailMessageId": "msg_xxxxxxxx",
  "smsMessageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### `/api/send-receipt-email`

Handles email receipt sending using Resend.

### `/api/send-receipt-sms`

Handles SMS receipt sending using Twilio.

## Email Template Features

- **Professional Design**: Clean, responsive HTML template
- **Complete Trip Details**: All booking information clearly displayed
- **Pricing Breakdown**: Detailed cost breakdown with line items
- **Branded Header**: ROB Transportation branding
- **Mobile Responsive**: Looks great on all devices
- **Contact Information**: Customer service details included

## SMS Template Features

- **Concise Format**: Essential information in a short message
- **Emoji Indicators**: Visual cues for better readability
- **Truncated Locations**: Long addresses are shortened for SMS limits
- **Key Details**: Booking ID, times, vehicle, and total cost

## Testing

1. **Health Check**: Visit `/api/health` to verify all environment variables are configured
2. **Test Booking**: Complete a test booking and payment
3. **Check Receipts**: Verify both email and SMS are received
4. **Error Scenarios**: Test with invalid email/phone to see error handling

## Troubleshooting

### Common Issues

1. **"Email service not configured"**: Check `RESEND_API_KEY` is set
2. **"SMS service not configured"**: Check Twilio credentials are set
3. **"Failed to send any receipts"**: Both services failed, check logs
4. **Email not received**: Check spam folder, verify Resend domain setup
5. **SMS not received**: Verify phone number format, check Twilio account balance

### Debugging

- Check browser console for error messages
- Check Vercel function logs for API errors
- Verify environment variables in Vercel dashboard
- Test individual endpoints with curl or Postman

## Customization

### Email Template

Edit the `generateEmailHTML` function in `/api/send-receipt-email.ts` to customize:

- Colors and styling
- Company branding
- Additional information
- Layout and structure

### SMS Template

Edit the `generateSMSMessage` function in `/api/send-receipt-sms.ts` to customize:

- Message format
- Information included
- Emoji usage
- Length limits

## Security Notes

- API keys are server-side only, never exposed to client
- Phone numbers are cleaned and validated before sending
- Email addresses are validated before sending
- All API endpoints include proper CORS headers
- Error messages don't expose sensitive information

## Cost Considerations

- **Resend**: Free tier includes 3,000 emails/month
- **Twilio**: Pay-per-SMS pricing (varies by country)
- Monitor usage in respective dashboards
- Consider rate limiting for high-volume scenarios
