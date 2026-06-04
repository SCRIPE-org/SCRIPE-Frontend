import { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";
import type { PluginCatalogItemModel, PluginTier } from "../models/CatalogModels";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const PluginCatalogItemModelSchema = z.object({
  id: uuidField(),
  key: z.string().min(1),
  name: z.string().min(1),
  nameAr: optionalString(),
  description: optionalString(),
  descriptionAr: optionalString(),
  tier: z.string().optional().default("Tier2"),
  iconUrl: z.string().optional().nullable(),
  colorHue: z.number().optional().nullable(),
  colorChroma: z.number().optional().nullable(),
  manifestJson: z.string().optional().default("{}"),
  isInstalled: z.boolean().optional().default(false),
});

export class CatalogMapper {
  static toEntity(model: PluginCatalogItemModel): PluginCatalogItem {
    const validated = safeParseApiResponse(
      PluginCatalogItemModelSchema,
      model,
      "PluginCatalogItem"
    );
    return new PluginCatalogItem({
      id: validated.id,
      key: validated.key,
      name: validated.name,
      nameAr: validated.nameAr ?? "",
      description: validated.description ?? "",
      descriptionAr: validated.descriptionAr ?? "",
      tier: (validated.tier ?? "Tier2") as PluginTier,
      iconUrl: validated.iconUrl ?? undefined,
      colorHue: validated.colorHue ?? undefined,
      colorChroma: validated.colorChroma ?? undefined,
      manifestJson: validated.manifestJson ?? "{}",
      isInstalled: validated.isInstalled ?? false,
    });
  }
}
