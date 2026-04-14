/**
 * Billing Service — API calls only, no business logic.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IBillingService } from "../../domain/interfaces/IBillingService";
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

export class BillingService implements IBillingService {
  constructor(private readonly api: IApiService) {}

  // ── Invoice Queries ──

  async getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResultModel<InvoiceListResponseModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.BILLING.INVOICES.LIST, {
      tenantId: params.tenantId,
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
    });
    return this.api.get<PagedResultModel<InvoiceListResponseModel>>(url);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseModel> {
    return this.api.get<InvoiceResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.INVOICES.BY_ID(id)
    );
  }

  async getTransactions(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
  }): Promise<PagedResultModel<PaymentTransactionModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.BILLING.INVOICES.TRANSACTIONS, {
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
    }
  ): Promise<CheckoutSessionResponseModel> {
    return this.api.post<CheckoutSessionResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.CHECKOUT(tenantId),
      data
    );
  }

  async createBillingPortal(
    tenantId: string,
    returnUrl: string
  ): Promise<BillingPortalResponseModel> {
    return this.api.post<BillingPortalResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.PORTAL(tenantId),
      { returnUrl }
    );
  }

  async cancelStripeSubscription(
    tenantId: string,
    immediately: boolean
  ): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.CANCEL_STRIPE(tenantId),
      { immediately }
    );
  }

  // ── Dashboard & Revenue ──

  async getDashboard(params?: { currency?: string }): Promise<BillingDashboardResponseModel> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.BILLING.DASHBOARD, {
      currency: params?.currency,
    });
    return this.api.get<BillingDashboardResponseModel>(url);
  }

  async createPaymentLink(
    tenantId: string,
    data: CreatePaymentLinkRequestModel
  ): Promise<PaymentLinkResponseModel> {
    return this.api.post<PaymentLinkResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.PAYMENT_LINK(tenantId),
      data
    );
  }

  // ── PDF Download ──

  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    return this.api.getBlob(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.INVOICES.PDF(invoiceId)
    );
  }

  // ── Email ──

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    await this.api.post(
      API_ENDPOINTS.ENTITLEMENTS.BILLING.INVOICES.SEND_EMAIL(invoiceId),
      {}
    );
  }
}

