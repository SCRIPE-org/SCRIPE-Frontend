/**
 * Subscription Mapper — Model ↔ Entity conversion
 *
 * Maps SubscriptionService DTOs to domain entities.
 */
import type { Subscription, SubscriptionListItem } from "../../domain/entities/Subscription";
import type {
      SubscriptionModel,
      SubscriptionListModel,
} from "../services/SubscriptionService";

export class SubscriptionMapper {
      static toEntity(model: SubscriptionModel): Subscription {
            return {
                  id: model.id,
                  tenantId: model.tenantId,
                  editionId: model.editionId,
                  editionName: model.editionName,
                  type: model.type,
                  status: model.status,
                  startDate: model.startDate,
                  endDate: model.endDate,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
            };
      }

      static toListItem(model: SubscriptionListModel): SubscriptionListItem {
            return {
                  id: model.id,
                  tenantId: model.tenantId,
                  editionId: model.editionId,
                  editionName: model.editionName,
                  type: model.type,
                  status: model.status,
                  startDate: model.startDate,
                  createdAt: model.createdAt,
            };
      }
}
