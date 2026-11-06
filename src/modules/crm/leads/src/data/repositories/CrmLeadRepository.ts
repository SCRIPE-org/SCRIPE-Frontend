import type { ICrmLeadRepository } from "../../domain/interfaces/ICrmLeadRepository";
import type { ICrmLeadService } from "../../domain/interfaces/ICrmLeadService";
import type {
  CrmLead,
  CreateLeadInput,
  UpdateLeadInput,
  QualifyLeadInput,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  MoveLeadStageInput,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../../domain/models/crm-lead.types";

export class CrmLeadRepository implements ICrmLeadRepository {
  constructor(private readonly service: ICrmLeadService) {}

  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult> {
    return this.service.getLeads(params);
  }

  getLeadById(id: string): Promise<CrmLead> {
    return this.service.getLeadById(id);
  }

  createLead(input: CreateLeadInput): Promise<CrmLead> {
    return this.service.createLead(input);
  }

  updateLead(input: UpdateLeadInput): Promise<CrmLead> {
    return this.service.updateLead(input);
  }

  qualifyLead(input: QualifyLeadInput): Promise<CrmLead> {
    return this.service.qualifyLead(input);
  }

  linkParty(input: LinkPartyToLeadInput): Promise<CrmLead> {
    return this.service.linkParty(input);
  }

  convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
    return this.service.convertLead(input);
  }

  moveLeadStage(input: MoveLeadStageInput): Promise<CrmLead> {
    return this.service.moveLeadStage(input);
  }
}
