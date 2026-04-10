/**
 * Billing Repository — uses Service + Mapper
 *
 * All API calls go through the Service layer.
 * Repository orchestrates Service + Mapper and returns domain entities.
 */
import type { IBillingRepository, PagedResult } from "../../domain/interfaces/IBillingRepository";
import type {
  Invoice,
  InvoiceListItem,
  PaymentTransaction,
  CheckoutSession,
  BillingPortal,
} from "../../domain/entities/Invoice";
import { BillingService } from "../services/BillingService";
import { BillingMapper } from "../mappers/BillingMapper";

export class BillingRepository implements IBillingRepository {
  constructor(private readonly service: BillingService) {}

  // ── Queries ──

  async getInvoices(params: {
    tenantId?: string;
    page: number;
    pageSize: number;
    status?: string;
  }): Promise<PagedResult<InvoiceListItem>> {
    const result = await this.service.getInvoices(params);
    return {
      items: (result.items ?? []).map(BillingMapper.toInvoiceListItem),
      totalCount: result.totalCount ?? 0,
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
    return {
      items: (result.items ?? []).map(BillingMapper.toTransaction),
      totalCount: result.totalCount ?? 0,
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
    }
  ): Promise<CheckoutSession> {
    const result = await this.service.createCheckoutSession(tenantId, data);
    return BillingMapper.toCheckoutSession(result);
  }

  async createBillingPortal(tenantId: string, returnUrl: string): Promise<BillingPortal> {
    const result = await this.service.createBillingPortal(tenantId, returnUrl);
    return BillingMapper.toBillingPortal(result);
  }

  async cancelStripeSubscription(tenantId: string, immediately: boolean): Promise<void> {
    await this.service.cancelStripeSubscription(tenantId, immediately);
  }
}
