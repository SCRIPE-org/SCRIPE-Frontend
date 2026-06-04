import { V1 } from "./_shared";

export const PLUGINS_ENDPOINTS = {
  PLUGINS: {
    CATALOG: `${V1}/plugins/catalog`,
    CATALOG_BY_ID: (id: string) => `${V1}/plugins/catalog/${id}`,
    INSTALLED: `${V1}/plugins/installed`,
    INSTALL: `${V1}/plugins/install`,
    UNINSTALL: (installationId: string) => `${V1}/plugins/installed/${installationId}`,
    ACTIVATE: (installationId: string) => `${V1}/plugins/installed/${installationId}/activate`,
    DEACTIVATE: (installationId: string) => `${V1}/plugins/installed/${installationId}/deactivate`,
    UPGRADE: (installationId: string) => `${V1}/plugins/installed/${installationId}/upgrade`,
    LOGS: (installationId: string) => `${V1}/plugins/installed/${installationId}/logs`,
    SETTINGS: (installationId: string) => `${V1}/plugins/installed/${installationId}/settings`,
    DEFINITIONS: `${V1}/plugins/definitions`,
    DATA_STORE: (installationId: string, ns: string) =>
      `${V1}/plugin-api/v1/data/${installationId}/${ns}`,
    DATA_STORE_KEY: (installationId: string, ns: string, key: string) =>
      `${V1}/plugin-api/v1/data/${installationId}/${ns}/${key}`,
  },
};
