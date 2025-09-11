import React, { useMemo, useState } from "react";

type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void; // kept for future, not used in hosted checkout
};

type AppliedCoupon = {
  code: string;
  discountCents: number;
  finalCents: number;
  display: string;
};

const PaymentPage: React.FC<PaymentPageProps> = (props) => {
  const { bookingId, totalAmount, customerName, customerEmail, onBack } = props;

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  // Promo UI
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [validating, setValidating] = useState(false);

  const subtotalCents = Math.round(totalAmount * 100);
  const payCents = applied ? applied.finalCents : subtotalCents;

  const displaySubtotal = useMemo(() => `$${(subtotalCents / 100).toFixed(2)}`, [subtotalCents]);
  const displayPayTotal = useMemo(() => `$${(payCents / 100).toFixed(2)}`, [payCents]);

  async function safeParseJson(resp: Response): Promise<any> {
    try {
      const text = await resp.text();
      if (!text) return null;
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async function handleApplyPromo(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setValidating(true);
    try {
      const resp = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.trim(), subtotalCents }),
      });

      const data = await safeParseJson(resp);

      if (!resp.ok || !data?.ok) {
        const msg =
          data?.error ||
          (resp.status === 404
            ? "Coupon not found"
            : resp.status === 410
            ? "Coupon expired"
            : resp.status === 409
            ? "Coupon usage limit reached"
            : "Could not apply coupon");
        throw new Error(msg);
      }

      const next: AppliedCoupon = {
        code: data.coupon.code,
        discountCents: data.discountCents,
        finalCents: data.finalCents,
        display: data.display,
      };
      setApplied(next);
      (window as any).__appliedCoupon = next;
    } catch (err: any) {
      setApplied(null);
      (window as any).__appliedCoupon = null;
      setError(err?.message || "Could not apply coupon");
    } finally {
      setValidating(false);
    }
  }

  async function handleHostedCheckout(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      const redirectUrl = `${window.location.origin}/payment-success?bookingId=${encodeURIComponent(
        bookingId || ""
      )}`;

      const body: any = {
        amount: payCents, // cents (already discounted if coupon applied)
        bookingId,
        customerName,
        customerEmail,
        redirectUrl,
      };

      if (applied) {
        body.discountCents = applied.discountCents;
        body.couponCode = applied.code;
      }

      const resp = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Robust parsing for non-JSON error bodies
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

      {/* Promo code */}
      <form onSubmit={handleApplyPromo} className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2"
          placeholder="Promo code"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
        />
        <button
          type="submit"
          disabled={!promo.trim() || validating}
          className="rounded-2xl px-4 py-2 border font-medium disabled:opacity-50"
        >
          {validating ? "Checking…" : "Apply"}
        </button>
      </form>

      {applied && (
        <div className="mt-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
          Applied <span className="font-mono">{applied.code}</span> — {applied.display}. New total{" "}
          <span className="font-semibold">{displayPayTotal}</span>
        </div>
      )}

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
          {busy ? "Opening secure checkout…" : `Pay Securely with Square (${displayPayTotal})`}
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
