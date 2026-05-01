import { CommissionLedgerEntryModel, CommissionInvoiceModel } from "../models/CommissionModels";
import {
  CommissionLedgerEntry,
  CommissionLedgerEntryData,
} from "../../domain/entities/CommissionLedgerEntry";
import { CommissionInvoice, CommissionInvoiceData } from "../../domain/entities/CommissionInvoice";

export class CommissionMapper {
  static toLedgerEntity(model: CommissionLedgerEntryModel): CommissionLedgerEntry {
    const data: CommissionLedgerEntryData = {
      id: model.id,
      tenantId: model.tenantId,
      userSubscriptionId: model.userSubscriptionId ?? null,
      paymentTransactionId: model.paymentTransactionId ?? null,
      commissionInvoiceId: model.commissionInvoiceId ?? null,
      gateway: model.gateway ?? "",
      gatewayTransactionId: model.gatewayTransactionId ?? "",
      grossAmount: model.grossAmount ?? 0,
      commissionRate: model.commissionRate ?? 0,
      commissionAmount: model.commissionAmount ?? 0,
      netAmount: model.netAmount ?? 0,
      currency: model.currency ?? "USD",
      status: model.status ?? "",
      collectionMethod: model.collectionMethod ?? "PostBilling",
      stripePaymentIntentId: model.stripePaymentIntentId ?? null,
      notes: model.notes ?? null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt ?? null,
    };
    return new CommissionLedgerEntry(data);
  }

  static toInvoiceEntity(model: CommissionInvoiceModel): CommissionInvoice {
    const data: CommissionInvoiceData = { ...model };
    return new CommissionInvoice(data);
  }
}
