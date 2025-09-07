import { useCallback, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";
import AdminDashboard from "./components/AdminDashboard";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import { VEHICLE_OPTIONS } from "./constants";
import {
  BookingFormData,
  BookingData,
  VehicleOption,
  VehicleType,
} from "./types";

type View = "form" | "review" | "payment" | "success" | "admin";

const initialBooking: BookingFormData = {
  pickupLocation: "",
  dropoffLocation: "",
  dateTime: "",
  vehicleType: null,
  name: "",
  phone: "",
  email: "",
  flightNumber: "",
};

export default function App() {
  const [view, setView] = useState<View>("form");
  const [bookingDetails, setBookingDetails] =
    useState<BookingFormData>(initialBooking);

  // simple in-memory “DB” of bookings so Admin can show something
  const [bookings, setBookings] = useState<BookingData[]>([]);

  // NEW: state for payments flow
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  const vehicleOptions: VehicleOption[] = useMemo(() => VEHICLE_OPTIONS, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setBookingDetails((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleVehicleSelect = useCallback((vehicle: VehicleOption) => {
    setBookingDetails((prev) => ({ ...prev, vehicleType: vehicle.id }));
  }, []);

  // Go to review page after validating required fields
  const handleSubmit = useCallback(() => {
    const { pickupLocation, dropoffLocation, dateTime, vehicleType, name, phone, email } =
      bookingDetails;

    if (
      !pickupLocation ||
      !dropoffLocation ||
      !dateTime ||
      !vehicleType ||
      !name ||
      !phone ||
      !email
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\+?[0-9\s-]{10,}$/.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    setView("review");
  }, [bookingDetails]);

  // ✅ Keep ReviewBooking's onConfirm() signature (no args)
  //    Read the total from the pricing snapshot it already places on window.__lastPricing
  const handleConfirmFromReview = useCallback(() => {
    const pricing = (window as any)?.__lastPricing || {};
    // Try common fields your pricing object may have:
    const total =
      typeof pricing.total === "number"
        ? pricing.total
        : typeof pricing.grandTotal === "number"
        ? pricing.grandTotal
        : Number(pricing?.summary?.total) || 0;

    if (!total || Number.isNaN(total)) {
      alert("Could not determine total price. Please review your booking again.");
      return;
    }

    setLastTotal(total);
    setBookingId(crypto.randomUUID());
    setView("payment");
  }, []);

  // Save booking (called after successful payment)
  const handleSaveBooking = useCallback(
    (pricing: any) => {
      const newBooking: BookingData = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation,
        dateTime: bookingDetails.dateTime,
        vehicleType: bookingDetails.vehicleType ?? VehicleType.SEDAN,
        name: bookingDetails.name,
        phone: bookingDetails.phone,
        email: bookingDetails.email,
        flightNumber: bookingDetails.flightNumber?.trim()
          ? bookingDetails.flightNumber
          : undefined,
        pricing,
      };

      setBookings((prev) => [newBooking, ...prev]);
    },
    [bookingDetails]
  );

  // Footer link -> open Admin
  const handleNavigateToAdmin = useCallback(() => {
    setView("admin");
  }, []);

  // Admin “New Booking” -> back to form
  const handleNavigateToCustomer = useCallback(() => {
    setView("form");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Header onNavigateHome={() => setView("form")} />

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        {view === "form" && (
          <BookingForm
            bookingDetails={bookingDetails}
            onInputChange={handleInputChange}
            onVehicleSelect={handleVehicleSelect}
            onSubmit={handleSubmit}
            vehicleOptions={vehicleOptions}
          />
        )}

        {view === "review" && (
          <ReviewBooking
            data={bookingDetails}
            onEdit={() => setView("form")}
            // ⬇️ no-arg handler expected by your current ReviewBooking Props
            onConfirm={handleConfirmFromReview}
          />
        )}

        {view === "payment" && (
          <PaymentPage
            bookingId={bookingId}
            totalAmount={lastTotal}
            customerName={`${bookingDetails.name}`.trim()}
            customerEmail={bookingDetails.email}
            onBack={() => setView("review")}
            onPaid={(pid) => {
              setPaymentId(pid);
              // store the pricing snapshot captured on review
              const pricing = (window as any)?.__lastPricing;
              if (pricing) handleSaveBooking(pricing);
              setView("success");
            }}
          />
        )}

        {view === "success" && (
          <PaymentSuccess
            paymentId={paymentId}
            onDone={() => setView("form")}
          />
        )}

        {view === "admin" && (
          <AdminDashboard
            bookings={bookings}
            onNavigateToCustomer={handleNavigateToCustomer}
            isLoading={false}
          />
        )}
      </main>

      <Footer onNavigateToAdmin={handleNavigateToAdmin} />
    </div>
  );
}
