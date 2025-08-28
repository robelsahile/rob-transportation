import React from "react";
import { VehicleOption, VehicleType } from "../types";

type Props = {
  options: VehicleOption[];
  selectedVehicle: VehicleType | null;
  onSelect: (vehicle: VehicleOption) => void;
};

const VehicleSelector: React.FC<Props> = ({ options, selectedVehicle, onSelect }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-brand-text-light mb-3">
        Select Vehicle <span className="text-red-500">*</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 sm:px-1 mt-4 mb-8">
        {options.map((option) => {
          const isSelected = selectedVehicle === option.id;

          return (
      <button
        key={option.id}
        type="button"
        onClick={() => onSelect(option)}
        className={[
          // base card
          "w-full text-left rounded-lg p-4 bg-white transition-all duration-200 ease-in-out transform",
          // default border + shadow
          "border border-slate-300 shadow-md",
          // selected vs hover
          isSelected
            ? "border-2 border-brand-primary ring-2 ring-brand-primary bg-sky-50 scale-104"
            : "hover:scale-104 hover:shadow-xl hover:ring-0 hover:ring-brand-primary",
          "cursor-pointer focus:outline-none"
        ].join(" ")}
      >
        <img
          src={option.image}
          alt={option.name}
          className="w-full h-49 object-cover rounded-md mb-4"
        />
        <h4 className="text-lg font-semibold text-brand-text mb-1">{option.name}</h4>
        <p className="text-sm text-brand-text-light mb-2">{option.capacity}</p>
        <p className="text-sm text-brand-text-light leading-snug">{option.description}</p>
      </button>
    );
        })}
      </div>
    </div>
  );
};

export default VehicleSelector;
