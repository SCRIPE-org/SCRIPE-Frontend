export const en = {
  guestPortal: {
    badge: "Guest Access",
    noAppRequired: "No App Required",
    eyebrow: "Guest Reservation Portal",
    title: "Booking Overview",
    reservationNumber: "Reservation Number",
    venue: "Venue",
    facility: "Facility",
    resource: "Resource",
    schedule: "Schedule & Time",
    startsAt: "Starts",
    endsAt: "Ends",
    duration: "Duration",
    timeZone: "Timezone",
    quantity: "Slots / Capacity",
    customer: "Booked For",
    instructions: "Directions & Access Instructions",
    noInstructions: "No special instructions provided by the venue.",
    status: {
      Confirmed: "Confirmed",
      CheckedIn: "Checked In",
      Completed: "Completed",
      Cancelled: "Cancelled",
      Held: "Held",
      Requested: "Requested",
      Expired: "Expired",
      Rejected: "Rejected",
      PartiallyFulfilled: "Partially Fulfilled",
      NoShow: "No Show",
    },
    finance: {
      title: "Payment Summary",
      invoiceNumber: "Invoice #",
      totalAmount: "Total Amount",
      paidAmount: "Paid",
      outstandingAmount: "Balance Due",
      status: {
        Paid: "Paid in Full",
        Pending: "Payment Pending",
        PartiallyPaid: "Partially Paid",
        Overdue: "Overdue",
      },
    },
    actions: {
      cancelBooking: "Cancel Reservation",
      cancelling: "Cancelling...",
      keepBooking: "Keep Reservation",
      confirmCancel: "Yes, Cancel Booking",
      downloadConfirmation: "Save Confirmation",
      backToHome: "Return",
    },
    cancelModal: {
      title: "Cancel this reservation?",
      description:
        "Are you sure you want to cancel reservation {{reservationNumber}}? The allocated time slot will be released immediately and made available for other guests.",
      reasonLabel: "Reason for cancellation (optional)",
      reasonPlaceholder: "e.g. Schedule conflict, change of plans...",
      warning: "This action cannot be undone once confirmed.",
    },
    messages: {
      cancelSuccess: "Your reservation has been cancelled successfully.",
      cancelFailed: "Unable to cancel reservation. Please contact the venue.",
      cancelNotEligible:
        "This booking is not eligible for self-service cancellation. Please contact the venue directly.",
    },
    errors: {
      invalidOrExpiredTitle: "Invalid or Expired Link",
      invalidOrExpiredDescription:
        "This guest access link is no longer valid. It may have expired, been revoked, or already used.",
      sessionExpiredTitle: "Session Expired",
      sessionExpiredDescription:
        "Your secure guest session has timed out. Please click the original link from your email or SMS again.",
      generalError:
        "An unexpected error occurred while loading your reservation. Please try again.",
      contactVenue:
        "If you need assistance with your booking, please contact the venue operator directly.",
    },
    loading: {
      securing: "Securing guest session...",
      loadingBooking: "Loading your reservation details...",
    },
  },
};
