/**
 * Billing Mapper — DTO → Entity conversion
 */
import {
  Invoice,
  InvoiceListItem,
  BillingDashboard,
} from "../../domain/entities/Invoice";
import type {
  InvoiceData,
  InvoiceListItemData,
  InvoiceLineItem,
  PaymentTransaction,
  CheckoutSession,
  BillingPortal,
  BillingDashboardData,
  MonthlyRevenuePoint,
  EditionBreakdownItem,
  PaymentLink,
} from "../../domain/entities/Invoice";
import type {
  InvoiceResponseModel,
  InvoiceListResponseModel,
  InvoiceLineItemModel,
  PaymentTransactionModel,
  CheckoutSessionResponseModel,
  BillingPortalResponseModel,
  BillingDashboardResponseModel,
  PaymentLinkResponseModel,
} from "../models/BillingModels";

export class BillingMapper {
  static toInvoice(dto: InvoiceResponseModel): Invoice {
    const data: InvoiceData = {
      id: dto.id,
      tenantId: dto.tenantId,
      subscriptionId: dto.subscriptionId,
      invoiceNumber: dto.invoiceNumber ?? "",
      currency: dto.currency ?? "USD",
      subTotal: dto.subTotal ?? 0,
      discountAmount: dto.discountAmount ?? 0,
      taxAmount: dto.taxAmount ?? 0,
      total: dto.total ?? 0,
      status: dto.status ?? "Draft",
      dueDate: dto.dueDate,
      paidAt: dto.paidAt,
      billingCycle: dto.billingCycle ?? "",
      stripeInvoiceId: dto.stripeInvoiceId,
      pdfUrl: dto.pdfUrl,
      notes: dto.notes,
      createdAt: dto.createdAt,
      lineItems: (dto.lineItems ?? []).map(BillingMapper.toLineItem),
      transactions: (dto.transactions ?? []).map(BillingMapper.toTransaction),
    };
    return new Invoice(data);
  }

  static toInvoiceListItem(dto: InvoiceListResponseModel): InvoiceListItem {
    const data: InvoiceListItemData = {
      id: dto.id,
      tenantId: dto.tenantId,
      invoiceNumber: dto.invoiceNumber ?? "",
      currency: dto.currency ?? "USD",
      total: dto.total ?? 0,
      status: dto.status ?? "Draft",
      dueDate: dto.dueDate,
      paidAt: dto.paidAt,
      billingCycle: dto.billingCycle ?? "",
      createdAt: dto.createdAt,
    };
    return new InvoiceListItem(data);
  }

  static toLineItem(dto: InvoiceLineItemModel): InvoiceLineItem {
    return {
      id: dto.id,
      description: dto.description ?? "",
      quantity: dto.quantity ?? 0,
      unitPrice: dto.unitPrice ?? 0,
      total: dto.total ?? 0,
    };
  }

  static toTransaction(dto: PaymentTransactionModel): PaymentTransaction {
    return {
      id: dto.id,
      invoiceId: dto.invoiceId,
      tenantId: dto.tenantId,
      gateway: dto.gateway ?? "",
      gatewayTransactionId: dto.gatewayTransactionId,
      gatewayCustomerId: dto.gatewayCustomerId,
      amount: dto.amount ?? 0,
      currency: dto.currency ?? "USD",
      status: dto.status ?? "Pending",
      failureReason: dto.failureReason,
      processedAt: dto.processedAt,
      refundedAt: dto.refundedAt,
      createdAt: dto.createdAt,
    };
  }

  static toCheckoutSession(dto: CheckoutSessionResponseModel): CheckoutSession {
    return {
      sessionId: dto.sessionId ?? "",
      url: dto.url ?? "",
      qrCodeBase64: dto.qrCodeBase64,
      emailSent: dto.emailSent ?? false,
    };
  }

  static toBillingPortal(dto: BillingPortalResponseModel): BillingPortal {
    return {
      url: dto.url ?? "",
    };
  }

  // ── Dashboard (Server-Computed KPIs) ──

  static toDashboard(dto: BillingDashboardResponseModel): BillingDashboard {
    const data: BillingDashboardData = {
      mrr: dto.mrr ?? 0,
      arr: dto.arr ?? 0,
      totalRevenue: dto.totalRevenue ?? 0,
      activeSubscriptions: dto.activeSubscriptions ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
      cancelledLast30Days: dto.cancelledLast30Days ?? 0,
      churnRate: dto.churnRate ?? 0,
      revenueTrend: (dto.revenueTrend ?? []).map((p) => ({
        month: p.month ?? "",
        revenue: p.revenue ?? 0,
        newSubscriptions: p.newSubscriptions ?? 0,
      })),
      editionBreakdown: (dto.editionBreakdown ?? []).map((e) => ({
        editionId: e.editionId ?? "",
        editionName: e.editionName ?? "Unknown",
        activeCount: e.activeCount ?? 0,
        revenue: e.revenue ?? 0,
      })),
      currency: dto.currency ?? "USD",
    };
    return new BillingDashboard(data);
  }

  // ── Payment Link ──

  static toPaymentLink(dto: PaymentLinkResponseModel): PaymentLink {
    return {
      url: dto.url ?? "",
      linkId: dto.linkId ?? "",
    };
  }
}

