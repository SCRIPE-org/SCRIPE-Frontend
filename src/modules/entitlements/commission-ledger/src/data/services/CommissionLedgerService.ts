import { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import { CommissionLedgerEntryModel, CommissionInvoiceModel, PagedResultModel } from "../models/CommissionModels";
import type { ICommissionLedgerService } from "../../domain/interfaces/ICommissionLedgerService";

export class CommissionLedgerService implements ICommissionLedgerService {
  constructor(private readonly api: IApiService) {}

  async getLedgers(params: any): Promise<PagedResultModel<CommissionLedgerEntryModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSION_LEDGER.LIST, params);
    return this.api.get<PagedResultModel<CommissionLedgerEntryModel>>(url);
  }

  async getInvoices(params: any): Promise<PagedResultModel<CommissionInvoiceModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSION_INVOICES.LIST, params);
    return this.api.get<PagedResultModel<CommissionInvoiceModel>>(url);
  }

  async retryCharge(invoiceId: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSION_INVOICES.RETRY_CHARGE(invoiceId), {});
  }

  async waiveInvoice(invoiceId: string, notes: string): Promise<void> {
    await this.api.post(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSION_INVOICES.WAIVE(invoiceId), { notes });
  }
}
