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
  DealContactRole,
  AddDealContactRoleInput,
} from "../../domain/entities/OpportunityEntity";
import type { CrmOpportunityDto } from "../models/OpportunityModel";
import { CrmOpportunityMapper } from "../mappers/CrmOpportunityMapper";

/**
 * Concrete repository mediating between viewmodels and the Opportunity data service
 * while mapping raw DTOs into `OpportunityEntity` domain objects.
 */
export class CrmOpportunityRepository implements ICrmOpportunityRepository {
  constructor(private readonly service: ICrmOpportunityService) {}

  /** Queries paginated CRM Opportunities and normalizes items via `CrmOpportunityMapper`. */
  async getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult> {
    const res = await this.service.getOpportunities(params);
    return {
      ...res,
      items: (res.items ?? []).map((dto) => CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data),
    };
  }

  /** Fetches a single Opportunity detail aggregate with stage history and normalizes it. */
  async getOpportunityById(id: string): Promise<OpportunityDetailResult> {
    const res = await this.service.getOpportunityById(id);
    return {
      ...res,
      opportunity: CrmOpportunityMapper.toEntity(res.opportunity as unknown as CrmOpportunityDto).data,
    };
  }

  /** Creates a new commercial Opportunity and normalizes the returned record. */
  async createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity> {
    const dto = await this.service.createOpportunity(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Updates core commercial Opportunity attributes and normalizes the returned record. */
  async updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity> {
    const dto = await this.service.updateOpportunity(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Reassigns ownership of an Opportunity and normalizes the returned record. */
  async assignOwner(input: AssignOpportunityOwnerInput): Promise<CrmOpportunity> {
    const dto = await this.service.assignOwner(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Advances or transitions an Opportunity to a target pipeline stage. */
  async moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity> {
    const dto = await this.service.moveStage(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Closes an Opportunity as Won or Lost and normalizes the returned record. */
  async closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity> {
    const dto = await this.service.closeOpportunity(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Reopens a closed Opportunity and normalizes the returned record. */
  async reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity> {
    const dto = await this.service.reopenOpportunity(input);
    return CrmOpportunityMapper.toEntity(dto as unknown as CrmOpportunityDto).data;
  }

  /** Retrieves buying-committee stakeholder roles attached to an Opportunity. */
  getContactRoles(opportunityId: string): Promise<DealContactRole[]> {
    return this.service.getContactRoles ? this.service.getContactRoles(opportunityId) : Promise.resolve([]);
  }

  /** Adds a buying-committee contact role to an Opportunity. */
  addContactRole(input: AddDealContactRoleInput): Promise<DealContactRole> {
    if (!this.service.addContactRole) {
      return Promise.reject(new Error("Contact role service not configured"));
    }
    return this.service.addContactRole(input);
  }

  /** Removes a buying-committee contact role from an Opportunity. */
  removeContactRole(opportunityId: string, roleId: string): Promise<boolean> {
    return this.service.removeContactRole
      ? this.service.removeContactRole(opportunityId, roleId)
      : Promise.resolve(true);
  }
}
