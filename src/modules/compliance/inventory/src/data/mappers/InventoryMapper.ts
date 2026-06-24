/**
 * Inventory Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { InventoryItem } from "../../domain/entities/InventoryItem";
import type { InventoryItemData } from "../../domain/entities/InventoryItem";
import type { InventoryItemModel } from "../models/InventoryModels";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const InventoryItemModelSchema = z.object({
  id: uuidField(),
  moduleName: optionalString(),
  entityName: optionalString(),
  fieldName: optionalString(),
  dataCategory: optionalString(),
  legalBasis: optionalString(),
  isAnonymizedOnErasure: z.boolean().optional().default(false),
  isIncludedInExport: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class InventoryMapper {
  static toEntity(model: InventoryItemModel): InventoryItem {
    const validated = safeParseApiResponse(InventoryItemModelSchema, model, "InventoryItem");

    const data: InventoryItemData = {
      id: validated.id,
      moduleName: validated.moduleName ?? "",
      entityName: validated.entityName ?? "",
      fieldName: validated.fieldName ?? "",
      dataCategory: validated.dataCategory ?? "",
      legalBasis: validated.legalBasis ?? "",
      isAnonymizedOnErasure: validated.isAnonymizedOnErasure ?? false,
      isIncludedInExport: validated.isIncludedInExport ?? false,
      isActive: validated.isActive ?? false,
      notes: validated.notes ?? "",
    };
    return new InventoryItem(data);
  }
}
