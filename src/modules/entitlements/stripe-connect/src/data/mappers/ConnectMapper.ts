/**
 * Stripe Connect Mapper — DTO ↔ Entity conversion.
 * Null-coalesces all nullable fields.
 */
import {
  ConnectAccount,
  ConnectAccountListItem,
  Commission,
  CommissionDashboard,
} from "../../domain/entities/ConnectAccount";
import type {
  ConnectAccountResponseModel,
  ConnectAccountListResponseModel,
  CommissionResponseModel,
  CommissionDashboardResponseModel,
} from "../models/ConnectModels";

export class ConnectMapper {
  static toAccountEntity(dto: ConnectAccountResponseModel): ConnectAccount {
    return new ConnectAccount({
      id: dto.id ?? "",
      tenantId: dto.tenantId ?? "",
      stripeAccountId: dto.stripeAccountId ?? "",
      accountType: dto.accountType ?? "Express",
      onboardingStatus: dto.onboardingStatus ?? "NotStarted",
      chargesEnabled: dto.chargesEnabled ?? false,
      payoutsEnabled: dto.payoutsEnabled ?? false,
      onboardingCompletedAt: dto.onboardingCompletedAt,
      disabledReason: dto.disabledReason,
      defaultCurrency: dto.defaultCurrency,
      country: dto.country,
      commissionRate: dto.commissionRate,
      payoutDelayDays: dto.payoutDelayDays ?? 7,
      lastPayoutAt: dto.lastPayoutAt,
      totalPayoutsAmount: dto.totalPayoutsAmount ?? 0,
      totalPayoutsCount: dto.totalPayoutsCount ?? 0,
      isFullyOnboarded: dto.isFullyOnboarded ?? false,
      effectiveCommissionRate: dto.effectiveCommissionRate ?? 0,
    });
  }

  static toAccountListEntity(dto: ConnectAccountListResponseModel): ConnectAccountListItem {
    return new ConnectAccountListItem({
      id: dto.id ?? "",
      tenantId: dto.tenantId ?? "",
      stripeAccountId: dto.stripeAccountId ?? "",
      onboardingStatus: dto.onboardingStatus ?? "NotStarted",
      chargesEnabled: dto.chargesEnabled ?? false,
      payoutsEnabled: dto.payoutsEnabled ?? false,
      country: dto.country,
      effectiveCommissionRate: dto.effectiveCommissionRate ?? 0,
      totalPayoutsAmount: dto.totalPayoutsAmount ?? 0,
      createdAt: dto.createdAt ?? "",
    });
  }

  static toCommissionEntity(dto: CommissionResponseModel): Commission {
    return new Commission({
      id: dto.id ?? "",
      tenantId: dto.tenantId ?? "",
      userSubscriptionId: dto.userSubscriptionId ?? "",
      stripePaymentIntentId: dto.stripePaymentIntentId ?? "",
      grossAmount: dto.grossAmount ?? 0,
      commissionAmount: dto.commissionAmount ?? 0,
      commissionRate: dto.commissionRate ?? 0,
      netAmount: dto.netAmount ?? 0,
      currency: dto.currency ?? "usd",
      status: dto.status ?? "Pending",
      collectedAt: dto.collectedAt,
      refundedAt: dto.refundedAt,
      refundedAmount: dto.refundedAmount,
      createdAt: dto.createdAt ?? "",
    });
  }

  static toDashboardEntity(dto: CommissionDashboardResponseModel): CommissionDashboard {
    return new CommissionDashboard({
      totalCommission: dto.totalCommission ?? 0,
      totalRefunded: dto.totalRefunded ?? 0,
      netCommission: dto.netCommission ?? 0,
      totalTransactions: dto.totalTransactions ?? 0,
      activeTenants: dto.activeTenants ?? 0,
      globalCommissionRate: dto.globalCommissionRate ?? 0,
      recentTrends: dto.recentTrends ?? [],
    });
  }
}
