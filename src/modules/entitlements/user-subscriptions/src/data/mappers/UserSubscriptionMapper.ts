/**
 * UserSubscription Mapper — Model ↔ Entity conversion
 */
import { UserSubscription } from "../../domain/entities/UserSubscription";
import type { UserSubscriptionData } from "../../domain/entities/UserSubscription";
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../models/UserSubscriptionModels";

export class UserSubscriptionMapper {
  static toEntity(model: UserSubscriptionModel): UserSubscription {
    const data: UserSubscriptionData = {
      id: model.id,
      userId: model.userId ?? "",
      userName: model.userName,
      userEmail: model.userEmail,
      tenantId: model.tenantId ?? "",
      tenantPlanId: model.tenantPlanId ?? "",
      planName: model.planName ?? "",
      currency: model.currency,
      price: model.price,
      billingCycle: model.billingCycle,
      status: model.status ?? "Active",
      startedAt: model.startedAt,
      expiresAt: model.expiresAt,
      cancelledAt: model.cancelledAt,
      trialEndsAt: model.trialEndsAt,
      isAutoRenew: model.isAutoRenew ?? false,
      isActive: model.isActive ?? false,
      isExpiringSoon: model.isExpiringSoon ?? false,
      daysRemaining: model.daysRemaining,
      externalRef: model.externalRef,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      tenantPlanVersionNumber: model.tenantPlanVersionNumber,
      promotionId: model.promotionId,
      promotionCode: model.promotionCode,
      discountAmount: model.discountAmount ?? 0,
      originalPrice: model.originalPrice,
      paymentMethod: model.paymentMethod,
      isSelfService: model.isSelfService ?? false,
      gracePeriodEndsAt: model.gracePeriodEndsAt,
    };
    return new UserSubscription(data);
  }

  static toEntityFromList(model: UserSubscriptionListModel): UserSubscription {
    const status = model.status ?? "Active";
    const data: UserSubscriptionData = {
      id: model.id,
      userId: model.userId ?? "",
      userName: model.userName,
      userEmail: model.userEmail,
      tenantId: "",  // Not available in list DTO — omitted intentionally
      tenantPlanId: model.tenantPlanId ?? "",
      planName: model.planName ?? "",
      // currency, price, billingCycle intentionally omitted — not in list DTO
      status,
      startedAt: model.startedAt,
      expiresAt: model.expiresAt,
      trialEndsAt: model.trialEndsAt,
      isAutoRenew: false,  // Not in list DTO — detail-only field
      isActive: status === "Active" || status === "Trial" || status === "Free",
      isExpiringSoon: model.isExpiringSoon ?? false,
      daysRemaining: model.daysRemaining,
      promotionCode: model.promotionCode,
      isSelfService: model.isSelfService ?? false,
      createdAt: model.createdAt,
    };
    return new UserSubscription(data);
  }
}
