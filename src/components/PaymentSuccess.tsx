// src/components/PaymentSuccess.tsx
import { useEffect, useMemo, useRef } from "react";

type Props = {
  paymentId?: string;          // optional prop (kept for compatibility)
  onDone?: () => void;         // optional prop (kept for compatibility)
};

export default function PaymentSuccess({ paymentId, onDone }: Props) {
  // 1) Read possible params Square appends on redirect.
  const { bookingId, transactionId, orderId } = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      bookingId: sp.get("bookingId") || undefined,
      transactionId: sp.get("transactionId") || undefined,
      orderId: sp.get("orderId") || undefined,
    };
  }, []);

  // 2) Call our server once to confirm payment with Square and mark the booking PAID.
  const didConfirm = useRef(false);
  useEffect(() => {
    if (didConfirm.current) return;
    didConfirm.current = true;

    // Only attempt if we have a bookingId from the redirect (safe no-op otherwise)
    if (!bookingId) return;

    // Fire and forget; we don't change the UI at all.
    fetch("/api/confirm-square", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, transactionId, orderId }),
    }).catch(() => {
      // Silently ignore; Admin list can still be checked manually.
    });
  }, [bookingId, transactionId, orderId]);

  // 3) Keep the exact same UI, showing a Payment ID if available.
  const shownPaymentId = paymentId || transactionId || orderId || "—";
  const handleDone = () => {
    if (onDone) onDone();
    else window.location.assign("/"); // safe fallback with no layout change
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment Successful 🎉</h1>
      <p className="text-gray-600">Your payment has been processed.</p>
      <p className="mt-4 text-sm text-gray-500">
        Payment ID: <span className="font-mono">{shownPaymentId}</span>
      </p>
      <button className="mt-6 px-4 py-2 rounded-xl bg-black text-white" onClick={handleDone}>
        Done
      </button>
    </div>
  );
}
