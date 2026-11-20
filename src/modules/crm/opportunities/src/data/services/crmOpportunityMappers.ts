import type { DealContactRole, PipelineDefinition } from "../../domain/entities/OpportunityEntity";

/** Standard API envelope returned by CRM Opportunity endpoints. */
export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

/** Normalizes DealContactRole payloads from heterogeneous backend endpoints. */
export function normalizeDealContactRoleDto(
  dto: Partial<DealContactRole> & {
    contactDisplayName?: string;
    email?: string | null;
    notes?: string | null;
    createdAt?: string;
    role?: string;
  }
): DealContactRole {
  return {
    id: dto.id ?? "",
    opportunityId: dto.opportunityId ?? "",
    contactPartyId: dto.contactPartyId ?? "",
    contactName: dto.contactName || dto.contactDisplayName || "",
    contactEmail: dto.contactEmail ?? dto.email ?? null,
    jobTitle: dto.jobTitle ?? null,
    stakeholderRole: dto.stakeholderRole || dto.role || "DecisionMaker",
    isPrimary: Boolean(dto.isPrimary),
    influenceNotes: dto.influenceNotes ?? dto.notes ?? null,
    createdAtUtc: dto.createdAtUtc || dto.createdAt || new Date().toISOString(),
  };
}

interface RawPipelineStageDto {
  stageId?: string;
  id?: string;
  stageKey: string;
  labelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  statusCategory: PipelineDefinition["stages"][number]["statusCategory"];
  color?: string;
  probabilityPercent?: number | null;
  winProbabilityPercent?: number | null;
  slaTargetDays?: number | null;
  slaDays?: number | null;
  requiredExitFields?: string[];
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  propertiesJson?: string | null;
  canvasX?: number | null;
  canvasY?: number | null;
  rowVersion?: string | null;
}

interface RawPipelineDefinitionDto {
  pipelineId?: string;
  id?: string;
  tenantId?: string;
  code?: string;
  key?: string;
  entityType?: "deal" | "lead";
  nameEn?: string;
  name?: string;
  nameAr?: string | null;
  version?: number;
  isDefault?: boolean;
  isActive?: boolean;
  propertiesJson?: string | null;
  transitionsJson?: string | null;
  rowVersion?: string;
  stages?: RawPipelineStageDto[];
}

/** Normalizes PipelineDefinition payloads from relational backend endpoints. */
export function normalizePipelineDefinitionDto(p: RawPipelineDefinitionDto | null | undefined): PipelineDefinition {
  if (!p) return p as unknown as PipelineDefinition;
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
      ? p.stages.map((s) => ({
          stageId: s.stageId ?? s.id ?? "",
          stageKey: s.stageKey,
          labelEn: s.labelEn,
          labelAr: s.labelAr ?? null,
          sortOrder: s.sortOrder,
          statusCategory: s.statusCategory,
          color: (s.color ?? "slate") as PipelineDefinition["stages"][number]["color"],
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
