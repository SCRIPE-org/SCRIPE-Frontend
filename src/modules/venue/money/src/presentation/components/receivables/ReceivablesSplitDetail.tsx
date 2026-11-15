"use client";

import type React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { MoneyInvoice } from "../../../domain/entities/Money";
import {
  formatInvoiceStatusLabel,
  formatReceivableDate,
  formatReceivableMoney,
  getInvoiceStatusBadgeVariant,
} from "./receivablesFormatters";

interface ReceivablesSplitDetailProps {
  invoice: MoneyInvoice;
  actions: React.ReactNode;
  canRecordPayment: boolean;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Right-hand master-detail panel for an invoice in GenericCrudView SplitPane mode.
 */
export function ReceivablesSplitDetail({
  invoice,
  actions,
  canRecordPayment,
  language,
  t,
}: ReceivablesSplitDetailProps) {
  const hasBalance = invoice.outstandingAmount > 0;
  const currencyLabel = invoice.currencyCode?.trim()
    ? invoice.currencyCode.toUpperCase()
    : t("money.receivables.unspecifiedCurrency");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-nx-line pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-base font-bold text-nx-ink" dir="ltr">
              {invoice.invoiceNumber}
            </h3>
            <Badge variant={getInvoiceStatusBadgeVariant(invoice)}>
              {formatInvoiceStatusLabel(invoice.status, t)}
            </Badge>
          </div>
          <p className="font-mono text-xs text-nx-ink-3">{invoice.payerPartyId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canRecordPayment && hasBalance && (
            <Button size="sm" variant="default" asChild className="h-8 px-3 text-xs font-semibold">
              <Link href={`/venue/money/payments?invoiceId=${encodeURIComponent(invoice.id)}`}>
                {t("money.receivables.recordPayment")}
              </Link>
            </Button>
          )}
          {actions}
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.outstanding")}</dt>
          <dd
            className={`mt-1 font-mono text-base font-bold tabular-nums ${
              hasBalance ? "text-warning" : "text-nx-ink"
            }`}
          >
            {formatReceivableMoney(invoice.outstandingAmount, invoice.currencyCode, language)}
          </dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.total")}</dt>
          <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-nx-ink">
            {formatReceivableMoney(invoice.effectiveTotalAmount, invoice.currencyCode, language)}
          </dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.paid")}</dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-success">
            {formatReceivableMoney(invoice.paidAmount, invoice.currencyCode, language)}
          </dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.credit")}</dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-info">
            {formatReceivableMoney(invoice.creditAmount, invoice.currencyCode, language)}
          </dd>
        </div>

        {invoice.adjustmentAmount !== 0 && (
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <dt className="text-xs text-nx-ink-3">{t("money.receivables.adjustment")}</dt>
            <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-nx-ink">
              {formatReceivableMoney(invoice.adjustmentAmount, invoice.currencyCode, language)}
            </dd>
          </div>
        )}

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.splitDetail.currency")}</dt>
          <dd className="mt-1 font-mono text-sm font-medium text-nx-ink">{currencyLabel}</dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.splitDetail.issuedDate")}</dt>
          <dd className="mt-1 font-mono text-sm text-nx-ink">
            {formatReceivableDate(invoice.issuedAtUtc, language, "medium")}
          </dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.splitDetail.dueDate")}</dt>
          <dd className="mt-1 font-mono text-sm text-nx-ink">
            {formatReceivableDate(invoice.dueAtUtc, language, "medium")}
          </dd>
        </div>

        <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <dt className="text-xs text-nx-ink-3">{t("money.receivables.payerLabel")}</dt>
          <dd className="mt-1 break-all font-mono text-xs text-nx-ink">{invoice.payerPartyId}</dd>
        </div>

        {invoice.reservationId && (
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <dt className="text-xs text-nx-ink-3">
              {t("money.receivables.splitDetail.linkedBooking")}
            </dt>
            <dd className="mt-1">
              <Link
                href={`/venue/bookings/${encodeURIComponent(invoice.reservationId)}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-nx-accent hover:underline"
              >
                <span>{t("money.receivables.viewBooking")}</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
