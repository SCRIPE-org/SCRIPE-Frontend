"use client";

import type React from "react";
import Link from "next/link";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import type { MoneyInvoice } from "../../../domain/entities/Money";
import {
  formatInvoiceStatusLabel,
  formatReceivableDate,
  formatReceivableMoney,
  formatShortPartyId,
  getInvoiceStatusBadgeVariant,
} from "./receivablesFormatters";

interface ReceivablesCardGridItemProps {
  invoice: MoneyInvoice;
  actions: React.ReactNode;
  canRecordPayment: boolean;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Flat matte Nexus card slab for an invoice in GenericCrudView CardGrid mode.
 */
export function ReceivablesCardGridItem({
  invoice,
  actions,
  canRecordPayment,
  language,
  t,
}: ReceivablesCardGridItemProps) {
  const hasBalance = invoice.outstandingAmount > 0;
  const issuedDate = formatReceivableDate(invoice.issuedAtUtc, language, "medium");
  const dueDate = invoice.dueAtUtc ? formatReceivableDate(invoice.dueAtUtc, language, "short") : null;

  return (
    <Card className="overflow-hidden border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-nx-line bg-nx-raised pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-mono text-sm font-bold text-nx-ink" dir="ltr">
              {invoice.invoiceNumber}
            </CardTitle>
            <Badge variant={getInvoiceStatusBadgeVariant(invoice)} className="px-1.5 py-0 text-[10px]">
              {formatInvoiceStatusLabel(invoice.status, t)}
            </Badge>
            {invoice.reservationId && (
              <Link
                href={`/venue/bookings/${encodeURIComponent(invoice.reservationId)}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-nx-accent hover:underline"
              >
                <span>{t("money.receivables.viewBooking")}</span>
                <ExternalLink className="size-3" aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-nx-ink-2">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Calendar className="size-3 text-nx-ink-3" aria-hidden="true" />
              {t("money.receivables.issued", { value: issuedDate })}
            </span>
            {dueDate && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-nx-ink-3">
                <Clock className="size-3" aria-hidden="true" />
                {t("money.receivables.due", { value: dueDate })}
              </span>
            )}
            <span className="font-mono text-[11px] text-nx-ink-3" title={invoice.payerPartyId}>
              {t("money.receivables.payer", { id: formatShortPartyId(invoice.payerPartyId) })}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-end">
          <span className="block text-[10px] font-semibold uppercase text-nx-ink-3">
            {t("money.receivables.outstanding")}
          </span>
          <span
            className={`font-mono text-base font-bold tabular-nums ${
              hasBalance ? "text-warning" : "text-nx-ink"
            }`}
          >
            {formatReceivableMoney(invoice.outstandingAmount, invoice.currencyCode, language)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center justify-between gap-4 pb-3 pt-3">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-[11px] text-nx-ink-3">{t("money.receivables.total")}</dt>
            <dd className="font-mono font-semibold tabular-nums text-nx-ink">
              {formatReceivableMoney(invoice.effectiveTotalAmount, invoice.currencyCode, language)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-nx-ink-3">{t("money.receivables.paid")}</dt>
            <dd className="font-mono font-semibold tabular-nums text-success">
              {formatReceivableMoney(invoice.paidAmount, invoice.currencyCode, language)}
            </dd>
          </div>
          {invoice.creditAmount > 0 && (
            <div>
              <dt className="text-[11px] text-nx-ink-3">{t("money.receivables.credit")}</dt>
              <dd className="font-mono font-semibold tabular-nums text-info">
                {formatReceivableMoney(invoice.creditAmount, invoice.currencyCode, language)}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex items-center gap-2">
          {canRecordPayment && hasBalance && (
            <Button size="sm" variant="default" asChild className="h-7 px-3 text-xs font-semibold">
              <Link href={`/venue/money/payments?invoiceId=${encodeURIComponent(invoice.id)}`}>
                {t("money.receivables.recordPayment")}
              </Link>
            </Button>
          )}
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}
