/**
 * Billing Mapper — DTO → Entity conversion
 */
import { Invoice, InvoiceListItem, BillingDashboard } from "../../domain/entities/Invoice";
import type {
  InvoiceData,
  InvoiceListItemData,
  InvoiceLineItem,
  PaymentTransaction,
  CheckoutSession,
  BillingPortal,
  BillingDashboardData,
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
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString, optionalIsoDate } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const InvoiceLineItemSchema = z.object({
  id: uuidField(),
  description: optionalString(),
  quantity: z.number().int().optional().default(0),
  unitPrice: z.number().optional().default(0),
  total: z.number().optional().default(0),
});

const PaymentTransactionSchema = z.object({
  id: uuidField(),
  invoiceId: uuidField(),
  tenantId: uuidField(),
  gateway: optionalString(),
  gatewayTransactionId: z.string().optional().nullable(),
  gatewayCustomerId: z.string().optional().nullable(),
  amount: z.number().optional().default(0),
  currency: optionalString(),
  status: z.string().optional().default("Pending"),
  failureReason: z.string().optional().nullable(),
  processedAt: optionalIsoDate(),
  refundedAt: optionalIsoDate(),
  createdAt: optionalIsoDate(),
});

const InvoiceResponseSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  tenantName: optionalString(),
  subscriptionId: z.string().optional().nullable(),
  invoiceNumber: optionalString(),
  currency: z.string().optional().default("USD"),
  subTotal: z.number().optional().default(0),
  discountAmount: z.number().optional().default(0),
  taxAmount: z.number().optional().default(0),
  total: z.number().optional().default(0),
  status: z.string().optional().default("Draft"),
  dueDate: optionalIsoDate(),
  paidAt: optionalIsoDate(),
  billingCycle: optionalString(),
  stripeInvoiceId: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: optionalIsoDate(),
  lineItems: z.array(InvoiceLineItemSchema).optional().default([]),
  transactions: z.array(PaymentTransactionSchema).optional().default([]),
});

const InvoiceListResponseSchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  tenantName: optionalString(),
  invoiceNumber: optionalString(),
  currency: z.string().optional().default("USD"),
  total: z.number().optional().default(0),
  status: z.string().optional().default("Draft"),
  dueDate: optionalIsoDate(),
  paidAt: optionalIsoDate(),
  billingCycle: optionalString(),
  createdAt: optionalIsoDate(),
});

const RevenueTrendSchema = z.object({
  month: optionalString(),
  revenue: z.number().optional().default(0),
  newSubscriptions: z.number().int().optional().default(0),
});

const EditionBreakdownSchema = z.object({
  editionId: optionalString(),
  editionName: optionalString(),
  activeCount: z.number().int().optional().default(0),
  revenue: z.number().optional().default(0),
});

const BillingDashboardSchema = z.object({
  mrr: z.number().optional().default(0),
  arr: z.number().optional().default(0),
  totalRevenue: z.number().optional().default(0),
  activeSubscriptions: z.number().int().optional().default(0),
  trialSubscriptions: z.number().int().optional().default(0),
  cancelledLast30Days: z.number().int().optional().default(0),
  churnRate: z.number().optional().default(0),
  revenueTrend: z.array(RevenueTrendSchema).optional().default([]),
  editionBreakdown: z.array(EditionBreakdownSchema).optional().default([]),
  currency: z.string().optional().default("USD"),
});

export class BillingMapper {
  static toInvoice(dto: InvoiceResponseModel): Invoice {
    const v = safeParseApiResponse(InvoiceResponseSchema, dto, "Invoice");

    const data: InvoiceData = {
      id: v.id,
      tenantId: v.tenantId,
      tenantName: v.tenantName ?? "Unknown",
      subscriptionId: v.subscriptionId ?? undefined,
      invoiceNumber: v.invoiceNumber ?? "",
      currency: v.currency ?? "USD",
      subTotal: v.subTotal ?? 0,
      discountAmount: v.discountAmount ?? 0,
      taxAmount: v.taxAmount ?? 0,
      total: v.total ?? 0,
      status: v.status ?? "Draft",
      dueDate: v.dueDate ?? undefined,
      paidAt: v.paidAt ?? undefined,
      billingCycle: v.billingCycle ?? "",
      stripeInvoiceId: v.stripeInvoiceId ?? undefined,
      pdfUrl: v.pdfUrl ?? undefined,
      notes: v.notes ?? undefined,
      createdAt: v.createdAt ?? "",
      lineItems: (v.lineItems ?? []).map(BillingMapper.toLineItemFromValidated),
      transactions: (v.transactions ?? []).map(BillingMapper.toTransactionFromValidated),
    };
    return new Invoice(data);
  }

  static toInvoiceListItem(dto: InvoiceListResponseModel): InvoiceListItem {
    const v = safeParseApiResponse(InvoiceListResponseSchema, dto, "InvoiceListItem");

    const data: InvoiceListItemData = {
      id: v.id,
      tenantId: v.tenantId,
      tenantName: v.tenantName ?? "Unknown",
      invoiceNumber: v.invoiceNumber ?? "",
      currency: v.currency ?? "USD",
      total: v.total ?? 0,
      status: v.status ?? "Draft",
      dueDate: v.dueDate ?? undefined,
      paidAt: v.paidAt ?? undefined,
      billingCycle: v.billingCycle ?? "",
      createdAt: v.createdAt ?? "",
    };
    return new InvoiceListItem(data);
  }

  /** Called from raw model (e.g., direct usage without validation pass-through) */
  static toLineItem(dto: InvoiceLineItemModel): InvoiceLineItem {
    return {
      id: dto.id,
      description: dto.description ?? "",
      quantity: dto.quantity ?? 0,
      unitPrice: dto.unitPrice ?? 0,
      total: dto.total ?? 0,
    };
  }

  /** Called from Zod-validated intermediary (no null descriptions) */
  private static toLineItemFromValidated(dto: z.infer<typeof InvoiceLineItemSchema>): InvoiceLineItem {
    return {
      id: dto.id,
      description: dto.description ?? "",
      quantity: dto.quantity ?? 0,
      unitPrice: dto.unitPrice ?? 0,
      total: dto.total ?? 0,
    };
  }

  /** Called from raw model (e.g., direct usage without validation pass-through) */
  static toTransaction(dto: PaymentTransactionModel): PaymentTransaction {
    return {
      id: dto.id,
      invoiceId: dto.invoiceId,
      tenantId: dto.tenantId,
      gateway: dto.gateway ?? "",
      gatewayTransactionId: dto.gatewayTransactionId ?? undefined,
      gatewayCustomerId: dto.gatewayCustomerId ?? undefined,
      amount: dto.amount ?? 0,
      currency: dto.currency ?? "USD",
      status: dto.status ?? "Pending",
      failureReason: dto.failureReason ?? undefined,
      processedAt: dto.processedAt ?? undefined,
      refundedAt: dto.refundedAt ?? undefined,
      createdAt: dto.createdAt ?? "",
    };
  }

  /** Called from Zod-validated intermediary */
  private static toTransactionFromValidated(dto: z.infer<typeof PaymentTransactionSchema>): PaymentTransaction {
    return {
      id: dto.id,
      invoiceId: dto.invoiceId,
      tenantId: dto.tenantId,
      gateway: dto.gateway ?? "",
      gatewayTransactionId: dto.gatewayTransactionId ?? undefined,
      gatewayCustomerId: dto.gatewayCustomerId ?? undefined,
      amount: dto.amount ?? 0,
      currency: dto.currency ?? "USD",
      status: dto.status ?? "Pending",
      failureReason: dto.failureReason ?? undefined,
      processedAt: dto.processedAt ?? undefined,
      refundedAt: dto.refundedAt ?? undefined,
      createdAt: dto.createdAt ?? "",
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
    const v = safeParseApiResponse(BillingDashboardSchema, dto, "BillingDashboard");

    const data: BillingDashboardData = {
      mrr: v.mrr ?? 0,
      arr: v.arr ?? 0,
      totalRevenue: v.totalRevenue ?? 0,
      activeSubscriptions: v.activeSubscriptions ?? 0,
      trialSubscriptions: v.trialSubscriptions ?? 0,
      cancelledLast30Days: v.cancelledLast30Days ?? 0,
      churnRate: v.churnRate ?? 0,
      revenueTrend: (v.revenueTrend ?? []).map((p) => ({
        month: p.month ?? "",
        revenue: p.revenue ?? 0,
        newSubscriptions: p.newSubscriptions ?? 0,
      })),
      editionBreakdown: (v.editionBreakdown ?? []).map((e) => ({
        editionId: e.editionId ?? "",
        editionName: e.editionName ?? "Unknown",
        activeCount: e.activeCount ?? 0,
        revenue: e.revenue ?? 0,
      })),
      currency: v.currency ?? "USD",
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
