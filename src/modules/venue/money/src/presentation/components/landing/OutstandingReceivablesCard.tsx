"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, ReceiptText } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import type { MoneyInvoice } from "../../../domain/entities/Money";
import { formatMoney, getInvoiceStatusMeta } from "./moneyLandingFormatters";

interface OutstandingReceivablesCardProps {
  outstandingInvoices: MoneyInvoice[];
  loading: boolean;
  error: string | null;
  canRecordPayment: boolean;
}

/**
 * Top 5 outstanding receivables preview table card for MoneyLandingView.
 */
export function OutstandingReceivablesCard({
  outstandingInvoices,
  loading,
  error,
  canRecordPayment,
}: OutstandingReceivablesCardProps) {
  const { t, language } = useI18n();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line px-4 py-3">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
              <ReceiptText className="size-3.5 text-nx-accent" aria-hidden="true" />
              <span>{t("money.landing.tables.outstandingTitle")}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
              {t("money.landing.tables.outstandingCountSubtitle", {
                count: outstandingInvoices.length,
              })}
            </CardDescription>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-nx-accent"
          >
            <Link href="/venue/money/receivables">
              <span>{t("money.landing.tables.viewAllReceivables")}</span>
              <ArrowRight className="size-3 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <LoadingSpinner showText={false} />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-xs text-nx-ink-3">{error}</div>
          ) : outstandingInvoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-nx-ink-3">
              <CheckCircle2 className="mx-auto mb-1.5 size-6 text-success" aria-hidden="true" />
              <span>{t("money.landing.tables.noOutstanding")}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 px-3 text-[11px]">
                    {t("money.landing.tables.invoice")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-[11px]">
                    {t("money.landing.tables.status")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-end text-[11px]">
                    {t("money.landing.tables.total")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-end text-[11px]">
                    {t("money.landing.tables.balance")}
                  </TableHead>
                  {canRecordPayment && (
                    <TableHead className="h-9 px-3 text-end text-[11px]">
                      {t("money.landing.tables.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingInvoices.slice(0, 5).map((inv) => {
                  const statusMeta = getInvoiceStatusMeta(inv.status);
                  const statusLabel = statusMeta.localeKey ? t(statusMeta.localeKey) : inv.status;
                  return (
                    <TableRow key={inv.id} className="text-xs">
                      <TableCell className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-semibold text-nx-ink" dir="ltr">
                            {inv.invoiceNumber}
                          </span>
                          {inv.reservationId && (
                            <Link
                              href={`/venue/bookings/${encodeURIComponent(inv.reservationId)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-nx-accent hover:underline"
                              data-testid={`receivable-booking-link-${inv.id}`}
                            >
                              <span>{t("money.landing.tables.openBooking")}</span>
                              <ExternalLink className="size-2.5" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <Badge variant={statusMeta.variant} className="px-1.5 py-0 text-[10px]">
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-end font-mono text-nx-ink-2">
                        <div>
                          {formatMoney(inv.effectiveTotalAmount, inv.currencyCode, language)}
                        </div>
                        <div className="text-[10px] text-nx-ink-3">
                          {t("money.landing.tables.paid")}:{" "}
                          {formatMoney(inv.paidAmount, inv.currencyCode, language)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-end font-mono font-bold text-warning">
                        {formatMoney(inv.outstandingAmount, inv.currencyCode, language)}
                      </TableCell>
                      {canRecordPayment && (
                        <TableCell className="px-3 py-2.5 text-end">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                          >
                            <Link href="/venue/money/payments">
                              <span>{t("money.landing.tables.recordPaymentAction")}</span>
                            </Link>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
