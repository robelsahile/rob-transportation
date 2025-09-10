// App.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
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

  // in-memory list so Admin has something to show
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // payments flow
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  // admin auth state (persisted via localStorage set by AdminLogin)
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => localStorage.getItem("rob_admin_authed") === "1"
  );

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

  const handleSubmit = useCallback(() => {
    const {
      pickupLocation,
      dropoffLocation,
      dateTime,
      vehicleType,
      name,
      phone,
      email,
    } = bookingDetails;

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

  const handleConfirmFromReview = useCallback(() => {
    const pricing = (window as any)?.__lastPricing || {};
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

  const handleNavigateToAdmin = useCallback(() => {
    setView("admin");
  }, []);

  const handleNavigateToCustomer = useCallback(() => {
    setView("form");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("rob_admin_authed");
    setIsAuthed(false);
    setView("form");
  }, []);

  // --------------------------
  // STEP 4: SAVE TO DB (POST)
  // --------------------------
  const postBookingToApi = useCallback(
    async (pricing: any) => {
      try {
        const payload = {
          pickupLocation: bookingDetails.pickupLocation,
          dropoffLocation: bookingDetails.dropoffLocation,
          dateTime: bookingDetails.dateTime,
          vehicleType: bookingDetails.vehicleType ?? VehicleType.SEDAN,
          name: bookingDetails.name,
          phone: bookingDetails.phone,
          email: bookingDetails.email,
          flightNumber: bookingDetails.flightNumber?.trim() || null,
          pricing,
        };

        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Failed to persist booking:", err);
        // Optional: show a toast or fallback UI
      }
    },
    [bookingDetails]
  );

  // --------------------------------------------
  // Hook POST into your existing payment success
  // --------------------------------------------
  const handlePaymentSuccess = useCallback(
    (pid: string) => {
      setPaymentId(pid);
      const pricing = (window as any)?.__lastPricing;

      // Persist to DB (fire-and-forget)
      if (pricing) postBookingToApi(pricing);

      // Keep your in-memory list too (useful for immediate UI)
      if (pricing) handleSaveBooking(pricing);

      setView("success");
    },
    [handleSaveBooking, postBookingToApi]
  );

  // --------------------------------
  // STEP 5: LOAD FROM DB (Admin GET)
  // --------------------------------
  useEffect(() => {
    const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;

    if (view !== "admin" || !isAuthed) return;

    (async () => {
      setIsLoadingBookings(true);
      try {
        const res = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN ?? ""}`,
          },
        });
        if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
        const json = await res.json();
        setBookings(json.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingBookings(false);
      }
    })();
  }, [view, isAuthed]);

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
            onPaid={handlePaymentSuccess}
          />
        )}

        {view === "success" && (
          <PaymentSuccess
            paymentId={paymentId}
            onDone={() => setView("form")}
          />
        )}

        {view === "admin" && (
          isAuthed ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Log out
                </button>
              </div>
              <AdminDashboard
                bookings={bookings}
                onNavigateToCustomer={handleNavigateToCustomer}
                isLoading={isLoadingBookings}
              />
            </div>
          ) : (
            <AdminLogin
              onSuccess={() => {
                setIsAuthed(true);
                setView("admin");
              }}
            />
          )
        )}
      </main>

      <Footer onNavigateToAdmin={handleNavigateToAdmin} />
    </div>
  );
}
