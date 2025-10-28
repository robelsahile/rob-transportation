// src/lib/pricing.ts

import { VehicleType } from "../types";

/** Tunable config: adjust these numbers anytime */
export const DEFAULT_PRICING_CONFIG = {
  currency: "USD",
  taxRate: 0.10,                // 10% tax
  airportFee: 5,                // flat fee if you want to apply based on pickup/dropoff
  freeWaitMinutes: 30,          // first 30 minutes free
  waitPerMinute: 1.00,          // after free minutes

  /** Demand / pickup time multipliers by hour of day (0–23). Missing hours default to 1.0
      Ex: early morning (5–8 AM) or evening rush (5–8 PM) could be 1.15–1.20 (15–20% higher).
  */
  pickupHourMultipliers: {
    5: 1.15, 6: 1.15, 7: 1.10, 8: 1.10,
    17: 1.20, 18: 1.20, 19: 1.15, 20: 1.10,
  } as Record<number, number>,

  /** Lead-time multipliers based on hours between booking & pickup */
  leadTimeMultipliers: [
    { maxHours: 2,   multiplier: 1.20 },   // last-minute
    { maxHours: 12,  multiplier: 1.10 },
    { maxHours: 24,  multiplier: 1.05 },
    { maxHours: 9999, multiplier: 1.00 },  // default
  ],

  /** Vehicle pricing */
  vehicles: {
    [VehicleType.SEDAN]: {
      displayName: "Luxury Sedan",
      baseFare: 10,
      minFare: 40,
      perMile: 3.25,
      perMinute: 0.70,
      includedMiles: 0,         // set to >0 if you include a mileage bundle
      includedMinutes: 0,       // set to >0 if you include a time bundle
    },
    [VehicleType.SUV]: {
      displayName: "Premium SUV",
      baseFare: 25,
      minFare: 45,
      perMile: 4.10,
      perMinute: 0.85,
      includedMiles: 0,
      includedMinutes: 0,
    },
    [VehicleType.VAN]: {
      displayName: "Executive Van",
      baseFare: 30,
      minFare: 95,
      perMile: 4.75,
      perMinute: 1.00,
      includedMiles: 0,
      includedMinutes: 0,
    },
  },
} as const;

export type PricingConfig = typeof DEFAULT_PRICING_CONFIG;

export type PricingInput = {
  vehicleType: VehicleType;
  /** Distance in kilometers */
  distanceKm: number;
  /** Duration in minutes (drive time) */
  durationMin: number;
  /** Date of pickup */
  pickupDate: Date;
  /** How many hours between “now” and pickup (for lead-time logic) */
  bookingLeadHours: number;
  /** Total tolls in currency units (pass-through) */
  tolls?: number;
  /** Waiting time in minutes at pickup beyond freeWaitMinutes */
  waitMinutes?: number;
  /** Tip as a percentage (e.g., 15 for 15%). Set 0 if you don’t want to include. */
  tipPercent?: number;
  /** Optional: add airport fee if pickup or dropoff is an airport */
  applyAirportFee?: boolean;
};

export type PricingBreakdown = {
  currency: string;
  vehicle: string;
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  pickupTimeMultiplier: number;
  leadTimeMultiplier: number;
  waitFee: number;
  tolls: number;
  airportFee: number;
  preTaxSubtotal: number;
  tax: number;
  tip: number;
  total: number;
  minFareApplied: boolean;
  notes: string[];
};

const MI_PER_KM = 0.621371;

/** Helper: get multiplier for pickup hour */
function multiplierForPickupHour(hour: number, cfg: PricingConfig): number {
  return cfg.pickupHourMultipliers[hour] ?? 1.0;
}

/** Helper: get multiplier from lead time */
function multiplierForLeadTime(leadHours: number, cfg: PricingConfig): number {
  for (const band of cfg.leadTimeMultipliers) {
    if (leadHours <= band.maxHours) return band.multiplier;
  }
  return 1.0;
}

/** Main calculator */
export function computePrice(
  input: PricingInput,
  cfg: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingBreakdown {
  const vCfg = cfg.vehicles[input.vehicleType as keyof typeof cfg.vehicles];
  if (!vCfg) throw new Error("Unknown vehicle type");

  const distanceMi = input.distanceKm * MI_PER_KM;

  const notes: string[] = [];

  // Base distance/time with optional included bundles
  const billableMiles = Math.max(0, distanceMi - (vCfg.includedMiles ?? 0));
  const billableMinutes = Math.max(0, input.durationMin - (vCfg.includedMinutes ?? 0));

  const distanceFee = round2(billableMiles * vCfg.perMile);
  const timeFee = round2(billableMinutes * vCfg.perMinute);

  let subtotal = vCfg.baseFare + distanceFee + timeFee;

  // Pickup time & lead-time multipliers
  const hour = input.pickupDate.getHours();
  const pickupMult = multiplierForPickupHour(hour, cfg);
  const leadMult = multiplierForLeadTime(input.bookingLeadHours, cfg);

  subtotal = round2(subtotal * pickupMult * leadMult);

  // Wait time
  const waitBeyondFree = Math.max(
    0,
    (input.waitMinutes ?? 0) - cfg.freeWaitMinutes
  );
  const waitFee = round2(waitBeyondFree * cfg.waitPerMinute);

  // Tolls & airport fee (pass-throughs)
  const tolls = round2(input.tolls ?? 0);
  const airportFee = round2(input.applyAirportFee ? cfg.airportFee : 0);

  // Minimum fare enforcement
  let preTaxSubtotal = subtotal + waitFee + tolls + airportFee;
  let minFareApplied = false;
  if (preTaxSubtotal < vCfg.minFare) {
    preTaxSubtotal = vCfg.minFare;
    minFareApplied = true;
  }

  // Tax
  const tax = round2(preTaxSubtotal * cfg.taxRate);

  // Tip (on pre-tax; change to include tax if preferred)
  const tip = round2((input.tipPercent ?? 0) / 100 * preTaxSubtotal);

  const total = round2(preTaxSubtotal + tax + tip);

  return {
    currency: cfg.currency,
    vehicle: vCfg.displayName,
    baseFare: vCfg.baseFare,
    distanceFee,
    timeFee,
    pickupTimeMultiplier: pickupMult,
    leadTimeMultiplier: leadMult,
    waitFee,
    tolls,
    airportFee,
    preTaxSubtotal,
    tax,
    tip,
    total,
    minFareApplied,
    notes,
  };
}

/** Helpers */
function round2(n: number) { return Math.round(n * 100) / 100; }
