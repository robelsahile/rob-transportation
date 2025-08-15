
import React from 'react';
import { VehicleOption, VehicleType } from '../types';

interface VehicleSelectorProps {
  options: VehicleOption[];
  selectedVehicle: VehicleType | null;
  onSelect: (vehicle: VehicleOption) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ options, selectedVehicle, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-brand-text-light mb-3">Select Vehicle {<span className="text-red-500">*</span>}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelect(option)}
            className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl
                        ${selectedVehicle === option.id ? 'border-brand-primary ring-2 ring-brand-primary bg-sky-50' : 'border-slate-300 bg-white'}`}
          >
            <img src={option.image} alt={option.name} className="w-full h-40 object-cover rounded-md mb-3" />
            <h4 className="text-md font-semibold text-brand-text">{option.name}</h4>
            <p className="text-xs text-brand-text-light mb-1">{option.capacity}</p>
            <p className="text-sm text-brand-text-light">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelector;