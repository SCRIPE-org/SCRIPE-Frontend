import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmLeadService } from "../../domain/interfaces/ICrmLeadService";
import type {
  CrmLead,
  CreateLeadInput,
  QualifyLeadInput,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  LeadsFilterParams,
  PagedLeadsResult,
} from "../../domain/models/crm-lead.types";
import { CRM_LEAD_ENDPOINTS } from "./crm-lead.endpoints";

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

export class CrmLeadService implements ICrmLeadService {
  constructor(private readonly api: IApiService) {}

  async getLeads(params?: LeadsFilterParams): Promise<PagedLeadsResult> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search.trim();
    }

    if (params?.status) {
      queryParams.status = params.status;
    }

    const response = await this.api.get<
      ApiSuccessResponse<PagedLeadsResult> | PagedLeadsResult
    >(CRM_LEAD_ENDPOINTS.LEADS, queryParams);

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as PagedLeadsResult;
  }

  async getLeadById(id: string): Promise<CrmLead> {
    const response = await this.api.get<ApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LEAD_BY_ID(id)
    );

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as CrmLead;
  }

  async createLead(input: CreateLeadInput): Promise<CrmLead> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const response = await this.api.post<ApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LEADS,
      input,
      undefined,
      {
        idempotencyKey,
        headers: {
          "Idempotency-Key": idempotencyKey,
          "X-Idempotency-Key": idempotencyKey,
        },
      }
    );

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as CrmLead;
  }

  async qualifyLead(input: QualifyLeadInput): Promise<CrmLead> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-qualify-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const payload = {
      decision: input.decision,
      disqualificationReasonCode: input.disqualificationReasonCode,
      disqualificationReason: input.disqualificationReason,
      qualificationNotes: input.qualificationNotes,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };

    const response = await this.api.post<ApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.QUALIFY(input.leadId),
      payload,
      undefined,
      {
        idempotencyKey,
        headers: {
          "Idempotency-Key": idempotencyKey,
          "X-Idempotency-Key": idempotencyKey,
        },
      }
    );

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as CrmLead;
  }

  async linkParty(input: LinkPartyToLeadInput): Promise<CrmLead> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-link-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const payload = {
      organizationPartyId: input.organizationPartyId,
      personPartyId: input.personPartyId,
      accountId: input.accountId,
      createMissingParties: input.createMissingParties ?? true,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };

    const response = await this.api.post<ApiSuccessResponse<CrmLead> | CrmLead>(
      CRM_LEAD_ENDPOINTS.LINK_PARTY(input.leadId),
      payload,
      undefined,
      {
        idempotencyKey,
        headers: {
          "Idempotency-Key": idempotencyKey,
          "X-Idempotency-Key": idempotencyKey,
        },
      }
    );

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as CrmLead;
  }

  async convertLead(input: ConvertLeadInput): Promise<ConvertLeadResult> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-convert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

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

    const response = await this.api.post<
      ApiSuccessResponse<ConvertLeadResult> | ConvertLeadResult
    >(
      CRM_LEAD_ENDPOINTS.CONVERT(input.leadId),
      payload,
      undefined,
      {
        idempotencyKey,
        headers: {
          "Idempotency-Key": idempotencyKey,
          "X-Idempotency-Key": idempotencyKey,
        },
      }
    );

    if ("data" in response && response.data) {
      return response.data;
    }
    return response as ConvertLeadResult;
  }
}
