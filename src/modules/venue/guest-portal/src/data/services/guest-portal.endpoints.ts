import { V1 } from "@/core/config/api-endpoints/_shared";

export const GUEST_PORTAL_ENDPOINTS = {
  SESSION: `${V1}/venue/guest/session`,
  BOOKING: `${V1}/venue/guest/booking`,
  CANCEL: `${V1}/venue/guest/booking/cancel`,
  LOGOUT: `${V1}/venue/guest/logout`,
} as const;
