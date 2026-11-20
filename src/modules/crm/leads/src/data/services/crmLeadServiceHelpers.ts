import type { CrmLead } from "../../domain/models/crm-lead.types";

/** Standard API envelope returned by CRM Lead endpoints. */
export interface LeadApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

const STATUS_TO_STAGE_KEY: Record<string, string> = {
  New: "lead.new",
  Working: "lead.working",
  Qualified: "lead.qualified",
  Converted: "lead.converted",
  Disqualified: "lead.disqualified",
};

/** Normalizes CrmLead DTOs so stageKey and customer display snapshots are always populated. */
export function normalizeCrmLeadDto(lead: CrmLead): CrmLead {
  if (!lead) return lead;
  const stageKey =
    lead.stageKey && lead.stageKey.trim() !== ""
      ? lead.stageKey
      : STATUS_TO_STAGE_KEY[lead.status] ?? "lead.new";
  const organizationDisplayName =
    lead.organizationDisplayName || lead.accountDisplayName || lead.partyDisplayName || undefined;
  const personDisplayName = lead.personDisplayName || lead.primaryContactName || undefined;
  return {
    ...lead,
    stageKey,
    partyDisplayName: lead.partyDisplayName || organizationDisplayName || personDisplayName,
    organizationDisplayName,
    personDisplayName,
  };
}
