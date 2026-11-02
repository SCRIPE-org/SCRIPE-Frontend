import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOpportunityService } from "../../domain/interfaces/ICrmOpportunityService";
import type { CrmOpportunity, OpportunityDetailResult, CreateOpportunityInput, UpdateOpportunityInput, AssignOpportunityOwnerInput, MoveOpportunityStageInput, CloseOpportunityInput, ReopenOpportunityInput, OpportunitiesFilterParams, PagedOpportunitiesResult, PipelineDefinition, UpdateDefaultPipelineInput, } from "../../domain/entities/OpportunityEntity";
import { CRM_OPPORTUNITY_ENDPOINTS } from "./crm-opportunity.endpoints";
/**
 * Standard API response envelope from backend AstraFlow handlers.
 */
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}
/**
 * Data service executing HTTP calls to backend CRM Opportunities API via IApiService.
 */
export class CrmOpportunityService implements ICrmOpportunityService {
  constructor(private readonly api: IApiService) {}
  async getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult> {
    const queryParams: Record<string, unknown> = {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    };
    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search.trim();
    }
    if (params?.stageKey) {
      queryParams.stageKey = params.stageKey;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }
    const response = await this.api.get<
      ApiSuccessResponse<PagedOpportunitiesResult> | PagedOpportunitiesResult
    >(CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES, queryParams);
    if ("data" in response && response.data) {
      return response.data;
    }
    return response as PagedOpportunitiesResult;
  }
  async getOpportunityById(id: string): Promise<OpportunityDetailResult> {
    const response = await this.api.get<
      ApiSuccessResponse<OpportunityDetailResult> | OpportunityDetailResult
    >(CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITY_BY_ID(id));
    if ("data" in response && response.data) {
      return response.data;
    }
    return response as OpportunityDetailResult;
  }
  async createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES,
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
    return response as CrmOpportunity;
  }
  async updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-upd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      title: input.title,
      estimatedAmount: input.estimatedAmount,
      currencyCode: input.currencyCode ?? "SAR",
      targetCloseDate: input.targetCloseDate,
      dealKind: input.dealKind ?? "NewBusiness",
      accountId: input.accountId,
      partyId: input.partyId,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.UPDATE(input.opportunityId),
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
    return response as CrmOpportunity;
  }
  async assignOwner(input: AssignOpportunityOwnerInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-asn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      ownerUserId: input.ownerUserId,
      ownerTeamId: input.ownerTeamId,
      assignmentReason: input.assignmentReason,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.ASSIGN_OWNER(input.opportunityId),
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
    return response as CrmOpportunity;
  }
  async moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-stg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      targetStageKey: input.targetStageKey,
      reason: input.reason,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.STAGE(input.opportunityId),
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
    return response as CrmOpportunity;
  }
  async closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-cls-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      outcome: input.outcome,
      dealKind: input.dealKind ?? "NewBusiness",
      hqOutcomeKind: input.hqOutcomeKind,
      targetExistingTenantId: input.targetExistingTenantId,
      lossReasonCode: input.lossReasonCode,
      competitorName: input.competitorName,
      closeNotes: input.closeNotes,
      approvalEvidenceRef: input.approvalEvidenceRef,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.CLOSE(input.opportunityId),
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
    return response as CrmOpportunity;
  }
  async reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-opp-rop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      reason: input.reason,
      expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.REOPEN(input.opportunityId),
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
    return response as CrmOpportunity;
  }
  async getDefaultPipeline(): Promise<PipelineDefinition> {
    const response = await this.api.get<
      ApiSuccessResponse<PipelineDefinition> | PipelineDefinition
    >(CRM_OPPORTUNITY_ENDPOINTS.DEFAULT_PIPELINE);
    const raw = "data" in response && response.data ? response.data : (response as PipelineDefinition);
    return this.normalizePipelineDefinition(raw);
  }
  async updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<PipelineDefinition> {
    const idempotencyKey =
      input.idempotencyKey ||
      `crm-pipe-upd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      nameEn: input.nameEn ?? "Standard Commercial Pipeline",
      nameAr: input.nameAr ?? null,
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey,
        sortOrder: s.sortOrder,
        labelEn: s.labelEn,
        labelAr: s.labelAr ?? null,
        probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
        requiredExitFields: s.requiredExitFields ?? [],
      })),
      expectedRowVersion: input.expectedRowVersion,
    };
    const response = await this.api.put<
      ApiSuccessResponse<PipelineDefinition> | PipelineDefinition
    >(
      CRM_OPPORTUNITY_ENDPOINTS.DEFAULT_PIPELINE,
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
    const raw = "data" in response && response.data ? response.data : (response as PipelineDefinition);
    return this.normalizePipelineDefinition(raw);
  }
  private normalizePipelineDefinition(p: any): PipelineDefinition {
    if (!p) return p;
    return {
      id: p.pipelineId ?? p.id ?? "",
      pipelineId: p.pipelineId ?? p.id ?? "",
      tenantId: p.tenantId ?? "",
      key: p.code ?? p.key ?? "default",
      code: p.code ?? p.key ?? "default",
      name: p.nameEn ?? p.name ?? "Standard Commercial Pipeline",
      nameEn: p.nameEn ?? p.name ?? "Standard Commercial Pipeline",
      nameAr: p.nameAr ?? null,
      version: p.version ?? 1,
      isDefault: p.isDefault ?? true,
      rowVersion: p.rowVersion ?? "",
      stages: Array.isArray(p.stages)
        ? p.stages.map((s: any) => ({
            stageId: s.stageId ?? s.id ?? "",
            stageKey: s.stageKey,
            labelEn: s.labelEn,
            labelAr: s.labelAr ?? null,
            sortOrder: s.sortOrder,
            winProbabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            requiredExitFields: s.requiredExitFields ?? [],
            requiresVerifiedParty: s.requiresVerifiedParty ?? false,
            rowVersion: s.rowVersion ?? null,
          }))
        : [],
    };
  }
}
