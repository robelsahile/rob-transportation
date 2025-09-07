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
  const appId = import.meta.env.VITE_SQUARE_APPLICATION_ID as string;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID as string;

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

  // Use singletons on window to survive HMR/StrictMode
  const paymentsRef = useRef<any>(null);
  const cardInst = useRef<any>(null);
  const appleInst = useRef<any>(null);
  const googleInst = useRef<any>(null);
  const cashAppInst = useRef<any>(null);

  const displayTotal = useMemo(() => `$${totalAmount.toFixed(2)}`, [totalAmount]);

  const hasIframe = (el: HTMLDivElement | null) =>
    !!el && el.querySelector("iframe") !== null;

  async function ensureAttached(instRef: React.MutableRefObject<any>, elRef: React.MutableRefObject<HTMLDivElement | null>) {
    if (!instRef.current || !elRef.current) return false;
    if (!hasIframe(elRef.current)) {
      await instRef.current.attach(elRef.current);
      // allow the iframe to render this frame
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    return hasIframe(elRef.current);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        if (!appId || !locationId) throw new Error("Missing Square Application or Location ID.");

        // 1) Get SDK from index.html
        const Square: any = (window as any).Square;
        if (!Square?.payments) throw new Error("Square SDK not found on window. Hard-refresh and ensure the script tag is present.");

        // 2) payments singleton
        if (!(window as any).__sqPayments) {
          (window as any).__sqPayments = Square.payments(appId, locationId);
        }
        paymentsRef.current = (window as any).__sqPayments;

        // 3) CARD instance (singleton)
        if (!(window as any).__sqCard) {
          (window as any).__sqCard = await paymentsRef.current.card();
        }
        cardInst.current = (window as any).__sqCard;
        if (cardRef.current) {
          await ensureAttached(cardInst, cardRef);
          setCardReady(hasIframe(cardRef.current));
        }

        // 4) APPLE PAY (if supported)
        try {
          const supported = await paymentsRef.current.applePay?.isSupported?.();
          if (supported) {
            if (!(window as any).__sqApple) {
              (window as any).__sqApple = await paymentsRef.current.applePay();
            }
            appleInst.current = (window as any).__sqApple;
            if (appleRef.current) {
              await ensureAttached(appleInst, appleRef);
              setAppleReady(hasIframe(appleRef.current));
            }
          } else {
            setAppleReady(false);
          }
        } catch { setAppleReady(false); }

        // 5) GOOGLE PAY (if supported)
        try {
          const supported = await paymentsRef.current.googlePay?.isSupported?.();
          if (supported) {
            if (!(window as any).__sqGoogle) {
              (window as any).__sqGoogle = await paymentsRef.current.googlePay();
            }
            googleInst.current = (window as any).__sqGoogle;
            if (googleRef.current) {
              await ensureAttached(googleInst, googleRef);
              setGoogleReady(hasIframe(googleRef.current));
            }
          } else {
            setGoogleReady(false);
          }
        } catch { setGoogleReady(false); }

        // 6) CASH APP PAY (if supported)
        try {
          const supported = await paymentsRef.current.cashAppPay?.isSupported?.();
          if (supported) {
            if (!(window as any).__sqCashApp) {
              (window as any).__sqCashApp = await paymentsRef.current.cashAppPay();
            }
            cashAppInst.current = (window as any).__sqCashApp;
            if (cashAppRef.current) {
              await ensureAttached(cashAppInst, cashAppRef);
              setCashAppReady(hasIframe(cashAppRef.current));
            }
          } else {
            setCashAppReady(false);
          }
        } catch { setCashAppReady(false); }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize payments");
      }
    })();
    // no cleanup: keeping instances avoids duplicate attachments in dev
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
        customerEmail,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.payment?.id as string;
  }

  async function tokenizeAndPay(kind: "card" | "apple" | "google" | "cashapp") {
    setError(null);
    setPaying(true);
    try {
      let inst: any;

      if (kind === "card") {
        if (!cardInst.current) throw new Error("Card is not ready yet.");
        const ok = await ensureAttached(cardInst, cardRef); // re-attach if HMR/StrictMode detached
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

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      <div className="grid gap-6">
        {/* Card */}
        <div>
          <div ref={cardRef} className="border rounded-2xl p-4" />
          <button
            type="button"           // <-- add this
            disabled={!cardReady || paying}
            onClick={(e) => { e.preventDefault(); tokenizeAndPay("card"); }}
            className="mt-3 w-full rounded-2xl py-3 font-medium bg-black text-white disabled:opacity-50"
          >
            Pay {displayTotal}
        </button>

        </div>

        {/* Apple Pay */}
        <div>
          <div ref={appleRef} />
          <button
            disabled={!appleReady || paying}
            onClick={() => tokenizeAndPay("apple")}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Apple Pay
          </button>
        </div>

        {/* Google Pay */}
        <div>
          <div ref={googleRef} />
          <button
            disabled={!googleReady || paying}
            onClick={() => tokenizeAndPay("google")}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Google Pay
          </button>
        </div>

        {/* Cash App Pay */}
        <div>
          <div ref={cashAppRef} />
          <button
            disabled={!cashAppReady || paying}
            onClick={() => tokenizeAndPay("cashapp")}
            className="mt-2 w-full rounded-2xl py-3 font-medium border"
          >
            Cash App Pay
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded-xl border">Back</button>
      </div>
    </div>
  );
}
