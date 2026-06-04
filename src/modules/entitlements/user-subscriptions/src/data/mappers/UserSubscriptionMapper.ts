/**
 * UserSubscription Mapper — Model ↔ Entity conversion
 */
import { UserSubscription } from "../../domain/entities/UserSubscription";
import type { UserSubscriptionData } from "../../domain/entities/UserSubscription";
import type {
  UserSubscriptionModel,
  UserSubscriptionListModel,
} from "../models/UserSubscriptionModels";
import { z } from "zod";
import {
  safeParseApiResponse,
  uuidField,
  optionalString,
  optionalIsoDate,
} from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const UserSubscriptionModelSchema = z.object({
  id: uuidField(),
  userId: uuidField(),
  userName: z.string().optional().nullable(),
  userEmail: z.string().optional().nullable(),
  tenantId: uuidField(),
  tenantPlanId: uuidField(),
  planName: optionalString(),
  currency: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  billingCycle: z.string().optional().nullable(),
  status: z.string().optional().default("Active"),
  startedAt: optionalIsoDate(),
  expiresAt: z.string().optional().nullable(),
  cancelledAt: z.string().optional().nullable(),
  trialEndsAt: z.string().optional().nullable(),
  isAutoRenew: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(false),
  isExpiringSoon: z.boolean().optional().default(false),
  daysRemaining: z.number().int().optional().nullable(),
  externalRef: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  tenantPlanVersionNumber: z.number().int().optional().nullable(),
  promotionId: z.string().optional().nullable(),
  promotionCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().default(0),
  originalPrice: z.number().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  isSelfService: z.boolean().optional().default(false),
  gracePeriodEndsAt: z.string().optional().nullable(),
});

const UserSubscriptionListModelSchema = z.object({
  id: uuidField(),
  userId: uuidField(),
  userName: z.string().optional().nullable(),
  userEmail: z.string().optional().nullable(),
  tenantPlanId: uuidField(),
  planName: optionalString(),
  status: z.string().optional().default("Active"),
  startedAt: optionalIsoDate(),
  expiresAt: z.string().optional().nullable(),
  trialEndsAt: z.string().optional().nullable(),
  isExpiringSoon: z.boolean().optional().default(false),
  daysRemaining: z.number().int().optional().nullable(),
  promotionCode: z.string().optional().nullable(),
  isSelfService: z.boolean().optional().default(false),
  createdAt: z.string().optional().nullable(),
});

export class UserSubscriptionMapper {
  static toEntity(model: UserSubscriptionModel): UserSubscription {
    const validated = safeParseApiResponse(UserSubscriptionModelSchema, model, "UserSubscription");

    const data: UserSubscriptionData = {
      id: validated.id,
      userId: validated.userId ?? "",
      userName: validated.userName ?? undefined,
      userEmail: validated.userEmail ?? undefined,
      tenantId: validated.tenantId ?? "",
      tenantPlanId: validated.tenantPlanId ?? "",
      planName: validated.planName ?? "",
      currency: validated.currency ?? undefined,
      price: validated.price ?? undefined,
      billingCycle: validated.billingCycle ?? undefined,
      status: validated.status ?? "Active",
      startedAt: validated.startedAt ?? "",
      expiresAt: validated.expiresAt ?? undefined,
      cancelledAt: validated.cancelledAt ?? undefined,
      trialEndsAt: validated.trialEndsAt ?? undefined,
      isAutoRenew: validated.isAutoRenew ?? false,
      isActive: validated.isActive ?? false,
      isExpiringSoon: validated.isExpiringSoon ?? false,
      daysRemaining: validated.daysRemaining ?? undefined,
      externalRef: validated.externalRef ?? undefined,
      notes: validated.notes ?? undefined,
      createdAt: validated.createdAt ?? "",
      updatedAt: validated.updatedAt ?? undefined,
      tenantPlanVersionNumber: validated.tenantPlanVersionNumber ?? undefined,
      promotionId: validated.promotionId ?? undefined,
      promotionCode: validated.promotionCode ?? undefined,
      discountAmount: validated.discountAmount ?? 0,
      originalPrice: validated.originalPrice ?? undefined,
      paymentMethod: validated.paymentMethod ?? undefined,
      isSelfService: validated.isSelfService ?? false,
      gracePeriodEndsAt: validated.gracePeriodEndsAt ?? undefined,
    };
    return new UserSubscription(data);
  }

  static toEntityFromList(model: UserSubscriptionListModel): UserSubscription {
    const validated = safeParseApiResponse(
      UserSubscriptionListModelSchema,
      model,
      "UserSubscriptionListItem"
    );
    const status = validated.status ?? "Active";

    const data: UserSubscriptionData = {
      id: validated.id,
      userId: validated.userId ?? "",
      userName: validated.userName ?? undefined,
      userEmail: validated.userEmail ?? undefined,
      tenantId: "", // Not available in list DTO — omitted intentionally
      tenantPlanId: validated.tenantPlanId ?? "",
      planName: validated.planName ?? "",
      // currency, price, billingCycle intentionally omitted — not in list DTO
      status,
      startedAt: validated.startedAt ?? "",
      expiresAt: validated.expiresAt ?? undefined,
      trialEndsAt: validated.trialEndsAt ?? undefined,
      isAutoRenew: false, // Not in list DTO — detail-only field
      isActive: status === "Active" || status === "Trial" || status === "Free",
      isExpiringSoon: validated.isExpiringSoon ?? false,
      daysRemaining: validated.daysRemaining ?? undefined,
      promotionCode: validated.promotionCode ?? undefined,
      isSelfService: validated.isSelfService ?? false,
      createdAt: validated.createdAt ?? "",
    };
    return new UserSubscription(data);
  }
}
