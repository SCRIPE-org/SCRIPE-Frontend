/**
 * Interface defining property specifications, keys types, and structural contract rules for paged result.
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for commission list params.
 */
export interface CommissionListParams {
  page: number;
  pageSize: number;
  [key: string]: string | number | boolean | null | undefined;
}

import { CommissionLedgerEntry } from "../entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../entities/CommissionInvoice";

/**
 * Repository layer implementing client request queries for i commission ledger.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface ICommissionLedgerRepository {
  getLedgers(params: CommissionListParams): Promise<PagedResult<CommissionLedgerEntry>>;
  getInvoices(params: CommissionListParams): Promise<PagedResult<CommissionInvoice>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
