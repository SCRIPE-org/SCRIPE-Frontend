import { V1 } from "@/core/config/api-endpoints/_shared";

export const INSTALLED_ENDPOINTS = {
  INSTALLED: `${V1}/plugins/installed`,
  UNINSTALL: (installationId: string) => `${V1}/plugins/installed/${installationId}`,
  ACTIVATE: (installationId: string) => `${V1}/plugins/installed/${installationId}/activate`,
  DEACTIVATE: (installationId: string) => `${V1}/plugins/installed/${installationId}/deactivate`,
  UPGRADE: (installationId: string) => `${V1}/plugins/installed/${installationId}/upgrade`,
} as const;
