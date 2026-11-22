/** Wire DTO aliases mapping CRM Lead domain types to API payloads. */
export type {
  CrmLead as CrmLeadDto,
  CreateLeadInput as CreateLeadDto,
  QualifyLeadInput as QualifyLeadDto,
  LinkPartyToLeadInput as LinkPartyToLeadDto,
  ConvertLeadInput as ConvertLeadDto,
  ConvertLeadResult as ConvertLeadResultDto,
  PagedLeadsResult as PagedLeadsDto,
} from "../../domain/models/crm-lead.types";
