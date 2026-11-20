/** Re-exported workflow pipeline configuration models consumed by Opportunities. */
export type {
  PipelineStageConfig,
  PipelineDefinition,
  UpdatePipelineStageItem,
  UpdateDefaultPipelineInput,
} from "@modules/crm/workflows/src/domain/models/crm-workflow.types";

/** Stakeholder role classification for buying committee contacts on an Opportunity. */
export type DealStakeholderRole =
  | "DecisionMaker"
  | "Champion"
  | "Finance"
  | "Legal"
  | "Technical"
  | "TechnicalEvaluator"
  | "FinancialApprover"
  | "EndUser";

/** Buying committee contact assignment linked to a CRM Opportunity. */
export interface DealContactRole {
  id: string;
  opportunityId: string;
  contactPartyId: string;
  contactName: string;
  contactEmail?: string | null;
  jobTitle?: string | null;
  stakeholderRole: string;
  isPrimary: boolean;
  influenceNotes?: string | null;
  createdAtUtc: string;
}

/** Input payload for adding a buying committee stakeholder to an Opportunity. */
export interface AddDealContactRoleInput {
  opportunityId: string;
  contactPartyId: string;
  contactName?: string;
  contactEmail?: string;
  stakeholderRole: string;
  isPrimary?: boolean;
  influenceNotes?: string;
  idempotencyKey?: string;
}
