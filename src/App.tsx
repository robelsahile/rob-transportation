// App.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import TestimonialsSection from "./components/TestimonialsSection";
import BookingForm from "./components/BookingForm";
import ReviewBooking from "./components/ReviewBooking";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import PaymentPage from "./components/PaymentPage";
import PaymentSuccess from "./components/PaymentSuccess";
import Blog from "./components/Blog";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import TopCities from "./components/TopCities";
import { VEHICLE_OPTIONS } from "./constants";
import {
  BookingFormData,
  BookingData,
  VehicleOption,
  VehicleType,
} from "./types";

// Custom hook to handle scroll to top functionality
function useScrollToTop() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return scrollToTop;
}

// Custom hook to handle URL routing and title updates
function useUrlRouting() {
  const updateUrlAndTitle = useCallback((view: View, blogPost?: string) => {
    const baseTitle = "ROB Transportation";
    let url = "/";
    let title = baseTitle;

    switch (view) {
      case "about":
        url = "/about-us";
        title = "About Us - " + baseTitle;
        break;
      case "blog":
        url = "/blog";
        title = "Blog - " + baseTitle;
        break;
      case "contact":
        url = "/contact";
        title = "Contact Us - " + baseTitle;
        break;
      case "cities":
        url = "/cities";
        title = "Top Cities - " + baseTitle;
        break;
      case "admin":
        url = "/admin";
        title = "Admin Dashboard - " + baseTitle;
        break;
      case "review":
        url = "/review-booking";
        title = "Review Booking - " + baseTitle;
        break;
      case "payment":
        url = "/payment";
        title = "Payment - " + baseTitle;
        break;
      case "success":
        url = "/payment-success";
        title = "Booking Success - " + baseTitle;
        break;
      case "form":
      default:
        url = "/";
        title = baseTitle;
        break;
    }

    // Handle blog post titles
    if (blogPost) {
      const postTitles: { [key: string]: string } = {
        'seattle-airport-guide': 'Seattle Airport Transportation Guide',
        'best-time-to-book': 'Best Time to Book Your Ride',
        'seattle-events': 'Seattle Area Events & Transportation'
      };
      title = (postTitles[blogPost] || 'Blog Post') + " - " + baseTitle;
      url = `/blog/${blogPost}`;
    }

    // Update URL without page reload
    window.history.pushState({}, '', url);
    
    // Update document title
    document.title = title;
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      if (path === "/about-us") {
        window.dispatchEvent(new CustomEvent('navigate-to-about'));
      } else if (path === "/blog") {
        window.dispatchEvent(new CustomEvent('navigate-to-blog'));
      } else if (path.startsWith("/blog/")) {
        const slug = path.split("/blog/")[1];
        window.dispatchEvent(new CustomEvent('navigate-to-blog-post', { detail: { slug } }));
      } else if (path === "/contact") {
        window.dispatchEvent(new CustomEvent('navigate-to-contact'));
      } else if (path === "/cities") {
        window.dispatchEvent(new CustomEvent('navigate-to-cities'));
      } else if (path === "/admin") {
        window.dispatchEvent(new CustomEvent('navigate-to-admin'));
      } else if (path === "/review-booking") {
        window.dispatchEvent(new CustomEvent('navigate-to-review'));
      } else if (path === "/payment") {
        window.dispatchEvent(new CustomEvent('navigate-to-payment'));
      } else if (path === "/booking-success") {
        window.dispatchEvent(new CustomEvent('navigate-to-success'));
      } else if (path === "/payment-success") {
        // Keep customers on payment success page until they click Done
        window.dispatchEvent(new CustomEvent('navigate-to-success'));
      } else {
        window.dispatchEvent(new CustomEvent('navigate-to-home'));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper function to add new pages easily
  const addNewPage = useCallback((viewName: string, urlPath: string, pageTitle: string) => {
    // This function can be used to dynamically add new pages
    // For now, it's documented for future use
    console.log(`To add new page: ${viewName} -> ${urlPath} -> ${pageTitle}`);
  }, []);

  return { updateUrlAndTitle, addNewPage };
}

type View = "form" | "review" | "payment" | "success" | "admin" | "blog" | "about" | "contact" | "cities";

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
  const [bookingDetails, setBookingDetails] = useState<BookingFormData>(initialBooking);

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [lastTotal, setLastTotal] = useState<number>(0);
  const [bookingId, setBookingId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => localStorage.getItem("rob_admin_authed") === "1"
  );

  const [resetBlog, setResetBlog] = useState<boolean>(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<string | null>(null);

  const vehicleOptions: VehicleOption[] = useMemo(() => VEHICLE_OPTIONS, []);
  const scrollToTop = useScrollToTop();
  const { updateUrlAndTitle } = useUrlRouting();

  // Scroll to top whenever the view changes
  useEffect(() => {
    scrollToTop();
  }, [view, scrollToTop]);

  // Scroll to top on initial page load/refresh
  useEffect(() => {
    scrollToTop();
  }, [scrollToTop]);

  // Handle URL-based navigation events
  useEffect(() => {
    const handleNavigateToAbout = () => setView("about");
    const handleNavigateToBlog = () => {
      setView("blog");
      setSelectedBlogPost(null);
      setResetBlog(true);
      setTimeout(() => setResetBlog(false), 100);
    };
    const handleNavigateToBlogPost = (event: CustomEvent) => {
      const slug = event.detail.slug;
      setView("blog");
      setSelectedBlogPost(slug);
      setResetBlog(false);
    };
    const handleNavigateToContact = () => setView("contact");
    const handleNavigateToCities = () => setView("cities");
    const handleNavigateToAdmin = () => setView("admin");
    const handleNavigateToReview = () => setView("review");
    const handleNavigateToPayment = () => setView("payment");
    const handleNavigateToSuccess = () => setView("success");
    const handleNavigateToHome = () => setView("form");

    window.addEventListener('navigate-to-about', handleNavigateToAbout);
    window.addEventListener('navigate-to-blog', handleNavigateToBlog);
    window.addEventListener('navigate-to-blog-post', handleNavigateToBlogPost as EventListener);
    window.addEventListener('navigate-to-contact', handleNavigateToContact);
    window.addEventListener('navigate-to-cities', handleNavigateToCities);
    window.addEventListener('navigate-to-admin', handleNavigateToAdmin);
    window.addEventListener('navigate-to-review', handleNavigateToReview);
    window.addEventListener('navigate-to-payment', handleNavigateToPayment);
    window.addEventListener('navigate-to-success', handleNavigateToSuccess);
    window.addEventListener('navigate-to-home', handleNavigateToHome);

    return () => {
      window.removeEventListener('navigate-to-about', handleNavigateToAbout);
      window.removeEventListener('navigate-to-blog', handleNavigateToBlog);
      window.removeEventListener('navigate-to-blog-post', handleNavigateToBlogPost as EventListener);
      window.removeEventListener('navigate-to-contact', handleNavigateToContact);
      window.removeEventListener('navigate-to-cities', handleNavigateToCities);
      window.removeEventListener('navigate-to-admin', handleNavigateToAdmin);
      window.removeEventListener('navigate-to-review', handleNavigateToReview);
      window.removeEventListener('navigate-to-payment', handleNavigateToPayment);
      window.removeEventListener('navigate-to-success', handleNavigateToSuccess);
      window.removeEventListener('navigate-to-home', handleNavigateToHome);
    };
  }, []);

  // Update URL and title when view changes
  useEffect(() => {
    console.log("View changed to:", view);
    if (selectedBlogPost) {
      updateUrlAndTitle("blog", selectedBlogPost);
    } else {
      updateUrlAndTitle(view);
    }
  }, [view, selectedBlogPost, updateUrlAndTitle]);

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
    const { pickupLocation, dropoffLocation, dateTime, vehicleType, name, phone, email } = bookingDetails;

    if (!pickupLocation || !dropoffLocation || !dateTime || !vehicleType || !name || !phone || !email) {
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

    let counter = 1;
    try {
      const res = await fetch("/api/booking-counter");
      if (res.ok) {
        const data = await res.json();
        counter = data?.nextCounter ?? 1;
      }
    } catch {}

    const lastName = bookingDetails.name.trim().split(" ").slice(-1)[0] || "CUST";
    const newId = generateBookingId(lastName, counter);
    setBookingId(newId);

    try {
      const pending = {
        details: bookingDetails,
        pricing: (window as any)?.__lastPricing || null,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`rt_pending_${newId}`, JSON.stringify(pending));
      localStorage.setItem("rt_pending_last", newId);
    } catch {}

    setView("payment");
  }, [bookingDetails]);

  const handleSaveBooking = useCallback(
    (pricing: any) => {
      const newBooking: BookingData = {
        id: bookingId,
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

  const handleNavigateToAdmin = useCallback(() => setView("admin"), []);
  const handleNavigateToCustomer = useCallback(() => setView("form"), []);
  const handleNavigateToBlog = useCallback(() => {
    setView("blog");
    setResetBlog(true);
    // Reset the flag after a short delay to allow the Blog component to react
    setTimeout(() => setResetBlog(false), 100);
  }, []);
  const handleNavigateToAbout = useCallback(() => setView("about"), []);
  const handleNavigateToContact = useCallback(() => setView("contact"), []);
  const handleNavigateToCities = useCallback(() => setView("cities"), []);
  const handleLogout = useCallback(() => {
    localStorage.removeItem("rob_admin_authed");
    setIsAuthed(false);
    setView("form");
  }, []);

  const postBookingToApi = useCallback(
    async (pricing: any) => {
      try {
        const payload = {
          bookingId,
          pickupLocation: bookingDetails.pickupLocation,
          dropoffLocation: bookingDetails.dropoffLocation,
          dateTime: bookingDetails.dateTime,
          vehicleType: bookingDetails.vehicleType ?? VehicleType.SEDAN,
          name: bookingDetails.name,
          phone: bookingDetails.phone,
          email: bookingDetails.email,
          flightNumber: bookingDetails.flightNumber?.trim() || null,
          pricing,
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

  const handlePaymentSuccess = useCallback(
    async (pid: string) => {
      setPaymentId(pid);
      const pricing = (window as any)?.__lastPricing;
      
      // Save booking data for email
      const bookingData = {
        id: bookingId,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        pickupLocation: bookingDetails.pickupLocation,
        dropoffLocation: bookingDetails.dropoffLocation,
        dateTime: bookingDetails.dateTime,
        vehicleType: bookingDetails.vehicleType,
        flightNumber: bookingDetails.flightNumber,
        pricing: pricing
      };

      // Send confirmation email
      try {
        console.log("Sending confirmation email for booking:", bookingId);
        const emailResponse = await fetch('/api/send-receipt-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookingData,
            paymentId: pid
          })
        });
        
        if (emailResponse.ok) {
          console.log("Confirmation email sent successfully");
        } else {
          const errorText = await emailResponse.text();
          console.error("Failed to send confirmation email:", errorText);
        }
      } catch (error) {
        console.error("Error sending confirmation email:", error);
      }

      postBookingToApi(pricing ?? null);     // always post
      if (pricing) handleSaveBooking(pricing);

      setView("success");
    },
    [bookingDetails, bookingId, handleSaveBooking, postBookingToApi]
  );

  // Handle /payment-success return path from Square
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== "/payment-success") return;

      const url = new URL(window.location.href);
      const orderId = url.searchParams.get("orderId") || "";
      const transactionId = url.searchParams.get("transactionId") || "";
      const paymentId = url.searchParams.get("paymentId") || "";
      const bookingId = url.searchParams.get("bookingId") || "";
      const hasCtx = !!localStorage.getItem("rt_last_payment");
      
      console.log("Payment success redirect params:", {
        orderId,
        transactionId,
        paymentId,
        bookingId,
        allParams: Object.fromEntries(url.searchParams.entries())
      });

      // If we have bookingId from URL but no other payment params, try to find the booking data
      if (bookingId && !orderId && !transactionId && !paymentId && !hasCtx) {
        console.log("Found bookingId in URL, looking for booking data:", bookingId);
        try {
          const pendingData = JSON.parse(localStorage.getItem(`rt_pending_${bookingId}`) || "null");
          if (pendingData?.details) {
            console.log("Found pending booking data, setting up payment success");
            setBookingDetails(pendingData.details);
            (window as any).__lastPricing = pendingData.pricing || null;
            setPaymentId("PAYMENT-SUCCESS-" + Date.now());
            setView("success");
            return;
          }
        } catch (e) {
          console.error("Error parsing pending booking data:", e);
        }
      }

      if (!orderId && !transactionId && !paymentId && !bookingId && !hasCtx) {
        console.log("No payment parameters found, redirecting to form");
        history.replaceState({}, "", "/");
        setView("form");
        return;
      }

      try {
        const resp = await fetch("/api/confirm-square", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId || undefined,
            transactionId: transactionId || undefined,
            paymentId: paymentId || undefined,
            bookingId: bookingId || localStorage.getItem("rt_pending_last") || undefined,
          }),
        });
        const j = resp.ok ? await resp.json() : null;

        try {
          localStorage.setItem(
            "rt_last_payment",
            JSON.stringify({
              bookingId: bookingId || localStorage.getItem("rt_pending_last") || null,
              orderId,
              transactionId,
              paymentId: j?.paymentId || j?.transactionId || "",
            })
          );
          // Keep the URL as /payment-success to maintain the confirmation page
          history.replaceState({}, "", "/payment-success");
        } catch {}

        try {
          const pendingId = bookingId || localStorage.getItem("rt_pending_last") || "";
          const pending = JSON.parse(localStorage.getItem(`rt_pending_${pendingId}`) || "null");
          if (pending?.details) {
            setBookingDetails(pending.details);
            (window as any).__lastPricing = pending.pricing || null;
            
            // Save to admin dashboard first
            console.log("Saving booking to admin dashboard (redirect flow):", pendingId);
            try {
              const adminPayload = {
                bookingId: pendingId,
                pickupLocation: pending.details.pickupLocation,
                dropoffLocation: pending.details.dropoffLocation,
                dateTime: pending.details.dateTime,
                vehicleType: pending.details.vehicleType,
                name: pending.details.name,
                phone: pending.details.phone,
                email: pending.details.email,
                flightNumber: pending.details.flightNumber?.trim() || null,
                pricing: pending.pricing || null,
              };

              const adminResponse = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(adminPayload),
              });

              if (adminResponse.ok) {
                console.log("Booking saved to admin dashboard successfully (redirect flow)");
              } else {
                const errorText = await adminResponse.text();
                console.error("Failed to save booking to admin dashboard (redirect flow):", errorText);
              }
            } catch (adminError) {
              console.error("Error saving booking to admin dashboard (redirect flow):", adminError);
            }
            
            // Send confirmation email for redirect flow
            try {
              console.log("Sending confirmation email for redirect booking:", pendingId);
              const emailResponse = await fetch('/api/send-receipt-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: pendingId,
                  customerName: pending.details.name,
                  customerEmail: pending.details.email,
                  customerPhone: pending.details.phone,
                  pickupLocation: pending.details.pickupLocation,
                  dropoffLocation: pending.details.dropoffLocation,
                  dateTime: pending.details.dateTime,
                  vehicleType: pending.details.vehicleType,
                  flightNumber: pending.details.flightNumber,
                  pricing: pending.pricing,
                  paymentId: j?.paymentId || j?.transactionId || paymentId || "PAID"
                })
              });
              
              if (emailResponse.ok) {
                console.log("Confirmation email sent successfully (redirect flow)");
              } else {
                const errorText = await emailResponse.text();
                console.error("Failed to send confirmation email (redirect flow):", errorText);
              }
            } catch (emailError) {
              console.error("Error sending confirmation email (redirect flow):", emailError);
            }
            
            postBookingToApi(pending.pricing ?? null); // post even if null pricing
            if (pending.pricing) handleSaveBooking(pending.pricing);
          }
        } catch {}

        setPaymentId(j?.paymentId || transactionId || orderId || "PAID");
        // Ensure we show the confirmation page
        setView("success");
        console.log("Payment success processed, showing confirmation page", {
          paymentId: j?.paymentId || transactionId || orderId || "PAID",
          view: "success"
        });
      } catch (e) {
        console.error("Payment success processing failed:", e);
        history.replaceState({}, "", "/");
        setView("form");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle initial page load for payment success (in case user refreshes or bookmarks the page)
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      if (window.location.pathname !== "/payment-success") return;
      
      // Check if we already have payment data in localStorage
      const hasPaymentData = localStorage.getItem("rt_last_payment");
      if (hasPaymentData) {
        console.log("Payment success page loaded with existing data, showing confirmation");
        setView("success");
      } else {
        // If no payment data but we're on payment-success, keep them on the success page
        // This prevents automatic redirect to home page on refresh
        console.log("No payment data found, staying on payment success page");
        setPaymentId("PAYMENT-" + Date.now());
        setView("success");
      }
    })();
  }, []);

  // Admin list loader
  const loadAdminBookings = useCallback(async () => {
    const ADMIN_TOKEN = ((): string | undefined => {
      try {
        return localStorage.getItem("rob_admin_token") || (import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined);
      } catch {
        return import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;
      }
    })();
    
    console.log("Loading admin bookings...");
    setIsLoadingBookings(true);
    try {
      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN ?? ""}` },
      });
      console.log("Admin API response:", { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Admin API error response:", errorText);
        throw new Error(`Failed to load bookings (${res.status}): ${errorText}`);
      }
      
      const json = await res.json();
      console.log("Admin API success:", { bookingsCount: json.bookings?.length || 0, bookings: json.bookings });
      setBookings(json.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setBookings([]); // Ensure we show empty state on error
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    console.log("Admin loader effect triggered:", { view, isAuthed });
    
    if (view !== "admin" || !isAuthed) {
      console.log("Skipping admin data load:", { view, isAuthed });
      return;
    }
    
    // Add a small delay to ensure the admin view is fully rendered
    const timer = setTimeout(() => {
      loadAdminBookings();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [view, isAuthed, loadAdminBookings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigateHome={() => setView("form")} />

      {/* Mobile Layout - Hero section first, then booking form */}
      {view === "form" && (
        <div className="block md:hidden">
          <HeroSection />
          <div className="container mx-auto px-4 sm:px-8 py-4 max-w-5xl">
            <BookingForm
              bookingDetails={bookingDetails}
              onInputChange={handleInputChange}
              onVehicleSelect={handleVehicleSelect}
              onSubmit={handleSubmit}
              vehicleOptions={vehicleOptions}
            />
          </div>
        </div>
      )}

      {/* Desktop Layout - Hero section first */}
      {view === "form" && (
        <div className="hidden md:block">
          <HeroSection />
          <main className="flex-grow bg-brand-bg">
            <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
              <BookingForm
                bookingDetails={bookingDetails}
                onInputChange={handleInputChange}
                onVehicleSelect={handleVehicleSelect}
                onSubmit={handleSubmit}
                vehicleOptions={vehicleOptions}
              />
            </div>
          </main>
        </div>
      )}

      <main className="flex-grow bg-brand-bg">

        {view === "review" && (
          <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
            <ReviewBooking
              data={bookingDetails}
              onEdit={() => setView("form")}
              onConfirm={handleConfirmFromReview}
            />
          </div>
        )}

        {view === "payment" && (
          <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
            <PaymentPage
              bookingId={bookingId}
              totalAmount={lastTotal}
              customerName={`${bookingDetails.name}`.trim()}
              customerEmail={bookingDetails.email}
              onBack={() => setView("review")}
              onPaid={handlePaymentSuccess}
            />
          </div>
        )}

        {view === "success" && (
          <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
            <PaymentSuccess
              paymentId={paymentId}
              onDone={() => {
                console.log("PaymentSuccess onDone called, returning to home");
                // Reset the app to a clean home form
                setBookingDetails(initialBooking);
                setBookingId("");
                setPaymentId("");
                (window as any).__lastPricing = null;
                setView("form");
              }}
            />
          </div>
        )}

        {view === "admin" && (
          <div className="container mx-auto px-4 sm:px-8 py-8 max-w-5xl">
            {isAuthed ? (
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
                  onRefresh={loadAdminBookings}
                  isLoading={isLoadingBookings}
                />
              </div>
            ) : (
              <AdminLogin
                onSuccess={() => {
                  console.log("Admin login successful, setting auth and view");
                  setIsAuthed(true);
                  setView("admin");
                }}
              />
            )}
          </div>
        )}

        {view === "blog" && (
          <Blog 
            onNavigateHome={() => setView("form")} 
            resetToMainPage={resetBlog}
            selectedPost={selectedBlogPost}
            onPostSelect={setSelectedBlogPost}
          />
        )}

        {view === "about" && (
          <AboutUs onNavigateHome={() => setView("form")} />
        )}

        {view === "contact" && (
          <ContactUs onNavigateHome={() => setView("form")} />
        )}

        {view === "cities" && (
          <TopCities onNavigateHome={() => setView("form")} />
        )}
      </main>

      {/* Testimonials Section - Only show on main form view */}
      {view === "form" && <TestimonialsSection />}

      <Footer 
        onNavigateToAdmin={handleNavigateToAdmin}
        onNavigateToBlog={handleNavigateToBlog}
        onNavigateToAbout={handleNavigateToAbout}
        onNavigateToContact={handleNavigateToContact}
        onNavigateToCities={handleNavigateToCities}
      />
    </div>
  );
}
