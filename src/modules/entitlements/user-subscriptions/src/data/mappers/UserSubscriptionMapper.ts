/**
 * UserSubscription Mapper — Model ↔ Entity conversion
 */
import { UserSubscription } from "../../domain/entities/UserSubscription";
import type { UserSubscriptionData } from "../../domain/entities/UserSubscription";
import type { UserSubscriptionModel, UserSubscriptionListModel } from "../models/UserSubscriptionModels";
import type { CreateUserSubscriptionRequest } from "../../domain/entities/UserSubscriptionRequests";

export class UserSubscriptionMapper {
  static toEntity(model: UserSubscriptionModel): UserSubscription {
    const data: UserSubscriptionData = {
      id: model.id,
      userId: model.userId ?? "",
      tenantId: model.tenantId ?? "",
      tenantPlanId: model.tenantPlanId ?? "",
      planName: model.planName ?? "",
      currency: model.currency ?? "USD",
      price: model.price ?? 0,
      billingCycle: model.billingCycle ?? "Monthly",
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
    };
    return new UserSubscription(data);
  }

  static toEntityFromList(model: UserSubscriptionListModel): UserSubscription {
    const status = model.status ?? "Active";
    const data: UserSubscriptionData = {
      id: model.id,
      userId: model.userId ?? "",
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
      createdAt: model.createdAt,
    };
    return new UserSubscription(data);
  }

  static toCreateJson(request: CreateUserSubscriptionRequest): Record<string, unknown> {
    return {
      userId: request.userId,
      tenantPlanId: request.tenantPlanId,
      isAutoRenew: request.isAutoRenew ?? true,
      notes: request.notes || null,
    };
  }
}
