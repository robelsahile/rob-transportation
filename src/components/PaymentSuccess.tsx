import { useEffect, useMemo, useState } from "react";
import type { BookingFormData } from "../types";

type PricingSnapshot = {
  vehicle?: string;
  total?: number;
  currency?: string;
  distanceMi?: number;
  durationMin?: number;
  airportFee?: number;
  tax?: number;
  preTaxSubtotal?: number;
  baseFare?: number;
  distanceFee?: number;
  timeFee?: number;
  waitFee?: number;
  tolls?: number;
  minFareApplied?: boolean;
  pickupTimeMultiplier?: number;
  leadTimeMultiplier?: number;
};

export default function PaymentSuccess({
  paymentId,
  onDone,
}: {
  paymentId: string;
  onDone: () => void;
}) {
  const [booking, setBooking] = useState<BookingFormData | null>(null);
  const [pricing, setPricing] = useState<PricingSnapshot | null>(null);
  const [bookingId, setBookingId] = useState<string>("");
  const [receiptStatus, setReceiptStatus] = useState<{
    sending: boolean;
    sent: boolean;
    error: string | null;
  }>({
    sending: false,
    sent: false,
    error: null,
  });

  // Rehydrate details for display
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // First try to get bookingId from rt_last_payment
        const ctx = JSON.parse(localStorage.getItem("rt_last_payment") || "null");
        console.log("Payment context:", ctx);
        
        if (ctx?.bookingId) {
          setBookingId(ctx.bookingId);
          const key = `rt_pending_${ctx.bookingId}`;
          console.log("Looking for booking data with key:", key);
          
          const pending = JSON.parse(localStorage.getItem(key) || "null");
          console.log("Found pending data:", pending);
          
          if (pending?.details) {
            setBooking(pending.details);
            if (pending?.pricing) setPricing(pending.pricing);
            console.log("Successfully loaded booking data from localStorage:", pending.details);
            return;
          }
        }
        
        // Fallback: try rt_pending_last
        const lastPendingId = localStorage.getItem("rt_pending_last");
        console.log("Trying rt_pending_last:", lastPendingId);
        
        if (lastPendingId) {
          setBookingId(lastPendingId);
          const key = `rt_pending_${lastPendingId}`;
          const pending = JSON.parse(localStorage.getItem(key) || "null");
          if (pending?.details) {
            setBooking(pending.details);
            if (pending?.pricing) setPricing(pending.pricing);
            console.log("Successfully loaded booking data from rt_pending_last:", pending.details);
            return;
          }
        }
        
        console.error("No booking data found in localStorage");
        console.log("Available localStorage keys:", Object.keys(localStorage));
        
        // If we still don't have booking data, try to fetch from the new API
        if (ctx?.bookingId) {
          console.log("Attempting to fetch booking data from API...");
          try {
            const response = await fetch(`/api/get-booking?bookingId=${encodeURIComponent(ctx.bookingId)}`);
            const result = await response.json();
            
            if (result.success && result.booking) {
              const dbBooking = result.booking;
              const bookingData = {
                pickupLocation: dbBooking.pickupLocation,
                dropoffLocation: dbBooking.dropoffLocation,
                dateTime: dbBooking.dateTime,
                vehicleType: dbBooking.vehicleType,
                name: dbBooking.name,
                phone: dbBooking.phone,
                email: dbBooking.email,
                flightNumber: dbBooking.flightNumber || "",
                passengers: dbBooking.passengers,
                notes: dbBooking.notes || ""
              };
              setBooking(bookingData);
              if (dbBooking.pricing) setPricing(dbBooking.pricing);
              console.log("Successfully loaded booking data from API:", bookingData);
              return;
            }
          } catch (error) {
            console.error("Failed to fetch booking data from API:", error);
          }
        }
        
        // If we still don't have booking data, this is a critical error
        console.error("CRITICAL: No booking data available for email generation!");
        
      } catch (error) {
        console.error("Error loading booking data:", error);
      }
    };

    loadBookingData();
  }, []);

  // Automatically send receipt when component loads with all required data
  useEffect(() => {
    (async () => {
      // Wait for both bookingId and booking data to be loaded
      if (!bookingId || !booking) {
        console.log("Waiting for booking data to load:", { bookingId: !!bookingId, booking: !!booking });
        return;
      }
      
      console.log("All data loaded, proceeding with admin notification and receipt sending");
      
      // Ensure Admin receives booking immediately upon success (idempotent)
      try {
        await postToAdmin();
      } catch {}

      if (paymentId && !receiptStatus.sending && !receiptStatus.sent) {
        console.log("Sending receipt with data:", { bookingId, customerName: booking.name, email: booking.email });
        sendReceipt();
      }
    })();
  }, [bookingId, booking, paymentId]);

  // Additional effect to ensure receipt is sent immediately when paymentId is available
  useEffect(() => {
    if (paymentId && bookingId && booking && !receiptStatus.sending && !receiptStatus.sent && !receiptStatus.error) {
      console.log("Payment ID detected, attempting immediate receipt sending");
      // Small delay to ensure all data is ready
      setTimeout(() => {
        sendReceipt();
      }, 1000);
    }
  }, [paymentId, bookingId, booking, receiptStatus.sending, receiptStatus.sent, receiptStatus.error]);

  const totalDisplay = useMemo(() => {
    if (!pricing?.total || !pricing?.currency) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: pricing.currency,
      }).format(pricing.total);
    } catch {
      return `$${Number(pricing.total).toFixed(2)}`;
    }
  }, [pricing]);

  // Always upsert to Admin — pricing can be null
  async function postToAdmin(): Promise<void> {
    if (!bookingId || !booking) {
      console.log("Skipping admin POST - missing data:", { bookingId, booking: !!booking });
      return;
    }

    const payload = {
      bookingId,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      dateTime: booking.dateTime,
      vehicleType: booking.vehicleType,
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      flightNumber: booking.flightNumber?.trim() || null,
      passengers: booking.passengers || null,
      notes: booking.notes?.trim() || null,
      pricing: pricing || null,
    };

    console.log("Posting booking to admin API:", { bookingId, payload });
    
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Admin POST failed:", res.status, t);
    } else {
      console.log("Admin POST successful for booking:", bookingId);
    }
  }

  // Send receipt via email and SMS
  async function sendReceipt(): Promise<void> {
    if (!bookingId || !booking || !paymentId) {
      console.log("Skipping receipt - missing data:", { bookingId, booking: !!booking, paymentId });
      return;
    }

    // Don't send if already sent or currently sending
    if (receiptStatus.sent || receiptStatus.sending) {
      console.log("Receipt already sent or currently sending, skipping");
      return;
    }

    // Validate that we have all the required booking data
    if (!booking.name || !booking.email || !booking.pickupLocation || !booking.dropoffLocation) {
      console.error("Missing required booking data for email:", {
        name: booking.name,
        email: booking.email,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation
      });
      setReceiptStatus({ sending: false, sent: false, error: "Missing required booking data" });
      return;
    }

    console.log("Starting receipt sending process...");
    setReceiptStatus({ sending: true, sent: false, error: null });

    try {
      const receiptData = {
        bookingId,
        customerName: booking.name,
        customerEmail: booking.email,
        customerPhone: booking.phone,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        dateTime: booking.dateTime,
        vehicleType: booking.vehicleType,
        vehicleName: pricing?.vehicle || undefined,
        flightNumber: booking.flightNumber?.trim() || undefined,
        passengers: booking.passengers || undefined,
        notes: booking.notes?.trim() || undefined,
        pricing: pricing || null,
        paymentId,
      };

      console.log("Sending receipt with complete data:", receiptData);

      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptData),
      });

      const result = await res.json();
      console.log("🔍 Receipt API response:", result);
      console.log("🔍 Response status:", res.status);
      console.log("🔍 Response ok:", res.ok);
      console.log("🔍 Result success:", result.success);

      if (res.ok && result.success) {
        setReceiptStatus({ sending: false, sent: true, error: null });
        console.log("✅ Receipt sent successfully:", result);
      } else {
        console.error("❌ Receipt failed - Status:", res.status, "Success:", result.success, "Error:", result.error);
        throw new Error(result.error || "Failed to send receipt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send receipt";
      setReceiptStatus({ sending: false, sent: false, error: errorMessage });
      console.error("❌ Receipt sending failed:", error);
    }
  }

  function cleanupAndReturnHome() {
    try {
      const ctx = JSON.parse(localStorage.getItem("rt_last_payment") || "null");
      const bid = ctx?.bookingId;
      if (bid) localStorage.removeItem(`rt_pending_${bid}`);
      localStorage.removeItem("rt_last_payment");
      localStorage.removeItem("rt_pending_last");
      (window as any).__lastPricing = null;
      // Only redirect to home when Done button is clicked
      history.replaceState({}, "", "/");
    } catch {}
    onDone();
  }

  async function handleDone() {
    try {
      await postToAdmin(); // idempotent upsert by bookingId on the server
      // Don't resend receipt here - it should have been sent automatically
      console.log("Done button clicked - receipt should already be sent");
    } catch (e) {
      console.error("Failed to persist booking from Done button:", e);
    } finally {
      cleanupAndReturnHome();
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment Successful 🎉</h1>
        <p className="text-gray-600">Your payment has been processed.</p>
        <p className="mt-4 text-sm text-gray-500">
          Payment ID: <span className="font-mono">{paymentId}</span>
        </p>
        {bookingId && (
          <p className="mt-1 text-sm text-gray-500">
            Booking ID: <span className="font-mono">{bookingId}</span>
          </p>
        )}
        {/* Receipt Status */}
        {receiptStatus.sending && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-700 text-sm">Sending receipt to your email and phone...</span>
            </div>
          </div>
        )}
        
        {receiptStatus.sent && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="text-green-700 text-sm">✅ Receipt sent to your email and phone!</span>
            </div>
          </div>
        )}
        
        {receiptStatus.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="text-red-700 text-sm">⚠️ Receipt sending failed: {receiptStatus.error}</span>
            </div>
          </div>
        )}

        {/* Thank You Message */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-base text-brand-text leading-relaxed mb-4">
              <span className="font-semibold">Thank you for choosing Rob Transportation!</span> Your booking has been successfully confirmed and your payment has been received.
            </p>
            <p className="text-sm text-brand-text-light leading-relaxed mb-3">
              You'll receive a confirmation email shortly with all your booking details.
            </p>
            <p className="text-sm text-brand-text-light leading-relaxed mb-3">
              Our team will be in touch if any additional information is needed.
            </p>
            <p className="text-sm text-brand-text font-medium">
              We look forward to providing you with a smooth and reliable ride experience.
            </p>
          </div>
        </div>

        <button className="mt-6 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-medium" onClick={handleDone}>
          Done
        </button>
      </div>

      {/* Read-only booking review */}
      {booking && (
        <div className="mt-8 bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-brand-text mb-6 border-b pb-3 border-slate-200">
            Review Your Booking
          </h2>

          <div className="overflow-hidden rounded-md border border-slate-200">
            <dl className="divide-y divide-slate-200 text-sm">
              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Pickup Location</dt>
                <dd className="col-span-2 text-brand-text text-right whitespace-pre-line">
                  {booking.pickupLocation}
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Drop-off Location</dt>
                <dd className="col-span-2 text-brand-text text-right whitespace-pre-line">
                  {booking.dropoffLocation}
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Date &amp; Time</dt>
                <dd className="col-span-2 text-brand-text text-right">
                  {booking.dateTime ? new Date(booking.dateTime).toLocaleString() : ""}
                </dd>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Full Name</dt>
                <dd className="col-span-2 text-brand-text text-right">{booking.name}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Phone</dt>
                <dd className="col-span-2 text-brand-text text-right">{booking.phone}</dd>
              </div>

              <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                <dt className="col-span-1 text-brand-text-light">Email</dt>
                <dd className="col-span-2 text-brand-text text-right">{booking.email}</dd>
              </div>

              {booking.flightNumber ? (
                <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                  <dt className="col-span-1 text-brand-text-light">Flight</dt>
                  <dd className="col-span-2 text-brand-text text-right">{booking.flightNumber}</dd>
                </div>
              ) : null}

              {booking.passengers ? (
                <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                  <dt className="col-span-1 text-brand-text-light">Passengers</dt>
                  <dd className="col-span-2 text-brand-text text-right">{booking.passengers}</dd>
                </div>
              ) : null}

              {booking.notes ? (
                <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
                  <dt className="col-span-1 text-brand-text-light">Additional Notes</dt>
                  <dd className="col-span-2 text-brand-text text-right whitespace-pre-line">{booking.notes}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          {pricing && (
            <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-brand-text">
                  <div className="font-medium">{pricing.vehicle || "Selected Vehicle"}</div>
                  <div className="text-xs text-brand-text-light">Upfront total</div>
                </div>
                <div className="text-xl font-bold">{totalDisplay}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
