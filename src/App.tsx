import React, { useState, useCallback } from 'react';
import { BookingFormData, VehicleOption } from './types';
import { VEHICLE_OPTIONS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingForm from './components/BookingForm';

const initialBookingData: BookingFormData = {
  pickupLocation: '',
  dropoffLocation: '',
  dateTime: '',
  vehicleType: null,
  name: '',
  phone: '',
  email: '',
  flightNumber: '', // optional, controlled input
};

const handleNavigateToAdmin = () => {
  alert('Admin view not implemented yet');
};

// ✅ Helper: allow anywhere in Washington State, avoid Washington DC
function isWashingtonAddress(address: string) {
  if (!address) return false;
  const a = address.toLowerCase();
  const hasWA =
    a.includes(', wa') ||
    a.endsWith(' wa') ||
    a.includes(', wa ') ||
    a.includes(' wa,');
  const hasWashingtonWord = a.includes(' washington');
  const isDC = a.includes('washington, dc') || a.includes(' dc');
  return (hasWA || hasWashingtonWord) && !isDC;
}

const App: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingFormData>(initialBookingData);

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

  const handleSubmit = () => {
    const { pickupLocation, dropoffLocation, dateTime, vehicleType, name, phone, email } =
      bookingDetails;

    // Required fields
    if (!pickupLocation || !dropoffLocation || !dateTime || !vehicleType || !name || !phone || !email) {
      alert('Please fill in all required fields.');
      return;
    }

    // WA-only check for pickup
    if (!isWashingtonAddress(pickupLocation)) {
      alert('Pickup service is available only within Washington State. Please enter a valid WA location.');
      return;
    }

    // Basic email + phone checks
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!/^\+?[0-9\s-]{10,}$/.test(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    // Success (demo)
    alert('Thank you for your interest! This is a demonstration and booking submission is not active.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <BookingForm
          bookingDetails={bookingDetails}
          onInputChange={handleInputChange}
          onVehicleSelect={handleVehicleSelect}
          onSubmit={handleSubmit}
          vehicleOptions={VEHICLE_OPTIONS}
        />
      </main>
      <Footer onNavigateToAdmin={handleNavigateToAdmin} />
    </div>
  );
};

export default App;
