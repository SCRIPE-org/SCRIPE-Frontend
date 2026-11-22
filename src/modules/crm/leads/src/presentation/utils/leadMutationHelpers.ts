"use client";

import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type { ICrmLeadRepository } from "../../domain/interfaces/ICrmLeadRepository";
import type {
  AssignLeadOwnerInput,
  CreateLeadInput,
  CrmLead,
  LeadStatus,
  LinkPartyToLeadInput,
} from "../../domain/models/crm-lead.types";
import { mapLeadTransitionPayload, saveLeadCustomFieldsIfPresent } from "./leadTransitionHelpers";

/** State snapshot contract for CRM Leads list viewmodels. */
export interface LeadsPagedResultState {
  stage: "idle" | "loading" | "success" | "failed";
  items: CrmLead[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: string | null;
}

/** Initial loading state snapshot for paginated CRM Leads queries. */
export const INITIAL_LEADS_STATE: LeadsPagedResultState = {
  stage: "loading",
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  error: null,
};

/** Fetches a paginated CRM leads slice through the injected repository boundary. */
export async function fetchLeadsPageMutation(
  repo: ICrmLeadRepository,
  page: number,
  pageSize: number,
  search?: string,
  status?: LeadStatus,
): Promise<LeadsPagedResultState> {
  const result = await repo.getLeads({
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
  repo: ICrmLeadRepository,
  input: CreateLeadInput,
  customFieldValues?: Record<string, unknown>,
): Promise<CrmLead> {
  const created = await repo.createLead(input);
  await saveLeadCustomFieldsIfPresent(created?.id, customFieldValues);
  return created;
}

/** Moves a lead through the configured workflow transition endpoint. */
export async function executeLeadTransitionMutation(
  repo: ICrmLeadRepository,
  payload: CrmWorkflowTransitionSubmitPayload,
): Promise<void> {
  await repo.moveLeadStage(mapLeadTransitionPayload(payload));
}

/** Reassigns lead ownership through the injected repository boundary. */
export async function executeAssignLeadOwnerMutation(
  repo: ICrmLeadRepository,
  input: AssignLeadOwnerInput,
): Promise<void> {
  if (!repo.assignOwner) throw new Error("Lead owner assignment unavailable");
  await repo.assignOwner(input);
}

/** Links an organization or person party to an existing lead. */
export async function executeLinkLeadPartyMutation(
  repo: ICrmLeadRepository,
  input: LinkPartyToLeadInput,
): Promise<CrmLead> {
  return repo.linkParty(input);
}
