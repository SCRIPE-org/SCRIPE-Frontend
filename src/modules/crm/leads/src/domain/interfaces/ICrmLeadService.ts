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
} from "../models/crm-lead.types";

/** Service port defining HTTP operations for CRM Lead workflows. */
export interface ICrmLeadService {
  getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult>;
  getLeadById(id: string): Promise<CrmLead>;
  createLead(input: CreateLeadInput): Promise<CrmLead>;
  updateLead(input: UpdateLeadInput): Promise<CrmLead>;
  assignOwner?(input: AssignLeadOwnerInput): Promise<CrmLead>;
  qualifyLead(input: QualifyLeadInput): Promise<CrmLead>;
  linkParty(input: LinkPartyToLeadInput): Promise<CrmLead>;
  convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult>;
  moveLeadStage(input: MoveLeadStageInput): Promise<CrmLead>;
}
