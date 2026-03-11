/**
 * Subscription Service — API calls only
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface SubscriptionModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      trialEndsAt?: string;
      gracePeriodEndsAt?: string;
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      modifiedAt?: string;
      // ── Pricing ──
      currency?: string;
      baseAmount?: number;
      adjustmentAmount?: number;
      totalAmount?: number;
      totalAmountUsd?: number;
      exchangeRateToUsd?: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
}

export interface SubscriptionListModel {
      id: string;
      tenantId: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      fallbackEditionName?: string;
      isDowngraded: boolean;
      downgradedFromEditionName?: string;
      downgradedFromType?: string;
      downgradedAt?: string;
      createdAt: string;
      // ── Pricing ──
      currency?: string;
      totalAmount?: number;
      totalAmountUsd?: number;
      // ── Promotion ──
      appliedPromoCode?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
}

export interface GlobalSubscriptionModel {
      id: string;
      tenantId: string;
      tenantName: string;
      editionId: string;
      editionName: string;
      type: string;
      status: string;
      startDate: string;
      endDate?: string;
      expiryBehavior: string;
      isDowngraded: boolean;
      createdAt: string;
      currency: string;
      totalAmount: number;
      totalAmountUsd: number;
      baseAmount: number;
      adjustmentAmount: number;
      exchangeRateToUsd: number;
      // ── Promotion ──
      appliedPromotionName?: string;
      promotionDiscount?: number;
      // ── Refund ──
      refundType?: string;
      refundAmount?: number;
      refundedAt?: string;
      refundReason?: string;
}

export class SubscriptionService {
      constructor(private readonly api: IApiService) { }

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
            return this.api.get<SubscriptionModel>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.GET_BY_ID(id)
            );
      }

      // ── Lifecycle Actions ──

      async assign(
            tenantId: string,
            data: { editionId: string; type: string; endDate?: string; expiryBehavior?: string; currency?: string; promoCode?: string; promotionId?: string }
      ): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.ASSIGN(tenantId),
                  data
            );
      }

      async change(
            tenantId: string,
            data: { editionId: string; type: string; currency?: string; promoCode?: string; promotionId?: string }
      ): Promise<void> {
            await this.api.put(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CHANGE(tenantId),
                  data
            );
      }

      async renew(tenantId: string, type: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RENEW(tenantId),
                  { type }
            );
      }

      async convertTrial(tenantId: string, type: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CONVERT(tenantId),
                  { type }
            );
      }

      async suspend(tenantId: string, reason: string, useFallback: boolean = false, refundType: string = "None", customRefundAmount?: number): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.SUSPEND(tenantId),
                  { reason, useFallback, refundType, customRefundAmount }
            );
      }

      async resume(tenantId: string, type?: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESUME(tenantId),
                  type ? { type } : {}
            );
      }

      async cancel(tenantId: string, reason?: string, useFallback: boolean = false, refundType: string = "None", customRefundAmount?: number): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.CANCEL(tenantId),
                  { reason, useFallback, refundType, customRefundAmount }
            );
      }

      async resync(tenantId: string): Promise<void> {
            await this.api.post(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.RESYNC(tenantId),
                  {}
            );
      }

      async revoke(id: string): Promise<void> {
            await this.api.delete(
                  API_ENDPOINTS.ENTITLEMENTS.SUBSCRIPTIONS.REVOKE(id)
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
