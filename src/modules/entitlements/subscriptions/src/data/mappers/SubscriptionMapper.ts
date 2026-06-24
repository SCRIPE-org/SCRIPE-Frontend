/**
 * Subscription Mapper — Model ↔ Entity conversion
 */
import {
  Subscription,
  SubscriptionListItem,
  GlobalSubscriptionItem,
} from "../../domain/entities/Subscription";
import type {
  SubscriptionData,
  SubscriptionListItemData,
  GlobalSubscriptionItemData,
} from "../../domain/entities/Subscription";
import type {
  SubscriptionModel,
  SubscriptionListModel,
  GlobalSubscriptionModel,
} from "../models/SubscriptionModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const SubscriptionBaseSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  editionId: uuidField(),
  editionName: optionalString(),
  type: optionalString(),
  status: optionalString(),
  startDate: optionalIsoDate(),
  endDate: z.string().optional().nullable(),
  expiryBehavior: optionalString(),
  fallbackEditionName: z.string().optional().nullable(),
  isDowngraded: z.boolean().optional().default(false),
  downgradedFromEditionName: z.string().optional().nullable(),
  downgradedFromType: z.string().optional().nullable(),
  downgradedAt: z.string().optional().nullable(),
  createdAt: optionalIsoDate(),
  currency: z.string().optional().nullable(),
  baseAmount: z.number().optional().nullable(),
  adjustmentAmount: z.number().optional().nullable(),
  totalAmount: z.number().optional().nullable(),
  totalAmountUsd: z.number().optional().nullable(),
  appliedPromotionName: z.string().optional().nullable(),
  promotionDiscount: z.number().optional().nullable(),
  refundType: z.string().optional().nullable(),
  refundAmount: z.number().optional().nullable(),
  refundedAt: z.string().optional().nullable(),
  refundReason: z.string().optional().nullable(),
  gatewayCustomerId: z.string().optional().nullable(),
  gatewaySubscriptionId: z.string().optional().nullable(),
});

const SubscriptionModelSchema = SubscriptionBaseSchema.extend({
  trialEndsAt: z.string().optional().nullable(),
  gracePeriodEndsAt: z.string().optional().nullable(),
  modifiedAt: optionalIsoDate(),
  exchangeRateToUsd: z.number().optional().nullable(),
});

const GlobalSubscriptionModelSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  tenantName: optionalString(),
  editionId: uuidField(),
  editionName: optionalString(),
  type: optionalString(),
  status: optionalString(),
  startDate: optionalIsoDate(),
  endDate: z.string().optional().nullable(),
  expiryBehavior: optionalString(),
  isDowngraded: z.boolean().optional().default(false),
  createdAt: optionalIsoDate(),
  currency: optionalString(),
  totalAmount: z.number().optional().nullable(),
  totalAmountUsd: z.number().optional().nullable(),
  exchangeRateToUsd: z.number().optional().nullable(),
  baseAmount: z.number().optional().nullable(),
  adjustmentAmount: z.number().optional().nullable(),
  appliedPromotionName: z.string().optional().nullable(),
  promotionDiscount: z.number().optional().nullable(),
  refundType: z.string().optional().nullable(),
  refundAmount: z.number().optional().nullable(),
  refundedAt: z.string().optional().nullable(),
  refundReason: z.string().optional().nullable(),
});

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
 */
export class SubscriptionMapper {
  static toEntity(model: SubscriptionModel): Subscription {
    const v = safeParseApiResponse(SubscriptionModelSchema, model, "Subscription");

    const data: SubscriptionData = {
      id: v.id,
      tenantId: v.tenantId,
      editionId: v.editionId,
      editionName: v.editionName ?? "",
      type: v.type ?? "",
      status: v.status ?? "",
      startDate: v.startDate ?? "",
      endDate: v.endDate ?? undefined,
      trialEndsAt: v.trialEndsAt ?? undefined,
      gracePeriodEndsAt: v.gracePeriodEndsAt ?? undefined,
      expiryBehavior: v.expiryBehavior ?? "",
      fallbackEditionName: v.fallbackEditionName ?? undefined,
      isDowngraded: v.isDowngraded ?? false,
      downgradedFromEditionName: v.downgradedFromEditionName ?? undefined,
      downgradedFromType: v.downgradedFromType ?? undefined,
      downgradedAt: v.downgradedAt ?? undefined,
      createdAt: v.createdAt ?? "",
      modifiedAt: v.modifiedAt ?? undefined,
      // Pricing
      currency: v.currency ?? undefined,
      baseAmount: v.baseAmount ?? undefined,
      adjustmentAmount: v.adjustmentAmount ?? undefined,
      totalAmount: v.totalAmount ?? undefined,
      totalAmountUsd: v.totalAmountUsd ?? undefined,
      exchangeRateToUsd: v.exchangeRateToUsd ?? undefined,
      // Promotion
      appliedPromoCode: v.appliedPromotionName ?? undefined,
      promotionDiscount: v.promotionDiscount ?? undefined,
      // Refund
      refundType: v.refundType ?? undefined,
      refundAmount: v.refundAmount ?? undefined,
      refundedAt: v.refundedAt ?? undefined,
      refundReason: v.refundReason ?? undefined,
      // Gateway
      gatewayCustomerId: v.gatewayCustomerId ?? undefined,
      gatewaySubscriptionId: v.gatewaySubscriptionId ?? undefined,
    };
    return new Subscription(data);
  }

  static toListItem(model: SubscriptionListModel): SubscriptionListItem {
    const v = safeParseApiResponse(SubscriptionBaseSchema, model, "SubscriptionListItem");

    const data: SubscriptionListItemData = {
      id: v.id,
      tenantId: v.tenantId,
      editionId: v.editionId,
      editionName: v.editionName ?? "",
      type: v.type ?? "",
      status: v.status ?? "",
      startDate: v.startDate ?? "",
      endDate: v.endDate ?? undefined,
      expiryBehavior: v.expiryBehavior ?? "",
      fallbackEditionName: v.fallbackEditionName ?? undefined,
      isDowngraded: v.isDowngraded ?? false,
      downgradedFromEditionName: v.downgradedFromEditionName ?? undefined,
      downgradedFromType: v.downgradedFromType ?? undefined,
      downgradedAt: v.downgradedAt ?? undefined,
      createdAt: v.createdAt ?? "",
      // Pricing
      currency: v.currency ?? undefined,
      baseAmount: v.baseAmount ?? undefined,
      adjustmentAmount: v.adjustmentAmount ?? undefined,
      totalAmount: v.totalAmount ?? undefined,
      totalAmountUsd: v.totalAmountUsd ?? undefined,
      // Promotion
      appliedPromoCode: v.appliedPromotionName ?? undefined,
      promotionDiscount: v.promotionDiscount ?? undefined,
      // Refund
      refundType: v.refundType ?? undefined,
      refundAmount: v.refundAmount ?? undefined,
      refundedAt: v.refundedAt ?? undefined,
      refundReason: v.refundReason ?? undefined,
      // Gateway
      gatewayCustomerId: v.gatewayCustomerId ?? undefined,
      gatewaySubscriptionId: v.gatewaySubscriptionId ?? undefined,
    };
    return new SubscriptionListItem(data);
  }

  static toGlobalItem(model: GlobalSubscriptionModel): GlobalSubscriptionItem {
    const v = safeParseApiResponse(GlobalSubscriptionModelSchema, model, "GlobalSubscriptionItem");

    const data: GlobalSubscriptionItemData = {
      id: v.id,
      tenantId: v.tenantId,
      tenantName: v.tenantName ?? "",
      editionId: v.editionId,
      editionName: v.editionName ?? "",
      type: v.type ?? "",
      status: v.status ?? "",
      startDate: v.startDate ?? "",
      endDate: v.endDate ?? undefined,
      expiryBehavior: v.expiryBehavior ?? "",
      isDowngraded: v.isDowngraded ?? false,
      createdAt: v.createdAt ?? "",
      currency: v.currency ?? "USD",
      totalAmount: v.totalAmount ?? 0,
      totalAmountUsd: v.totalAmountUsd ?? 0,
      baseAmount: v.baseAmount ?? 0,
      adjustmentAmount: v.adjustmentAmount ?? 0,
      exchangeRateToUsd: v.exchangeRateToUsd ?? 1,
      // Promotion
      appliedPromoCode: v.appliedPromotionName ?? undefined,
      promotionDiscount: v.promotionDiscount ?? undefined,
      // Refund
      refundType: v.refundType ?? undefined,
      refundAmount: v.refundAmount ?? undefined,
      refundedAt: v.refundedAt ?? undefined,
      refundReason: v.refundReason ?? undefined,
    };
    return new GlobalSubscriptionItem(data);
  }
}
