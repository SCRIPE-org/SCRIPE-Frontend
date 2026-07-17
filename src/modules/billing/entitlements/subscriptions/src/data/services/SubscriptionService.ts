/**
 * Subscription Service — API calls only
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { ISubscriptionService } from "../../domain/interfaces/ISubscriptionService";
import type {
  SubscriptionModel,
  SubscriptionListModel,
  GlobalSubscriptionModel,
} from "../models/SubscriptionModels";
import { SUBSCRIPTION_ENDPOINTS } from "./subscription.endpoints";

/**
 * Http API network service for subscription.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class SubscriptionService implements ISubscriptionService {
  constructor(private readonly api: IApiService) {}

  // ── Queries ──

  async getAll(): Promise<GlobalSubscriptionModel[]> {
    return this.api.get<GlobalSubscriptionModel[]>(
      SUBSCRIPTION_ENDPOINTS.LIST_ALL
    );
  }

  async getByTenant(tenantId: string): Promise<SubscriptionListModel[]> {
    return this.api.get<SubscriptionListModel[]>(
      SUBSCRIPTION_ENDPOINTS.LIST_BY_TENANT(tenantId)
    );
  }

  async getById(id: string): Promise<SubscriptionModel> {
    return this.api.get<SubscriptionModel>(SUBSCRIPTION_ENDPOINTS.GET_BY_ID(id));
  }

  async getMyTenantSubscription(): Promise<SubscriptionModel | null> {
    try {
      return await this.api.get<SubscriptionModel>(SUBSCRIPTION_ENDPOINTS.GET_MY_SUBSCRIPTION);
    } catch {
      // 204 No Content → null
      return null;
    }
  }

  // ── Lifecycle Actions ──

  async assign(
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
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      SUBSCRIPTION_ENDPOINTS.ASSIGN(tenantId),
      data
    );
  }

  async change(
    tenantId: string,
    data: {
      editionId: string;
      type: string;
      expiryBehavior?: string;
      currency?: string;
      promoCode?: string;
      promotionId?: string;
    }
  ): Promise<void> {
    await this.api.put(SUBSCRIPTION_ENDPOINTS.CHANGE(tenantId), data);
  }

  async renew(tenantId: string, type: string): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.RENEW(tenantId), { type });
  }

  async convertTrial(tenantId: string, type: string): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.CONVERT(tenantId), { type });
  }

  async suspend(
    tenantId: string,
    reason: string,
    useFallback: boolean = false,
    refundType: string = "None",
    customRefundAmount?: number
  ): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.SUSPEND(tenantId), {
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    });
  }

  async resume(tenantId: string, type?: string): Promise<void> {
    await this.api.post(
      SUBSCRIPTION_ENDPOINTS.RESUME(tenantId),
      type ? { type } : {}
    );
  }

  async cancel(
    tenantId: string,
    reason?: string,
    useFallback: boolean = false,
    refundType: string = "None",
    customRefundAmount?: number
  ): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.CANCEL(tenantId), {
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    });
  }

  async resync(tenantId: string): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.RESYNC(tenantId), {});
  }

  async revoke(id: string): Promise<void> {
    await this.api.delete(SUBSCRIPTION_ENDPOINTS.REVOKE(id));
  }

  async changeCurrency(tenantId: string, currency: string): Promise<void> {
    await this.api.post(SUBSCRIPTION_ENDPOINTS.CHANGE_CURRENCY(tenantId), {
      currency,
    });
  }

  async getDowngradeImpact(
    tenantId: string,
    targetEditionId: string
  ): Promise<{
    hasOverflow: boolean;
    overflows: {
      resourceType: string;
      featureName: string;
      currentCount: number;
      newLimit: number;
      overflowCount: number;
    }[];
  }> {
    return this.api.get(
      SUBSCRIPTION_ENDPOINTS.DOWNGRADE_IMPACT(tenantId, targetEditionId)
    );
  }

  // ── Export (blob download) ──

  async exportSubscriptions(params: {
    format: string;
    statusFilter?: string;
    typeFilter?: string;
    displayCurrency?: string;
    dateFrom?: string;
    dateTo?: string;
    expiringInDays?: number;
    editionFilter?: string;
  }): Promise<{ blob: Blob; filename: string }> {
    const ext = params.format === "excel" ? "xlsx" : params.format === "csv" ? "csv" : "pdf";
    const filename = `subscriptions-export.${ext}`;

    const endpointPath = SUBSCRIPTION_ENDPOINTS.EXPORT(
      params.format,
      params.statusFilter,
      params.typeFilter,
      params.displayCurrency,
      params.dateFrom,
      params.dateTo,
      params.expiringInDays,
      params.editionFilter
    );

    const blob = await this.api.getBlob(endpointPath);
    return { blob, filename };
  }

  // ── Receipt (blob download — backend-generated PDF) ──

  async downloadReceipt(tenantId: string): Promise<{ blob: Blob; filename: string }> {
    const endpointPath = SUBSCRIPTION_ENDPOINTS.RECEIPT(tenantId);
    const blob = await this.api.getBlob(endpointPath);
    const filename = `subscription-receipt.pdf`;
    return { blob, filename };
  }
}
