/**
 * TenantGateway Domain Entity
 *
 * Rich domain entity for tenant-owned payment gateway configurations.
 * Constructed by the mapper from DTO/model data — never used directly in the data layer.
 */

export interface TenantGatewayData {
  id: string;
  gateway: string;
  displayLabel: string;
  merchantId: string;
  isEnabled: boolean;
  isVerified: boolean;
  isTestMode: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
  modifiedAt: string | null;
}

export class TenantGateway {
  constructor(private readonly data: TenantGatewayData) {}

  get id() {
    return this.data.id;
  }
  get gateway() {
    return this.data.gateway;
  }
  get displayLabel() {
    return this.data.displayLabel;
  }
  get merchantId() {
    return this.data.merchantId;
  }
  get isEnabled() {
    return this.data.isEnabled;
  }
  get isVerified() {
    return this.data.isVerified;
  }
  get isTestMode() {
    return this.data.isTestMode;
  }
  get lastVerifiedAt() {
    return this.data.lastVerifiedAt;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get modifiedAt() {
    return this.data.modifiedAt;
  }

  /** Human-readable gateway label with fallback */
  get gatewayLabel(): string {
    return this.data.displayLabel || this.data.gateway;
  }

  /** Status badge text */
  get statusText(): string {
    if (!this.data.isEnabled) return "Disabled";
    if (this.data.isVerified) return "Connected";
    return "Not Verified";
  }

  /** Status badge variant */
  get statusVariant(): "default" | "success" | "destructive" | "secondary" {
    if (!this.data.isEnabled) return "secondary";
    if (this.data.isVerified) return "success";
    return "destructive";
  }

  /** Gateway icon name (Lucide icon) */
  get iconName(): string {
    switch (this.data.gateway) {
      case "Stripe":
        return "CreditCard";
      case "PayPal":
        return "Wallet";
      case "Paymob":
        return "Banknote";
      default:
        return "CreditCard";
    }
  }

  copyWith(updates: Partial<TenantGatewayData>): TenantGateway {
    return new TenantGateway({ ...this.data, ...updates });
  }
}
