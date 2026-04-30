import { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@core/config/api-endpoints";
import { CommissionLedgerEntryModel, CommissionInvoiceModel, PagedResultModel } from "../models/CommissionModels";
import type { ICommissionLedgerService } from "../../domain/interfaces/ICommissionLedgerService";

export class CommissionLedgerService implements ICommissionLedgerService {
  constructor(private readonly api: IApiService) {}

  async getLedgers(params: any): Promise<PagedResultModel<CommissionLedgerEntryModel>> {
    const url = buildUrl("/api/v1/commission-ledger", params);
    return this.api.get<PagedResultModel<CommissionLedgerEntryModel>>(url);
  }

  async getInvoices(params: any): Promise<PagedResultModel<CommissionInvoiceModel>> {
    const url = buildUrl("/api/v1/commission-invoices", params);
    return this.api.get<PagedResultModel<CommissionInvoiceModel>>(url);
  }

  async retryCharge(invoiceId: string): Promise<void> {
    await this.api.post(`/api/v1/commission-invoices/${invoiceId}/retry-charge`, {});
  }

  async waiveInvoice(invoiceId: string, notes: string): Promise<void> {
    await this.api.post(`/api/v1/commission-invoices/${invoiceId}/waive`, { notes });
  }
}
