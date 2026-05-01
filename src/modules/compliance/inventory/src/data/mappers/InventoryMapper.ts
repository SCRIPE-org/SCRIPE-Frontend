/**
 * Inventory Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { InventoryItem } from "../../domain/entities/InventoryItem";
import type { InventoryItemData } from "../../domain/entities/InventoryItem";
import type { InventoryItemModel } from "../models/InventoryModels";

export class InventoryMapper {
  static toEntity(model: InventoryItemModel): InventoryItem {
    const data: InventoryItemData = {
      id: model.id,
      moduleName: model.moduleName ?? "",
      entityName: model.entityName ?? "",
      fieldName: model.fieldName ?? "",
      dataCategory: model.dataCategory ?? "",
      legalBasis: model.legalBasis ?? "",
      isAnonymizedOnErasure: model.isAnonymizedOnErasure ?? false,
      isIncludedInExport: model.isIncludedInExport ?? false,
      isActive: model.isActive ?? false,
      notes: model.notes,
    };
    return new InventoryItem(data);
  }
}
