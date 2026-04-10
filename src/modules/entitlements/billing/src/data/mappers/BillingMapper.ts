/**
 * Billing Mapper — DTO → Entity conversion
 */
import {
  Invoice,
  InvoiceListItem,
} from "../../domain/entities/Invoice";
import type {
  InvoiceData,
  InvoiceListItemData,
  InvoiceLineItem,
  PaymentTransaction,
  CheckoutSession,
  BillingPortal,
} from "../../domain/entities/Invoice";
import type {
  InvoiceResponseModel,
  InvoiceListResponseModel,
  InvoiceLineItemModel,
  PaymentTransactionModel,
  CheckoutSessionResponseModel,
  BillingPortalResponseModel,
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
    };
  }

  static toBillingPortal(dto: BillingPortalResponseModel): BillingPortal {
    return {
      url: dto.url ?? "",
    };
  }
}
