/**
 * Shared domain contracts and type primitives across all CRM sub-modules.
 */

export * from "./crmSettingsSharedTypes";

/** Entity types supported by the CRM Workflow Engine. */
export type CrmWorkflowEntityType = "deal" | "lead";

/** Visual and lifecycle category of a workflow stage node. */
export type CrmWorkflowStageCategory = "todo" | "in_progress" | "done" | "lost";

/** Semantic color token configurable per stage across Deals & Leads workflows, minimap, and Kanban columns. */
export type CrmStageColorToken =
  | "slate"
  | "zinc"
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "emerald"
  | "green"
  | "lime"
  | "amber"
  | "orange"
  | "coral"
  | "rose"
  | "crimson"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo";

/** Canonical active pipeline stage keys. */
export type CanonicalActiveStageKey =
  | "default.discovery"
  | "default.qualification"
  | "default.solution_fit"
  | "default.proposal"
  | "default.negotiation";

/** All supported CRM stage key variants. */
export type CrmStageKey =
  | CanonicalActiveStageKey
  | "discovery"
  | "qualification"
  | "solution_fit"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

/** Navigation tab identifiers for CrmShell. */
export type CrmTabId =
  | "overview"
  | "leads"
  | "deals"
  | "accounts"
  | "contacts"
  | "activities"
  | "pipelines"
  | "reports"
  | "settings";

/** Supported entity categories for server-backed searchable CRM selectors. */
export type CrmEntitySearchKind =
  | "party"
  | "account"
  | "contact"
  | "user"
  | "team"
  | "assignee";

/** Query descriptor for searching tenant CRM entities or commercial assignees. */
export interface CrmEntitySearchRequest {
  kind: CrmEntitySearchKind;
  query?: string;
  accountId?: string;
  pageSize?: number;
}

/** Normalized entity search option returned from tenant CRM endpoints. */
export interface CrmEntitySearchItem {
  id: string;
  partyId?: string;
  accountId?: string;
  contactId?: string;
  kind: "party" | "account" | "contact" | "user" | "team";
  label: string;
  labelAr?: string | null;
  description?: string | null;
  isVerified?: boolean;
  email?: string | null;
  phone?: string | null;
}

/** Input payload for inline quick creation inside searchable CRM selectors. */
export interface CrmQuickCreateEntityInput {
  kind: "account" | "contact" | "party";
  entitySubKind?: "account" | "contact";
  nameEn: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  primaryAccountId?: string;
  commercialTierCode?: string;
}

/** Cross-submodule DI delegate interface for searching and quick-creating CRM entities. */
export interface ICrmEntityLookupProvider {
  searchEntities(request: CrmEntitySearchRequest): Promise<CrmEntitySearchItem[]>;
  quickCreateEntity(input: CrmQuickCreateEntityInput): Promise<CrmEntitySearchItem>;
}
