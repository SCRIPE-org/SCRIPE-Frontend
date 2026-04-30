import type { CommissionLedgerEntryModel, CommissionInvoiceModel, PagedResultModel } from "../../data/models/CommissionModels";

export interface ICommissionLedgerService {
  getLedgers(params: any): Promise<PagedResultModel<CommissionLedgerEntryModel>>;
  getInvoices(params: any): Promise<PagedResultModel<CommissionInvoiceModel>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
