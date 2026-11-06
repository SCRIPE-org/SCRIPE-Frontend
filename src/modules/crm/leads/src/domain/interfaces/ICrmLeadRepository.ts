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
} from "../models/crm-lead.types";

export interface ICrmLeadRepository {
  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult>;
  getLeadById(id: string): Promise<CrmLead>;
  createLead(input: CreateLeadInput): Promise<CrmLead>;
  updateLead(input: UpdateLeadInput): Promise<CrmLead>;
  qualifyLead(input: QualifyLeadInput): Promise<CrmLead>;
  linkParty(input: LinkPartyToLeadInput): Promise<CrmLead>;
  convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult>;
  moveLeadStage(input: MoveLeadStageInput): Promise<CrmLead>;
}
