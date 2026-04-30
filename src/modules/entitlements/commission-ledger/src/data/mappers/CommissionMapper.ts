import { CommissionLedgerEntryModel, CommissionInvoiceModel } from "../models/CommissionModels";
import { CommissionLedgerEntry, CommissionLedgerEntryData } from "../../domain/entities/CommissionLedgerEntry";
import { CommissionInvoice, CommissionInvoiceData } from "../../domain/entities/CommissionInvoice";

export class CommissionMapper {
  static toLedgerEntity(model: CommissionLedgerEntryModel): CommissionLedgerEntry {
    const data: CommissionLedgerEntryData = { ...model };
    return new CommissionLedgerEntry(data);
  }

  static toInvoiceEntity(model: CommissionInvoiceModel): CommissionInvoice {
    const data: CommissionInvoiceData = { ...model };
    return new CommissionInvoice(data);
  }
}
