
import { VehicleType, VehicleOption } from './types';

export const VEHICLE_OPTIONS: VehicleOption[] = [
  { 
    id: VehicleType.SEDAN, 
    name: 'Luxury Sedan', 
    description: 'Experience unparalleled comfort and style, perfect for executives and couples seeking a refined journey.', 
    capacity: '1-3 passengers', 
    image: 'https://picsum.photos/seed/luxesedan/600/400' 
  },
  { 
    id: VehicleType.SUV, 
    name: 'Premium SUV', 
    description: 'Spacious, versatile, and powerful, our premium SUVs offer a commanding presence and ample room for families or groups.', 
    capacity: '1-5 passengers', 
    image: 'https://picsum.photos/seed/luxesuv/600/400' 
  },
  { 
    id: VehicleType.VAN, 
    name: 'Executive Van', 
    description: 'The ultimate choice for larger groups requiring sophisticated travel, combining luxury with generous space and amenities.', 
    capacity: '1-7 passengers', 
    image: 'https://picsum.photos/seed/luxevan/600/400' 
  },
];

export const APP_NAME = "ROB Transportation";
