import { getCrmContainer } from "@modules/crm/di";
import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type {
  AssignLeadOwnerInput,
  CreateLeadInput,
  CrmLead,
  LeadStatus,
  LinkPartyToLeadInput,
} from "../../domain/models/crm-lead.types";
import { mapLeadTransitionPayload, saveLeadCustomFieldsIfPresent } from "./leadTransitionHelpers";

export interface LeadsPagedResultState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

export const INITIAL_LEADS_STATE: LeadsPagedResultState = {
  stage: "loading",
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  error: null,
};

/** Fetches a paginated CRM leads slice through the repository boundary. */
export async function fetchLeadsPageMutation(
  page: number,
  pageSize: number,
  search?: string,
  status?: LeadStatus,
): Promise<LeadsPagedResultState> {
  const result = await getCrmContainer().leadRepository.getLeads({
    page,
    pageSize,
    search,
    status,
  });
  return {
    stage: "success",
    items: result.items,
    totalCount: result.totalCount,
    page: result.page,
    pageSize: result.pageSize || pageSize,
    error: null,
  };
}

/** Persists a new CRM lead and saves any supplied dynamic custom fields. */
export async function executeCreateLeadMutation(
  input: CreateLeadInput,
  customFieldValues?: Record<string, unknown>,
): Promise<CrmLead> {
  const created = await getCrmContainer().leadRepository.createLead(input);
  await saveLeadCustomFieldsIfPresent(created?.id, customFieldValues);
  return created;
}

/** Moves a lead through the configured workflow transition endpoint. */
export async function executeLeadTransitionMutation(
  payload: CrmWorkflowTransitionSubmitPayload,
): Promise<void> {
  await getCrmContainer().leadRepository.moveLeadStage(mapLeadTransitionPayload(payload));
}

/** Reassigns lead ownership through the repository boundary. */
export async function executeAssignLeadOwnerMutation(input: AssignLeadOwnerInput): Promise<void> {
  const repo = getCrmContainer().leadRepository;
  if (!repo.assignOwner) throw new Error("Lead owner assignment unavailable");
  await repo.assignOwner(input);
}

/** Links an organization or person party to an existing lead. */
export async function executeLinkLeadPartyMutation(input: LinkPartyToLeadInput): Promise<CrmLead> {
  return getCrmContainer().leadRepository.linkParty(input);
}
