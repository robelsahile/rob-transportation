/// <reference types="google.maps" />

import React, { useEffect } from "react";
import { BookingFormData, VehicleOption } from "../types";
import TextInput from "./TextInput";
import DateTimePicker from "./DateTimePicker";
import VehicleSelector from "./VehicleSelector";
import Button from "./Button";
import { loadGoogleMaps } from "../lib/googleMaps";

/* ----------------------------- Types/Props ----------------------------- */
interface BookingFormProps {
  bookingDetails: BookingFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onVehicleSelect: (vehicle: VehicleOption) => void;
  onSubmit: () => void;
  vehicleOptions: VehicleOption[];
}

/* -------------------------------- Icons -------------------------------- */
const LocationMarkerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
      clipRule="evenodd"
    />
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
const PlaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.18 4.02l6.6 5.11a1 1 0 01-.42 1.76l-3.5.9-1.3 3.25a1 1 0 01-1.86-.02l-1.2-3.1-3.62-.93a1 1 0 01-.3-1.78l6.6-5.19a1 1 0 011.1 0z" />
  </svg>
);

/* ---------------- Name+Address storage + name-only display in inputs --------------- */
function formatPlaceDisplay(place: google.maps.places.PlaceResult, fallback: string) {
  const name = place.name?.trim();
  const addr = place.formatted_address?.trim();

  // Store full "name\naddress" when both exist (used later on Review/Admin).
  if (name && addr) {
    const addrLower = addr.toLowerCase();
    if (!addrLower.includes(name.toLowerCase())) return `${name}\n${addr}`;
    return addr; // already contains the name
  }
  return name || addr || fallback;
}

type AddressFieldProps = {
  label: string;
  name: "pickupLocation" | "dropoffLocation";
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
};

const AddressField: React.FC<AddressFieldProps> = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  Icon,
  required,
}) => {
  // Show only the first line (place "name") in the text overlay.
  // If there is no name, it will just show the address line.
  const displayText = value.includes("\n") ? value.split("\n")[0] : value;

  return (
    <label className="block">
      <span className="block text-sm font-medium text-brand-text-light">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative mt-1">
        <input
          name={name}
          value={value}
          onChange={onChange}
          autoComplete="off"
          required={required}
          className="w-full h-12 rounded-md border border-slate-400 bg-white pl-10 pr-3
                     text-transparent caret-brand-primary placeholder-transparent
                     focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
        {/* Overlay that shows ONLY the name (first line) if present */}
        <div className="absolute inset-0 flex items-center rounded-md pl-10 pr-3 pointer-events-none">
          <div className={`truncate text-sm ${value ? "text-brand-text" : "text-slate-400"}`}>
            {value ? displayText : placeholder}
          </div>
        </div>
      </div>
    </label>
  );
};

/* -------------------------------- Component ------------------------------- */
const BookingForm: React.FC<BookingFormProps> = ({
  bookingDetails,
  onInputChange,
  onVehicleSelect,
  onSubmit,
  vehicleOptions,
}) => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) {
      console.error("Google Maps API key missing. Put it in .env.local as VITE_GOOGLE_MAPS_API_KEY");
      return;
    }

    loadGoogleMaps(apiKey).then(() => {
      const pickupInput = document.querySelector<HTMLInputElement>("input[name='pickupLocation']");
      const dropoffInput = document.querySelector<HTMLInputElement>("input[name='dropoffLocation']");

      if (pickupInput) {
        const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
          fields: ["formatted_address", "geometry", "name"],
        });
        pickupAutocomplete.addListener("place_changed", () => {
          const place = pickupAutocomplete.getPlace();
          const value = formatPlaceDisplay(place, pickupInput.value);
          const evt = { target: { name: "pickupLocation", value } } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(evt);
        });
      }

      if (dropoffInput) {
        const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, {
          fields: ["formatted_address", "geometry", "name"],
        });
        dropoffAutocomplete.addListener("place_changed", () => {
          const place = dropoffAutocomplete.getPlace();
          const value = formatPlaceDisplay(place, dropoffInput.value);
          const evt = { target: { name: "dropoffLocation", value } } as React.ChangeEvent<HTMLInputElement>;
          onInputChange(evt);
        });
      }
    });
  }, [onInputChange]);

  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-brand-text mb-4 border-b pb-3 border-slate-200">
        Book Your Ride
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
          <AddressField
            label="Pickup Location"
            name="pickupLocation"
            value={bookingDetails.pickupLocation}
            onChange={onInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder="e.g., SeaTac International Airport"
            Icon={LocationMarkerIcon}
            required
          />
          <AddressField
            label="Drop-off Location"
            name="dropoffLocation"
            value={bookingDetails.dropoffLocation}
            onChange={onInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            placeholder="e.g., Space Needle, Seattle, WA"
            Icon={LocationMarkerIcon}
            required
          />
        </div>

        {/* Uber-like Date & Time (unchanged layout) */}
        <DateTimePicker
          name="dateTime"
          value={bookingDetails.dateTime}
          onChange={onInputChange}
          required
        />

        <div className="mb-6">
          <VehicleSelector
            options={vehicleOptions}
            selectedVehicle={bookingDetails.vehicleType}
            onSelect={onVehicleSelect}
          />
        </div>

        <h3 className="text-lg font-medium text-brand-text-light mb-3 pt-4 border-t border-slate-200">
          Your Details
        </h3>

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

        <TextInput
          label="Flight Number (optional)"
          name="flightNumber"
          value={bookingDetails.flightNumber || ""}
          onChange={onInputChange}
          placeholder="e.g., AA1234 or DL208"
          Icon={PlaneIcon}
        />

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
