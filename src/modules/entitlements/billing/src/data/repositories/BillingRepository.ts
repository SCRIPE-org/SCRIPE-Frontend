/**
 * Billing Repository — uses Service + Mapper
 *
 * All API calls go through the Service layer.
 * Repository orchestrates Service + Mapper and returns domain entities.
 */
import type { IBillingRepository } from "../../domain/interfaces/IBillingRepository";
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  Invoice,
  InvoiceListItem,
  PaymentTransaction,
} from "../../domain/entities/Invoice";
import { BillingDashboard } from "../../domain/entities/BillingDashboard";
import type {
  CheckoutSession,
  BillingPortal,
  PaymentLink,
} from "../../domain/entities/BillingDashboard";
import type {
  IBillingService,
  GatewayListResponseModel,
} from "../../domain/interfaces/IBillingService";
import { BillingMapper } from "../mappers/BillingMapper";

/**
 * Repository implementation for managing database operations on Billing resources.
 */
export class BillingRepository implements IBillingRepository {
  constructor(private readonly service: IBillingService) {}

  // ── Queries ──

  async getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResult<InvoiceListItem>> {
    const result = await this.service.getInvoices(params);
    const items = (result.items ?? []).map(BillingMapper.toInvoiceListItem);
    const totalCount = result.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / params.pageSize) || 1;
    return {
      items,
      totalCount,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const result = await this.service.getInvoiceById(id);
    return BillingMapper.toInvoice(result);
  }

  async getTransactions(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
  }): Promise<PagedResult<PaymentTransaction>> {
    const result = await this.service.getTransactions(params);
    const items = (result.items ?? []).map(BillingMapper.toTransaction);
    const totalCount = result.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / params.pageSize) || 1;
    return {
      items,
      totalCount,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
  }

  // ── Actions ──

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
  ): Promise<CheckoutSession> {
    const result = await this.service.createCheckoutSession(tenantId, data);
    return BillingMapper.toCheckoutSession(result);
  }

  async createBillingPortal(tenantId: string, returnUrl: string): Promise<BillingPortal> {
    const result = await this.service.createBillingPortal(tenantId, returnUrl);
    return BillingMapper.toBillingPortal(result);
  }

  async cancelGatewaySubscription(tenantId: string, immediately: boolean): Promise<void> {
    await this.service.cancelGatewaySubscription(tenantId, immediately);
  }

  // ── Dashboard & Revenue ──

  async getDashboard(params?: { currency?: string }): Promise<BillingDashboard> {
    const result = await this.service.getDashboard(params);
    return BillingMapper.toDashboard(result);
  }

  async createPaymentLink(
    tenantId: string,
    data: { editionId: string; subscriptionType: string; currency?: string }
  ): Promise<PaymentLink> {
    const result = await this.service.createPaymentLink(tenantId, data);
    return BillingMapper.toPaymentLink(result);
  }

  // ── PDF Download ──

  async downloadInvoicePdf(invoiceId: string): Promise<Blob> {
    return this.service.downloadInvoicePdf(invoiceId);
  }

  // ── Email ──

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    await this.service.sendInvoiceEmail(invoiceId);
  }

  // ── Payment Gateway Management ──

  async getGateways(): Promise<GatewayListResponseModel> {
    return this.service.getGateways();
  }

  async testGatewayConnection(gateway: string): Promise<{ success: boolean; message: string }> {
    return this.service.testGatewayConnection(gateway);
  }

  async toggleGatewayStatus(
    gateway: string,
    enabled: boolean
  ): Promise<{ success: boolean; message: string; enabled: boolean }> {
    return this.service.toggleGatewayStatus(gateway, enabled);
  }
}
