import { useEffect, useMemo, useRef, useState } from "react";

export type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void;
};

export default function PaymentPage({
  bookingId,
  totalAmount,
  customerName,
  customerEmail,
  onBack,
  onPaid,
}: PaymentPageProps) {
  const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID as string | undefined;
  const locationId = import_meta_env("VITE_SQUARE_LOCATION_ID") as string | undefined;
  const env = import.meta.env.VITE_SQUARE_ENV as string | undefined;

  // 🔎 Frontend ENV: visible + console
  const mask = (v?: string) => (v ? v.slice(0, 6) + "…" : "(missing)");
  console.log("Square Frontend Env", { appId, locationId, env });

  function import_meta_env(key: string) {
    return (import.meta as any).env?.[key];
  }

  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const [cardReady, setCardReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [cashAppReady, setCashAppReady] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const appleRef = useRef<HTMLDivElement>(null);
  const googleRef = useRef<HTMLDivElement>(null);
  const cashAppRef = useRef<HTMLDivElement>(null);

  const paymentsRef = useRef<any>(null);
  const cardInst = useRef<any>(null);
  const appleInst = useRef<any>(null);
  const googleInst = useRef<any>(null);
  const cashAppInst = useRef<any>(null);

  const displayTotal = useMemo(() => `$${totalAmount.toFixed(2)}`, [totalAmount]);

  const containerHasIframe = (el: HTMLDivElement | null) =>
    !!el && el.querySelector("iframe") !== null;

  async function ensureAttached(
    instRef: React.MutableRefObject<any>,
    elRef: React.MutableRefObject<HTMLDivElement | null>
  ) {
    if (!instRef.current || !elRef.current) return false;
    if (!containerHasIframe(elRef.current)) {
      await instRef.current.attach(elRef.current);
    }
    return containerHasIframe(elRef.current);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        if (!appId || !locationId) {
          throw new Error("Missing Square Application or Location ID (.env.local / Vercel env).");
        }

        const Square: any = (window as any).Square;
        if (!Square?.payments) {
          throw new Error('Square SDK not found. Ensure <script src="https://sandbox.web.squarecdn.com/v1/square.js"> is in index.html, then hard-refresh.');
        }

        if (!(window as any).__sqPayments) {
          (window as any).__sqPayments = Square.payments(appId, locationId);
        }
        paymentsRef.current = (window as any).__sqPayments;

        // CARD
        if (!cardInst.current) cardInst.current = await paymentsRef.current.card();
        if (cardRef.current && !containerHasIframe(cardRef.current)) {
          await cardInst.current.attach(cardRef.current);
        }
        setCardReady(!!containerHasIframe(cardRef.current));

        // APPLE
        try {
          const supported = await paymentsRef.current.applePay?.isSupported?.();
          if (supported) {
            if (!appleInst.current) appleInst.current = await paymentsRef.current.applePay();
            if (appleRef.current && !containerHasIframe(appleRef.current)) {
              await appleInst.current.attach(appleRef.current);
            }
            setAppleReady(!!containerHasIframe(appleRef.current));
          } else {
            setAppleReady(false);
          }
        } catch { setAppleReady(false); }

        // GOOGLE
        try {
          const supported = await paymentsRef.current.googlePay?.isSupported?.();
          if (supported) {
            if (!googleInst.current) googleInst.current = await paymentsRef.current.googlePay();
            if (googleRef.current && !containerHasIframe(googleRef.current)) {
              await googleInst.current.attach(googleRef.current);
            }
            setGoogleReady(!!containerHasIframe(googleRef.current));
          } else {
            setGoogleReady(false);
          }
        } catch { setGoogleReady(false); }

        // CASH APP
        try {
          const supported = await paymentsRef.current.cashAppPay?.isSupported?.();
          if (supported) {
            if (!cashAppInst.current) cashAppInst.current = await paymentsRef.current.cashAppPay();
            if (cashAppRef.current && !containerHasIframe(cashAppRef.current)) {
              await cashAppInst.current.attach(cashAppRef.current);
            }
            setCashAppReady(!!containerHasIframe(cashAppRef.current));
          } else {
            setCashAppReady(false);
          }
        } catch { setCashAppReady(false); }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize payments");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, locationId]);

  async function sendToServer(sourceId: string) {
    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId,
        amount: Math.round(totalAmount * 100), // cents
        bookingId,
        customerName,
        customerEmail
      })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.payment?.id as string;
  }

  async function tokenizeAndPay(
    kind: "card" | "apple" | "google" | "cashapp",
    e?: React.MouseEvent
  ) {
    e?.preventDefault(); // stop any parent <form> submit
    setError(null);
    setPaying(true);
    try {
      let inst: any = null;

      if (kind === "card") {
        if (!cardInst.current) throw new Error("Card is not ready yet.");
        const ok = await ensureAttached(cardInst, cardRef);
        if (!ok) throw new Error("Card is not attached yet.");
        inst = cardInst.current;
      } else if (kind === "apple") {
        if (!appleInst.current) throw new Error("Apple Pay is not available.");
        const ok = await ensureAttached(appleInst, appleRef);
        if (!ok) throw new Error("Apple Pay not attached.");
        inst = appleInst.current;
      } else if (kind === "google") {
        if (!googleInst.current) throw new Error("Google Pay is not available.");
        const ok = await ensureAttached(googleInst, googleRef);
        if (!ok) throw new Error("Google Pay not attached.");
        inst = googleInst.current;
      } else {
        if (!cashAppInst.current) throw new Error("Cash App Pay is not available.");
        const ok = await ensureAttached(cashAppInst, cashAppRef);
        if (!ok) throw new Error("Cash App Pay not attached.");
        inst = cashAppInst.current;
      }

      const payload = await inst.tokenize();
      if (payload?.status !== "OK") {
        throw new Error(payload?.errors?.[0]?.message || "Tokenization failed");
      }

      const paymentId = await sendToServer(payload.token);
      onPaid(paymentId);
    } catch (e: any) {
      setError(e?.message || "Payment error");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-2">Payment</h1>
      <p className="text-sm text-gray-500 mb-6">
        Secure checkout powered by Square. Total due:{" "}
        <span className="font-semibold">{displayTotal}</span>
      </p>

      {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>}

      <div className="grid gap-6">
        {/* Card */}
        <div>
          <div ref={cardRef} className="border rounded-2xl p-4" />
          <button
            type="button"
            disabled={!cardReady || paying}
            onClick={(e) => tokenizeAndPay("card", e)}
            className="mt-3 w-full rounded-2xl py-3 font-medium bg-black text-white disabled:opacity-50"
          >
            Pay {displayTotal}
          </button>
        </div>

        {/* Apple Pay */}
        <div>
          <div ref={appleRef} />
          <button
            type="button"
            disabled={!appleReady || paying}
            onClick={(e) => tokenizeAndPay("apple", e)}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Apple Pay
          </button>
        </div>

        {/* Google Pay */}
        <div>
          <div ref={googleRef} />
          <button
            type="button"
            disabled={!googleReady || paying}
            onClick={(e) => tokenizeAndPay("google", e)}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Google Pay
          </button>
        </div>

        {/* Cash App Pay */}
        <div>
          <div ref={cashAppRef} />
          <button
            type="button"
            disabled={!cashAppReady || paying}
            onClick={(e) => tokenizeAndPay("cashapp", e)}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Cash App Pay
          </button>
        </div>
      </div>

      {/* 🔎 Tiny debug footer (remove later) */}
      <div className="mt-6 text-xs text-gray-500">
        <div className="inline-block rounded-lg border px-3 py-2 bg-white">
          <div><strong>ENV (frontend)</strong></div>
          <div>VITE_SQUARE_APPLICATION_ID: {mask(appId)}</div>
          <div>VITE_SQUARE_LOCATION_ID: {mask(locationId)}</div>
          <div>VITE_SQUARE_ENV: {env || "(missing)"}</div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded-xl border">Back</button>
      </div>
    </div>
  );
}
