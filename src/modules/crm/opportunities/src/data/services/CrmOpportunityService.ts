import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOpportunityService } from "../../domain/interfaces/ICrmOpportunityService";
import type { CrmOpportunity, OpportunityDetailResult, CreateOpportunityInput, UpdateOpportunityInput, AssignOpportunityOwnerInput, MoveOpportunityStageInput, CloseOpportunityInput, ReopenOpportunityInput, OpportunitiesFilterParams, PagedOpportunitiesResult, PipelineDefinition, UpdateDefaultPipelineInput, DealContactRoleDto, AddDealContactRoleInput } from "../../domain/entities/OpportunityEntity";
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
      (() => {
        const { idempotencyKey: _, ...payload } = input;
        return payload;
      })(),
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
      partyId: input.partyId,
      accountId: input.accountId,
      estimatedAmount: input.estimatedAmount,
      targetCloseDate: input.targetCloseDate,
      primaryContactRole: input.primaryContactRole,
      solutionFitConfirmed: input.solutionFitConfirmed,
      stageTransitionNote: input.stageTransitionNote,
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
        slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null,
        requiredExitFields: s.requiredExitFields ?? [],
        ...(s.triggerDealConversion !== undefined
          ? { triggerDealConversion: Boolean(s.triggerDealConversion) }
          : {}),
      })),
      ...(input.transitionsJson !== undefined
        ? { transitionsJson: input.transitionsJson }
        : {}),
      ...(input.allowDynamicStages !== undefined
        ? { allowDynamicStages: input.allowDynamicStages }
        : {}),
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
  async getPipelines(entityType?: string): Promise<PipelineDefinition[]> {
    const query = entityType ? { entityType } : undefined;
    const response = await this.api.get<ApiSuccessResponse<PipelineDefinition[]> | PipelineDefinition[]>(
      CRM_OPPORTUNITY_ENDPOINTS.PIPELINES,
      query
    );
    const list = "data" in response && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
    return list.map((p) => this.normalizePipelineDefinition(p));
  }
  async savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<PipelineDefinition> {
    const idempotencyKey = input.idempotencyKey || `crm-pipe-save-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const payload = {
      nameEn: input.nameEn ?? "Custom CRM Pipeline",
      nameAr: input.nameAr ?? null,
      entityType: input.entityType ?? "deal",
      isActive: input.isActive,
      allowDynamicStages: input.allowDynamicStages ?? true,
      transitionsJson: input.transitionsJson ?? null,
      expectedRowVersion: input.expectedRowVersion || "auto",
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey,
        sortOrder: s.sortOrder,
        labelEn: s.labelEn,
        labelAr: s.labelAr ?? null,
        statusCategory: s.statusCategory,
        probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
        slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null,
        requiredExitFields: s.requiredExitFields ?? [],
        triggerDealConversion: Boolean(s.triggerDealConversion),
        propertiesJson: s.propertiesJson ?? null,
        canvasX: s.canvasX ?? null,
        canvasY: s.canvasY ?? null,
      })),
    };
    const response = await this.api.put<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.PIPELINE_BY_ID(pipelineId),
      payload,
      undefined,
      { idempotencyKey, headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey } }
    );
    const raw = "data" in response && response.data ? response.data : (response as PipelineDefinition);
    return this.normalizePipelineDefinition(raw);
  }
  async activatePipeline(pipelineId: string): Promise<PipelineDefinition> {
    const idempotencyKey = `crm-pipe-act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const response = await this.api.post<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.ACTIVATE_PIPELINE(pipelineId),
      {},
      undefined,
      { idempotencyKey, headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey } }
    );
    const raw = "data" in response && response.data ? response.data : (response as PipelineDefinition);
    return this.normalizePipelineDefinition(raw);
  }
  async deletePipeline(pipelineId: string): Promise<boolean> {
    await this.api.delete(CRM_OPPORTUNITY_ENDPOINTS.PIPELINE_BY_ID(pipelineId));
    return true;
  }
  async replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<{ migratedRecordCount: number }> {
    const idempotencyKey = `crm-pipe-rep-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const response = await this.api.post<ApiSuccessResponse<{ migratedRecordCount: number }> | { migratedRecordCount: number }>(
      CRM_OPPORTUNITY_ENDPOINTS.REPLACE_STAGE(pipelineId, stageKeyToRemove),
      { replacementStageKey },
      undefined,
      { idempotencyKey, headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey } }
    );
    return "data" in response && response.data ? response.data : (response as { migratedRecordCount: number });
  }
  async getContactRoles(opportunityId: string): Promise<DealContactRoleDto[]> {
    const response = await this.api.get<ApiSuccessResponse<DealContactRoleDto[]> | DealContactRoleDto[]>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(opportunityId)
    );
    return "data" in response && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
  }
  async addContactRole(input: AddDealContactRoleInput): Promise<DealContactRoleDto> {
    const idempotencyKey = input.idempotencyKey || `crm-role-add-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const response = await this.api.post<ApiSuccessResponse<DealContactRoleDto> | DealContactRoleDto>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(input.opportunityId),
      {
        contactPartyId: input.contactPartyId,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        stakeholderRole: input.stakeholderRole,
        isPrimary: input.isPrimary ?? false,
        influenceNotes: input.influenceNotes,
      },
      undefined,
      { idempotencyKey, headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey } }
    );
    return "data" in response && response.data ? response.data : (response as DealContactRoleDto);
  }
  async removeContactRole(opportunityId: string, roleId: string): Promise<boolean> {
    await this.api.delete(CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLE_BY_ID(opportunityId, roleId));
    return true;
  }
  private normalizePipelineDefinition(p: any): PipelineDefinition {
    if (!p) return p;
    return {
      id: p.pipelineId ?? p.id ?? "",
      pipelineId: p.pipelineId ?? p.id ?? "",
      tenantId: p.tenantId ?? "",
      key: p.code ?? p.key ?? "default",
      code: p.code ?? p.key ?? "default",
      entityType: p.entityType ?? (String(p.code ?? p.key ?? "").startsWith("lead.") ? "lead" : "deal"),
      name: p.nameEn ?? p.name ?? "Standard Commercial Pipeline",
      nameEn: p.nameEn ?? p.name ?? "Standard Commercial Pipeline",
      nameAr: p.nameAr ?? null,
      version: p.version ?? 1,
      isDefault: p.isDefault ?? true,
      isActive: p.isActive ?? true,
      propertiesJson: p.propertiesJson ?? null,
      transitionsJson: p.transitionsJson ?? null,
      rowVersion: p.rowVersion ?? "",
      stages: Array.isArray(p.stages)
        ? p.stages.map((s: any) => ({
            stageId: s.stageId ?? s.id ?? "",
            stageKey: s.stageKey,
            labelEn: s.labelEn,
            labelAr: s.labelAr ?? null,
            sortOrder: s.sortOrder,
            statusCategory: s.statusCategory,
            color: s.color,
            winProbabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null,
            slaDays: s.slaDays ?? s.slaTargetDays ?? null,
            requiredExitFields: s.requiredExitFields ?? [],
            requiresVerifiedParty: s.requiresVerifiedParty ?? false,
            triggerDealConversion: Boolean(s.triggerDealConversion),
            propertiesJson: s.propertiesJson ?? null,
            canvasX: s.canvasX ?? null,
            canvasY: s.canvasY ?? null,
            rowVersion: s.rowVersion ?? null,
          }))
        : [],
    };
  }
}
