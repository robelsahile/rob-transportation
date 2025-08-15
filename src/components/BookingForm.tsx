import React from 'react';
import { BookingData, VehicleOption } from '../../types';
import TextInput from './TextInput';
import DateTimePicker from './DateTimePicker';
import VehicleSelector from "./VehicleSelector";
import Button from "./Button";


interface BookingFormProps {
  bookingDetails: Omit<BookingData, 'id' | 'created_at'>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  onSubmit: () => void;
  vehicleOptions: VehicleOption[];
}

// Placeholder icons (simple SVG paths)
const LocationMarkerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);
const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);
const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M2.003 5.884L10 11.884l7.997-6M2 12h.01M2 15h.01M4 15h.01M6 15h.01M8 15h.01M10 15h.01M12 15h.01M14 15h.01M16 15h.01M18 15h.01M20 15h.01M2.992 18h14.016a2 2 0 002-2V6a2 2 0 00-2-2H2.992a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BookingForm: React.FC<BookingFormProps> = ({ bookingDetails, onInputChange, onVehicleSelect, onSubmit, vehicleOptions }) => {
  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-brand-text mb-6 border-b pb-3 border-slate-200">Book Your Ride</h2>
      
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <TextInput
            label="Pickup Location"
            name="pickupLocation"
            value={bookingDetails.pickupLocation}
            onChange={onInputChange}
            placeholder="e.g., Space Needle, Seattle, WA"
            required
            Icon={LocationMarkerIcon}
          />
          <TextInput
            label="Drop-off Location"
            name="dropoffLocation"
            value={bookingDetails.dropoffLocation}
            onChange={onInputChange}
            placeholder="e.g., 123 Main St, Bellevue"
            required
            Icon={LocationMarkerIcon}
          />
        </div>

        <DateTimePicker
          label="Date & Time"
          name="dateTime"
          value={bookingDetails.dateTime}
          onChange={onInputChange}
          required
        />

        <VehicleSelector
          options={vehicleOptions}
          selectedVehicle={bookingDetails.vehicleType}
          onSelect={onVehicleSelect}
        />

        <h3 className="text-lg font-medium text-brand-text-light mb-3 pt-4 border-t border-slate-200">Your Details</h3>
        <TextInput
          label="Full Name"
          name="name"
          value={bookingDetails.name}
          onChange={onInputChange}
          placeholder="e.g., John Doe"
          required
          Icon={UserIcon}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <TextInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={bookingDetails.phone}
            onChange={onInputChange}
            placeholder="e.g., (555) 123-4567"
            required
            Icon={PhoneIcon}
          />
          <TextInput
            label="Email Address"
            name="email"
            type="email"
            value={bookingDetails.email}
            onChange={onInputChange}
            placeholder="e.g., john.doe@example.com"
            required
            Icon={EnvelopeIcon}
          />
        </div>

        <div className="mt-8">
          <Button type="submit" fullWidth variant="primary">
            Review Booking
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;