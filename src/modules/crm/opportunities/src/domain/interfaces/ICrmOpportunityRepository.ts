import type {
  CrmOpportunity,
  OpportunityDetailResult,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  AssignOpportunityOwnerInput,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  OpportunitiesFilterParams,
  PagedOpportunitiesResult,
  PipelineDefinition,
  UpdateDefaultPipelineInput,
  DealContactRole,
  AddDealContactRoleInput,
} from "../entities/OpportunityEntity";

/**
 * Domain repository contract for managing CRM Opportunity lifecycle operations.
 */
export interface ICrmOpportunityRepository {
  getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult>;
  getOpportunityById(id: string): Promise<OpportunityDetailResult>;
  createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity>;
  updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity>;
  assignOwner(input: AssignOpportunityOwnerInput): Promise<CrmOpportunity>;
  moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity>;
  closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity>;
  reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity>;
  getDefaultPipeline(): Promise<PipelineDefinition>;
  updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<PipelineDefinition>;
  getPipelines?(entityType?: string): Promise<PipelineDefinition[]>;
  savePipeline?(pipelineId: string, input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }): Promise<PipelineDefinition>;
  activatePipeline?(pipelineId: string): Promise<PipelineDefinition>;
  deletePipeline?(pipelineId: string): Promise<boolean>;
  replacePipelineStage?(pipelineId: string, stageKeyToRemove: string, replacementStageKey: string): Promise<{ migratedRecordCount: number }>;
  getContactRoles?(opportunityId: string): Promise<DealContactRole[]>;
  addContactRole?(input: AddDealContactRoleInput): Promise<DealContactRole>;
  removeContactRole?(opportunityId: string, roleId: string): Promise<boolean>;
}
