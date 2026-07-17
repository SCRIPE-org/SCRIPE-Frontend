import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import {
  CommissionLedgerEntryModel,
  CommissionInvoiceModel,
  PagedResultModel,
} from "../models/CommissionModels";
import type { ICommissionLedgerService } from "../../domain/interfaces/ICommissionLedgerService";
import type { CommissionListParams } from "../../domain/interfaces/ICommissionLedgerRepository";
import { COMMISSION_LEDGER_ENDPOINTS } from "./commission-ledger.endpoints";

/**
 * Http API network service for commission ledger.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class CommissionLedgerService implements ICommissionLedgerService {
  constructor(private readonly api: IApiService) {}

  async getLedgers(
    params: CommissionListParams
  ): Promise<PagedResultModel<CommissionLedgerEntryModel>> {
    const url = buildUrl(COMMISSION_LEDGER_ENDPOINTS.LEDGER_LIST, params);
    return this.api.get<PagedResultModel<CommissionLedgerEntryModel>>(url);
  }

  async getInvoices(
    params: CommissionListParams
  ): Promise<PagedResultModel<CommissionInvoiceModel>> {
    const url = buildUrl(
      COMMISSION_LEDGER_ENDPOINTS.INVOICE_LIST,
      params
    );
    return this.api.get<PagedResultModel<CommissionInvoiceModel>>(url);
  }

  async retryCharge(invoiceId: string): Promise<void> {
    await this.api.post(
      COMMISSION_LEDGER_ENDPOINTS.RETRY_CHARGE(invoiceId),
      {}
    );
  }

  async waiveInvoice(invoiceId: string, notes: string): Promise<void> {
    await this.api.post(
      COMMISSION_LEDGER_ENDPOINTS.WAIVE(invoiceId),
      { notes }
    );
  }
}
