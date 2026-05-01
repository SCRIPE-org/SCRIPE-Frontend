/**
 * Platform Stripe Mapper — DTO → Domain Entity conversion.
 *
 * All nullable DTO fields are null-coalesced to safe defaults.
 */
import type {
  PlatformStripeDashboardModel,
  PlatformAccountModel,
  PlatformBalanceModel,
  PlatformTransactionModel,
  PlatformPayoutModel,
  PlatformConnectSummaryModel,
  PlatformStripeLinksModel,
  BalanceAmountModel,
} from "../models/PlatformStripeModels";

import {
  PlatformStripeDashboard,
  PlatformAccount,
  PlatformBalance,
  PlatformTransaction,
  PlatformPayout,
  PlatformConnectSummary,
  PlatformStripeLinks,
  BalanceAmount,
} from "../../domain/entities/PlatformStripeDashboard";

export class PlatformStripeMapper {
  static toDashboardEntity(dto: PlatformStripeDashboardModel): PlatformStripeDashboard {
    return new PlatformStripeDashboard({
      account: PlatformStripeMapper.toAccountEntity(dto.account),
      balance: PlatformStripeMapper.toBalanceEntity(dto.balance),
      recentTransactions: (dto.recentTransactions ?? []).map(
        PlatformStripeMapper.toTransactionEntity
      ),
      recentPayouts: (dto.recentPayouts ?? []).map(PlatformStripeMapper.toPayoutEntity),
      connectSummary: PlatformStripeMapper.toConnectSummaryEntity(dto.connectSummary),
      links: PlatformStripeMapper.toLinksEntity(dto.links),
    });
  }

  static toAccountEntity(dto: PlatformAccountModel): PlatformAccount {
    return new PlatformAccount({
      accountId: dto.accountId ?? "",
      businessName: dto.businessName ?? "",
      email: dto.email ?? "",
      country: dto.country ?? "",
      defaultCurrency: dto.defaultCurrency ?? "",
      chargesEnabled: dto.chargesEnabled ?? false,
      payoutsEnabled: dto.payoutsEnabled ?? false,
      detailsSubmitted: dto.detailsSubmitted ?? false,
      businessType: dto.businessType ?? "",
      supportPhone: dto.supportPhone ?? "",
      supportEmail: dto.supportEmail ?? "",
      supportUrl: dto.supportUrl ?? "",
      statementDescriptor: dto.statementDescriptor ?? "",
    });
  }

  static toBalanceEntity(dto: PlatformBalanceModel): PlatformBalance {
    return new PlatformBalance({
      available: (dto.available ?? []).map(PlatformStripeMapper.toBalanceAmountEntity),
      pending: (dto.pending ?? []).map(PlatformStripeMapper.toBalanceAmountEntity),
      connectReserved: (dto.connectReserved ?? []).map(PlatformStripeMapper.toBalanceAmountEntity),
    });
  }

  static toBalanceAmountEntity(dto: BalanceAmountModel): BalanceAmount {
    return new BalanceAmount({
      currency: dto.currency ?? "usd",
      amount: dto.amount ?? 0,
    });
  }

  static toTransactionEntity(dto: PlatformTransactionModel): PlatformTransaction {
    return new PlatformTransaction({
      id: dto.id ?? "",
      type: dto.type ?? "",
      amount: dto.amount ?? 0,
      fee: dto.fee ?? 0,
      net: dto.net ?? 0,
      currency: dto.currency ?? "usd",
      description: dto.description ?? "",
      source: dto.source ?? "",
      created: dto.created ?? "",
      status: dto.status ?? "",
    });
  }

  static toPayoutEntity(dto: PlatformPayoutModel): PlatformPayout {
    return new PlatformPayout({
      id: dto.id ?? "",
      amount: dto.amount ?? 0,
      currency: dto.currency ?? "usd",
      status: dto.status ?? "pending",
      arrivalDate: dto.arrivalDate ?? "",
      method: dto.method ?? "",
      description: dto.description ?? "",
      type: dto.type ?? "",
      created: dto.created ?? "",
    });
  }

  static toConnectSummaryEntity(dto: PlatformConnectSummaryModel): PlatformConnectSummary {
    return new PlatformConnectSummary({
      totalAccounts: dto.totalAccounts ?? 0,
      activeAccounts: dto.activeAccounts ?? 0,
      pendingOnboarding: dto.pendingOnboarding ?? 0,
      disabledAccounts: dto.disabledAccounts ?? 0,
      totalCommissionsEarned: dto.totalCommissionsEarned ?? 0,
      totalCommissionsPending: dto.totalCommissionsPending ?? 0,
    });
  }

  static toLinksEntity(dto: PlatformStripeLinksModel): PlatformStripeLinks {
    return new PlatformStripeLinks({
      dashboard: dto.dashboard ?? "",
      payments: dto.payments ?? "",
      payouts: dto.payouts ?? "",
      connect: dto.connect ?? "",
      developers: dto.developers ?? "",
      webhooks: dto.webhooks ?? "",
      events: dto.events ?? "",
      customers: dto.customers ?? "",
    });
  }
}
