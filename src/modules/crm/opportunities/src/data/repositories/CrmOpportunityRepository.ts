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
}
