/**
 * Subscription Mapper — Model ↔ Entity conversion
 */
import type { Subscription, SubscriptionListItem, GlobalSubscriptionItem } from "../../domain/entities/Subscription";
import type {
      SubscriptionModel,
      SubscriptionListModel,
      GlobalSubscriptionModel,
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
                  trialEndsAt: model.trialEndsAt,
                  gracePeriodEndsAt: model.gracePeriodEndsAt,
                  expiryBehavior: model.expiryBehavior,
                  fallbackEditionName: model.fallbackEditionName,
                  isDowngraded: model.isDowngraded,
                  downgradedFromEditionName: model.downgradedFromEditionName,
                  downgradedFromType: model.downgradedFromType,
                  downgradedAt: model.downgradedAt,
                  createdAt: model.createdAt,
                  modifiedAt: model.modifiedAt,
                  // Pricing
                  currency: model.currency,
                  baseAmount: model.baseAmount,
                  adjustmentAmount: model.adjustmentAmount,
                  totalAmount: model.totalAmount,
                  totalAmountUsd: model.totalAmountUsd,
                  exchangeRateToUsd: model.exchangeRateToUsd,
                  // Promotion
                  appliedPromoCode: model.appliedPromoCode,
                  promotionDiscount: model.promotionDiscount,
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
                  endDate: model.endDate,
                  expiryBehavior: model.expiryBehavior,
                  fallbackEditionName: model.fallbackEditionName,
                  isDowngraded: model.isDowngraded,
                  downgradedFromEditionName: model.downgradedFromEditionName,
                  downgradedFromType: model.downgradedFromType,
                  downgradedAt: model.downgradedAt,
                  createdAt: model.createdAt,
                  // Pricing
                  currency: model.currency,
                  totalAmount: model.totalAmount,
                  totalAmountUsd: model.totalAmountUsd,
                  // Promotion
                  appliedPromoCode: model.appliedPromoCode,
                  promotionDiscount: model.promotionDiscount,
            };
      }

      static toGlobalItem(model: GlobalSubscriptionModel): GlobalSubscriptionItem {
            return {
                  id: model.id,
                  tenantId: model.tenantId,
                  tenantName: model.tenantName,
                  editionId: model.editionId,
                  editionName: model.editionName,
                  type: model.type,
                  status: model.status,
                  startDate: model.startDate,
                  endDate: model.endDate,
                  expiryBehavior: model.expiryBehavior,
                  isDowngraded: model.isDowngraded,
                  createdAt: model.createdAt,
                  currency: model.currency,
                  totalAmount: model.totalAmount,
                  totalAmountUsd: model.totalAmountUsd,
                  baseAmount: model.baseAmount,
                  adjustmentAmount: model.adjustmentAmount,
                  // Promotion
                  appliedPromoCode: model.appliedPromoCode,
                  promotionDiscount: model.promotionDiscount,
            };
      }
}
