/**
 * Billing Service Interface (API contract)
 *
 * Defines the contract for billing/invoice API operations.
 * Implemented by BillingService in the data layer.
 */
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
} from "../../data/models/BillingModels";

/**
 * Interface defining operations for the Billing network service.
 */
export interface IBillingService {
  // ── Invoice Queries ──
  getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResultModel<InvoiceListResponseModel>>;
  getInvoiceById(id: string): Promise<InvoiceResponseModel>;
  getTransactions(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
  }): Promise<PagedResultModel<PaymentTransactionModel>>;

  // ── Billing Actions ──
  createCheckoutSession(
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
  ): Promise<CheckoutSessionResponseModel>;
  createBillingPortal(tenantId: string, returnUrl: string): Promise<BillingPortalResponseModel>;
  cancelGatewaySubscription(tenantId: string, immediately: boolean): Promise<void>;

  // ── Dashboard & Revenue ──
  getDashboard(params?: { currency?: string }): Promise<BillingDashboardResponseModel>;
  createPaymentLink(
    tenantId: string,
    data: CreatePaymentLinkRequestModel
  ): Promise<PaymentLinkResponseModel>;

  // ── PDF ──
  downloadInvoicePdf(invoiceId: string): Promise<Blob>;

  // ── Email ──
  sendInvoiceEmail(invoiceId: string): Promise<void>;

  // ── Payment Gateway Management ──
  getGateways(): Promise<GatewayListResponseModel>;
  testGatewayConnection(gateway: string): Promise<{ success: boolean; message: string }>;
  toggleGatewayStatus(
    gateway: string,
    enabled: boolean
  ): Promise<{ success: boolean; message: string; enabled: boolean }>;
}

// ── Gateway Models ──
/**
 * Interface structure detailing the properties and attributes of Gateway Status Model.
 */
export interface GatewayStatusModel {
  gateway: string;
  enabled: boolean;
  isDefault: boolean;
  supportsRecurring: boolean;
  supportsBillingPortal: boolean;
  supportedFeatures: string[];
}

/**
 * Interface structure detailing the properties and attributes of Gateway List Response Model.
 */
export interface GatewayListResponseModel {
  defaultGateway: string;
  gateways: GatewayStatusModel[];
}
