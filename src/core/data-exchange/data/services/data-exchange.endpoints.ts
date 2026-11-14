import { V1 } from "@core/config/api-endpoints/_shared";
import type { DataExchangeArtifactKind } from "../../domain/types";

const BASE = `${V1}/data-transfer`;

/** Route builders for SCRIPE Data Exchange Studio API endpoints. */
export const DATA_EXCHANGE_ENDPOINTS = {
  ENTITIES: `${BASE}/entities`,
  DESCRIPTOR: (entityKey: string) => `${BASE}/entities/${encodeURIComponent(entityKey)}/descriptor`,
  TEMPLATE: `${BASE}/template`,
  INSPECT: `${BASE}/inspect`,
  DRY_RUN: `${BASE}/dry-run`,
  IMPORT: `${BASE}/import`,
  EXPORT: `${BASE}/export`,
  EXPORT_JOBS: `${BASE}/export/jobs`,
  PRESETS: `${BASE}/presets`,
  PRESET_BY_ID: (id: string) => `${BASE}/presets/${encodeURIComponent(id)}`,
  JOBS: `${BASE}/jobs`,
  JOB_BY_ID: (jobId: string) => `${BASE}/jobs/${encodeURIComponent(jobId)}`,
  CANCEL_JOB: (jobId: string) => `${BASE}/jobs/${encodeURIComponent(jobId)}/cancel`,
  DOWNLOAD_ARTIFACT: (jobId: string, artifactKind: DataExchangeArtifactKind) =>
    `${BASE}/jobs/${encodeURIComponent(jobId)}/download/${encodeURIComponent(artifactKind)}`,
} as const;
