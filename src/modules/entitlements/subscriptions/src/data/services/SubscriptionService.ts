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
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export class SubscriptionService implements ISubscriptionService {
  constructor(private readonly api: IApiService) {}

  // ── Queries ──

  async getAll(): Promise<GlobalSubscriptionModel[]> {
    return this.api.get<GlobalSubscriptionModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.LIST_ALL
    );
  }

  async getByTenant(tenantId: string): Promise<SubscriptionListModel[]> {
    return this.api.get<SubscriptionListModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.LIST_BY_TENANT(tenantId)
    );
  }

  async getById(id: string): Promise<SubscriptionModel> {
    return this.api.get<SubscriptionModel>(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.GET_BY_ID(id));
  }

  async getMyTenantSubscription(): Promise<SubscriptionModel | null> {
    try {
      return await this.api.get<SubscriptionModel>(API_ENDPOINTS.ENTITLEMENTS.MY_SUBSCRIPTION.GET);
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
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.ASSIGN(tenantId),
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
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE(tenantId), data);
  }

  async renew(tenantId: string, type: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RENEW(tenantId), { type });
  }

  async convertTrial(tenantId: string, type: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CONVERT(tenantId), { type });
  }

  async suspend(
    tenantId: string,
    reason: string,
    useFallback: boolean = false,
    refundType: string = "None",
    customRefundAmount?: number
  ): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.SUSPEND(tenantId), {
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    });
  }

  async resume(tenantId: string, type?: string): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESUME(tenantId),
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
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CANCEL(tenantId), {
      reason,
      useFallback,
      refundType,
      customRefundAmount,
    });
  }

  async resync(tenantId: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESYNC(tenantId), {});
  }

  async revoke(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.REVOKE(id));
  }

  async changeCurrency(tenantId: string, currency: string): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE_CURRENCY(tenantId),
      { currency }
    );
  }

  async getDowngradeImpact(
    tenantId: string,
    targetEditionId: string
  ): Promise<{ hasOverflow: boolean; overflows: { resourceType: string; featureName: string; currentCount: number; newLimit: number; overflowCount: number }[] }> {
    return this.api.get(
      API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.DOWNGRADE_IMPACT(tenantId, targetEditionId)
    );
  }

  // ── Export (blob download — IApiService only handles JSON) ──

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
    const token = this.api.getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    const endpointPath = API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.EXPORT(
      params.format,
      params.statusFilter,
      params.typeFilter,
      params.displayCurrency,
      params.dateFrom,
      params.dateTo,
      params.expiringInDays,
      params.editionFilter
    );

    const fullUrl = `${apiUrl}${endpointPath}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Export failed (${response.status})`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    const ext = params.format === "excel" ? "xlsx" : params.format === "csv" ? "csv" : "pdf";
    let filename = `subscriptions-export.${ext}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match?.[1]) filename = match[1].replace(/['"']*/g, "");
    }

    return { blob, filename };
  }

  // ── Receipt (blob download — backend-generated PDF) ──

  async downloadReceipt(tenantId: string): Promise<{ blob: Blob; filename: string }> {
    const token = this.api.getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    const endpointPath = API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RECEIPT(tenantId);
    const fullUrl = `${apiUrl}${endpointPath}`;

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || `Receipt download failed (${response.status})`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    let filename = `subscription-receipt.pdf`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match?.[1]) filename = match[1].replace(/['"']*/g, "");
    }

    return { blob, filename };
  }
}
