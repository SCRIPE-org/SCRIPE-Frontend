import type { ICrmOpportunityRepository } from "../../domain/interfaces/ICrmOpportunityRepository";
import type { ICrmOpportunityService } from "../../domain/interfaces/ICrmOpportunityService";
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
} from "../../domain/entities/OpportunityEntity";

/**
 * Concrete repository mediating between viewmodels and the Opportunity data service.
 */
export class CrmOpportunityRepository implements ICrmOpportunityRepository {
  constructor(private readonly service: ICrmOpportunityService) {}

  getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult> {
    return this.service.getOpportunities(params);
  }

  getOpportunityById(id: string): Promise<OpportunityDetailResult> {
    return this.service.getOpportunityById(id);
  }

  createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity> {
    return this.service.createOpportunity(input);
  }

  updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity> {
    return this.service.updateOpportunity(input);
  }

  assignOwner(input: AssignOpportunityOwnerInput): Promise<CrmOpportunity> {
    return this.service.assignOwner(input);
  }

  moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity> {
    return this.service.moveStage(input);
  }

  closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity> {
    return this.service.closeOpportunity(input);
  }

  reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity> {
    return this.service.reopenOpportunity(input);
  }

  getDefaultPipeline(): Promise<PipelineDefinition> {
    return this.service.getDefaultPipeline();
  }

  updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<PipelineDefinition> {
    return this.service.updateDefaultPipeline(input);
  }

  getPipelines(entityType?: string): Promise<PipelineDefinition[]> {
    return this.service.getPipelines ? this.service.getPipelines(entityType) : Promise.resolve([]);
  }

  savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<PipelineDefinition> {
    return this.service.savePipeline
      ? this.service.savePipeline(pipelineId, input)
      : this.service.updateDefaultPipeline(input);
  }

  activatePipeline(pipelineId: string): Promise<PipelineDefinition> {
    return this.service.activatePipeline
      ? this.service.activatePipeline(pipelineId)
      : this.service.getDefaultPipeline();
  }

  deletePipeline(pipelineId: string): Promise<boolean> {
    return this.service.deletePipeline ? this.service.deletePipeline(pipelineId) : Promise.resolve(true);
  }

  replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<{ migratedRecordCount: number }> {
    return this.service.replacePipelineStage
      ? this.service.replacePipelineStage(pipelineId, stageKeyToRemove, replacementStageKey)
      : Promise.resolve({ migratedRecordCount: 0 });
  }

  getContactRoles(opportunityId: string): Promise<DealContactRole[]> {
    return this.service.getContactRoles ? this.service.getContactRoles(opportunityId) : Promise.resolve([]);
  }

  addContactRole(input: AddDealContactRoleInput): Promise<DealContactRole> {
    if (!this.service.addContactRole) {
      return Promise.reject(new Error("Contact role service not configured"));
    }
    return this.service.addContactRole(input);
  }

  removeContactRole(opportunityId: string, roleId: string): Promise<boolean> {
    return this.service.removeContactRole
      ? this.service.removeContactRole(opportunityId, roleId)
      : Promise.resolve(true);
  }
}

