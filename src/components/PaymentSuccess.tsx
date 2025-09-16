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

export default function PaymentSuccess({ paymentId, onDone }: { paymentId: string; onDone: () => void }) {
  const [booking, setBooking] = useState<BookingFormData | null>(null);
  const [pricing, setPricing] = useState<PricingSnapshot | null>(null);
  const [bookingId, setBookingId] = useState<string>("");

  useEffect(() => {
    try {
      const ctx = JSON.parse(localStorage.getItem("rt_last_payment") || "null");
      if (ctx?.bookingId) setBookingId(ctx.bookingId);
      const key = ctx?.bookingId ? `rt_pending_${ctx.bookingId}` : null;
      if (key) {
        const pending = JSON.parse(localStorage.getItem(key) || "null");
        if (pending?.details) setBooking(pending.details);
        if (pending?.pricing) setPricing(pending.pricing);
      }
    } catch {
      // ignore
    }
  }, []);

  const totalDisplay = useMemo(() => {
    if (!pricing?.total || !pricing?.currency) return "";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: pricing.currency }).format(pricing.total);
    } catch {
      return `$${Number(pricing.total).toFixed(2)}`;
    }
  }, [pricing]);

  function handleDone() {
    try {
      // Clean any leftovers from the successful checkout
      const ctx = JSON.parse(localStorage.getItem("rt_last_payment") || "null");
      const bid = ctx?.bookingId;
      if (bid) {
        localStorage.removeItem(`rt_pending_${bid}`);
      }
      localStorage.removeItem("rt_last_payment");
      localStorage.removeItem("rt_pending_last");
      // also clear any pricing scratch
      (window as any).__lastPricing = null;

      // Clean the address bar and stay on home
      history.replaceState({}, "", "/");
    } catch {
      // ignore
    }
    onDone(); // parent resets state & shows home form
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
        <button className="mt-6 px-4 py-2 rounded-xl bg-black text-white" onClick={handleDone}>
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
