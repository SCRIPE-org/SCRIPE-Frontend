/**
 * Subscription Repository Interface
 */
import type {
  Subscription,
  SubscriptionListItem,
  GlobalSubscriptionItem,
  DowngradeImpactReport,
} from "../entities/Subscription";
import type { ExportParams, ExportFileResult } from "../entities/SubscriptionExport";

export interface ISubscriptionRepository {
  // Queries
  getAll(): Promise<GlobalSubscriptionItem[]>;
  getByTenant(tenantId: string): Promise<SubscriptionListItem[]>;
  getById(id: string): Promise<Subscription>;
  getMyTenantSubscription(): Promise<Subscription | null>;

  // Export
  exportSubscriptions(params: ExportParams): Promise<ExportFileResult>;

  // Receipt
  downloadReceipt(tenantId: string): Promise<ExportFileResult>;

  // Lifecycle
  assign(
    tenantId: string,
    data: {
      editionId: string;
      type: string;
      endDate?: string;
      expiryBehavior?: string;
      promoCode?: string;
      currency?: string;
      promotionId?: string;
      skipPayment?: boolean;
    }
  ): Promise<string>;
  change(
    tenantId: string,
    data: {
      editionId: string;
      type: string;
      promoCode?: string;
      currency?: string;
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

  // ── Downgrade Impact ──
  getDowngradeImpact(tenantId: string, targetEditionId: string): Promise<DowngradeImpactReport>;

  // ── Currency ──
  changeCurrency(tenantId: string, currency: string): Promise<void>;
}
