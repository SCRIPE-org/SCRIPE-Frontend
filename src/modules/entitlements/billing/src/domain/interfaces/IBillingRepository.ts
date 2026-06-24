import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  Invoice,
  InvoiceListItem,
  PaymentTransaction,
} from "../entities/Invoice";
import type {
  CheckoutSession,
  BillingPortal,
  BillingDashboard,
  PaymentLink,
} from "../entities/BillingDashboard";
import type { GatewayListResponseModel } from "./IBillingService";

/**
 * Repository layer implementing client request queries for i billing.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IBillingRepository {
  // Queries
  getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResult<InvoiceListItem>>;
  getInvoiceById(id: string): Promise<Invoice>;
  getTransactions(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
  }): Promise<PagedResult<PaymentTransaction>>;

  // Actions
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
  ): Promise<CheckoutSession>;
  createBillingPortal(tenantId: string, returnUrl: string): Promise<BillingPortal>;
  cancelGatewaySubscription(tenantId: string, immediately: boolean): Promise<void>;

  // Dashboard & Revenue
  getDashboard(params?: { currency?: string }): Promise<BillingDashboard>;
  createPaymentLink(
    tenantId: string,
    data: {
      editionId: string;
      subscriptionType: string;
      currency?: string;
    }
  ): Promise<PaymentLink>;

  // PDF
  downloadInvoicePdf(invoiceId: string): Promise<Blob>;

  // Email
  sendInvoiceEmail(invoiceId: string): Promise<void>;

  // Payment Gateway Management
  getGateways(): Promise<GatewayListResponseModel>;
  testGatewayConnection(gateway: string): Promise<{ success: boolean; message: string }>;
  toggleGatewayStatus(
    gateway: string,
    enabled: boolean
  ): Promise<{ success: boolean; message: string; enabled: boolean }>;
}
