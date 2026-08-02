import { V1 } from "@/core/config/api-endpoints/_shared";

export const OAUTH_APPS_ENDPOINTS = {
  LIST: `${V1}/oauth-applications`,
  BY_ID: (id: string) => `${V1}/oauth-applications/${id}`,
  CREATE: `${V1}/oauth-applications`,
  UPDATE: (id: string) => `${V1}/oauth-applications/${id}`,
  DELETE: (id: string) => `${V1}/oauth-applications/${id}`,
  REGENERATE_SECRET: (id: string) => `${V1}/oauth-applications/${id}/regenerate-secret`,
} as const;
