import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { stripHtmlTags } from "@core/common/sanitize";
import type { IApiService } from "@/core/interfaces/api.interface";
import type { ICrmWorkflowService } from "../../domain/interfaces/ICrmWorkflowService";
import type { UpdateDefaultPipelineInput } from "../../domain/models/crm-workflow.types";
import type {
  RawPipelineDefinitionDto,
  RawReplaceStageResultDto,
  RawWorkflowApiEnvelope,
} from "../models/WorkflowModel";
import { CRM_WORKFLOW_ENDPOINTS } from "./crm-workflow.endpoints";

function unwrap<T>(res: RawWorkflowApiEnvelope<T> | T): T {
  if (res && typeof res === "object" && "data" in res && res.data !== undefined) {
    return res.data;
  }
  return res as T;
}

function buildIdempotency(prefix: string, customKey?: string) {
  const idempotencyKey = customKey || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    idempotencyKey,
    headers: { "Idempotency-Key": idempotencyKey, "X-Idempotency-Key": idempotencyKey },
  };
}

/** Concrete HTTP service mediating relational CRM pipeline CRUD and stage replacement. */
export class CrmWorkflowService implements ICrmWorkflowService {
  constructor(private readonly api: IApiService) {}

  /** Fetches the tenant's default CRM pipeline DTO. */
  async getDefaultPipeline(): Promise<RawPipelineDefinitionDto> {
    const res = await this.api.get<RawWorkflowApiEnvelope<RawPipelineDefinitionDto> | RawPipelineDefinitionDto>(
      CRM_WORKFLOW_ENDPOINTS.DEFAULT_PIPELINE
    );
    return unwrap(res) ?? {};
  }

  /** Sanitizes stage labels and updates the default CRM pipeline via idempotent PUT. */
  async updateDefaultPipeline(input: UpdateDefaultPipelineInput): Promise<RawPipelineDefinitionDto> {
    const payload = {
      ...(input.nameEn !== undefined ? { nameEn: stripHtmlTags(input.nameEn).trim() } : {}),
      ...(input.nameAr !== undefined ? { nameAr: input.nameAr ? stripHtmlTags(input.nameAr).trim() : null } : {}),
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey,
        sortOrder: s.sortOrder,
        labelEn: stripHtmlTags(s.labelEn).trim(),
        labelAr: s.labelAr ? stripHtmlTags(s.labelAr).trim() : null,
        probabilityPercent: s.probabilityPercent ?? s.winProbabilityPercent ?? null,
        slaTargetDays: s.slaTargetDays ?? s.slaDays ?? null,
        requiredExitFields: s.requiredExitFields ?? [],
        ...(s.triggerDealConversion !== undefined ? { triggerDealConversion: Boolean(s.triggerDealConversion) } : {}),
      })),
      ...(input.transitionsJson !== undefined ? { transitionsJson: input.transitionsJson } : {}),
      ...(input.allowDynamicStages !== undefined ? { allowDynamicStages: input.allowDynamicStages } : {}),
      expectedRowVersion: input.expectedRowVersion,
    };
    const res = await this.api.put<RawWorkflowApiEnvelope<RawPipelineDefinitionDto> | RawPipelineDefinitionDto>(
      CRM_WORKFLOW_ENDPOINTS.DEFAULT_PIPELINE,
      payload,
      undefined,
      buildIdempotency("crm-pipe-upd", input.idempotencyKey)
    );
    return unwrap(res) ?? {};
  }

  /** Lists persisted CRM workflow pipeline DTOs optionally scoped by entity type. */
  async getPipelines(entityType?: string): Promise<RawPipelineDefinitionDto[]> {
    const url = buildUrl(CRM_WORKFLOW_ENDPOINTS.PIPELINES, {
      entityType: entityType || undefined,
    });
    const res = await this.api.get<RawWorkflowApiEnvelope<RawPipelineDefinitionDto[]> | RawPipelineDefinitionDto[]>(url);
    const list = unwrap(res);
    return Array.isArray(list) ? list : [];
  }

  /** Persists a full CRM pipeline studio definition (stages, layout, and transitions) via PUT. */
  async savePipeline(
    pipelineId: string,
    input: UpdateDefaultPipelineInput & { entityType?: string; isActive?: boolean }
  ): Promise<RawPipelineDefinitionDto> {
    const payload = {
      nameEn: stripHtmlTags(input.nameEn ?? "Custom CRM Pipeline").trim(),
      nameAr: input.nameAr ? stripHtmlTags(input.nameAr).trim() : null,
      entityType: input.entityType ?? "deal",
      isActive: input.isActive,
      allowDynamicStages: input.allowDynamicStages ?? true,
      transitionsJson: input.transitionsJson ?? null,
      expectedRowVersion: input.expectedRowVersion || "auto",
      stages: input.stages.map((s) => ({
        stageKey: s.stageKey,
        sortOrder: s.sortOrder,
        labelEn: stripHtmlTags(s.labelEn).trim(),
        labelAr: s.labelAr ? stripHtmlTags(s.labelAr).trim() : null,
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
    const res = await this.api.put<RawWorkflowApiEnvelope<RawPipelineDefinitionDto> | RawPipelineDefinitionDto>(
      CRM_WORKFLOW_ENDPOINTS.PIPELINE_BY_ID(pipelineId),
      payload,
      undefined,
      buildIdempotency("crm-pipe-save", input.idempotencyKey)
    );
    return unwrap(res) ?? {};
  }

  /** Activates a CRM workflow pipeline for live runtime execution via POST. */
  async activatePipeline(pipelineId: string): Promise<RawPipelineDefinitionDto> {
    const res = await this.api.post<RawWorkflowApiEnvelope<RawPipelineDefinitionDto> | RawPipelineDefinitionDto>(
      CRM_WORKFLOW_ENDPOINTS.ACTIVATE_PIPELINE(pipelineId),
      {},
      undefined,
      buildIdempotency("crm-pipe-act")
    );
    return unwrap(res) ?? {};
  }

  /** Deletes a non-default CRM workflow pipeline via DELETE. */
  async deletePipeline(pipelineId: string): Promise<boolean> {
    await this.api.delete(CRM_WORKFLOW_ENDPOINTS.PIPELINE_BY_ID(pipelineId));
    return true;
  }

  /** Executes server-side record migration from a removed stage key to a replacement stage. */
  async replacePipelineStage(
    pipelineId: string,
    stageKeyToRemove: string,
    replacementStageKey: string
  ): Promise<RawReplaceStageResultDto> {
    const res = await this.api.post<RawWorkflowApiEnvelope<RawReplaceStageResultDto> | RawReplaceStageResultDto>(
      CRM_WORKFLOW_ENDPOINTS.REPLACE_STAGE(pipelineId, stageKeyToRemove),
      { replacementStageKey },
      undefined,
      buildIdempotency("crm-pipe-rep")
    );
    return unwrap(res) ?? { migratedRecordCount: 0 };
  }
}
