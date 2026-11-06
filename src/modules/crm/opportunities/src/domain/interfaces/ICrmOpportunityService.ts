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
  DealContactRoleDto,
  AddDealContactRoleInput,
} from "../entities/OpportunityEntity";

/**
 * Domain service contract for CRM Opportunity business operations and orchestrations.
 */
export interface ICrmOpportunityService {
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
  getContactRoles?(opportunityId: string): Promise<DealContactRoleDto[]>;
  addContactRole?(input: AddDealContactRoleInput): Promise<DealContactRoleDto>;
  removeContactRole?(opportunityId: string, roleId: string): Promise<boolean>;
}
