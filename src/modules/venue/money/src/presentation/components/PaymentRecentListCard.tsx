"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { usePaymentsViewModel } from "../viewmodels/usePaymentsViewModel";

interface PaymentRecentListCardProps {
  model: ReturnType<typeof usePaymentsViewModel>;
  canRecord: boolean;
  canRefund: boolean;
}

/**
 * Documentation for PaymentRecentListCard
 */
export function PaymentRecentListCard({ model, canRecord, canRefund }: PaymentRecentListCardProps) {
  const { t } = useI18n();
  const displayedPayments = model.filteredPayments ?? model.payments;

  return (
    <Card className="border-nx-line">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("money.payments.recent")}</CardTitle>
        <Button size="sm" variant="outline" onClick={() => void model.load()}>
          <RefreshCw className="size-4" />
          {t("money.retry")}
        </Button>
      </CardHeader>
      <div className="flex items-center gap-1.5 px-6 pb-2">
        {(["all", "today", "days7"] as const).map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={model.paymentDateFilter === filter ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => model.setPaymentDateFilter(filter)}
            data-testid={`payment-filter-${filter}`}
          >
            {t(`money.payments.filters.${filter}`, {
              defaultValue: filter === "all" ? "All Payments" : filter === "today" ? "Today" : "7 Days",
            })}
          </Button>
        ))}
      </div>
      <CardContent>
        {displayedPayments?.length ? (
          <ul className="space-y-2">
            {displayedPayments.map((payment) => (
              <li
                key={payment.id}
                className="hover:bg-nx-raised flex flex-wrap items-center justify-between gap-2 rounded-nx-lg border border-nx-line p-3 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium" dir="ltr">
                    {payment.paymentNumber}
                  </span>
                  <span>
                    {payment.currencyCode} {payment.amount}
                  </span>
                  <span className="text-sm text-nx-ink-2">{payment.method}</span>
                  {payment.status === "Refunded" ? (
                    <Badge variant="destructive">
                      {t("money.payments.status.refunded", { defaultValue: "Refunded" })}
                    </Badge>
                  ) : payment.unallocatedAmount > 0 ? (
                    <Badge variant="warning">
                      {payment.currencyCode} {payment.unallocatedAmount}
                    </Badge>
                  ) : null}
                  {payment.reservationId && (
                    <Link
                      href={`/venue/bookings/${encodeURIComponent(payment.reservationId)}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-nx-accent hover:underline ms-1"
                      data-testid={`payment-booking-link-${payment.id}`}
                    >
                      <span>{t("money.payments.viewBooking", { defaultValue: "Booking 360" })}</span>
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canRecord && payment.unallocatedAmount > 0 && payment.status !== "Refunded" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => model.beginAllocate(payment)}
                    >
                      {t("money.payments.allocate.action")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={model.timelineLoading}
                    onClick={() => void model.openTimeline(payment.id)}
                  >
                    {t("money.payments.timeline.action")}
                  </Button>
                  {canRefund && payment.status !== "Refunded" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => model.beginRefund(payment)}
                      data-testid={`refund-btn-${payment.id}`}
                    >
                      {t("money.payments.refund.action")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-nx-ink-2">{t("money.payments.empty")}</p>
        )}
      </CardContent>
    </Card>
  );
}
