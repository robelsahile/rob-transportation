import { BookingData } from "../types";
import Button from "./Button";

type AdminDashboardProps = {
  bookings: BookingData[];
  onNavigateToCustomer: () => void;
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
  });
};

export default function AdminDashboard({
  bookings,
  onNavigateToCustomer,
  isLoading,
}: AdminDashboardProps) {
  return (
    <div className="bg-brand-surface p-4 sm:p-6 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200">
        <h2 className="text-xl font-semibold text-brand-text">Admin Dashboard</h2>
        <Button onClick={onNavigateToCustomer} variant="secondary">
          New Booking
        </Button>
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
          {bookings.map((b) => (
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
                </div>
              </div>

              {/* Bottom row: vehicle + flight */}
              <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Vehicle:</strong>{" "}
                  <span className="text-brand-text">{b.vehicleType ?? "—"}</span>
                </div>
                <div>
                  <strong>Flight:</strong>{" "}
                  <span className="text-brand-text">{b.flightNumber ?? "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
