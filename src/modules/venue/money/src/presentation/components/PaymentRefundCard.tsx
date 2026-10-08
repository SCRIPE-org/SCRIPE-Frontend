"use client";

import React from "react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import type { usePaymentsViewModel } from "../viewmodels/usePaymentsViewModel";

interface PaymentRefundCardProps {
  model: ReturnType<typeof usePaymentsViewModel>;
}

/**
 * Documentation for module export
 */
export function PaymentRefundCard({ model }: PaymentRefundCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("money.payments.refund.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="info">
          <AlertDescription>{t("money.payments.refund.description")}</AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label id="refund-invoice-label" htmlFor="refund-invoice-select">{t("money.payments.invoice")}</Label>
          <GenericSelect
            id="refund-invoice-select"
            aria-labelledby="refund-invoice-label"
            type="searchable"
            searchType="client"
            allowClear={false}
            options={model.refundInvoiceOptions}
            value={model.refundInvoiceId}
            onValueChange={(value: string | string[]) =>
              model.setRefundInvoiceId(Array.isArray(value) ? value[0] ?? "" : value)
            }
            placeholder={t("money.payments.refund.selectInvoice")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="refund-amount">{t("money.payments.amount")}</Label>
            <Input
              id="refund-amount"
              type="number"
              min={0.01}
              step="0.01"
              value={model.refundAmount}
              disabled={model.refunding}
              onChange={(event) => model.setRefundAmount(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refund-reference">{t("money.payments.reference")}</Label>
            <Input
              id="refund-reference"
              value={model.refundReference}
              disabled={model.refunding}
              onChange={(event) => model.setRefundReference(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="refund-reason">{t("money.payments.reason")}</Label>
            <Input
              id="refund-reason"
              value={model.refundReason}
              disabled={model.refunding}
              onChange={(event) => model.setRefundReason(event.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={model.refunding}
          onClick={() => void model.submitRefund()}
        >
          {model.refunding
            ? t("money.payments.refund.saving")
            : t("money.payments.refund.record")}
        </Button>
      </CardContent>
    </Card>
  );
}
