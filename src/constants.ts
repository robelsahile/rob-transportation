
import { VehicleType, VehicleOption } from './types';

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { 
    id: VehicleType.SEDAN, 
    name: 'Luxury Sedan', 
    description: 'Perfect for business travelers or small groups up to 3 passengers. Comfortable, stylish, and ideal for airport transfers, business meetings, or city rides.', 
    capacity: '1-3 passengers  3 Suitcases', 
    image: 'Lincoln_continental.webp' 
  },
  { 
    id: VehicleType.SUV, 
    name: 'Premium SUV', 
    description: 'Perfect for larger groups or those requiring extra space, our SUV limo provides premium comfort, extra luggage capacity, and a smooth ride, seating up to 6 passengers.', 
    capacity: '1-5 passengers  6 Suitcases', 
    image: 'Chevrolet_suburban.webp' 
  },
  { 
    id: VehicleType.VAN, 
    name: 'Executive Van', 
    description: 'Designed for larger groups up to 14 passengers. Great for cruise transfers, events, or group outings where everyone wants to travel together hassle-free.', 
    capacity: '1-14 passengers', 
    image: 'Mercedes_sprinter_van.webp' 
  },
];

export const APP_NAME = "ROB Transportation";
