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
 * Interface structure detailing the properties and attributes of Invoice List Response Model.
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
 * Interface structure detailing the properties and attributes of Invoice Line Item Model.
 */
export interface InvoiceLineItemModel {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Interface structure detailing the properties and attributes of Payment Transaction Model.
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
 * Interface structure detailing the properties and attributes of Checkout Session Response Model.
 */
export interface CheckoutSessionResponseModel {
  sessionId: string;
  url: string;
  qrCodeBase64?: string;
  emailSent?: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Billing Portal Response Model.
 */
export interface BillingPortalResponseModel {
  url: string;
}

/**
 * Interface structure detailing the properties and attributes of Paged Result Model.
 */
export interface PagedResultModel<T> {
  items: T[];
  totalCount: number;
}

// ── Dashboard Models ──

/**
 * Interface structure detailing the properties and attributes of Billing Dashboard Response Model.
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
 * Interface structure detailing the properties and attributes of Monthly Revenue Point Model.
 */
export interface MonthlyRevenuePointModel {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

/**
 * Interface structure detailing the properties and attributes of Edition Breakdown Item Model.
 */
export interface EditionBreakdownItemModel {
  editionId: string;
  editionName: string;
  activeCount: number;
  revenue: number;
}

// ── Payment Link Models ──

/**
 * Interface structure detailing the properties and attributes of Payment Link Response Model.
 */
export interface PaymentLinkResponseModel {
  url: string;
  linkId: string;
}

/**
 * Interface structure detailing the properties and attributes of Create Payment Link Request Model.
 */
export interface CreatePaymentLinkRequestModel {
  editionId: string;
  subscriptionType: string;
  currency?: string;
}
