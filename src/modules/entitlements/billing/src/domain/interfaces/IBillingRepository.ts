import type { PagedResult } from "@modules/identity/core/domain/types";
import type { Invoice, InvoiceListItem, PaymentTransaction, CheckoutSession, BillingPortal } from "../entities/Invoice";

export interface IBillingRepository {
  // Queries
  getInvoices(params: { tenantId?: string; page: number; pageSize: number; status?: string }): Promise<PagedResult<InvoiceListItem>>;
  getInvoiceById(id: string): Promise<Invoice>;
  getTransactions(params: { tenantId?: string; page: number; pageSize: number }): Promise<PagedResult<PaymentTransaction>>;

  // Actions
  createCheckoutSession(tenantId: string, data: {
    editionId: string;
    subscriptionType: string;
    currency?: string;
    promoCode?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSession>;
  createBillingPortal(tenantId: string, returnUrl: string): Promise<BillingPortal>;
  cancelStripeSubscription(tenantId: string, immediately: boolean): Promise<void>;
}
