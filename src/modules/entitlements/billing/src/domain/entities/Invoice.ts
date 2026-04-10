/**
 * Invoice Entity — matches backend InvoiceResponse / InvoiceListResponse
 */
export interface Invoice {
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
  lineItems: InvoiceLineItem[];
  transactions: PaymentTransaction[];
}

export interface InvoiceListItem {
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

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentTransaction {
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

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface BillingPortal {
  url: string;
}
