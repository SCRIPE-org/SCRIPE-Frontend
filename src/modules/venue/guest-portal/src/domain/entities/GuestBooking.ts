/**
 * SCRIPE Venue — No-App Guest Experience (Layer 1)
 * Guest Booking Domain Entities & Types
 *
 * Sanitized, customer-permitted operational and presentation data.
 * Zero internal IDs, party IDs, staff notes, pricing rules, or raw bearer credentials.
 */

export interface GuestFinancialSummary {
  invoiceNumber?: string | null;
  currencyCode: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
}

export interface GuestBooking {
  reservationNumber: string;
  venueName: string;
  facilityName: string;
  resourceName: string;
  startUtc: string;
  endUtc: string;
  timeZoneId: string;
  status: string;
  quantity: number;
  customerName?: string | null;
  financialSummary?: GuestFinancialSummary | null;
  allowedActions: string[];
  canCancel: boolean;
  instructions?: string | null;
}

export interface ExchangeGuestSessionResponse {
  guestSessionToken: string;
  expiresAtUtc: string;
  reservation: GuestBooking;
}

export interface CancelGuestReservationResponse {
  reservationNumber: string;
  status: string;
}
