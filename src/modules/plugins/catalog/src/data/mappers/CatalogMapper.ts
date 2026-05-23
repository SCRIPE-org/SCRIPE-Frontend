import { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";
import type { PluginCatalogItemModel } from "../models/CatalogModels";
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
  tier: z.union([z.literal(1), z.literal(2)]).optional().default(2),
  iconUrl: z.string().optional().nullable(),
  colorHue: z.number().optional().nullable(),
  colorChroma: z.number().optional().nullable(),
  manifestJson: z.string().optional().default("{}"),
  isInstalled: z.boolean().optional().default(false),
});

export class CatalogMapper {
  static toEntity(model: PluginCatalogItemModel): PluginCatalogItem {
    const validated = safeParseApiResponse(PluginCatalogItemModelSchema, model, "PluginCatalogItem");
    return new PluginCatalogItem({
      id: validated.id,
      key: validated.key,
      name: validated.name,
      nameAr: validated.nameAr ?? "",
      description: validated.description ?? "",
      descriptionAr: validated.descriptionAr ?? "",
      tier: (validated.tier ?? 2) as 1 | 2,
      iconUrl: validated.iconUrl ?? undefined,
      colorHue: validated.colorHue ?? undefined,
      colorChroma: validated.colorChroma ?? undefined,
      manifestJson: validated.manifestJson ?? "{}",
      isInstalled: validated.isInstalled ?? false,
    });
  }
}
