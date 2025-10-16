import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "./StripePaymentForm";

type PaymentPageProps = {
  bookingId: string;
  totalAmount: number; // USD
  customerName?: string;
  customerEmail?: string;
  passengers?: number;
  notes?: string;
  onBack: () => void;
  onPaid: (paymentId: string) => void;
};

// Initialize Stripe (loaded once)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const PaymentPage: React.FC<PaymentPageProps> = (props) => {
  const { bookingId, totalAmount, customerName, customerEmail, passengers, notes, onBack, onPaid } = props;

  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const subtotalCents = Math.round(totalAmount * 100);
  const displaySubtotal = useMemo(() => `$${(subtotalCents / 100).toFixed(2)}`, [subtotalCents]);

  // Pull the chosen vehicle name from window.__lastPricing
  const vehicleName =
    typeof (window as any)?.__lastPricing?.vehicle === "string" &&
    (window as any).__lastPricing.vehicle.trim()
      ? (window as any).__lastPricing.vehicle.trim()
      : "Private Ride";

  // Create PaymentIntent on component mount
  useEffect(() => {
    (async () => {
      setError(null);
      setLoading(true);

      try {
        const body = {
          amount: subtotalCents,
          bookingId,
          customerName,
          customerEmail,
          vehicleName,
          passengers,
          notes,
        };

        const resp = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await resp.json();

        if (!resp.ok) {
          const msg = data.error || data.message || "Failed to initialize payment.";
          throw new Error(msg);
        }

        if (!data.clientSecret) {
          throw new Error("No client secret returned from payment initialization.");
        }

        setClientSecret(data.clientSecret);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to initialize payment.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [subtotalCents, bookingId, customerName, customerEmail, vehicleName]);

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#000000",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#ef4444",
      fontFamily: "system-ui, -apple-system, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-1">Payment</h1>
      <p className="text-sm text-gray-500">
        Complete your payment securely below. Total:{" "}
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

      {loading && (
        <div className="mt-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Initializing secure payment...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</div>
      )}

      {!loading && !error && clientSecret && (
        <div className="mt-6">
          <Elements stripe={stripePromise} options={options}>
            <StripePaymentForm 
              onSuccess={onPaid} 
              onBack={onBack}
              displayTotal={displaySubtotal}
            />
          </Elements>
        </div>
      )}

      {!loading && !error && !clientSecret && (
        <button onClick={onBack} className="mt-6 px-4 py-2 rounded-xl border">
          Back
        </button>
      )}

      <p className="mt-4 text-xs text-gray-400">
        * Your payment information is processed securely by Stripe. We never store your card details.
      </p>
    </div>
  );
};

export default PaymentPage;
