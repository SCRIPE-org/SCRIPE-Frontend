import type { ICrmLeadRepository } from "../../domain/interfaces/ICrmLeadRepository";
import type { ICrmLeadService } from "../../domain/interfaces/ICrmLeadService";
import { CrmLeadMapper } from "../mappers/CrmLeadMapper";
import type {
  CrmLead,
  CreateLeadInput,
  UpdateLeadInput,
  AssignLeadOwnerInput,
  QualifyLeadInput,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  MoveLeadStageInput,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../../domain/models/crm-lead.types";

/** Concrete repository mediating Lead service calls and `CrmLeadMapper` domain normalization. */
export class CrmLeadRepository implements ICrmLeadRepository {
  constructor(private readonly service: ICrmLeadService) {}

  /** Queries paginated CRM Leads and maps items through `CrmLeadMapper`. */
  async getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult> {
    const res = await this.service.getLeads(params);
    return {
      ...res,
      items: (res.items ?? []).map((item) => CrmLeadMapper.toEntity(item).toDto()),
    };
  }

  /** Fetches a single CRM Lead by ID and normalizes it via `CrmLeadMapper`. */
  async getLeadById(id: string): Promise<CrmLead> {
    const item = await this.service.getLeadById(id);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Creates a new CRM Lead and returns the normalized domain record. */
  async createLead(input: CreateLeadInput): Promise<CrmLead> {
    const item = await this.service.createLead(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Updates an existing CRM Lead and returns the normalized domain record. */
  async updateLead(input: UpdateLeadInput): Promise<CrmLead> {
    const item = await this.service.updateLead(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Reassigns ownership of a CRM Lead to the specified user or team. */
  async assignOwner(input: AssignLeadOwnerInput): Promise<CrmLead> {
    if (!this.service.assignOwner) {
      return Promise.reject(new Error("Lead owner assignment service not configured"));
    }
    const item = await this.service.assignOwner(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Records a qualification or disqualification decision on a CRM Lead. */
  async qualifyLead(input: QualifyLeadInput): Promise<CrmLead> {
    const item = await this.service.qualifyLead(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Links or provisions PartyKernel and Account records for a CRM Lead. */
  async linkParty(input: LinkPartyToLeadInput): Promise<CrmLead> {
    const item = await this.service.linkParty(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }

  /** Converts a qualified CRM Lead into a commercial Opportunity. */
  convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
    return this.service.convertLead(input);
  }

  /** Executes a workflow-governed stage transition on a CRM Lead. */
  async moveLeadStage(input: MoveLeadStageInput): Promise<CrmLead> {
    const item = await this.service.moveLeadStage(input);
    return CrmLeadMapper.toEntity(item).toDto();
  }
}
