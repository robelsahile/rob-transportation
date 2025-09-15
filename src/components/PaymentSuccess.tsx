export default function PaymentSuccess({ paymentId, onDone }: { paymentId: string; onDone: () => void }) {
  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Payment Successful 🎉</h1>
      <p className="text-gray-600">Your payment has been processed.</p>
      <p className="mt-4 text-sm text-gray-500">Payment ID: <span className="font-mono">{paymentId}</span></p>
      <button className="mt-6 px-4 py-2 rounded-xl bg-black text-white" onClick={onDone}>Done</button>
    </div>
  );
}
