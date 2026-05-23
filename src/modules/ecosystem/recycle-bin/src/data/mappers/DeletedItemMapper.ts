/**
 * DeletedItem Mapper
 *
 * Converts between DeletedItemModel (DTO) and DeletedItem (Entity).
 * Repository uses this to transform service responses.
 *
 * @module recycle-bin/data
 */
import { DeletedItem, type DeletedItemData } from "../../domain/entities/DeletedItem";
import { DeletedItemModel } from "../models/DeletedItemModel";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString, isoDateString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const DeletedItemModelSchema = z.object({
  id: uuidField(),
  entityType: z.string().min(1),
  name: z.string().min(1),
  daysUntilPermanent: z.number().int().optional().default(0),
  email: z.string().optional().nullable(),
  tenantName: z.string().optional().nullable(),
  deletedAt: z.string().min(1),
  deletedByName: z.string().optional().nullable(),
});

export class DeletedItemMapper {
  /**
   * Convert DeletedItemModel to DeletedItem Entity
   */
  static toEntity(model: DeletedItemModel): DeletedItem {
    const validated = safeParseApiResponse(DeletedItemModelSchema, model, "DeletedItem");

    const data: DeletedItemData = {
      id: validated.id,
      entityType: validated.entityType,
      name: validated.name,
      daysUntilPermanent: validated.daysUntilPermanent ?? 0,
      email: validated.email ?? undefined,
      tenantName: validated.tenantName ?? undefined,
      deletedAt: validated.deletedAt,
      deletedByName: validated.deletedByName ?? undefined,
    };
    return new DeletedItem(data);
  }

  /**
   * Convert DeletedItem Entity to DeletedItemModel
   */
  static toModel(entity: DeletedItem): DeletedItemModel {
    return new DeletedItemModel(
      entity.id,
      entity.entityType,
      entity.name,
      entity.daysUntilPermanent,
      entity.email,
      entity.tenantName,
      entity.deletedAtRaw,
      entity.deletedByName
    );
  }

  /**
   * Convert array of Models to Entities
   */
  static toEntityList(models: DeletedItemModel[]): DeletedItem[] {
    return models.map((model) => DeletedItemMapper.toEntity(model));
  }
}
