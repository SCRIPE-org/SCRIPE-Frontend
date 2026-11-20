import { V1 } from "@/core/config/api-endpoints/_shared";

const CRM_V1 = `${V1}/crm`;

/** REST API endpoint catalog for CRM Pipelines & Universal Workflow Studio. */
export const CRM_WORKFLOW_ENDPOINTS = {
  DEFAULT_PIPELINE: `${CRM_V1}/pipelines/default`,
  PIPELINES: `${CRM_V1}/pipelines`,
  PIPELINE_BY_ID: (id: string) => `${CRM_V1}/pipelines/${encodeURIComponent(id)}`,
  ACTIVATE_PIPELINE: (id: string) => `${CRM_V1}/pipelines/${encodeURIComponent(id)}/activate`,
  REPLACE_STAGE: (id: string, stageKey: string) =>
    `${CRM_V1}/pipelines/${encodeURIComponent(id)}/stages/${encodeURIComponent(stageKey)}/replace`,
} as const;
