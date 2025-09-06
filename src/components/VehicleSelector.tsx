import React, { useState } from "react";
import { VehicleOption, VehicleType } from "../types";

type Props = {
  options: VehicleOption[];
  selectedVehicle: VehicleType | null;
  onSelect: (vehicle: VehicleOption) => void;

  /** Upfront totals computed in BookingForm per vehicle */
  upfrontTotalsByVehicle?: Partial<
    Record<VehicleType, { total: number; currency: string; airportFee: number }>
  >;
  /** Show Airport fee line on the back face */
  applyAirportFee?: boolean;
  /** Label like "10%" */
  taxPercentLabel?: string;
};

function getCapacityLabels(capacity: string | undefined) {
  // supports dashes or en-dashes: "1-5" or "1–5"
  const pMatch = capacity?.match(/([\d–-]+\s*passengers?)/i);
  const sMatch = capacity?.match(/(\d+)\s*suitcases?/i);
  return {
    passengers: pMatch ? pMatch[1] : "passengers",
    suitcases: sMatch ? `${sMatch[1]} suitcases` : "suitcases",
  };
}

function formatMoney(n: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
}

const VehicleSelector: React.FC<Props> = ({
  options,
  selectedVehicle,
  onSelect,
  upfrontTotalsByVehicle,
  applyAirportFee,
  taxPercentLabel = "10%",
}) => {
  const [flippedId, setFlippedId] = useState<VehicleType | null>(null);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-brand-text-light mb-3">
        Select Vehicle <span className="text-red-500">*</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3 sm:px-4 mt-4 mb-10">
        {options.map((option) => {
          const isSelected = selectedVehicle === option.id;
          const isFlipped = flippedId === option.id;

          const upfront = upfrontTotalsByVehicle?.[option.id as VehicleType] || null;
          const totalStr = upfront ? formatMoney(upfront.total, upfront.currency) : "—";
          const airportFeeStr = upfront ? formatMoney(upfront.airportFee, upfront.currency) : "$5.00";

          return (
            <div key={option.id} className="relative w-full [perspective:1000px] pb-2">
              {/* flipper */}
              <div
                className={[
                  "relative w-full min-h-[400px] transition-transform duration-500",
                  "[transform-style:preserve-3d] [-webkit-transform-style:preserve-3d]",
                  "[will-change:transform]",
                  isFlipped ? "[transform:rotateY(180deg)]" : "",
                ].join(" ")}
              >
                {/* FRONT */}
                <button
                  type="button"
                  onClick={() =>
                    setFlippedId((id) => (id === option.id ? null : option.id))
                  }
                  // don't let the hidden face take focus or taps
                  tabIndex={isFlipped ? -1 : 0}
                  className={[
                    "absolute inset-0 w-full text-left rounded-lg overflow-hidden",
                    "border border-slate-300 shadow-lg",
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-500 bg-sky-50"
                      : "hover:shadow-xl",
                    "cursor-pointer focus:outline-none",
                    // iOS/Safari: prevent mirrored bleed-through
                    "[backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:translateZ(0)]",
                    // only the visible face should take input
                    isFlipped ? "pointer-events-none" : "pointer-events-auto",
                  ].join(" ")}
                >
                  {/* Title + capacity */}
                  <div className="absolute top-2 left-3 right-3 z-10 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    <h4 className="text-base sm:text-lg font-semibold text-brand-text mb-1">
                      {option.name}
                    </h4>

                    {(() => {
                      const { passengers, suitcases } = getCapacityLabels(option.capacity);
                      return (
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-brand-text-light">
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                            <span>{passengers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M6 7V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v1h2v13H4V7h2zm2-1v1h8V6H8zm10 3H6v9h12V9z" />
                            </svg>
                            <span>{suitcases}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Image */}
                  <div className="absolute inset-x-0 top-16 bottom-0 p-1">
                    <img
                      src={option.image}
                      alt={option.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Flip hint */}
                  <div className="absolute inset-x-0 bottom-2 flex justify-center">
                    <span className="text-[10px] sm:text-xs text-slate-600 bg-white/80 px-2 py-0.5 rounded border">
                      Click for the price
                    </span>
                  </div>
                </button>

                {/* BACK */}
                <div
                  className={[
                    "absolute inset-0 rounded-lg p-4 bg-white",
                    "border border-slate-300 shadow-md flex flex-col",
                    "[transform:rotateY(180deg)]",
                    // iOS/Safari: prevent mirrored bleed-through
                    "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
                    // only the visible face should take input
                    !isFlipped ? "pointer-events-none" : "pointer-events-auto",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={option.image}
                      alt={`${option.name} thumbnail`}
                      className="w-24 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-brand-text">{option.name}</h4>
                      <p className="text-sm text-brand-text-light">{option.capacity}</p>
                    </div>
                  </div>

                  {option.description && (
                    <p className="text-sm text-slate-700 mt-3 leading-snug">{option.description}</p>
                  )}

                  {/* Price summary (Upfront) */}
                  <div className="mt-4 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-base font-semibold">{totalStr}</span>
                    </div>

                    <div className="mt-2 text-sm">
                      {applyAirportFee ? (
                        <div className="flex justify-between py-1 border-b">
                          <span>Airport fee</span>
                          <span>{airportFeeStr}</span>
                        </div>
                      ) : null}

                      <div className="flex justify-between py-1">
                        <span>Estimated tax</span>
                        <span>{taxPercentLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(option)}
                      className={[
                        "inline-flex items-center justify-center rounded-lg px-4 py-2",
                        "bg-brand-primary text-white font-medium shadow-md",
                        "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-primary",
                        isSelected ? "ring-2 ring-brand-primary" : "",
                      ].join(" ")}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFlippedId(null)}
                      className="ml-auto text-sm text-slate-600 underline"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleSelector;
