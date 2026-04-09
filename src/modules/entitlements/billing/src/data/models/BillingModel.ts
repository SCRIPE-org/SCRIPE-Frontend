export interface BillingModel {
  mode: string;
  stripeConnected: string;
  revenue: string;
  features: string;
  publicPlans: string;
}

export interface BillingListModel {
  [key: string]: unknown;
}
