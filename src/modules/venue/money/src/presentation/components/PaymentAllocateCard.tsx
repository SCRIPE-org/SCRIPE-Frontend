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

interface PaymentAllocateCardProps {
  model: ReturnType<typeof usePaymentsViewModel>;
}

/**
 * Documentation for module export
 */
export function PaymentAllocateCard({ model }: PaymentAllocateCardProps) {
  const { t } = useI18n();

  if (!model.allocatingPayment) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("money.payments.allocate.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="info">
          <AlertDescription>
            {t("money.payments.allocate.description", {
              payment: model.allocatingPayment.paymentNumber,
            })}
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Label id="allocate-invoice-label" htmlFor="allocate-invoice-select">{t("money.payments.allocate.selectInvoice")}</Label>
          <GenericSelect
            id="allocate-invoice-select"
            aria-labelledby="allocate-invoice-label"
            type="searchable"
            searchType="client"
            allowClear={false}
            options={model.allocationInvoiceOptions}
            value={model.allocationInvoiceId}
            onValueChange={(value: string | string[]) =>
              model.setAllocationInvoiceId(Array.isArray(value) ? value[0] ?? "" : value)
            }
            placeholder={t("money.payments.allocate.selectInvoice")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="allocate-amount">{t("money.payments.allocate.amount")}</Label>
          <Input
            id="allocate-amount"
            type="number"
            min={0.01}
            step="0.01"
            value={model.allocationAmount}
            disabled={model.allocating}
            onChange={(event) => model.setAllocationAmount(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={model.allocating || !model.allocationInvoiceId}
            onClick={() => void model.submitAllocation()}
          >
            {model.allocating
              ? t("money.payments.allocate.saving")
              : t("money.payments.allocate.record")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={model.allocating}
            onClick={model.cancelAllocate}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
