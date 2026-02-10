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

export class DeletedItemMapper {
      /**
       * Convert DeletedItemModel to DeletedItem Entity
       */
      static toEntity(model: DeletedItemModel): DeletedItem {
            const data: DeletedItemData = {
                  id: model.id,
                  entityType: model.entityType,
                  name: model.name,
                  daysUntilPermanent: model.daysUntilPermanent,
                  email: model.email,
                  tenantName: model.tenantName,
                  deletedAt: model.deletedAt,
                  deletedByName: model.deletedByName,
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
                  entity.deletedByName,
            );
      }

      /**
       * Convert array of Models to Entities
       */
      static toEntityList(models: DeletedItemModel[]): DeletedItem[] {
            return models.map((model) => DeletedItemMapper.toEntity(model));
      }
}
