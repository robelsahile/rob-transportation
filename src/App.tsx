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
};

const handleNavigateToAdmin = () => {
  // if you have routing or state for admin, do it here
  // e.g., setStep('admin') or navigate('/admin')
  alert('Admin view not implemented yet'); // placeholder
};

const App: React.FC = () => {
  const [bookingDetails, setBookingDetails] = useState<BookingFormData>(initialBookingData);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleVehicleSelect = useCallback((vehicle: VehicleOption) => {
    setBookingDetails(prev => ({ ...prev, vehicleType: vehicle.id }));
  }, []);

  const handleSubmit = () => {
    // In this simplified version, we just validate and show an alert.
    const { pickupLocation, dropoffLocation, dateTime, vehicleType, name, phone, email } = bookingDetails;
    if (!pickupLocation || !dropoffLocation || !dateTime || !vehicleType || !name || !phone || !email) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!pickupLocation.toLowerCase().includes('seattle')) {
      alert("Pickup service is currently available only in the Seattle area. Please enter a valid Seattle location.");
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
    
    alert("Thank you for your interest! This is a demonstration and booking submission is not active.");
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