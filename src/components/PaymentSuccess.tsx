import { useEffect, useMemo, useState } from "react";
import type { BookingFormData } from "../types";
import { VehicleType } from "../types";

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
        const ctx = JSON.parse(localStorage.getItem("rt_last_payment") || "null");
        if (ctx?.bookingId) {
          setBookingId(ctx.bookingId);
          const key = `rt_pending_${ctx.bookingId}`;
          const pending = JSON.parse(localStorage.getItem(key) || "null");
          if (pending?.details) {
            setBooking(pending.details);
            if (pending?.pricing) setPricing(pending.pricing);
            return; // Successfully loaded from localStorage
          }
          
          // If localStorage data is not available, fetch from database
          console.log("LocalStorage data not found, fetching from database...");
          const response = await fetch(`/api/get-booking?bookingId=${encodeURIComponent(ctx.bookingId)}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.booking) {
              const dbBooking = result.booking;
              // Transform database booking to BookingFormData format
              const bookingData: BookingFormData = {
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
              console.log("Successfully loaded booking data from database");
              return;
            }
          }
          console.error("Failed to fetch booking data from database");
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
      }
      
      // Fallback: create minimal booking display only if we can't get real data
      console.log("Creating fallback booking display");
      setBooking({
        pickupLocation: "Payment completed successfully",
        dropoffLocation: "Thank you for your business!",
        dateTime: new Date().toISOString(),
        vehicleType: VehicleType.SEDAN,
        name: "Customer",
        phone: "",
        email: "",
        flightNumber: ""
      });
    };

    loadBookingData();
  }, []);

  // Automatically send receipt when component loads with all required data
  useEffect(() => {
    (async () => {
      if (!bookingId || !booking) return;
      // Ensure Admin receives booking immediately upon success (idempotent)
      try {
        await postToAdmin();
      } catch {}

      if (paymentId && !receiptStatus.sending && !receiptStatus.sent) {
        sendReceipt();
      }
    })();
  }, [bookingId, booking, paymentId]);

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

      console.log("Sending receipt:", { bookingId, email: booking.email, phone: booking.phone });

      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setReceiptStatus({ sending: false, sent: true, error: null });
        console.log("Receipt sent successfully:", result);
      } else {
        throw new Error(result.error || "Failed to send receipt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send receipt";
      setReceiptStatus({ sending: false, sent: false, error: errorMessage });
      console.error("Receipt sending failed:", error);
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
      await sendReceipt(); // send receipt via email and SMS
    } catch (e) {
      console.error("Failed to persist booking or send receipt from PaymentSuccess:", e);
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
