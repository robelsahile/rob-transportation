import { VEHICLE_OPTIONS } from "../constants";
import { BookingFormData, VehicleOption } from "../types";
import Button from "./Button";

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

export default function ReviewBooking({ data, onEdit, onConfirm }: Props) {
  const vehicle: VehicleOption | undefined = VEHICLE_OPTIONS.find(
    (v) => v.id === data.vehicleType
  );

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
            <dd className="col-span-2 text-brand-text text-right">{data.pickupLocation}</dd>
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 sm:p-4 bg-white">
            <dt className="col-span-1 text-brand-text-light">Drop-off Location</dt>
            <dd className="col-span-2 text-brand-text text-right">{data.dropoffLocation}</dd>
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

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button type="button" variant="secondary" fullWidth onClick={onEdit}>
          Edit Booking
        </Button>
        <Button type="button" variant="primary" fullWidth onClick={onConfirm}>
          Confirm &amp; Book Now
        </Button>
      </div>
    </div>
  );
}
