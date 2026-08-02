import {
  ICommissionLedgerRepository,
  PagedResult,
  CommissionListParams,
} from "../../domain/interfaces/ICommissionLedgerRepository";
import type { ICommissionLedgerService } from "../../domain/interfaces/ICommissionLedgerService";
import { CommissionMapper } from "../mappers/CommissionMapper";
import { CommissionLedgerEntry } from "../../domain/entities/CommissionLedgerEntry";
import { CommissionInvoice } from "../../domain/entities/CommissionInvoice";

/**
 * Repository layer implementing client request queries for commission ledger.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class CommissionLedgerRepository implements ICommissionLedgerRepository {
  constructor(private readonly service: ICommissionLedgerService) {}

  async getLedgers(params: CommissionListParams): Promise<PagedResult<CommissionLedgerEntry>> {
    const result = await this.service.getLedgers(params);
    return {
      items: result.items.map(CommissionMapper.toLedgerEntity),
      totalCount: result.totalCount,
    };
  }

  async getInvoices(params: CommissionListParams): Promise<PagedResult<CommissionInvoice>> {
    const result = await this.service.getInvoices(params);
    return {
      items: result.items.map(CommissionMapper.toInvoiceEntity),
      totalCount: result.totalCount,
    };
  }

  async retryCharge(invoiceId: string): Promise<void> {
    await this.service.retryCharge(invoiceId);
  }

  async waiveInvoice(invoiceId: string, notes: string): Promise<void> {
    await this.service.waiveInvoice(invoiceId, notes);
  }
}
