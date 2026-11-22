"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, ExternalLink } from "lucide-react";
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
import type { MoneyPayment } from "../../../domain/entities/Money";
import {
  formatDateTime,
  formatMoney,
  getPaymentMethodLocaleKey,
} from "./moneyLandingFormatters";

interface RecentPaymentsCardProps {
  payments: MoneyPayment[];
  loading: boolean;
  error: string | null;
  canUpdateAllocations: boolean;
}

/**
 * Top 5 recent operational payments preview table card for MoneyLandingView.
 */
export function RecentPaymentsCard({
  payments,
  loading,
  error,
  canUpdateAllocations,
}: RecentPaymentsCardProps) {
  const { t, language } = useI18n();

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line px-4 py-3">
          <div>
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
              <CreditCard className="size-3.5 text-success" aria-hidden="true" />
              <span>{t("money.landing.tables.recentPaymentsTitle")}</span>
            </CardTitle>
            <CardDescription className="mt-0.5 text-[11px] text-nx-ink-3">
              {t("money.landing.tables.recentPaymentsCountSubtitle", {
                count: payments.length,
              })}
            </CardDescription>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-nx-accent"
          >
            <Link href="/venue/money/payments">
              <span>{t("money.landing.tables.viewAllPayments")}</span>
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
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-xs text-nx-ink-3">
              <span>{t("money.landing.tables.noPayments")}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 px-3 text-[11px]">
                    {t("money.landing.tables.payment")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-[11px]">
                    {t("money.landing.tables.method")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-[11px]">
                    {t("money.landing.tables.allocationState")}
                  </TableHead>
                  <TableHead className="h-9 px-3 text-end text-[11px]">
                    {t("money.landing.tables.amount")}
                  </TableHead>
                  {canUpdateAllocations && (
                    <TableHead className="h-9 px-3 text-end text-[11px]">
                      {t("money.landing.tables.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 5).map((pay) => {
                  const methodKey = getPaymentMethodLocaleKey(pay.method);
                  const methodLabel = methodKey ? t(methodKey) : pay.method;

                  return (
                    <TableRow key={pay.id} className="text-xs">
                      <TableCell className="px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-semibold text-nx-ink" dir="ltr">
                            {pay.paymentNumber}
                          </span>
                          {pay.reservationId && (
                            <Link
                              href={`/venue/bookings/${encodeURIComponent(pay.reservationId)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-nx-accent hover:underline"
                              data-testid={`payment-booking-link-${pay.id}`}
                            >
                              <span>{t("money.landing.tables.openBooking")}</span>
                              <ExternalLink className="size-2.5" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-nx-ink-3">
                          {formatDateTime(pay.recordedAtUtc, language)}
                        </p>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-nx-ink-2">{methodLabel}</TableCell>
                      <TableCell className="px-3 py-2.5">
                        {pay.status === "Refunded" ? (
                          <Badge variant="destructive" className="px-1.5 py-0 text-[9px]">
                            {t("money.landing.tables.refundedBadge")}
                          </Badge>
                        ) : pay.unallocatedAmount > 0 ? (
                          <Badge variant="warning" className="px-1.5 py-0 text-[9px]">
                            {t("money.landing.tables.unallocated")}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="px-1.5 py-0 text-[9px]">
                            {t("money.landing.tables.allocated")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-end font-mono font-bold text-success">
                        {formatMoney(pay.amount, pay.currencyCode, language)}
                      </TableCell>
                      {canUpdateAllocations && (
                        <TableCell className="px-3 py-2.5 text-end">
                          {pay.unallocatedAmount > 0 && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-6 border-warning/40 px-2 text-[10px]"
                            >
                              <Link href="/venue/money/payments">
                                <span>{t("money.landing.tables.allocateAction")}</span>
                              </Link>
                            </Button>
                          )}
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
