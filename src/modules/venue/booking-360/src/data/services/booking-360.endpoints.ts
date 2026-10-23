/**
 * API endpoints for Booking 360 module.
 */
export const BOOKING_360_ENDPOINTS = {
  OPERATIONAL_DETAIL: (reservationId: string) =>
    `/v1/reservations/${encodeURIComponent(reservationId)}/operational-detail`,
  GUEST_ACCESS: (reservationId: string) =>
    `/v1/reservations/${encodeURIComponent(reservationId)}/guest-access`,
  GUEST_ACCESS_SEND: (reservationId: string) =>
    `/v1/reservations/${encodeURIComponent(reservationId)}/guest-access/send`,
} as const;
