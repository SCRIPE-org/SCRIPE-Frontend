import type { Metadata } from "next";
import { GuestBookingPortalView } from "@modules/venue/guest-portal/src/presentation/views/GuestBookingPortalView";

export const metadata: Metadata = {
  title: "Guest Reservation — SCRIPE",
  description:
    "View your reservation details, facility directions, and manage your booking.",
  robots: { index: false, follow: false },
};

/**
 * /bookings/guest — SCRIPE Venue No-App Guest Experience
 *
 * Public entrypoint for guest reservations.
 * Securely exchanges fragment-delivered bearer tokens (#<token>) for short-lived sessions
 * and displays sanitized, customer-permitted operational details without requiring app installation or account creation.
 */
export default function GuestBookingPage() {
  return <GuestBookingPortalView />;
}
