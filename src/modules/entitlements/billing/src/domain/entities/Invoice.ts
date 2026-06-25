/**
 * Invoice Entities — Rich domain entities with getters and computed properties.
 */
// ── Invoice (Full Detail) ──
/**
 * Interface detailing the complete schema of an Invoice entity.
 * Holds identifiers, customer and company names, total breakdowns (subtotal, tax, discounts),
 * navigation urls, line item details, and historical payment transactions.
 */
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
/**
 * Domain entity wrapping full invoice properties with rich computed logic.
 * Contains methods to query status attributes (e.g. isPaid, isOverdue), check active discounts,
 * compute line-item statistics, and create immutable copy overrides.
 */
export class Invoice {
  constructor(public readonly data: InvoiceData) {}
  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get tenantName(): string {
    return this.data.tenantName;
  }
  get subscriptionId(): string | undefined {
    return this.data.subscriptionId;
  }
  get invoiceNumber(): string {
    return this.data.invoiceNumber;
  }
  get currency(): string {
    return this.data.currency;
  }
  get subTotal(): number {
    return this.data.subTotal;
  }
  get discountAmount(): number {
    return this.data.discountAmount;
  }
  get taxAmount(): number {
    return this.data.taxAmount;
  }
  get total(): number {
    return this.data.total;
  }
  get status(): string {
    return this.data.status;
  }
  get dueDate(): string | undefined {
    return this.data.dueDate;
  }
  get paidAt(): string | undefined {
    return this.data.paidAt;
  }
  get billingCycle(): string {
    return this.data.billingCycle;
  }
  get stripeInvoiceId(): string | undefined {
    return this.data.stripeInvoiceId;
  }
  get pdfUrl(): string | undefined {
    return this.data.pdfUrl;
  }
  get notes(): string | undefined {
    return this.data.notes;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get lineItems(): InvoiceLineItem[] {
    return this.data.lineItems;
  }
  get transactions(): PaymentTransaction[] {
    return this.data.transactions;
  }
  // ── Computed Properties ──
  get isPaid(): boolean {
    return this.data.status === "Paid";
  }
  get isPending(): boolean {
    return this.data.status === "Pending";
  }
  get isOverdue(): boolean {
    return this.data.status === "Overdue";
  }
  get hasDiscount(): boolean {
    return this.data.discountAmount > 0;
  }
  get hasPdf(): boolean {
    return !!this.data.pdfUrl;
  }
  get lineItemCount(): number {
    return this.data.lineItems.length;
  }
  copyWith(updates: Partial<InvoiceData>): Invoice {
    return new Invoice({ ...this.data, ...updates });
  }
}
// ── Invoice List Item ──
/**
 * Data structure detailing the layout of lightweight invoice summaries.
 * Optimized for paginated dashboard lists and reports where full line-item details are unnecessary.
 */
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
/**
 * Domain entity representing a lightweight row in an invoice data list.
 * Exposes core fields such as payment totals, active cycles, status flags, and formatting utilities.
 */
export class InvoiceListItem {
  constructor(public readonly data: InvoiceListItemData) {}
  get id(): string {
    return this.data.id;
  }
  get tenantId(): string {
    return this.data.tenantId;
  }
  get tenantName(): string {
    return this.data.tenantName;
  }
  get invoiceNumber(): string {
    return this.data.invoiceNumber;
  }
  get currency(): string {
    return this.data.currency;
  }
  get total(): number {
    return this.data.total;
  }
  get status(): string {
    return this.data.status;
  }
  get dueDate(): string | undefined {
    return this.data.dueDate;
  }
  get paidAt(): string | undefined {
    return this.data.paidAt;
  }
  get billingCycle(): string {
    return this.data.billingCycle;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get isPaid(): boolean {
    return this.data.status === "Paid";
  }
  copyWith(updates: Partial<InvoiceListItemData>): InvoiceListItem {
    return new InvoiceListItem({ ...this.data, ...updates });
  }
}
// ── Simple Value Types (kept as interfaces — no domain logic needed) ──
/**
 * Schema representing an individual line-item row within an invoice receipt.
 * Holds line identifiers, unit price rules, quantity multipliers, and calculated subtotals.
 */
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
/**
 * Data structure mapping gateway payment logs (Stripe, Paypal) associated with an invoice.
 * Captures status changes, processing timestamps, refunds, and failure codes.
 */
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
