export interface CommissionLedgerEntryData {
  id: string;
  tenantId: string;
  userSubscriptionId: string | null;
  paymentTransactionId: string | null;
  commissionInvoiceId: string | null;
  gateway: string;
  gatewayTransactionId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  collectionMethod: string;
  stripePaymentIntentId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export class CommissionLedgerEntry {
  constructor(private readonly data: CommissionLedgerEntryData) {}

  get id() { return this.data.id; }
  get tenantId() { return this.data.tenantId; }
  get userSubscriptionId() { return this.data.userSubscriptionId; }
  get paymentTransactionId() { return this.data.paymentTransactionId; }
  get commissionInvoiceId() { return this.data.commissionInvoiceId; }
  get gateway() { return this.data.gateway; }
  get gatewayTransactionId() { return this.data.gatewayTransactionId; }
  get grossAmount() { return this.data.grossAmount; }
  get commissionRate() { return this.data.commissionRate; }
  get commissionAmount() { return this.data.commissionAmount; }
  get netAmount() { return this.data.netAmount; }
  get currency() { return this.data.currency; }
  get status() { return this.data.status; }
  get collectionMethod() { return this.data.collectionMethod; }
  get stripePaymentIntentId() { return this.data.stripePaymentIntentId; }
  get notes() { return this.data.notes; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }

  /** True for Stripe Connect (instant fee collection). False for PayPal/Paymob (invoiced). */
  get isInstant(): boolean { return this.data.collectionMethod === "Instant"; }

  /** Human-readable gateway label. */
  get displayGateway(): string {
    switch (this.data.gateway) {
      case "StripeConnect": return "Stripe Connect";
      case "PayPal":        return "PayPal";
      case "Paymob":        return "Paymob";
      case "Stripe":        return "Stripe";
      default:              return this.data.gateway;
    }
  }

  /** Commission rate formatted as a percentage string (e.g. "10%"). */
  get commissionRateDisplay(): string {
    return `${(this.data.commissionRate * 100).toFixed(0)}%`;
  }

  copyWith(updates: Partial<CommissionLedgerEntryData>): CommissionLedgerEntry {
    return new CommissionLedgerEntry({ ...this.data, ...updates });
  }
}

