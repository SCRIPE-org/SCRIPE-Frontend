/**
 * Billing Service — API calls only, no business logic.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IBillingService,
  GatewayListResponseModel,
} from "../../domain/interfaces/IBillingService";
import { BILLING_ENDPOINTS } from "./billing.endpoints";
import type {
  InvoiceResponseModel,
  InvoiceListResponseModel,
  PaymentTransactionModel,
  CheckoutSessionResponseModel,
  BillingPortalResponseModel,
  BillingDashboardResponseModel,
  PaymentLinkResponseModel,
  CreatePaymentLinkRequestModel,
  PagedResultModel,
} from "../models/BillingModels";

/**
 * Http API network service for billing.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class BillingService implements IBillingService {
  constructor(private readonly api: IApiService) {}

  // ── Invoice Queries ──

  async getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResultModel<InvoiceListResponseModel>> {
    const url = buildUrl(BILLING_ENDPOINTS.INVOICES.LIST, {
      tenantId: params.tenantId,
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
    });
    return this.api.get<PagedResultModel<InvoiceListResponseModel>>(url);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseModel> {
    return this.api.get<InvoiceResponseModel>(
      BILLING_ENDPOINTS.INVOICES.BY_ID(id)
    );
  }

  async getTransactions(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
  }): Promise<PagedResultModel<PaymentTransactionModel>> {
    const url = buildUrl(BILLING_ENDPOINTS.INVOICES.TRANSACTIONS, {
      tenantId: params.tenantId,
      page: params.page,
      pageSize: params.pageSize,
    });
    return this.api.get<PagedResultModel<PaymentTransactionModel>>(url);
  }

  // ── Billing Actions ──

  async createCheckoutSession(
    tenantId: string,
    data: {
      editionId: string;
      subscriptionType: string;
      currency?: string;
      promoCode?: string;
      successUrl: string;
      cancelUrl: string;
      generateQrCode?: boolean;
      sendToEmail?: string;
      tenantName?: string;
      gatewayOverride?: string;
    }
  ): Promise<CheckoutSessionResponseModel> {
    return this.api.post<CheckoutSessionResponseModel>(
      BILLING_ENDPOINTS.CHECKOUT(tenantId),
      data
    );
  }

  async createBillingPortal(
    tenantId: string,
    returnUrl: string
  ): Promise<BillingPortalResponseModel> {
    return this.api.post<BillingPortalResponseModel>(
      BILLING_ENDPOINTS.PORTAL(tenantId),
      { returnUrl }
    );
  }

  async cancelGatewaySubscription(tenantId: string, immediately: boolean): Promise<void> {
    await this.api.post(BILLING_ENDPOINTS.CANCEL_GATEWAY(tenantId), {
      immediately,
    });
  }

  // ── Dashboard & Revenue ──

  async getDashboard(params?: { currency?: string }): Promise<BillingDashboardResponseModel> {
    const url = buildUrl(BILLING_ENDPOINTS.DASHBOARD, {
      currency: params?.currency,
    });
    return this.api.get<BillingDashboardResponseModel>(url);
  }

  async createPaymentLink(
    tenantId: string,
    data: CreatePaymentLinkRequestModel
  ): Promise<PaymentLinkResponseModel> {
    return this.api.post<PaymentLinkResponseModel>(
      BILLING_ENDPOINTS.PAYMENT_LINK(tenantId),
      data
    );
  }

  // ── PDF Download ──

  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    return this.api.getBlob(BILLING_ENDPOINTS.INVOICES.PDF(invoiceId));
  }

  // ── Email ──

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    await this.api.post(BILLING_ENDPOINTS.INVOICES.SEND_EMAIL(invoiceId), {});
  }

  // ── Payment Gateway Management ──

  async getGateways(): Promise<GatewayListResponseModel> {
    return this.api.get<GatewayListResponseModel>(BILLING_ENDPOINTS.GATEWAYS.BASE);
  }

  async testGatewayConnection(gateway: string): Promise<{ success: boolean; message: string }> {
    return this.api.post(BILLING_ENDPOINTS.GATEWAYS.TEST_CONNECTION(gateway), {});
  }

  async toggleGatewayStatus(
    gateway: string,
    enabled: boolean
  ): Promise<{ success: boolean; message: string; enabled: boolean }> {
    return this.api.post(BILLING_ENDPOINTS.GATEWAYS.TOGGLE(gateway), { enabled });
  }
}
