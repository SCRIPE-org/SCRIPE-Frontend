import type { CommissionLedgerEntryModel, CommissionInvoiceModel, PagedResultModel } from "../../data/models/CommissionModels";
import type { CommissionListParams } from "./ICommissionLedgerRepository";

export interface ICommissionLedgerService {
  getLedgers(params: CommissionListParams): Promise<PagedResultModel<CommissionLedgerEntryModel>>;
  getInvoices(params: CommissionListParams): Promise<PagedResultModel<CommissionInvoiceModel>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
