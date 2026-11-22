/** Raw pipeline stage DTO returned by backend pipeline endpoints. */
export interface RawPipelineStageDto {
  id?: string;
  stageId?: string;
  pipelineId?: string;
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
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  rowVersion?: string | null;
}

/** Raw relational pipeline DTO returned by `/v1/crm/pipelines`. */
export interface RawPipelineDefinitionDto {
  id?: string;
  pipelineId?: string;
  tenantId?: string;
  key?: string;
  code?: string;
  entityType?: string;
  name?: string;
  nameEn?: string;
  nameAr?: string | null;
  version?: number;
  isDefault?: boolean;
  isActive?: boolean;
  propertiesJson?: string | null;
  transitionsJson?: string | null;
  rowVersion?: string;
  stages?: RawPipelineStageDto[];
}

/** Response envelope returned by backend endpoints. */
export interface RawWorkflowApiEnvelope<T> {
  data?: T;
}

/** Result returned when migrating active records off a replaced stage. */
export interface RawReplaceStageResultDto {
  migratedRecordCount: number;
}
