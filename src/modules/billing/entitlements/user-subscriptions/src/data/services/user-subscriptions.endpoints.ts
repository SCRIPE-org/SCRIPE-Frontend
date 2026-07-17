import { V1 } from "@/core/config/api-endpoints/_shared";

export const USER_SUBSCRIPTIONS_ENDPOINTS = {
  LIST: `${V1}/user-subscriptions`,
  BY_ID: (id: string) => `${V1}/user-subscriptions/${id}`,
  CREATE: `${V1}/user-subscriptions`,
  CANCEL: (id: string) => `${V1}/user-subscriptions/${id}/cancel`,
  RENEW: (id: string) => `${V1}/user-subscriptions/${id}/renew`,
  ME: `${V1}/user-subscriptions/me`,
  CHANGE_PLAN: (id: string) => `${V1}/user-subscriptions/${id}/change-plan`,
  USERS_LIST: `${V1}/Users`,
} as const;
