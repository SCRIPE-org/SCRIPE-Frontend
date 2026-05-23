
export type PayoutStatus = "Pending" | "Processing" | "Paid" | "Failed";

export interface AppPurchaseData {
  id: string;
  appListingId: string;
  appName: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  pricingModel: "OneTime" | "Subscription";
  purchasedAt: string;
}

export class AppPurchase {
  constructor(private readonly data: AppPurchaseData) {}
  get id() { return this.data.id; }
  get appListingId() { return this.data.appListingId; }
  get appName() { return this.data.appName; }
  get tenantId() { return this.data.tenantId; }
  get tenantName() { return this.data.tenantName; }
  get amount() { return this.data.amount; }
  get currency() { return this.data.currency; }
  get pricingModel() { return this.data.pricingModel; }
  get purchasedAt() { return this.data.purchasedAt; }

  get amountLabel(): string {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: this.data.currency || "USD",
    }).format(this.data.amount);
  }
}

export interface DeveloperPayoutData {
  id: string;
  developerProfileId: string;
  developerName: string;
  amount: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: PayoutStatus;
  stripeTransferId: string | null;
  createdAt: string;
}

export class DeveloperPayout {
  constructor(private readonly data: DeveloperPayoutData) {}
  get id() { return this.data.id; }
  get developerProfileId() { return this.data.developerProfileId; }
  get developerName() { return this.data.developerName; }
  get amount() { return this.data.amount; }
  get currency() { return this.data.currency; }
  get periodStart() { return this.data.periodStart; }
  get periodEnd() { return this.data.periodEnd; }
  get status() { return this.data.status; }
  get stripeTransferId() { return this.data.stripeTransferId; }
  get createdAt() { return this.data.createdAt; }

  get isPending() { return this.data.status === "Pending"; }
  get canProcess() { return this.data.status === "Pending"; }

  get amountLabel(): string {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: this.data.currency || "USD",
    }).format(this.data.amount);
  }

  get statusVariant(): "default" | "secondary" | "destructive" | "outline" {
    if (this.data.status === "Paid") return "default";
    if (this.data.status === "Failed") return "destructive";
    if (this.data.status === "Processing") return "secondary";
    return "outline";
  }
}
