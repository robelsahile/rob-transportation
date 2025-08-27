import { useCallback, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";
import AdminDashboard from "./components/AdminDashboard";
import { VEHICLE_OPTIONS } from "./constants";
import {
  BookingFormData,
  BookingData,
  VehicleOption,
  VehicleType,
} from "./types";

type View = "form" | "review" | "admin";

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

  // Confirm -> save booking and go to Admin
  const handleConfirmBooking = useCallback(() => {
    const newBooking: BookingData = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      pickupLocation: bookingDetails.pickupLocation,
      dropoffLocation: bookingDetails.dropoffLocation,
      dateTime: bookingDetails.dateTime,
      vehicleType:
        bookingDetails.vehicleType ?? VehicleType.SEDAN, // fallback
      name: bookingDetails.name,
      phone: bookingDetails.phone,
      email: bookingDetails.email,
      flightNumber: bookingDetails.flightNumber?.trim()
        ? bookingDetails.flightNumber
        : undefined,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setView("admin");
  }, [bookingDetails]);

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
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
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
            onConfirm={handleConfirmBooking}
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
