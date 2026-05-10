import { V1 } from "./_shared";

export const WEBHOOKS_ENDPOINTS = {
  WEBHOOKS: {
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
    // Phase 7: Analytics & Health
    HEALTH: `${V1}/webhooks/health`,
    ANALYTICS: (id: string) => `${V1}/webhooks/${id}/analytics`,
    // Phase 7: Dead Letter Queue
    DEAD_LETTERS: (id: string) => `${V1}/webhooks/${id}/dead-letters`,
    REPLAY_DEAD_LETTER: (logId: string) => `${V1}/webhooks/dead-letters/${logId}/replay`,
    REPLAY_ALL_DEAD_LETTERS: (id: string) => `${V1}/webhooks/${id}/dead-letters/replay-all`,
    // Phase 7: Bulk Operations
    BULK_TOGGLE: `${V1}/webhooks/bulk-toggle`,
  },
};
