/**
 * Subscription Mapper — Model ↔ Entity conversion
 */
import { Subscription, SubscriptionListItem, GlobalSubscriptionItem } from "../../domain/entities/Subscription";
import type { SubscriptionData, SubscriptionListItemData, GlobalSubscriptionItemData } from "../../domain/entities/Subscription";
import type {
      SubscriptionModel,
      SubscriptionListModel,
      GlobalSubscriptionModel,
} from "../models/SubscriptionModels";

export class SubscriptionMapper {
      static toEntity(model: SubscriptionModel): Subscription {
            const data: SubscriptionData = {
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
                  appliedPromoCode: model.appliedPromotionName,
                  promotionDiscount: model.promotionDiscount,
                  // Refund
                  refundType: model.refundType,
                  refundAmount: model.refundAmount,
                  refundedAt: model.refundedAt,
                  refundReason: model.refundReason,
                  // Stripe
                  stripeCustomerId: model.stripeCustomerId,
                  stripeSubscriptionId: model.stripeSubscriptionId,
            };
            return new Subscription(data);
      }

      static toListItem(model: SubscriptionListModel): SubscriptionListItem {
            const data: SubscriptionListItemData = {
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
                  baseAmount: model.baseAmount,
                  adjustmentAmount: model.adjustmentAmount,
                  totalAmount: model.totalAmount,
                  totalAmountUsd: model.totalAmountUsd,
                  // Promotion
                  appliedPromoCode: model.appliedPromotionName,
                  promotionDiscount: model.promotionDiscount,
                  // Refund
                  refundType: model.refundType,
                  refundAmount: model.refundAmount,
                  refundedAt: model.refundedAt,
                  refundReason: model.refundReason,
                  // Stripe
                  stripeCustomerId: model.stripeCustomerId,
                  stripeSubscriptionId: model.stripeSubscriptionId,
            };
            return new SubscriptionListItem(data);
      }

      static toGlobalItem(model: GlobalSubscriptionModel): GlobalSubscriptionItem {
            const data: GlobalSubscriptionItemData = {
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
                  exchangeRateToUsd: model.exchangeRateToUsd,
                  baseAmount: model.baseAmount,
                  adjustmentAmount: model.adjustmentAmount,
                  // Promotion
                  appliedPromoCode: model.appliedPromotionName,
                  promotionDiscount: model.promotionDiscount,
                  // Refund
                  refundType: model.refundType,
                  refundAmount: model.refundAmount,
                  refundedAt: model.refundedAt,
                  refundReason: model.refundReason,
            };
            return new GlobalSubscriptionItem(data);
      }
}
