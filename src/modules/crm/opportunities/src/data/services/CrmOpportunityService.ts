import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmOpportunityService } from "../../domain/interfaces/ICrmOpportunityService";
import type {
  CrmOpportunity, OpportunityDetailResult, CreateOpportunityInput, UpdateOpportunityInput,
  AssignOpportunityOwnerInput, MoveOpportunityStageInput, CloseOpportunityInput, ReopenOpportunityInput,
  OpportunitiesFilterParams, PagedOpportunitiesResult, PipelineDefinition, UpdateDefaultPipelineInput,
  DealContactRoleDto, AddDealContactRoleInput,
} from "../../domain/entities/OpportunityEntity";
import { CRM_OPPORTUNITY_ENDPOINTS } from "./crm-opportunity.endpoints";

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

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

  async getOpportunities(params?: OpportunitiesFilterParams): Promise<PagedOpportunitiesResult> {
    const queryParams: Record<string, unknown> = { page: params?.page ?? 1, pageSize: params?.pageSize ?? 20 };
    if (params?.search && params.search.trim() !== "") queryParams.search = params.search.trim();
    if (params?.stageKey) queryParams.stageKey = params.stageKey;
    if (params?.status) queryParams.status = params.status;
    const response = await this.api.get<ApiSuccessResponse<PagedOpportunitiesResult> | PagedOpportunitiesResult>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES, queryParams
    );
    return this.unwrap(response);
  }

  async getOpportunityById(id: string): Promise<OpportunityDetailResult> {
    const response = await this.api.get<ApiSuccessResponse<OpportunityDetailResult> | OpportunityDetailResult>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITY_BY_ID(id)
    );
    return this.unwrap(response);
  }

  async createOpportunity(input: CreateOpportunityInput): Promise<CrmOpportunity> {
    const { idempotencyKey, ...payload } = input;
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.OPPORTUNITIES, payload, undefined, this.withIdempotency("crm-opp", idempotencyKey)
    );
    return this.unwrap(response);
  }

  async updateOpportunity(input: UpdateOpportunityInput): Promise<CrmOpportunity> {
    const payload = {
      title: input.title, estimatedAmount: input.estimatedAmount, currencyCode: input.currencyCode ?? "SAR",
      targetCloseDate: input.targetCloseDate, dealKind: input.dealKind ?? "NewBusiness",
      accountId: input.accountId, partyId: input.partyId, expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.put<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.UPDATE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-upd", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

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

  async moveStage(input: MoveOpportunityStageInput): Promise<CrmOpportunity> {
    const payload = {
      targetStageKey: input.targetStageKey, reason: input.reason, expectedRowVersion: input.expectedRowVersion ?? "",
      partyId: input.partyId, accountId: input.accountId, estimatedAmount: input.estimatedAmount,
      targetCloseDate: input.targetCloseDate, primaryContactRole: input.primaryContactRole,
      solutionFitConfirmed: input.solutionFitConfirmed, stageTransitionNote: input.stageTransitionNote,
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.STAGE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-stg", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  async closeOpportunity(input: CloseOpportunityInput): Promise<CrmOpportunity> {
    const payload = {
      outcome: input.outcome, dealKind: input.dealKind ?? "NewBusiness", hqOutcomeKind: input.hqOutcomeKind,
      targetExistingTenantId: input.targetExistingTenantId, lossReasonCode: input.lossReasonCode,
      competitorName: input.competitorName, closeNotes: input.closeNotes,
      approvalEvidenceRef: input.approvalEvidenceRef, expectedRowVersion: input.expectedRowVersion ?? "",
    };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.CLOSE(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-cls", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  async reopenOpportunity(input: ReopenOpportunityInput): Promise<CrmOpportunity> {
    const payload = { reason: input.reason, expectedRowVersion: input.expectedRowVersion ?? "" };
    const response = await this.api.post<ApiSuccessResponse<CrmOpportunity> | CrmOpportunity>(
      CRM_OPPORTUNITY_ENDPOINTS.REOPEN(input.opportunityId), payload, undefined, this.withIdempotency("crm-opp-rop", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  async getDefaultPipeline(): Promise<PipelineDefinition> {
    const response = await this.api.get<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.DEFAULT_PIPELINE
    );
    return this.normalizePipelineDefinition(this.unwrap(response));
  }

  async updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<PipelineDefinition> {
    const payload = {
      nameEn: input.nameEn ?? "Standard Commercial Pipeline", nameAr: input.nameAr ?? null,
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey, sortOrder: s.sortOrder, labelEn: s.labelEn, labelAr: s.labelAr ?? null,
        probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
        slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null, requiredExitFields: s.requiredExitFields ?? [],
        ...(s.triggerDealConversion !== undefined ? { triggerDealConversion: Boolean(s.triggerDealConversion) } : {}),
      })),
      ...(input.transitionsJson !== undefined ? { transitionsJson: input.transitionsJson } : {}),
      ...(input.allowDynamicStages !== undefined ? { allowDynamicStages: input.allowDynamicStages } : {}),
      expectedRowVersion: input.expectedRowVersion,
    };
    const response = await this.api.put<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.DEFAULT_PIPELINE, payload, undefined, this.withIdempotency("crm-pipe-upd", input.idempotencyKey)
    );
    return this.normalizePipelineDefinition(this.unwrap(response));
  }

  async getPipelines(entityType?: string): Promise<PipelineDefinition[]> {
    const query = entityType ? { entityType } : undefined;
    const response = await this.api.get<ApiSuccessResponse<PipelineDefinition[]> | PipelineDefinition[]>(
      CRM_OPPORTUNITY_ENDPOINTS.PIPELINES, query
    );
    const list = "data" in response && Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
    return list.map((p) => this.normalizePipelineDefinition(p));
  }

  async savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<PipelineDefinition> {
    const payload = {
      nameEn: input.nameEn ?? "Custom CRM Pipeline", nameAr: input.nameAr ?? null,
      entityType: input.entityType ?? "deal", isActive: input.isActive,
      allowDynamicStages: input.allowDynamicStages ?? true, transitionsJson: input.transitionsJson ?? null,
      expectedRowVersion: input.expectedRowVersion || "auto",
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey, sortOrder: s.sortOrder, labelEn: s.labelEn, labelAr: s.labelAr ?? null,
        statusCategory: s.statusCategory, probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
        slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null, requiredExitFields: s.requiredExitFields ?? [],
        triggerDealConversion: Boolean(s.triggerDealConversion), propertiesJson: s.propertiesJson ?? null,
        canvasX: s.canvasX ?? null, canvasY: s.canvasY ?? null,
      })),
    };
    const response = await this.api.put<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.PIPELINE_BY_ID(pipelineId), payload, undefined, this.withIdempotency("crm-pipe-save", input.idempotencyKey)
    );
    return this.normalizePipelineDefinition(this.unwrap(response));
  }

  async activatePipeline(pipelineId: string): Promise<PipelineDefinition> {
    const response = await this.api.post<ApiSuccessResponse<PipelineDefinition> | PipelineDefinition>(
      CRM_OPPORTUNITY_ENDPOINTS.ACTIVATE_PIPELINE(pipelineId), {}, undefined, this.withIdempotency("crm-pipe-act")
    );
    return this.normalizePipelineDefinition(this.unwrap(response));
  }

  async deletePipeline(pipelineId: string): Promise<boolean> {
    await this.api.delete(CRM_OPPORTUNITY_ENDPOINTS.PIPELINE_BY_ID(pipelineId));
    return true;
  }

  async replacePipelineStage(
    pipelineId: string, stageKeyToRemove: string, replacementStageKey: string
  ): Promise<{ migratedRecordCount: number }> {
    const response = await this.api.post<ApiSuccessResponse<{ migratedRecordCount: number }> | { migratedRecordCount: number }>(
      CRM_OPPORTUNITY_ENDPOINTS.REPLACE_STAGE(pipelineId, stageKeyToRemove),
      { replacementStageKey }, undefined, this.withIdempotency("crm-pipe-rep")
    );
    return this.unwrap(response);
  }

  async getContactRoles(opportunityId: string): Promise<DealContactRoleDto[]> {
    const response = await this.api.get<ApiSuccessResponse<DealContactRoleDto[]> | DealContactRoleDto[]>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(opportunityId)
    );
    return "data" in response && Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
  }

  async addContactRole(input: AddDealContactRoleInput): Promise<DealContactRoleDto> {
    const response = await this.api.post<ApiSuccessResponse<DealContactRoleDto> | DealContactRoleDto>(
      CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLES(input.opportunityId),
      {
        contactPartyId: input.contactPartyId, contactName: input.contactName, contactEmail: input.contactEmail,
        stakeholderRole: input.stakeholderRole, isPrimary: input.isPrimary ?? false, influenceNotes: input.influenceNotes,
      },
      undefined, this.withIdempotency("crm-role-add", input.idempotencyKey)
    );
    return this.unwrap(response);
  }

  async removeContactRole(opportunityId: string, roleId: string): Promise<boolean> {
    await this.api.delete(CRM_OPPORTUNITY_ENDPOINTS.CONTACT_ROLE_BY_ID(opportunityId, roleId));
    return true;
  }

  private normalizePipelineDefinition(p: any): PipelineDefinition {
    if (!p) return p;
    return {
      id: p.pipelineId ?? p.id ?? "", pipelineId: p.pipelineId ?? p.id ?? "", tenantId: p.tenantId ?? "",
      key: p.code ?? p.key ?? "default", code: p.code ?? p.key ?? "default",
      entityType: p.entityType ?? (String(p.code ?? p.key ?? "").startsWith("lead.") ? "lead" : "deal"),
      name: p.nameEn ?? p.name ?? "Standard Commercial Pipeline", nameEn: p.nameEn ?? p.name ?? "Standard Commercial Pipeline",
      nameAr: p.nameAr ?? null, version: p.version ?? 1, isDefault: p.isDefault ?? true, isActive: p.isActive ?? true,
      propertiesJson: p.propertiesJson ?? null, transitionsJson: p.transitionsJson ?? null, rowVersion: p.rowVersion ?? "",
      stages: Array.isArray(p.stages)
        ? p.stages.map((s: any) => ({
            stageId: s.stageId ?? s.id ?? "", stageKey: s.stageKey, labelEn: s.labelEn, labelAr: s.labelAr ?? null,
            sortOrder: s.sortOrder, statusCategory: s.statusCategory, color: s.color,
            winProbabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
            slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null, slaDays: s.slaDays ?? s.slaTargetDays ?? null,
            requiredExitFields: s.requiredExitFields ?? [], requiresVerifiedParty: s.requiresVerifiedParty ?? false,
            triggerDealConversion: Boolean(s.triggerDealConversion), propertiesJson: s.propertiesJson ?? null,
            canvasX: s.canvasX ?? null, canvasY: s.canvasY ?? null, rowVersion: s.rowVersion ?? null,
          }))
        : [],
    };
  }
}
