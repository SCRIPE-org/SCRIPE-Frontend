/**
 * Interface mapping Stripe/gateway checkout session redirection details.
 * Supplies unique checkout identifiers, customer validation URLs, and visual base64 QR code representations.
 */
export interface CheckoutSession {
  sessionId: string;
  url: string;
  qrCodeBase64?: string;
  emailSent?: boolean;
}

/**
 * Interface mapping configuration properties for customer self-service billing portals.
 * Enables client access to billing settings, saved payment methods, and invoice history pages.
 */
export interface BillingPortal {
  url: string;
}

/**
 * Data point mapping revenue trend aggregates for specific month intervals.
 * Feeds billing dashboard charts detailing monthly recurring gains and registration volumes.
 */
export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

/**
 * Breakdown mapping item linking performance stats to a subscription edition.
 * Feeds lists displaying count of active tenants per tier level and revenue statistics.
 */
export interface EditionBreakdownItem {
  editionId: string;
  editionName: string;
  activeCount: number;
  revenue: number;
}

/**
 * Data schema representing dashboard aggregates for subscription performance analytics.
 * Holds calculated metrics including MRR, ARR, active cycles volume, and cancellation rates.
 */
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

/**
 * Domain entity mapping subscription dashboard summaries.
 * Evaluates core telemetry metrics including combined subscription volumes and tenant retention health states.
 */
export class BillingDashboard {
  constructor(private readonly data: BillingDashboardData) {}
  get mrr(): number {
    return this.data.mrr;
  }
  get arr(): number {
    return this.data.arr;
  }
  get totalRevenue(): number {
    return this.data.totalRevenue;
  }
  get activeSubscriptions(): number {
    return this.data.activeSubscriptions;
  }
  get trialSubscriptions(): number {
    return this.data.trialSubscriptions;
  }
  get cancelledLast30Days(): number {
    return this.data.cancelledLast30Days;
  }
  get churnRate(): number {
    return this.data.churnRate;
  }
  get revenueTrend(): MonthlyRevenuePoint[] {
    return this.data.revenueTrend;
  }
  get editionBreakdown(): EditionBreakdownItem[] {
    return this.data.editionBreakdown;
  }
  get currency(): string {
    return this.data.currency;
  }
  get totalSubscriptions(): number {
    return this.activeSubscriptions + this.trialSubscriptions;
  }
  get hasRevenue(): boolean {
    return this.totalRevenue > 0;
  }
  get isHealthy(): boolean {
    return this.churnRate < 5;
  }
  copyWith(updates: Partial<BillingDashboardData>): BillingDashboard {
    return new BillingDashboard({ ...this.data, ...updates });
  }
}

/**
 * Schema detail representing direct payment link urls created for standard subscriptions.
 */
export interface PaymentLink {
  url: string;
  linkId: string;
}
