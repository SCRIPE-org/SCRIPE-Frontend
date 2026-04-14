/**
 * Invoice Entities — Rich domain entities with getters and computed properties.
 */

// ── Invoice (Full Detail) ──

export interface InvoiceData {
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
  lineItems: InvoiceLineItem[];
  transactions: PaymentTransaction[];
}

export class Invoice {
  constructor(public readonly data: InvoiceData) { }

  get id(): string { return this.data.id; }
  get tenantId(): string { return this.data.tenantId; }
  get tenantName(): string { return this.data.tenantName; }
  get subscriptionId(): string | undefined { return this.data.subscriptionId; }
  get invoiceNumber(): string { return this.data.invoiceNumber; }
  get currency(): string { return this.data.currency; }
  get subTotal(): number { return this.data.subTotal; }
  get discountAmount(): number { return this.data.discountAmount; }
  get taxAmount(): number { return this.data.taxAmount; }
  get total(): number { return this.data.total; }
  get status(): string { return this.data.status; }
  get dueDate(): string | undefined { return this.data.dueDate; }
  get paidAt(): string | undefined { return this.data.paidAt; }
  get billingCycle(): string { return this.data.billingCycle; }
  get stripeInvoiceId(): string | undefined { return this.data.stripeInvoiceId; }
  get pdfUrl(): string | undefined { return this.data.pdfUrl; }
  get notes(): string | undefined { return this.data.notes; }
  get createdAt(): string { return this.data.createdAt; }
  get lineItems(): InvoiceLineItem[] { return this.data.lineItems; }
  get transactions(): PaymentTransaction[] { return this.data.transactions; }

  // ── Computed Properties ──
  get isPaid(): boolean { return this.data.status === "Paid"; }
  get isPending(): boolean { return this.data.status === "Pending"; }
  get isOverdue(): boolean { return this.data.status === "Overdue"; }
  get hasDiscount(): boolean { return this.data.discountAmount > 0; }
  get hasPdf(): boolean { return !!this.data.pdfUrl; }
  get lineItemCount(): number { return this.data.lineItems.length; }

  copyWith(updates: Partial<InvoiceData>): Invoice {
    return new Invoice({ ...this.data, ...updates });
  }
}

// ── Invoice List Item ──

export interface InvoiceListItemData {
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

export class InvoiceListItem {
  constructor(public readonly data: InvoiceListItemData) { }

  get id(): string { return this.data.id; }
  get tenantId(): string { return this.data.tenantId; }
  get tenantName(): string { return this.data.tenantName; }
  get invoiceNumber(): string { return this.data.invoiceNumber; }
  get currency(): string { return this.data.currency; }
  get total(): number { return this.data.total; }
  get status(): string { return this.data.status; }
  get dueDate(): string | undefined { return this.data.dueDate; }
  get paidAt(): string | undefined { return this.data.paidAt; }
  get billingCycle(): string { return this.data.billingCycle; }
  get createdAt(): string { return this.data.createdAt; }

  get isPaid(): boolean { return this.data.status === "Paid"; }

  copyWith(updates: Partial<InvoiceListItemData>): InvoiceListItem {
    return new InvoiceListItem({ ...this.data, ...updates });
  }
}

// ── Simple Value Types (kept as interfaces — no domain logic needed) ──

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
  qrCodeBase64?: string;
  emailSent?: boolean;
}

export interface BillingPortal {
  url: string;
}

// ── Billing Dashboard (Server-Computed KPIs) ──

export interface BillingDashboardData {
  mrr: number;
  arr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledLast30Days: number;
  churnRate: number;
  revenueTrend: MonthlyRevenuePoint[];
  editionBreakdown: EditionBreakdownItem[];
  currency: string;
}

export class BillingDashboard {
  constructor(public readonly data: BillingDashboardData) {}

  get mrr(): number { return this.data.mrr; }
  get arr(): number { return this.data.arr; }
  get totalRevenue(): number { return this.data.totalRevenue; }
  get activeSubscriptions(): number { return this.data.activeSubscriptions; }
  get trialSubscriptions(): number { return this.data.trialSubscriptions; }
  get cancelledLast30Days(): number { return this.data.cancelledLast30Days; }
  get churnRate(): number { return this.data.churnRate; }
  get revenueTrend(): MonthlyRevenuePoint[] { return this.data.revenueTrend; }
  get editionBreakdown(): EditionBreakdownItem[] { return this.data.editionBreakdown; }
  get currency(): string { return this.data.currency; }

  // ── Computed Properties ──
  get totalSubscriptions(): number { return this.activeSubscriptions + this.trialSubscriptions; }
  get hasRevenue(): boolean { return this.totalRevenue > 0; }
  get isHealthy(): boolean { return this.churnRate < 5; }
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

export interface EditionBreakdownItem {
  editionId: string;
  editionName: string;
  activeCount: number;
  revenue: number;
}

// ── Payment Link ──

export interface PaymentLink {
  url: string;
  linkId: string;
}
