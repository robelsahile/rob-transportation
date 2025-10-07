import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

type StripePaymentFormProps = {
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
  displayTotal: string;
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSuccess,
  onBack,
  displayTotal,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed. Please try again.");
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded without redirect
        console.log("Payment succeeded:", paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        // Handle other states if needed
        setErrorMessage("Payment processing. Please wait...");
        setProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err?.message || "An unexpected error occurred.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full rounded-xl py-3 font-medium bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
        >
          {processing ? "Processing..." : `Pay ${displayTotal}`}
        </button>
      </div>
    </form>
  );
};

export default StripePaymentForm;

