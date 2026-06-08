/**
 * Subscription Service Interface (API contract)
 *
 * Defines the contract for subscription API operations.
 * Implemented by SubscriptionService in the data layer.
 */
import type {
  SubscriptionModel,
  SubscriptionListModel,
  GlobalSubscriptionModel,
} from "../../data/models/SubscriptionModels";

export interface ISubscriptionService {
  // ── Queries ──
  getAll(): Promise<GlobalSubscriptionModel[]>;
  getByTenant(tenantId: string): Promise<SubscriptionListModel[]>;
  getById(id: string): Promise<SubscriptionModel>;
  getMyTenantSubscription(): Promise<SubscriptionModel | null>;

  // ── Lifecycle Actions ──
  assign(
    tenantId: string,
    data: {
      editionId: string;
      type: string;
      endDate?: string;
      expiryBehavior?: string;
      currency?: string;
      promoCode?: string;
      promotionId?: string;
      skipPayment?: boolean;
    }
  ): Promise<{ id: string }>;
  change(
    tenantId: string,
    data: {
      editionId: string;
      type: string;
      expiryBehavior?: string;
      currency?: string;
      promoCode?: string;
      promotionId?: string;
    }
  ): Promise<void>;
  renew(tenantId: string, type: string): Promise<void>;
  convertTrial(tenantId: string, type: string): Promise<void>;
  suspend(
    tenantId: string,
    reason: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ): Promise<void>;
  resume(tenantId: string, type?: string): Promise<void>;
  cancel(
    tenantId: string,
    reason?: string,
    useFallback?: boolean,
    refundType?: string,
    customRefundAmount?: number
  ): Promise<void>;
  resync(tenantId: string): Promise<void>;
  revoke(id: string): Promise<void>;

  // ── Export (blob download) ──
  exportSubscriptions(params: {
    format: string;
    statusFilter?: string;
    typeFilter?: string;
    displayCurrency?: string;
    dateFrom?: string;
    dateTo?: string;
    expiringInDays?: number;
    editionFilter?: string;
  }): Promise<{ blob: Blob; filename: string }>;

  // ── Receipt ──
  downloadReceipt(tenantId: string): Promise<{ blob: Blob; filename: string }>;

  // ── Downgrade Impact ──
  getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<{ hasOverflow: boolean; overflows: { resourceType: string; featureName: string; currentCount: number; newLimit: number; overflowCount: number }[] }>;

  // ── Currency ──
  changeCurrency(tenantId: string, currency: string): Promise<void>;
}
