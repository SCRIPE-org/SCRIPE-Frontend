import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const BOOKING_ENDPOINTS = {
  RESERVATIONS: `${V1}/Reservations`,
  RESERVATION_BY_ID: (id: string) => `${V1}/Reservations/${id}`,
  CONFIRM: (id: string) => `${V1}/Reservations/${id}/confirm`,
  CHECK_IN: (id: string) => `${V1}/Reservations/${id}/check-in`,
  COMPLETE: (id: string) => `${V1}/Reservations/${id}/complete`,
  NO_SHOW: (id: string) => `${V1}/Reservations/${id}/no-show`,
  CANCEL: (id: string) => `${V1}/Reservations/${id}/cancel`,
  RESCHEDULE: (id: string) => `${V1}/Reservations/${id}/reschedule`,
  CHANGE_RESOURCE: (id: string) => `${V1}/Reservations/${id}/change-resource`,
  HOLDS: `${V1}/booking-holds`,
  PARTIES: `${V1}/Parties`,
  PARTY_BY_ID: (id: string) => `${V1}/Parties/${id}`,
} as const;
