export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface CommissionListParams {
  page: number;
  pageSize: number;
  [key: string]: string | number | boolean | null | undefined;
}

import { CommissionLedgerEntry } from "../entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../entities/CommissionInvoice";

export interface ICommissionLedgerRepository {
  getLedgers(params: CommissionListParams): Promise<PagedResult<CommissionLedgerEntry>>;
  getInvoices(params: CommissionListParams): Promise<PagedResult<CommissionInvoice>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
