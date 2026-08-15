/**
 * Billing Data Models — Raw DTO types matching backend API responses exactly.
 * These live in the data layer and are NEVER used in presentation.
 */

export interface InvoiceResponseModel {
  id: string;
  tenantId: string;
  tenantName: string;
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for invoice list response model.
 */
export interface InvoiceListResponseModel {
  id: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  currency: string;
  total: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  billingCycle: string;
  createdAt: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for invoice line item model.
 */
export interface InvoiceLineItemModel {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for payment transaction model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for checkout session response model.
 */
export interface CheckoutSessionResponseModel {
  sessionId: string;
  url: string;
  qrCodeBase64?: string;
  emailSent?: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for billing portal response model.
 */
export interface BillingPortalResponseModel {
  url: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for paged result model.
 */
export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
}

// ── Dashboard Models ──

/**
 * Interface defining property specifications, keys types, and structural contract rules for billing dashboard response model.
 */
export interface BillingDashboardResponseModel {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledLast30Days: number;
  churnRate: number;
  revenueTrend: MonthlyRevenuePointModel[];
  editionBreakdown: EditionBreakdownItemModel[];
  currency: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for monthly revenue point model.
 */
export interface MonthlyRevenuePointModel {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition breakdown item model.
 */
export interface EditionBreakdownItemModel {
  editionId: string;
  editionName: string;
  activeCount: number;
  revenue: number;
}

// ── Payment Link Models ──

/**
 * Interface defining property specifications, keys types, and structural contract rules for payment link response model.
 */
export interface PaymentLinkResponseModel {
  url: string;
  linkId: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for create payment link request model.
 */
export interface CreatePaymentLinkRequestModel {
  editionId: string;
  subscriptionType: string;
  currency?: string;
}
