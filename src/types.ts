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

// Represents the data captured by the form in the simplified app
export interface BookingFormData {
  pickupLocation: string;
  dropoffLocation: string;
  dateTime: string;
  vehicleType: VehicleType | null;
  name: string;
  phone: string;
  email: string;
}