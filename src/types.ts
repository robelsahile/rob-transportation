// src/types.ts
export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  VAN = 'VAN',
}

export interface VehicleOption {
  id: VehicleType;
  name: string;
  description: string;
  capacity: string;
  image: string;
}

// Full booking record (if you ever store it)
export interface BookingData {
  id: string;
  created_at: string;
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  vehicleType: VehicleType | null;
  name: string;
  phone: string;
  email: string;
  flightNumber?: string; // optional
}

// 👇 Use this for the form everywhere
export type BookingFormData = Omit<BookingData, 'id' | 'created_at'>;
