export interface BillingEntityData {
  mode: string;
  stripeConnected: string;
  revenue: string;
  features: string;
  publicPlans: string;
}

export class BillingEntity {
  constructor(private readonly data: BillingEntityData) {}

  get mode() { return this.data.mode; }
  get stripeConnected() { return this.data.stripeConnected; }
  get revenue() { return this.data.revenue; }
  get features() { return this.data.features; }
  get publicPlans() { return this.data.publicPlans; }

  copyWith(updates: Partial<BillingEntityData>): BillingEntity {
    return new BillingEntity({ ...this.data, ...updates });
  }
}
