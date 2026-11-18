import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmLeadService } from "../../domain/interfaces/ICrmLeadService";
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
} from "../../domain/models/crm-lead.types";
import { CRM_LEAD_ENDPOINTS } from "./crm-lead.endpoints";
import { normalizeCrmLeadDto, type LeadApiSuccessResponse } from "./crmLeadServiceHelpers";

export class CrmLeadService implements ICrmLeadService {
  constructor(private readonly api: IApiService) {}

  private withIdempotency(prefix: string, explicitKey?: string) {
    const idempotencyKey =
      explicitKey || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      idempotencyKey,
      headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
    };
  }

  private unwrap<T>(response: LeadApiSuccessResponse<T> | T): T {
    return response && typeof response === "object" && "data" in response && response.data
      ? response.data
      : (response as T);
  }

  async getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };
    if (params?.search && params.search.trim() !== "") queryParams.search = params.search.trim();
    if (params?.status) queryParams.status = params.status;

    const response = await this.api.get<LeadApiSuccessResponse<PagedLeadsResult> | PagedLeadsResult>(
      CRM_LEAD_ENDPOINTS.LEADS,
      queryParams
    );
    const resData = this.unwrap(response);
    return { ...resData, items: (resData.items || []).map(normalizeCrmLeadDto) };
  }

  async getLeadById(id: string): Promise<CrmLead> {
    const response = await this.api.get<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LEAD_BY_ID(id)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async createLead(input: CreateLeadInput): Promise<CrmLead> {
    const { idempotencyKey, ...payload } = input;
    const response = await this.api.post<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LEADS,
      payload,
      undefined,
      this.withIdempotency("crm-lead", idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async updateLead(input: UpdateLeadInput): Promise<CrmLead> {
    const { leadId, ...payload } = input;
    const response = await this.api.put<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LEAD_BY_ID(leadId),
      { ...payload, expectedRowVersion: input.expectedRowVersion ?? "" },
      undefined,
      this.withIdempotency("crm-lead-upd", input.idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async qualifyLead(input: QualifyLeadInput): Promise<CrmLead> {
    const payload = {
      decision: input.decision,
      disqualificationReasonCode: input.disqualificationReasonCode,
      disqualificationReason: input.disqualificationReason,
      qualificationNotes: input.qualificationNotes,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.QUALIFY(input.leadId),
      payload,
      undefined,
      this.withIdempotency("crm-qualify", input.idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async linkParty(input: LinkPartyToLeadInput): Promise<CrmLead> {
    const payload = {
      organizationPartyId: input.organizationPartyId,
      personPartyId: input.personPartyId,
      accountId: input.accountId,
      createMissingParties: input.createMissingParties ?? true,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LINK_PARTY(input.leadId),
      payload,
      undefined,
      this.withIdempotency("crm-link", input.idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
    const payload = {
      opportunityTitle: input.opportunityTitle,
      estimatedAmount: input.estimatedAmount,
      currencyCode: input.currencyCode ?? "SAR",
      targetStageKey: input.targetStageKey,
      targetCloseDate: input.targetCloseDate,
      dealKind: input.dealKind ?? "NewBusiness",
      directCreateRationale: input.directCreateRationale,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<LeadApiSuccessResponse<ConvertLeadResult> | ConvertLeadResult>(
      CRM_LEAD_ENDPOINTS.CONVERT(input.leadId),
      payload,
      undefined,
      this.withIdempotency("crm-convert", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  async moveLeadStage(input: MoveLeadStageInput): Promise<CrmLead> {
    const payload = {
      targetStageKey: input.targetStageKey,
      transitionId: input.transitionId,
      reason: input.reason || input.reopenReason,
      auditNote: input.auditNote,
      qualificationNotes: input.qualificationNotes,
      closeNotes: input.closeNotes,
      disqualificationReasonCode: input.disqualificationReasonCode,
      expectedRowVersion: input.expectedRowVersion ?? "",
      customFields: input.customFields,
      partyId: input.partyId,
      accountId: input.accountId,
      contactId: input.contactId,
      ownerUserId: input.ownerUserId,
      leadPhoneOrEmail: input.leadPhoneOrEmail,
      leadSourceChannel: input.leadSourceChannel,
      leadBantNotes: input.leadBantNotes,
      estimatedValue: input.estimatedValue,
      currency: input.currency,
      convertDealTitle: input.convertDealTitle,
      targetDealPipelineId: input.targetDealPipelineId,
      dealKind: input.dealKind,
      reopenReason: input.reopenReason,
      nextStepSummary: input.nextStepSummary,
    };
    const response = await this.api.post<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.MOVE_STAGE(input.leadId),
      payload,
      undefined,
      this.withIdempotency("crm-lead-stage", input.idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }

  async assignOwner(input: AssignLeadOwnerInput): Promise<CrmLead> {
    const payload = {
      ownerUserId: input.ownerUserId,
      ownerTeamId: input.ownerTeamId,
      assignmentReason: input.assignmentReason,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<LeadApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.ASSIGN_OWNER(input.leadId),
      payload,
      undefined,
      this.withIdempotency("crm-lead-assign", input.idempotencyKey)
    );
    return normalizeCrmLeadDto(this.unwrap(response));
  }
}
