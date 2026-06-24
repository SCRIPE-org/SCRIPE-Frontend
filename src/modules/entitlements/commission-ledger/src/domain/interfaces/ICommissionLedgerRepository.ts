/**
 * Interface structure detailing the properties and attributes of Paged Result.
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

/**
 * Interface structure detailing the properties and attributes of Commission List Params.
 */
export interface CommissionListParams {
  page: number;
  pageSize: number;
  [key: string]: string | number | boolean | null | undefined;
}

import { CommissionLedgerEntry } from "../entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../entities/CommissionInvoice";

/**
 * Interface defining repository methods for managing CommissionLedger data access.
 */
export interface ICommissionLedgerRepository {
  getLedgers(params: CommissionListParams): Promise<PagedResult<CommissionLedgerEntry>>;
  getInvoices(params: CommissionListParams): Promise<PagedResult<CommissionInvoice>>;
  retryCharge(invoiceId: string): Promise<void>;
  waiveInvoice(invoiceId: string, notes: string): Promise<void>;
}
