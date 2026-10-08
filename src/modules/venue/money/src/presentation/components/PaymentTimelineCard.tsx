"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { usePaymentsViewModel } from "../viewmodels/usePaymentsViewModel";

interface PaymentTimelineCardProps {
  model: ReturnType<typeof usePaymentsViewModel>;
}

/**
 * Documentation for module export
 */
export function PaymentTimelineCard({ model }: PaymentTimelineCardProps) {
  const { t } = useI18n();

  if (!model.timeline) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>
          {t("money.payments.timeline.title", {
            payment: model.timeline.payment.paymentNumber,
          })}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={model.closeTimeline}>
          {t("money.payments.timeline.close")}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-nx-ink">
            {t("money.payments.timeline.allocations")}
          </p>
          {model.timeline.allocations.length ? (
            <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">
              {model.timeline.allocations.map((item) => (
                <li key={item.id}>{item.amount}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-nx-ink-2">
              {t("money.payments.timeline.none")}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-nx-ink">
            {t("money.payments.timeline.receipts")}
          </p>
          {model.timeline.receipts.length ? (
            <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">
              {model.timeline.receipts.map((item) => (
                <li key={item.id} dir="ltr">
                  {item.receiptNumber}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-nx-ink-2">
              {t("money.payments.timeline.none")}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-nx-ink">
            {t("money.payments.timeline.refunds")}
          </p>
          {model.timeline.refunds.length ? (
            <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">
              {model.timeline.refunds.map((item) => (
                <li key={item.id}>
                  {item.amount} â€” {item.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-nx-ink-2">
              {t("money.payments.timeline.none")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
