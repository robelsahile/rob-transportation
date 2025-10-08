// src/types.ts

export enum VehicleType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  VAN = "VAN",
}

export interface VehicleOption {
  id: VehicleType;
  name: string;
  description: string;
  capacity: string;
  image: string;
  price?: number; // optional for future static prices
}

// Snapshot of computed pricing (stored in jsonb, may be partial/null)
export type PricingSnapshot = {
  currency?: string;
  total?: number;
  baseFare?: number;
  distanceFee?: number;
  timeFee?: number;
  pickupTimeMultiplier?: number;
  leadTimeMultiplier?: number;
  waitFee?: number;
  tolls?: number;
  airportFee?: number;
  preTaxSubtotal?: number;
  tax?: number;
  tip?: number;
  // Optional trip metrics for Admin display
  distanceMi?: number;
  durationMin?: number;
};

// Full booking record persisted in DB & shown in Admin
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
  flightNumber?: string;
  passengers?: number;
  notes?: string;
  pricing?: PricingSnapshot | null;
  vehicleSelectionId?: string; // Format: yyyyMMdd-xxx-nnnn (date-lastName-sequence)
}

// For booking form (before saving)
export type BookingFormData = Omit<
  BookingData,
  "id" | "created_at" | "vehicleType"
> & {
  vehicleType: VehicleType | null; // ✅ form can start with null
};
