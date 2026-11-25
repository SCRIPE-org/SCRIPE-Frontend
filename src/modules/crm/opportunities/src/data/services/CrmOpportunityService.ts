import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOpportunityService } from "../../domain/interfaces/ICrmOpportunityService";
import type {
  CrmOpportunity, OpportunityDetailResult, CreateOpportunityInput, UpdateOpportunityInput,
  AssignOpportunityOwnerInput, MoveOpportunityStageInput, CloseOpportunityInput, ReopenOpportunityInput,
  OpportunitiesFilterParams, PagedOpportunitiesResult, DealContactRole, AddDealContactRoleInput,
} from "../../domain/entities/OpportunityEntity";
import { CRM_OPPORTUNITY_ENDPOINTS } from "./crm-opportunity.endpoints";
import { normalizeDealContactRoleDto, type ApiSuccessResponse } from "./crmOpportunityMappers";

/** Re-exported standard API envelope type for CRM Opportunity service consumers. */
export type { ApiSuccessResponse };

/** Concrete HTTP service for CRM Opportunity lifecycle and buying committee endpoints. */
export class CrmOpportunityService implements ICrmOpportunityService {
  constructor(private readonly api: IApiService) {}

  private withIdempotency(prefix: string, explicitKey?: string) {
    const idempotencyKey = explicitKey || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      idempotencyKey,
      headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
    };
  }

  private unwrap<T>(response: ApiSuccessResponse<T> | T): T {
    if (response && typeof response === "object" && "data" in response && response.data) return response.data;
    return response as T;
  }

  /** Fetches paginated CRM Opportunities filtered by search, stageKey, and status. */
  async getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult> {
    const queryParams: Record<string, unknown> = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
    const cleanSearch = stripHtmlTags(params?.search ?? "").trim();
    if (cleanSearch) queryParams.search = cleanSearch;
    if (params?.stageKey) queryParams.stageKey = params.stageKey;
    if (params?.status) queryParams.status = params.status;
    const response = await this.api.get<ApiSuccessResponse<PagedOpportunitiesResult> | PagedOpportunitiesResult>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES, queryParams
    );
    return this.unwrap(response);
  }

  /** Fetches a single Opportunity aggregate and its stage history by ID. */
  async getOpportunityById(id: string): Promise<OpportunityDetailResult> {
    const response = await this.api.get<ApiSuccessResponse<OpportunityDetailResult> | OpportunityDetailResult>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITY_BY_ID(id)
    );
    return this.unwrap(response);
  }

  /** Sanitizes text fields and creates a new Opportunity via idempotent POST. */
  async createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity> {
    const { idempotencyKey, ...rawPayload } = input;
    const payload = {
      ...rawPayload,
      title: stripHtmlTags(rawPayload.title).trim(),
      directCreateRationale: rawPayload.directCreateRationale
        ? stripHtmlTags(rawPayload.directCreateRationale).trim()
        : rawPayload.directCreateRationale,
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES, payload, undefined, this.withIdempotency("crm-opp", idempotencyKey)
    );
    return this.unwrap(response);
  }

  /**
   * Updates core commercial fields on an existing Opportunity via idempotent PUT.
   *
   * The backend treats this as a partial update: any field that is omitted is left untouched,
   * while any field that is SENT is checked against the caller's restricted-field policy
   * (`crm.opportunities`). Defaults must therefore never be injected for `currencyCode` or
   * `dealKind` — silently sending `"SAR"` / `"NewBusiness"` would both overwrite stored values
   * and be refused with `FieldRestricted` for users who cannot write those fields.
   */
  async updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity> {
    const payload = {
      title: input.title, estimatedAmount: input.estimatedAmount,
      ...(input.currencyCode !== undefined ? { currencyCode: input.currencyCode } : {}),
      targetCloseDate: input.targetCloseDate,
      ...(input.dealKind !== undefined ? { dealKind: input.dealKind } : {}),
      accountId: input.accountId, partyId: input.partyId, expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.UPDATE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-upd", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  /** Assigns an owner user and optional team to an Opportunity via idempotent PUT. */
  async assignOwner(input: AssignOpportunityOwnerInput): Promise<CrmOpportunity> {
    const payload = {
      ownerUserId: input.ownerUserId, ownerTeamId: input.ownerTeamId,
      assignmentReason: input.assignmentReason, expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.ASSIGN_OWNER(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-asn", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  /** Executes a workflow-governed stage transition on an Opportunity via POST. */
  async moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity> {
    const payload = {
      targetStageKey: input.targetStageKey,
      transitionId: input.transitionId,
      reason: input.reason || input.reopenReason,
      expectedRowVersion: input.expectedRowVersion ?? "",
      partyId: input.partyId,
      accountId: input.accountId,
      contactId: input.contactId,
      ownerUserId: input.ownerUserId,
      estimatedAmount: input.estimatedAmount,
      actualAmount: input.actualAmount,
      discountPercent: input.discountPercent,
      nextStepSummary: input.nextStepSummary,
      targetCloseDate: input.targetCloseDate,
      primaryContactRole: input.primaryContactRole,
      solutionFitConfirmed: input.solutionFitConfirmed,
      stageTransitionNote: input.stageTransitionNote,
      closeNotes: input.closeNotes,
      lossReasonCode: input.lossReasonCode,
      competitorName: input.competitorName,
      winReasonCode: input.winReasonCode,
      reopenReason: input.reopenReason,
      customFields: input.customFieldValues,
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.STAGE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-stg", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  /**
   * Closes an Opportunity as Won or Lost with rationale and approval metadata.
   *
   * Matches `updateOpportunity` FLS partial-update semantics: `dealKind` is omitted when
   * not supplied so restricted callers do not hit `FieldRestricted` refusals and stored
   * `Expansion`/`Renewal`/`Services` classifications are preserved on close.
   */
  async closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity> {
    const payload = {
      outcome: input.outcome,
      ...(input.dealKind !== undefined ? { dealKind: input.dealKind } : {}),
      hqOutcomeKind: input.hqOutcomeKind,
      targetExistingTenantId: input.targetExistingTenantId, lossReasonCode: input.lossReasonCode,
      competitorName: input.competitorName, closeNotes: input.closeNotes,
      approvalEvidenceRef: input.approvalEvidenceRef, expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.CLOSE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-cls", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  /** Reopens a previously closed Opportunity with an audit reason. */
  async reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity> {
    const payload = { reason: input.reason, expectedRowVersion: input.expectedRowVersion ?? "" };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.REOPEN(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-rop", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  /** Fetches buying-committee stakeholder roles attached to an Opportunity. */
  async getContactRoles(opportunityId: string): Promise<DealContactRole[]> {
    const response = await this.api.get<ApiSuccessResponse<DealContactRole[]> | DealContactRole[]>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(opportunityId)
    );
    const items = "data" in response && Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
    return items.map((item) => normalizeDealContactRoleDto(item));
  }

  /** Adds a buying-committee stakeholder role to an Opportunity via idempotent POST. */
  async addContactRole(input: AddDealContactRoleInput): Promise<DealContactRole> {
    const response = await this.api.post<ApiSuccessResponse<DealContactRole> | DealContactRole>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(input.opportunityId),
      {
        contactPartyId: input.contactPartyId,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        stakeholderRole: input.stakeholderRole,
        isPrimary: input.isPrimary ?? false,
        notes: input.influenceNotes,
      },
      undefined, this.withIdempotency("crm-role-add", input.idempotencyKey)
    );
    return normalizeDealContactRoleDto(this.unwrap(response));
  }

  /** Removes a buying-committee stakeholder role from an Opportunity via DELETE. */
  async removeContactRole(opportunityId: string, roleId: string): Promise<boolean> {
    await this.api.delete(CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLE_BY_ID(opportunityId, roleId));
    return true;
  }
}
