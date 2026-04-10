/**
 * Billing Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface InvoiceResponseModel {
  id: string;
  tenantId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  currency: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  billingCycle: string;
  stripeInvoiceId?: string;
  pdfUrl?: string;
  notes?: string;
  createdAt: string;
  lineItems: InvoiceLineItemModel[];
  transactions: PaymentTransactionModel[];
}

export interface InvoiceListResponseModel {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  currency: string;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  billingCycle: string;
  createdAt: string;
}

export interface InvoiceLineItemModel {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentTransactionModel {
  id: string;
  invoiceId: string;
  tenantId: string;
  gateway: string;
  gatewayTransactionId?: string;
  gatewayCustomerId?: string;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string;
  processedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface CheckoutSessionResponseModel {
  sessionId: string;
  url: string;
}

export interface BillingPortalResponseModel {
  url: string;
}

export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
}
