"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
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

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("money.payments.recent")}</CardTitle>
        <Button size="sm" variant="outline" onClick={() => void model.load()}>
          <RefreshCw className="size-4" />
          {t("money.retry")}
        </Button>
      </CardHeader>
      <CardContent>
        {model.payments?.length ? (
          <ul className="space-y-2">
            {model.payments.map((payment) => (
              <li
                key={payment.id}
                className="border-nx-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium" dir="ltr">
                    {payment.paymentNumber}
                  </span>
                  <span>
                    {payment.currencyCode} {payment.amount}
                  </span>
                  <span className="text-sm text-nx-ink-2">{payment.method}</span>
                  {payment.unallocatedAmount > 0 && (
                    <Badge variant="warning">
                      {payment.currencyCode} {payment.unallocatedAmount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canRecord && payment.unallocatedAmount > 0 && (
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
                  {canRefund && (
                    <Button size="sm" variant="outline" onClick={() => model.beginRefund(payment)}>
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
