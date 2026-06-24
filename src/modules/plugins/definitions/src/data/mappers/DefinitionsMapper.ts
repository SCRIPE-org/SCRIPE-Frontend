import { PluginDefinition } from "@modules/plugins/core";
import type {
  PluginDefinitionModel,
  PluginTierValue,
  PluginStatusValue,
  PluginScopeValue,
} from "@modules/plugins/core";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────
// Enums arrive as JSON strings from the backend (JsonStringEnumConverter).

const PluginDefinitionModelSchema = z.object({
  id: uuidField(),
  key: z.string().min(1),
  name: z.string().min(1),
  nameAr: optionalString(),
  description: optionalString(),
  descriptionAr: optionalString(),
  tier: z.string().optional().default("Tier2"),
  status: z.string().optional().default("Draft"),
  scope: z.string().optional().default("Tenant"),
  iconUrl: z.string().optional().nullable(),
  colorHue: z.number().optional().nullable(),
  colorChroma: z.number().optional().nullable(),
  workspaceKey: z.string().optional().nullable(),
  manifestJson: z.string().optional().default("{}"),
  baseUrl: z.string().optional().nullable(),
  frontendUrl: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class DefinitionsMapper {
  static toEntity(model: PluginDefinitionModel): PluginDefinition {
    const validated = safeParseApiResponse(PluginDefinitionModelSchema, model, "PluginDefinition");

    return new PluginDefinition({
      id: validated.id ?? "",
      key: validated.key ?? "",
      name: validated.name ?? "",
      nameAr: validated.nameAr ?? "",
      description: validated.description ?? "",
      descriptionAr: validated.descriptionAr ?? "",
      tier: (validated.tier ?? "Tier2") as PluginTierValue,
      status: (validated.status ?? "Draft") as PluginStatusValue,
      scope: (validated.scope ?? "Tenant") as PluginScopeValue,
      iconUrl: validated.iconUrl ?? undefined,
      colorHue: validated.colorHue ?? undefined,
      colorChroma: validated.colorChroma ?? undefined,
      workspaceKey: validated.workspaceKey ?? undefined,
      manifestJson: validated.manifestJson ?? "{}",
      baseUrl: validated.baseUrl ?? undefined,
      frontendUrl: validated.frontendUrl ?? undefined,
      createdAt: validated.createdAt ?? new Date().toISOString(),
    });
  }

  static toEntityList(models: PluginDefinitionModel[]): PluginDefinition[] {
    return models.map(DefinitionsMapper.toEntity);
  }
}
