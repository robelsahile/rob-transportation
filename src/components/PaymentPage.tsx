import React, { useMemo, useState } from "react";

type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void; // kept for future, not used in hosted checkout
};

const PaymentPage: React.FC<PaymentPageProps> = (props) => {
  // Note: we intentionally do NOT destructure `onPaid` because we don't use it in Hosted Checkout
  const { bookingId, totalAmount, customerName, customerEmail, onBack } = props;

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const displayTotal = useMemo(() => `$${totalAmount.toFixed(2)}`, [totalAmount]);

  async function handleHostedCheckout(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      // where Square redirects after payment
      const redirectUrl = `${window.location.origin}/payment-success?bookingId=${encodeURIComponent(
        bookingId || ""
      )}`;

      const resp = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // cents
          bookingId,
          customerName,
          customerEmail,
          redirectUrl,
        }),
      });

      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      const url = data?.url as string | undefined;
      if (!url) throw new Error("No payment link returned.");

      // Go to Square Hosted Checkout
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
        Secure checkout will open on Square. Total due:{" "}
        <span className="font-semibold">{displayTotal}</span>
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
          {busy ? "Opening secure checkout…" : `Pay Securely with Square (${displayTotal})`}
        </button>

        <button onClick={onBack} className="px-4 py-2 rounded-xl border mt-4">
          Back
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * You’ll be redirected to Square’s secure checkout. After payment you’ll
        come back here.
      </p>
    </div>
  );
};

export default PaymentPage;
