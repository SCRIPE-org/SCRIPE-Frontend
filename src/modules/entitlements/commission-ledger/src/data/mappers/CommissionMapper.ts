import { CommissionLedgerEntryModel, CommissionInvoiceModel } from "../models/CommissionModels";
import {
  CommissionLedgerEntry,
  CommissionLedgerEntryData,
} from "../../domain/entities/CommissionLedgerEntry";
import { CommissionInvoice, CommissionInvoiceData } from "../../domain/entities/CommissionInvoice";
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString, optionalIsoDate } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const CommissionLedgerEntrySchema = z.object({
  id: uuidField(),
  tenantId: uuidField(),
  userSubscriptionId: z.string().optional().nullable(),
  paymentTransactionId: z.string().optional().nullable(),
  commissionInvoiceId: z.string().optional().nullable(),
  gateway: optionalString(),
  gatewayTransactionId: optionalString(),
  grossAmount: z.number().optional().default(0),
  commissionRate: z.number().optional().default(0),
  commissionAmount: z.number().optional().default(0),
  netAmount: z.number().optional().default(0),
  currency: z.string().optional().default("USD"),
  status: optionalString(),
  collectionMethod: z.string().optional().default("PostBilling"),
  stripePaymentIntentId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: optionalIsoDate(),
  updatedAt: z.string().optional().nullable(),
});

export class CommissionMapper {
  static toLedgerEntity(model: CommissionLedgerEntryModel): CommissionLedgerEntry {
    const validated = safeParseApiResponse(CommissionLedgerEntrySchema, model, "CommissionLedgerEntry");

    const data: CommissionLedgerEntryData = {
      id: validated.id,
      tenantId: validated.tenantId,
      userSubscriptionId: validated.userSubscriptionId ?? null,
      paymentTransactionId: validated.paymentTransactionId ?? null,
      commissionInvoiceId: validated.commissionInvoiceId ?? null,
      gateway: validated.gateway ?? "",
      gatewayTransactionId: validated.gatewayTransactionId ?? "",
      grossAmount: validated.grossAmount ?? 0,
      commissionRate: validated.commissionRate ?? 0,
      commissionAmount: validated.commissionAmount ?? 0,
      netAmount: validated.netAmount ?? 0,
      currency: validated.currency ?? "USD",
      status: validated.status ?? "",
      collectionMethod: validated.collectionMethod ?? "PostBilling",
      stripePaymentIntentId: validated.stripePaymentIntentId ?? null,
      notes: validated.notes ?? null,
      createdAt: validated.createdAt ?? "",
      updatedAt: validated.updatedAt ?? null,
    };
    return new CommissionLedgerEntry(data);
  }

  static toInvoiceEntity(model: CommissionInvoiceModel): CommissionInvoice {
    const data: CommissionInvoiceData = { ...model };
    return new CommissionInvoice(data);
  }
}
