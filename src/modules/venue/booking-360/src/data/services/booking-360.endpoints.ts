/**
 * Documentation for module export
 */
export const BOOKING_360_ENDPOINTS = {
  OPERATIONAL_DETAIL: (reservationId: string) =>
    `/v1/reservations/${encodeURIComponent(reservationId)}/operational-detail`,
} as const;
