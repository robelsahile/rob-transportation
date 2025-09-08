import React, { useMemo, useState } from "react";

type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void;
};

const PaymentPage: React.FC<PaymentPageProps> = ({
  bookingId,
  totalAmount,
  onBack,
  onPaid,
}: PaymentPageProps) => {
  // 👆 notice: we don’t destructure customerName or customerEmail here

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayTotal = useMemo(() => `$${totalAmount.toFixed(2)}`, [totalAmount]);

  const formValid =
    cardNumber.replace(/\s+/g, "").length >= 12 &&
    /\d{2}\/\d{2}/.test(expiry) &&
    cvv.length >= 3 &&
    zip.length >= 5;

  async function handlePayClick() {
    setError(null);
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const fakeId = `test_${Date.now()}_${bookingId || "no_booking"}`;
      onPaid(fakeId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-2">Payment</h1>
      <p className="text-sm text-gray-500 mb-6">
        This is a preview of the checkout UI. Total due:{" "}
        <span className="font-semibold">{displayTotal}</span>
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      <div className="grid gap-6">
        <div className="border rounded-2xl p-4 bg-white">
          <label className="block text-sm text-gray-600 mb-1">Card number</label>
          <input
            className="w-full border rounded-xl px-3 py-2 mb-3"
            placeholder="4111 1111 1111 1111"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">MM/YY</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                placeholder="12/28"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CVV</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                placeholder="123"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">ZIP</label>
              <input
                className="w-full border rounded-xl px-3 py-2"
                placeholder="98188"
                inputMode="numeric"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!formValid || busy}
          onClick={handlePayClick}
          className="mt-1 w-full rounded-2xl py-3 font-medium bg-black text-white disabled:opacity-50"
        >
          {busy ? "Processing…" : `Pay ${displayTotal}`}
        </button>

        <button type="button" disabled className="w-full rounded-2xl py-3 font-medium border opacity-60">
          Apple Pay (coming soon)
        </button>
        <button type="button" disabled className="w-full rounded-2xl py-3 font-medium border opacity-60">
          Google Pay (coming soon)
        </button>
        <button type="button" disabled className="w-full rounded-2xl py-3 font-medium border opacity-60">
          Cash App Pay (coming soon)
        </button>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded-xl border">
          Back
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * This page is UI-only. Real payments will be enabled later.
      </p>
    </div>
  );
};

export default PaymentPage;
