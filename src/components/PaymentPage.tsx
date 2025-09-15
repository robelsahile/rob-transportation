import React, { useMemo, useState } from "react";

type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void; // reserved for future, not used in hosted checkout
};

const PaymentPage: React.FC<PaymentPageProps> = (props) => {
  const { bookingId, totalAmount, customerName, customerEmail, onBack } = props;

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const subtotalCents = Math.round(totalAmount * 100);
  const displaySubtotal = useMemo(() => `$${(subtotalCents / 100).toFixed(2)}`, [subtotalCents]);

  // NEW: read the chosen vehicle name from the last pricing breakdown (set on Review step)
  const vehicleName = useMemo(() => {
    const v = (window as any)?.__lastPricing?.vehicle;
    return (typeof v === "string" && v.trim()) ? v.trim() : "Private Ride";
  }, []);

  async function handleHostedCheckout(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      const redirectUrl = `${window.location.origin}/payment-success?bookingId=${encodeURIComponent(
        bookingId || ""
      )}`;

      // Only send subtotal; Square will provide the coupon field in hosted checkout
      const body = {
        amount: subtotalCents,
        bookingId,
        customerName,
        customerEmail,
        redirectUrl,
        // NEW: send the vehicle name so the order summary shows the selected vehicle
        vehicleName,
        // Optional: best-effort title hint (Square uses line item + reference id for header)
        orderTitle: bookingId ? `Booking Id - ${bookingId}` : undefined,
      };

      const resp = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await resp.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;

      if (!resp.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          text ||
          "Failed to start checkout.";
        throw new Error(msg);
      }

      const url = data?.payment_link?.url || data?.url;
      if (!url) throw new Error("No payment link returned.");
      window.location.href = url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start checkout.";
      setError(msg);
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-1">Payment</h1>
      <p className="text-sm text-gray-500">
        Secure checkout will open on Square. Subtotal:{" "}
        <span className="font-semibold">{displaySubtotal}</span>
      </p>

      <div className="mt-2 text-sm text-gray-500">
        <div>
          Name: <span className="font-medium">{customerName || "Guest"}</span>
        </div>
        <div>
          Email: <span className="font-medium">{customerEmail || "N/A"}</span>
        </div>
        {bookingId && (
          <div>
            Booking ID: <span className="font-mono">{bookingId}</span>
          </div>
        )}
      </div>

      {/* Promo box removed — Square will show "Add coupon" on checkout page */}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={handleHostedCheckout}
          disabled={busy}
          className="w-full rounded-2xl py-3 font-medium bg-black text-white disabled:opacity-50"
        >
          {busy ? "Opening secure checkout…" : `Pay Securely with Square (${displaySubtotal})`}
        </button>

        <button onClick={onBack} className="px-4 py-2 rounded-xl border mt-4">
          Back
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * You’ll be redirected to Square’s secure checkout. After payment you’ll
        come back here. Discounts or coupon codes can be entered there.
      </p>
    </div>
  );
};

export default PaymentPage;
