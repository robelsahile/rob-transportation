import { BookingData } from "../types";
import Button from "./Button";

type AdminDashboardProps = {
  bookings: BookingData[];
  onNavigateToCustomer: () => void;
  isLoading: boolean;
};

const formatDateTime = (dateTimeString: string) => {
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
    <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6 border-b pb-3 border-slate-200">
        <h2 className="text-2xl font-semibold text-brand-text">Admin Dashboard</h2>
        <Button onClick={onNavigateToCustomer} variant="secondary">
          New Booking
        </Button>
      </div>

      {isLoading && (
        <p className="text-center py-10 text-brand-text-light">Loading bookings...</p>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
          <h3 className="text-lg font-medium text-brand-text-light">No Bookings Found</h3>
          <p className="text-sm text-gray-500 mt-1">The bookings list is currently empty.</p>
        </div>
      )}

      {!isLoading && bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                  Trip Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-text-light uppercase tracking-wider">
                  Booked On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-brand-text">{b.name}</div>
                    <div className="text-sm text-brand-text-light">{b.email}</div>
                    <div className="text-sm text-brand-text-light">{b.phone}</div>
                  </td>
                  {/* Trip Details */}
                  <td className="px-6 py-4 text-sm text-brand-text-light">
                    <div className="font-semibold text-brand-text">
                      From:{" "}
                      <span className="font-normal whitespace-pre-line">
                        {b.pickupLocation}
                      </span>
                    </div>
                    <div className="font-semibold text-brand-text">
                      To:{" "}
                      <span className="font-normal whitespace-pre-line">
                        {b.dropoffLocation}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    {b.vehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-light">
                    {formatDateTime(b.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
