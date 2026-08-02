import type {
  CommissionLedgerEntryModel,
  CommissionInvoiceModel,
  PagedResultModel,
} from "../../data/models/CommissionModels";
import type { CommissionListParams } from "./ICommissionLedgerRepository";

/**
 * Http API network service for i commission ledger.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface ICommissionLedgerService {
  getLedgers(params: CommissionListParams): Promise<PagedResultModel<CommissionLedgerEntryModel>>;
  getInvoices(params: CommissionListParams): Promise<PagedResultModel<CommissionInvoiceModel>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
