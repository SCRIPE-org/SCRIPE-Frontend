/**
 * Interface structure detailing the properties and attributes of Checkout Session.
 */
export interface CheckoutSession {
  sessionId: string;
  url: string;
  qrCodeBase64?: string;
  emailSent?: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Billing Portal.
 */
export interface BillingPortal {
  url: string;
}

/**
 * Interface structure detailing the properties and attributes of Monthly Revenue Point.
 */
export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  newSubscriptions: number;
}

/**
 * Interface structure detailing the properties and attributes of Edition Breakdown Item.
 */
export interface EditionBreakdownItem {
  editionId: string;
  editionName: string;
  activeCount: number;
  revenue: number;
}

/**
 * Interface structure detailing the properties and attributes of Billing Dashboard Data.
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
 * Domain entity class representing a Billing Dashboard.
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
 * Interface structure detailing the properties and attributes of Payment Link.
 */
export interface PaymentLink {
  url: string;
  linkId: string;
}
