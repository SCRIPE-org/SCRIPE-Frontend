export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

import { CommissionLedgerEntry } from "../entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../entities/CommissionInvoice";

export interface ICommissionLedgerRepository {
  getLedgers(params: any): Promise<PagedResult<CommissionLedgerEntry>>;
  getInvoices(params: any): Promise<PagedResult<CommissionInvoice>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
