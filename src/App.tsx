import React, { useState, useCallback, useEffect } from "react";
import { BookingFormData, VehicleOption } from "./types";
import { VEHICLE_OPTIONS } from "./constants";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";

type Step = "form" | "review";

const initialBookingData: BookingFormData = {
  pickupLocation: "",
  dropoffLocation: "",
  dateTime: "",
  vehicleType: null,
  name: "",
  phone: "",
  email: "",
  flightNumber: "", // optional; keep as empty string
};

const App: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingFormData>(initialBookingData);
  const [step, setStep] = useState<Step>("form");

  useEffect(() => {
    // scroll top on step change (helps match your screenshot feel)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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

  const isWashingtonPickup = (loc: string) =>
    /,\s*WA\b/i.test(loc) || /Washington\b/i.test(loc);

  const handleSubmit = () => {
    const { pickupLocation, dropoffLocation, dateTime, vehicleType, name, phone, email } =
      bookingDetails;

    if (!pickupLocation || !dropoffLocation || !dateTime || !vehicleType || !name || !phone || !email) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!isWashingtonPickup(pickupLocation)) {
      alert("Pickup service is currently available in Washington state. Please enter a WA location.");
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

    // Go to review step
    setStep("review");
  };

  const handleEdit = () => setStep("form");

  const handleConfirm = () => {
    alert("Thank you! This is a demo — booking submission isn’t live yet.");
    // TODO: integrate backend/email when ready
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {step === "form" ? (
          <BookingForm
            bookingDetails={bookingDetails}
            onInputChange={handleInputChange}
            onVehicleSelect={handleVehicleSelect}
            onSubmit={handleSubmit}
            vehicleOptions={VEHICLE_OPTIONS}
          />
        ) : (
          <ReviewBooking data={bookingDetails} onEdit={handleEdit} onConfirm={handleConfirm} />
        )}
      </main>
      <Footer onNavigateToAdmin={() => alert("Admin view not implemented yet")} />
    </div>
  );
};

export default App;
