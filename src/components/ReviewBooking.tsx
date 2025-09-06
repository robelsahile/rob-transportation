/// <reference types="google.maps" />
import { useEffect, useMemo, useState, useId } from "react";
import { VEHICLE_OPTIONS } from "../constants";
import { BookingFormData, VehicleOption, VehicleType } from "../types";
import Button from "./Button";
import { computePrice, DEFAULT_PRICING_CONFIG } from "../lib/pricing";
import { getRouteMetricsKmMin } from "../lib/routeMetrics";

type Props = {
  data: BookingFormData;
  onEdit: () => void;
  onConfirm: () => void;
};

function formatDate(dt: string) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function ReviewBooking({ data, onEdit, onConfirm }: Props) {
  const vehicle: VehicleOption | undefined = VEHICLE_OPTIONS.find(
    (v) => v.id === data.vehicleType
  );

  // ---- Pricing State ----
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);

  // Adjustments (only tip is user-editable now)
  const [tipPercent, setTipPercent] = useState<number>(0);

  // Not editable here – fixed values (still passed into pricing)
  const tolls = 0;
  const waitMinutes = 0;

  // Distance & duration
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMin, setDurationMin] = useState<number>(0);

  // Final computed breakdown
  const [breakdown, setBreakdown] = useState<ReturnType<typeof computePrice> | null>(null);

  const pickupDate = useMemo(() => (data.dateTime ? new Date(data.dateTime) : null), [data.dateTime]);

  // Airport rule
  const applyAirportFee = useMemo(() => {
    const test = (s?: string) => !!s && /airport|sea\-tac|seatac/i.test(s);
    return test(data.pickupLocation) || test(data.dropoffLocation);
  }, [data.pickupLocation, data.dropoffLocation]);

  // Lead time (hours)
  const bookingLeadHours = useMemo(() => {
    if (!pickupDate) return 0;
    const now = new Date();
    return Math.max(0, (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  }, [pickupDate]);

  // 1) Fetch distance/duration
  useEffect(() => {
    (async () => {
      setDistanceKm(0);
      setDurationMin(0);
      if (!data.pickupLocation || !data.dropoffLocation) return;

      try {
        const r = await getRouteMetricsKmMin(data.pickupLocation, data.dropoffLocation);
        setDistanceKm(r.distanceKm);
        setDurationMin(r.durationMin);
      } catch {
        // keep zeros if DM not available
      }
    })();
  }, [data.pickupLocation, data.dropoffLocation]);

  // 2) Compute price on changes
  useEffect(() => {
    (async () => {
      setQuoteErr(null);
      setBreakdown(null);

      if (!pickupDate || !data.vehicleType) return;

      setLoadingQuote(true);
      try {
        const bd = computePrice(
          {
            vehicleType: data.vehicleType as VehicleType,
            distanceKm,
            durationMin,
            pickupDate,
            bookingLeadHours,
            tolls,
            tipPercent,
            waitMinutes,
            applyAirportFee,
          },
          DEFAULT_PRICING_CONFIG
        );
        setBreakdown(bd);
      } catch (err: any) {
        setQuoteErr(err?.message || "Failed to compute price");
      } finally {
        setLoadingQuote(false);
      }
    })();
  }, [
    pickupDate,
    data.vehicleType,
    distanceKm,
    durationMin,
    bookingLeadHours,
    tolls,
    tipPercent,
    waitMinutes,
    applyAirportFee,
  ]);

  // ---- Derived for display ----
  const miles = useMemo(() => distanceKm * 0.621371, [distanceKm]);
  const vehicleCfg =
    data.vehicleType ? DEFAULT_PRICING_CONFIG.vehicles[data.vehicleType as VehicleType] : null;

  const baseSubtotal =
    vehicleCfg && breakdown
      ? vehicleCfg.baseFare + breakdown.distanceFee + breakdown.timeFee
      : 0;

  const afterMultipliers =
    breakdown ? round2(baseSubtotal * breakdown.pickupTimeMultiplier * breakdown.leadTimeMultiplier) : 0;

  const TIP_PRESETS = [0, 10, 15, 18, 20, 25];
  const tipName = useId(); // radio group name

  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-brand-text mb-6 border-b pb-3 border-slate-200">
        Review Your Booking
      </h2>

      {/* Details table */}
      <div className="overflow-hidden rounded-md border border-slate-200">
        <dl className="divide-y divide-slate-200 text-sm">
          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Pickup Location</dt>
            <dd className="col-span-2 text-brand-text text-right whitespace-pre-line">
              {data.pickupLocation}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Drop-off Location</dt>
            <dd className="col-span-2 text-brand-text text-right whitespace-pre-line">
              {data.dropoffLocation}
            </dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Date &amp; Time</dt>
            <dd className="col-span-2 text-brand-text text-right">{formatDate(data.dateTime)}</dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Full Name</dt>
            <dd className="col-span-2 text-brand-text text-right">{data.name}</dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Phone</dt>
            <dd className="col-span-2 text-brand-text text-right">{data.phone}</dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Email</dt>
            <dd className="col-span-2 text-brand-text text-right">{data.email}</dd>
          </div>

          {data.flightNumber ? (
            <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
              <dt className="col-span-1 text-brand-text-light">Flight</dt>
              <dd className="col-span-2 text-brand-text text-right">{data.flightNumber}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {/* Vehicle card */}
      {vehicle && (
        <div className="mt-4 rounded-md border border-slate-200 bg-sky-50">
          <div className="flex items-center gap-4 p-3 sm:p-4">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-24 h-16 object-cover rounded-md"
            />
            <div>
              <p className="font-semibold text-brand-text">{vehicle.name}</p>
              <p className="text-xs text-brand-text-light">{vehicle.capacity}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Card */}
      <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-text">Price (Upfront)</h3>
        </div>

        {/* Price states */}
        {loadingQuote && (
          <p className="text-sm text-brand-text-light mt-3">Calculating price…</p>
        )}
        {quoteErr && (
          <p className="text-sm text-red-600 mt-3">{quoteErr}</p>
        )}

        {/* Total (always visible) */}
        {breakdown && (
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-brand-text">
              <div className="font-medium">{breakdown.vehicle}</div>
              <div className="text-xs text-brand-text-light">
                Upfront total shown below.
              </div>
            </div>
            <div className="text-xl font-bold">
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: breakdown.currency,
              }).format(breakdown.total)}
            </div>
          </div>
        )}

        {/* Collapsible details (chevron-only) */}
        {breakdown && (
          <details className="mt-3 group">
            <summary
              aria-label="Toggle price details"
              className="list-none cursor-pointer inline-flex items-center text-slate-600 hover:text-slate-900 select-none"
            >
              {/* Chevron only; rotate when open */}
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

            {/* Trip metrics */}
            <div className="mt-2 text-sm text-slate-700">
              <div className="flex items-center">
                <span>Distance</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>{miles.toFixed(1)} mi</span>
              </div>
              <div className="flex items-center">
                <span>Estimated duration</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>{Math.round(durationMin)} min</span>
              </div>
            </div>

            {/* Calculation details — with dotted leaders */}
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              <li className="flex items-center">
                <span>Base fare</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.baseFare.toFixed(2)}</span>
              </li>

              {vehicleCfg && (
                <li className="flex items-center">
                  <span>
                    Distance: {miles.toFixed(1)} mi × ${vehicleCfg.perMile.toFixed(2)} /mi
                  </span>
                  <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                  <span>${breakdown.distanceFee.toFixed(2)}</span>
                </li>
              )}

              {vehicleCfg && (
                <li className="flex items-center">
                  <span>
                    Time: {Math.round(durationMin)} min × ${vehicleCfg.perMinute.toFixed(2)} /min
                  </span>
                  <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                  <span>${breakdown.timeFee.toFixed(2)}</span>
                </li>
              )}

              <li className="flex items-center">
                <span>Subtotal (before multipliers)</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${round2(baseSubtotal).toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Pickup-time multiplier</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>×{breakdown.pickupTimeMultiplier.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Lead-time multiplier</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>×{breakdown.leadTimeMultiplier.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>After multipliers</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${round2(afterMultipliers).toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Waiting time</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.waitFee.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Tolls</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.tolls.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Airport fee</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.airportFee.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Pre-tax subtotal</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.preTaxSubtotal.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Tax ({Math.round(DEFAULT_PRICING_CONFIG.taxRate * 100)}%)</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.tax.toFixed(2)}</span>
              </li>

              <li className="flex items-center">
                <span>Tip ({tipPercent}%)</span>
                <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-slate-300"></span>
                <span>${breakdown.tip.toFixed(2)}</span>
              </li>

              {breakdown.minFareApplied && (
                <li className="text-xs text-amber-700 flex items-center">
                  <span>Note</span>
                  <span aria-hidden className="flex-1 mx-2 border-b border-dotted border-amber-300"></span>
                  <span>Minimum fare rule applied.</span>
                </li>
              )}
            </ul>
          </details>
        )}

        {/* Adjustments — ONLY Tip (%) */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-brand-text mb-3">Adjustments</h4>

          <fieldset className="mb-0">
            <legend className="text-xs text-brand-text-light mb-2">Tip (%)</legend>
            <div className="flex flex-wrap gap-2">
              {TIP_PRESETS.map((n) => {
                const id = `tip-${n}-${tipName}`;
                const active = tipPercent === n;
                return (
                  <div key={n}>
                    <input
                      id={id}
                      type="radio"
                      name={tipName}
                      className="sr-only"
                      checked={active}
                      onChange={() => setTipPercent(n)}
                    />
                    <label
                      htmlFor={id}
                      className={
                        "px-3 py-1.5 rounded-full text-sm border cursor-pointer select-none transition " +
                        (active
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400")
                      }
                      title={`Set tip to ${n}%`}
                    >
                      {n}%
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <p className="text-xs text-slate-500 mt-3">
            Changes update the upfront total automatically.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button type="button" variant="secondary" fullWidth onClick={onEdit}>
          Edit Booking
        </Button>
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={() => {
            if (breakdown) {
              (window as any).__lastPricing = {
                ...breakdown,
                distanceMi: Number(miles.toFixed(1)),
                durationMin,
              };
            }
            onConfirm();
          }}
          disabled={!breakdown}
        >
          Confirm &amp; Book Now
        </Button>
      </div>

      {/* Hide default summary marker in WebKit for cleaner icon-only summary */}
      <style>{`summary::-webkit-details-marker { display: none; }`}</style>
    </div>
  );
}
