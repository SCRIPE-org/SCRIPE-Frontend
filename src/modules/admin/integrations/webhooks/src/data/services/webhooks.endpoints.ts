import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const WEBHOOKS_ENDPOINTS = {
  LIST: `${V1}/webhooks`,
  BY_ID: (id: string) => `${V1}/webhooks/${id}`,
  CREATE: `${V1}/webhooks`,
  UPDATE: (id: string) => `${V1}/webhooks/${id}`,
  DELETE: (id: string) => `${V1}/webhooks/${id}`,
  TOGGLE: (id: string) => `${V1}/webhooks/${id}/toggle`,
  ROTATE_SECRET: (id: string) => `${V1}/webhooks/${id}/rotate-secret`,
  TEST: (id: string) => `${V1}/webhooks/${id}/test`,
  DELIVERY_LOGS: (id: string) => `${V1}/webhooks/${id}/logs`,
  EVENTS: `${V1}/webhooks/events`,
  HEALTH: `${V1}/webhooks/health`,
  ANALYTICS: (id: string) => `${V1}/webhooks/${id}/analytics`,
  DEAD_LETTERS: (id: string) => `${V1}/webhooks/${id}/dead-letters`,
  REPLAY_DEAD_LETTER: (logId: string) => `${V1}/webhooks/dead-letters/${logId}/replay`,
  REPLAY_ALL_DEAD_LETTERS: (id: string) => `${V1}/webhooks/${id}/dead-letters/replay-all`,
  BULK_TOGGLE: `${V1}/webhooks/bulk-toggle`,
} as const;
