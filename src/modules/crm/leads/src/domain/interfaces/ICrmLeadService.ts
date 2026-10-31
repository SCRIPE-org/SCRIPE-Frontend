import type {
  CrmLead,
  CreateLeadInput,
  QualifyLeadInput,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../models/crm-lead.types";

export interface ICrmLeadService {
  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult>;
  getLeadById(id: string): Promise<CrmLead>;
  createLead(input: CreateLeadInput): Promise<CrmLead>;
  qualifyLead(input: QualifyLeadInput): Promise<CrmLead>;
  linkParty(input: LinkPartyToLeadInput): Promise<CrmLead>;
  convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult>;
}
