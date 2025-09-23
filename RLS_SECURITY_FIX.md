# Row Level Security (RLS) Fix for Supabase

## Problem

You received security alerts from Supabase indicating that RLS was disabled on:

- `public.booking_counter` (sequence)

This sequence is exposed via PostgREST and needs proper security policies.

## Solution Applied

### 1. Database Schema Updates

The `sql/supabase_schema.sql` file has been updated with:

#### RLS Policies

- **Bookings table**: Service role can manage all bookings
- **Booking counter sequence**: Secured via the existing `next_booking_counter()` function

### 2. Simplified Security

Since you use Square payment links (no coupon system needed), the security fix focuses only on:

- Securing the bookings table with RLS
- The booking counter sequence is already secured via the `security definer` function

## Deployment Steps

### Step 1: Apply Database Changes

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire updated `supabase_schema.sql` content
4. Execute the SQL

### Step 2: Verify Changes

1. Go to Authentication > Policies in Supabase dashboard
2. Verify that RLS is enabled on the bookings table
3. Check that policies are created for the bookings table

### Step 3: Test Functionality

1. Test booking counter API: `/api/booking-counter`
2. Verify that security alerts are resolved

### Step 4: Deploy Code Changes

Since your site auto-deploys via GitHub → Vercel, simply:

1. Commit and push the updated files to your repository
2. Vercel will automatically deploy the changes

## Files Modified

- `sql/supabase_schema.sql` - Added RLS policies for bookings table
- `src/components/PaymentPage.tsx` - Removed coupon reference
- Removed `components/validate-coupon.ts` - Not needed with Square payments

## Security Benefits

- ✅ Prevents unauthorized access to booking data
- ✅ Maintains functionality while securing data
- ✅ Complies with Supabase security best practices
- ✅ Simplified security model focused on your actual needs

## Testing Checklist

- [ ] Booking counter API returns valid counter
- [ ] Supabase security alerts are resolved
- [ ] No breaking changes to existing functionality
- [ ] Square payment flow works correctly
