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
  price?: number; // if you plan to show prices later
}

// Full booking record stored in admin/dashboard
export interface BookingData {
  id: string;
  created_at: string;
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  vehicleType: VehicleType; // ✅ required once saved
  name: string;
  phone: string;
  email: string;
  flightNumber?: string; // optional
}

// For form use (before saving)
export type BookingFormData = Omit<BookingData, 'id' | 'created_at' | 'vehicleType'> & {
  vehicleType: VehicleType | null; // ✅ form can start with null
};
