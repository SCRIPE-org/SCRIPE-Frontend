import { CrmWorkflowEntity } from "../../domain/entities/CrmWorkflowEntity";
import type { PipelineDefinition } from "../../domain/models/crm-workflow.types";
import type { RawPipelineDefinitionDto } from "../models/WorkflowModel";

/**
 * Data mapper converting raw backend pipeline DTOs into `CrmWorkflowEntity`.
 */
export class CrmWorkflowMapper {
  /** Converts a raw pipeline DTO payload into a normalized `PipelineDefinition`. */
  static toPlain(p: RawPipelineDefinitionDto): PipelineDefinition {
    const resolvedKey = p.code ?? p.key ?? "default";
    const resolvedName = p.nameEn ?? p.name ?? "Standard Commercial Pipeline";
    return {
      id: p.pipelineId ?? p.id ?? "",
      pipelineId: p.pipelineId ?? p.id ?? "",
      tenantId: p.tenantId ?? "",
      key: resolvedKey,
      code: resolvedKey,
      entityType: p.entityType ?? (String(resolvedKey).startsWith("lead.") ? "lead" : "deal"),
      name: resolvedName,
      nameEn: resolvedName,
      nameAr: p.nameAr ?? null,
      version: p.version ?? 1,
      isDefault: p.isDefault ?? true,
      isActive: p.isActive ?? true,
      propertiesJson: p.propertiesJson ?? null,
      transitionsJson: p.transitionsJson ?? null,
      rowVersion: p.rowVersion ?? "",
      stages: Array.isArray(p.stages)
        ? p.stages.map((s) => ({
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

  /** Converts a raw pipeline DTO payload into `CrmWorkflowEntity`. */
  static toEntity(dto: RawPipelineDefinitionDto): CrmWorkflowEntity {
    return new CrmWorkflowEntity(CrmWorkflowMapper.toPlain(dto));
  }
}
