import type {
  CrmLead,
  CreateLeadInput,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../models/crm-lead.types";

export interface ICrmLeadRepository {
  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult>;
  getLeadById(id: string): Promise<CrmLead>;
  createLead(input: CreateLeadInput): Promise<CrmLead>;
}
