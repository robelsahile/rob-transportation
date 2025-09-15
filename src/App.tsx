// App.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import { VEHICLE_OPTIONS } from "./constants";
import {
  BookingFormData,
  BookingData,
  VehicleOption,
  VehicleType,
} from "./types";

type View = "form" | "review" | "payment" | "success" | "admin";

const initialBooking: BookingFormData = {
  pickupLocation: "",
  dropoffLocation: "",
  dateTime: "",
  vehicleType: null,
  name: "",
  phone: "",
  email: "",
  flightNumber: "",
};

/* ------------------- Booking ID generator ------------------- */
function generateBookingId(lastName: string, counter: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const datePart = `${year}${month}${day}`;
  const namePart = (lastName || "CUST").slice(0, 3).toUpperCase();
  const counterPart = String(counter).padStart(4, "0");

  return `${datePart}-${namePart}-${counterPart}`;
}

export default function App() {
  const [view, setView] = useState<View>("form");
  const [bookingDetails, setBookingDetails] =
    useState<BookingFormData>(initialBooking);

  // in-memory list so Admin has something to show
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // payments flow
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  // admin auth state (persisted via localStorage set by AdminLogin)
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => localStorage.getItem("rob_admin_authed") === "1"
  );

  const vehicleOptions: VehicleOption[] = useMemo(() => VEHICLE_OPTIONS, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setBookingDetails((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleVehicleSelect = useCallback((vehicle: VehicleOption) => {
    setBookingDetails((prev) => ({ ...prev, vehicleType: vehicle.id }));
  }, []);

  const handleSubmit = useCallback(() => {
    const {
      pickupLocation,
      dropoffLocation,
      dateTime,
      vehicleType,
      name,
      phone,
      email,
    } = bookingDetails;

    if (
      !pickupLocation ||
      !dropoffLocation ||
      !dateTime ||
      !vehicleType ||
      !name ||
      !phone ||
      !email
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\+?[0-9\s-]{10,}$/.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }

    setView("review");
  }, [bookingDetails]);

  const handleConfirmFromReview = useCallback(async () => {
    const pricing = (window as any)?.__lastPricing || {};
    const total =
      typeof pricing.total === "number"
        ? pricing.total
        : typeof pricing.grandTotal === "number"
        ? pricing.grandTotal
        : Number(pricing?.summary?.total) || 0;

    if (!total || Number.isNaN(total)) {
      alert("Could not determine total price. Please review your booking again.");
      return;
    }

    setLastTotal(total);

    // 🔹 Fetch the next global booking counter from the server
    let counter = 1;
    try {
      const res = await fetch("/api/booking-counter");
      if (res.ok) {
        const data = await res.json();
        counter = data?.nextCounter ?? 1;
      } else {
        console.error("Failed to fetch booking counter:", res.status);
      }
    } catch (e) {
      console.error("Error fetching booking counter:", e);
    }

    // Derive last name (fallback "CUST")
    const lastName = bookingDetails.name.trim().split(" ").slice(-1)[0] || "CUST";
    const newId = generateBookingId(lastName, counter);
    setBookingId(newId);

    // ✅ Stash pending booking (for post-redirect rehydrate)
    try {
      const pending = {
        details: bookingDetails,
        pricing: (window as any)?.__lastPricing || null,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`rt_pending_${newId}`, JSON.stringify(pending));
      // remember the last one explicitly (helps us find the right key)
      localStorage.setItem("rt_pending_last", newId);
    } catch {
      // ignore storage errors
    }

    setView("payment");
  }, [bookingDetails]);

  const handleSaveBooking = useCallback(
    (pricing: any) => {
      const newBooking: BookingData = {
        id: bookingId, // use custom ID
        created_at: new Date().toISOString(),
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation,
        dateTime: bookingDetails.dateTime,
        vehicleType: bookingDetails.vehicleType ?? VehicleType.SEDAN,
        name: bookingDetails.name,
        phone: bookingDetails.phone,
        email: bookingDetails.email,
        flightNumber: bookingDetails.flightNumber?.trim()
          ? bookingDetails.flightNumber
          : undefined,
        pricing,
      };
      setBookings((prev) => [newBooking, ...prev]);
    },
    [bookingDetails, bookingId]
  );

  const handleNavigateToAdmin = useCallback(() => {
    setView("admin");
  }, []);

  const handleNavigateToCustomer = useCallback(() => {
    setView("form");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("rob_admin_authed");
    setIsAuthed(false);
    setView("form");
  }, []);

  // --------------------------
  // SAVE TO DB (POST)
  // --------------------------
  const postBookingToApi = useCallback(
    async (pricing: any) => {
      try {
        // Pick up any coupon that PaymentPage stored on window (kept for compatibility)
        const applied = (window as any).__appliedCoupon || null;

        const payload = {
          bookingId, // custom ID
          pickupLocation: bookingDetails.pickupLocation,
          dropoffLocation: bookingDetails.dropoffLocation,
          dateTime: bookingDetails.dateTime,
          vehicleType: bookingDetails.vehicleType ?? VehicleType.SEDAN,
          name: bookingDetails.name,
          phone: bookingDetails.phone,
          email: bookingDetails.email,
          flightNumber: bookingDetails.flightNumber?.trim() || null,
          pricing,
          appliedCouponCode: applied?.code || null,
          discountCents: applied?.discountCents || 0,
        };

        await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Failed to persist booking:", err);
      }
    },
    [bookingDetails, bookingId]
  );

  // --------------------------------------------
  // Hook POST into your existing payment success
  // --------------------------------------------
  const handlePaymentSuccess = useCallback(
    (pid: string) => {
      setPaymentId(pid);
      const pricing = (window as any)?.__lastPricing;

      // Persist to DB (fire-and-forget)
      if (pricing) postBookingToApi(pricing);

      // Keep your in-memory list too (useful for immediate UI)
      if (pricing) handleSaveBooking(pricing);

      setView("success");
    },
    [handleSaveBooking, postBookingToApi]
  );

  // --------------------------------
  // LOAD FROM DB (Admin GET)
  // --------------------------------
  useEffect(() => {
    const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;

    if (view !== "admin" || !isAuthed) return;

    (async () => {
      setIsLoadingBookings(true);
      try {
        const res = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN ?? ""}`,
          },
        });
        if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
        const json = await res.json();
        setBookings(json.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingBookings(false);
      }
    })();
  }, [view, isAuthed]);

  /* ------------------------------------------------------------
     NEW: On first load, if we’re on /payment-success, confirm,
     clean the URL, and show the success view (no query string).
     ------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== "/payment-success") return;

      const url = new URL(window.location.href);
      const orderId = url.searchParams.get("orderId") || "";
      const transactionId = url.searchParams.get("transactionId") || "";

      // Find the pending booking id we created pre-redirect
      let pendingId = localStorage.getItem("rt_pending_last") || "";
      if (!pendingId) {
        // Fallback: choose the most-recent rt_pending_* key
        let latestKey = "";
        let latestTime = 0;
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("rt_pending_")) {
            try {
              const obj = JSON.parse(localStorage.getItem(k) || "null");
              const t = Date.parse(obj?.createdAt || "");
              if (t && t > latestTime) {
                latestTime = t;
                latestKey = k;
              }
            } catch {}
          }
        }
        if (latestKey) pendingId = latestKey.replace("rt_pending_", "");
      }

      // Confirm with backend to obtain a canonical paymentId (if possible)
      let confirmedPaymentId = "";
      try {
        const resp = await fetch("/api/confirm-square", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId || undefined,
            transactionId: transactionId || undefined,
            bookingId: pendingId || undefined,
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          confirmedPaymentId = j?.paymentId || j?.transactionId || "";
        }
      } catch (e) {
        console.error("confirm-square failed:", e);
      }

      // Save a tiny context and clean the address bar
      try {
        localStorage.setItem(
          "rt_last_payment",
          JSON.stringify({ bookingId: pendingId, orderId, transactionId, paymentId: confirmedPaymentId })
        );
        history.replaceState({}, "", "/payment-success"); // <= removes ?orderId=... etc
      } catch {}

      // Rehydrate pending booking (for success screen + persistence)
      try {
        const pending = JSON.parse(localStorage.getItem(`rt_pending_${pendingId}`) || "null");
        if (pending?.details) {
          setBookingDetails(pending.details);
          // make pricing available to the page if needed
          (window as any).__lastPricing = pending.pricing || null;

          if (pending.pricing) {
            // ensure DB has the record too
            postBookingToApi(pending.pricing);
            handleSaveBooking(pending.pricing);
          }
        }
      } catch {}

      // Finally show success view
      setPaymentId(confirmedPaymentId || transactionId || orderId || "PAID");
      setView("success");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Header onNavigateHome={() => setView("form")} />

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
        {view === "form" && (
          <BookingForm
            bookingDetails={bookingDetails}
            onInputChange={handleInputChange}
            onVehicleSelect={handleVehicleSelect}
            onSubmit={handleSubmit}
            vehicleOptions={vehicleOptions}
          />
        )}

        {view === "review" && (
          <ReviewBooking
            data={bookingDetails}
            onEdit={() => setView("form")}
            onConfirm={handleConfirmFromReview}
          />
        )}

        {view === "payment" && (
          <PaymentPage
            bookingId={bookingId}
            totalAmount={lastTotal}
            customerName={`${bookingDetails.name}`.trim()}
            customerEmail={bookingDetails.email}
            onBack={() => setView("review")}
            onPaid={handlePaymentSuccess}
          />
        )}

        {view === "success" && (
          <div className="space-y-6">
            <PaymentSuccess
              paymentId={paymentId}
              onDone={() => setView("form")}
            />
          </div>
        )}

        {view === "admin" && (
          isAuthed ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Log out
                </button>
              </div>
              <AdminDashboard
                bookings={bookings}
                onNavigateToCustomer={handleNavigateToCustomer}
                isLoading={isLoadingBookings}
              />
            </div>
          ) : (
            <AdminLogin
              onSuccess={() => {
                setIsAuthed(true);
                setView("admin");
              }}
            />
          )
        )}
      </main>

      <Footer onNavigateToAdmin={handleNavigateToAdmin} />
    </div>
  );
}
