/** Stage configuration persisted in a relational CRM Pipeline. */
export interface PipelineStageConfig {
  id?: string;
  stageId?: string;
  pipelineId?: string;
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  statusCategory?: "todo" | "in_progress" | "done" | "lost" | string;
  color?: string;
  winProbabilityPercent?: number | null;
  probabilityPercent?: number | null;
  slaTargetDays?: number | null;
  slaDays?: number | null;
  requiredExitFields?: string[];
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  rowVersion?: string | null;
}

/** Relational CRM pipeline definition returned by `/v1/crm/pipelines`. */
export interface PipelineDefinition {
  id?: string;
  pipelineId?: string;
  tenantId?: string;
  key?: string;
  code?: string;
  entityType?: string;
  name?: string;
  nameEn?: string;
  nameAr?: string | null;
  version: number;
  isDefault?: boolean;
  isActive?: boolean;
  propertiesJson?: string | null;
  stages: PipelineStageConfig[];
  transitionsJson?: string | null;
  rowVersion: string;
}

/** Stage upsert payload used when saving a relational pipeline. */
export interface UpdatePipelineStageItem {
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  statusCategory?: string;
  color?: string;
  winProbabilityPercent?: number | null;
  probabilityPercent?: number | null;
  slaTargetDays?: number | null;
  slaDays?: number | null;
  requiredExitFields?: string[];
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  expectedRowVersion?: string | null;
}

/** Pipeline update request payload. */
export interface UpdateDefaultPipelineInput {
  nameEn?: string;
  nameAr?: string | null;
  stages: UpdatePipelineStageItem[];
  transitionsJson?: string | null;
  expectedRowVersion: string;
  allowDynamicStages?: boolean;
  idempotencyKey?: string;
}
