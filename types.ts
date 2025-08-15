
export enum VehicleType {
  SEDAN = 'Luxury Sedan',
  SUV = 'Premium SUV',
  VAN = 'Executive Van',
}

export interface VehicleOption {
  id: VehicleType;
  name: string;
  description: string;
  capacity: string;
  image: string;
}

export interface BookingData {
  id: string; // Unique identifier for the booking
  created_at: string; // Timestamp from the database
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  vehicleType: VehicleType | null;
  name: string;
  phone: string;
  email: string;
}

export enum BookingStep {
  FORM,
  SUMMARY,
  CONFIRMED,
}