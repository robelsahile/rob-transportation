// import { useState } from "react";
import { BookingData, VehicleType } from "../types";
import Button from "./Button";
import { DEFAULT_PRICING_CONFIG } from "../lib/pricing";

type AdminDashboardProps = {
  bookings: BookingData[];
  onNavigateToCustomer: () => void;
  onRefresh: () => void;
  isLoading: boolean;
};

const formatDateTime = (dateTimeString: string | undefined | null) => {
  if (!dateTimeString) return "N/A";
  return new Date(dateTimeString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

function money(n?: number, currency = "USD") {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function AdminDashboard({
  bookings,
  onNavigateToCustomer,
  onRefresh,
  isLoading,
}: AdminDashboardProps) {
  const taxPctLabel = `${Math.round(DEFAULT_PRICING_CONFIG.taxRate * 100)}%`;

  // (kept to avoid big refactor; not used by <details/> version)
  // const [open, setOpen] = useState<Record<string, boolean>>({});
  // const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="bg-brand-surface p-4 sm:p-6 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200">
        <h2 className="text-xl font-semibold text-brand-text">Admin Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="secondary"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={onNavigateToCustomer} variant="secondary">
            New Booking
          </Button>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <p className="text-center py-10 text-brand-text-light">Loading bookings...</p>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
          <h3 className="text-lg font-medium text-brand-text-light">No Bookings Found</h3>
          <p className="text-sm text-gray-500 mt-1">The bookings list is currently empty.</p>
        </div>
      )}

      {/* Card List */}
      {!isLoading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => {
            const p = (b as any).pricing as
              | {
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
                  distanceMi?: number;
                  durationMin?: number;
                }
              | undefined;

            const currency = p?.currency || "USD";

            const vCfg =
              b.vehicleType &&
              DEFAULT_PRICING_CONFIG.vehicles[b.vehicleType as VehicleType];

            const miles =
              typeof p?.distanceMi === "number" ? p.distanceMi : undefined;
            const minutes =
              typeof p?.durationMin === "number"
                ? Math.round(p.durationMin)
                : undefined;

            const baseSubtotal =
              typeof p?.baseFare === "number" &&
              typeof p?.distanceFee === "number" &&
              typeof p?.timeFee === "number"
                ? round2(p.baseFare + p.distanceFee + p.timeFee)
                : undefined;

            const afterMultipliers =
              typeof baseSubtotal === "number" &&
              typeof p?.pickupTimeMultiplier === "number" &&
              typeof p?.leadTimeMultiplier === "number"
                ? round2(
                    baseSubtotal *
                      p.pickupTimeMultiplier *
                      p.leadTimeMultiplier
                  )
                : undefined;

            return (
              <div
                key={b.id}
                className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 sm:p-5"
              >
                {/* Top row: dates */}
                <div className="flex flex-wrap justify-between text-sm border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <strong>Booked On:</strong>{" "}
                    <span className="text-brand-text">{formatDateTime(b.created_at)}</span>
                  </div>
                  <div>
                    <strong>Trip Date:</strong>{" "}
                    <span className="text-brand-text">{formatDateTime(b.dateTime)}</span>
                  </div>
                </div>

                {/* Middle row: customer + trip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Customer */}
                  <div>
                    <h4 className="font-semibold text-brand-text mb-1">Customer</h4>
                    <div className="text-brand-text">{b.name}</div>
                    <div className="text-brand-text-light">{b.email}</div>
                    {b.phone && (
                      <div className="text-brand-text-light">{b.phone}</div>
                    )}
                  </div>

                  {/* Trip */}
                  <div>
                    <h4 className="font-semibold text-brand-text mb-1">Trip Details</h4>
                    <div className="mb-2">
                      <strong>From:</strong>
                      <div className="text-brand-text whitespace-pre-line">{b.pickupLocation}</div>
                    </div>
                    <div className="mb-2">
                      <strong>To:</strong>
                      <div className="text-brand-text whitespace-pre-line">{b.dropoffLocation}</div>
                    </div>

                    {(typeof miles === "number" || typeof minutes === "number") && (
                      <div className="mt-2 text-brand-text-light">
                        {typeof miles === "number" && (
                          <span className="mr-4">Distance: {miles.toFixed(1)} mi</span>
                        )}
                        {typeof minutes === "number" && (
                          <span>Duration: {minutes} min</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom row: vehicle + flight + passengers + vehicle selection ID */}
                <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Vehicle:</strong>{" "}
                    <span className="text-brand-text">{b.vehicleType ?? "—"}</span>
                  </div>
                  <div>
                    <strong>Flight:</strong>{" "}
                    <span className="text-brand-text">{b.flightNumber ?? "—"}</span>
                  </div>
                  <div>
                    <strong>Passengers:</strong>{" "}
                    <span className="text-brand-text">{b.passengers ?? "—"}</span>
                  </div>
                  <div>
                    <strong>Vehicle Selection ID:</strong>{" "}
                    <span className="text-brand-text font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                      {b.vehicleSelectionId ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Additional Notes */}
                {b.notes && (
                  <div className="mt-3 pt-2 border-t border-slate-200 text-sm">
                    <strong>Additional Notes:</strong>
                    <div className="text-brand-text whitespace-pre-line mt-1 bg-slate-50 p-2 rounded">
                      {b.notes}
                    </div>
                  </div>
                )}

                {/* Price (Upfront) */}
                {p && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-brand-text">Price (Upfront)</h4>
                    </div>

                    {/* Total (always visible) */}
                    <div className="mt-2 flex items-baseline justify-between">
                      <div className="text-brand-text-light text-sm">Total</div>
                      <div className="text-lg font-semibold">
                        {money(p.total, currency)}
                      </div>
                    </div>

                    {/* Collapsible details (icon-only summary) */}
                    <details className="mt-2 group">
                      <summary
                        aria-label="Toggle price details"
                        className="list-none cursor-pointer inline-flex items-center text-slate-600 hover:text-slate-900 select-none"
                      >
                        {/* Chevron icon only; rotates when open */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 transition-transform duration-200 group-open:rotate-180"
                        >
                          <path d="M12 15.5l-7-7 1.4-1.4L12 12.7l5.6-5.6L19 8.5z" />
                        </svg>
                        <span className="sr-only">Show/Hide details</span>
                      </summary>

                      <ul className="mt-2 text-sm text-slate-700 space-y-1">
                        {typeof p.baseFare === "number" && (
                          <li className="flex items-center">
                            <span>Base fare</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.baseFare, currency)}</span>
                          </li>
                        )}

                        {vCfg && typeof miles === "number" && typeof p.distanceFee === "number" && (
                          <li className="flex items-center">
                            <span>
                              Distance: {miles.toFixed(1)} mi × ${vCfg.perMile.toFixed(2)} /mi
                            </span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.distanceFee, currency)}</span>
                          </li>
                        )}

                        {vCfg && typeof minutes === "number" && typeof p.timeFee === "number" && (
                          <li className="flex items-center">
                            <span>
                              Time: {minutes} min × ${vCfg.perMinute.toFixed(2)} /min
                            </span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.timeFee, currency)}</span>
                          </li>
                        )}

                        {typeof baseSubtotal === "number" && (
                          <li className="flex items-center">
                            <span>Subtotal (before multipliers)</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(baseSubtotal, currency)}</span>
                          </li>
                        )}

                        {typeof p.pickupTimeMultiplier === "number" && (
                          <li className="flex items-center">
                            <span>Pickup-time multiplier</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>×{p.pickupTimeMultiplier.toFixed(2)}</span>
                          </li>
                        )}

                        {typeof p.leadTimeMultiplier === "number" && (
                          <li className="flex items-center">
                            <span>Lead-time multiplier</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>×{p.leadTimeMultiplier.toFixed(2)}</span>
                          </li>
                        )}

                        {typeof afterMultipliers === "number" && (
                          <li className="flex items-center">
                            <span>After multipliers</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(afterMultipliers, currency)}</span>
                          </li>
                        )}

                        {typeof p.waitFee === "number" && p.waitFee > 0 && (
                          <li className="flex items-center">
                            <span>Waiting time</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.waitFee, currency)}</span>
                          </li>
                        )}

                        {typeof p.tolls === "number" && p.tolls > 0 && (
                          <li className="flex items-center">
                            <span>Tolls</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.tolls, currency)}</span>
                          </li>
                        )}

                        {typeof p.airportFee === "number" && p.airportFee > 0 && (
                          <li className="flex items-center">
                            <span>Airport fee</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.airportFee, currency)}</span>
                          </li>
                        )}

                        {typeof p.preTaxSubtotal === "number" && (
                          <li className="flex items-center">
                            <span>Pre-tax subtotal</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.preTaxSubtotal, currency)}</span>
                          </li>
                        )}

                        {typeof p.tax === "number" && (
                          <li className="flex items-center">
                            <span>Tax ({taxPctLabel})</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.tax, currency)}</span>
                          </li>
                        )}

                        {typeof p.tip === "number" && (
                          <li className="flex items-center">
                            <span>Tip</span>
                            <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                            <span>{money(p.tip, currency)}</span>
                          </li>
                        )}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hide default summary marker in WebKit for cleaner icon-only summary */}
      <style>{`
        summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}
