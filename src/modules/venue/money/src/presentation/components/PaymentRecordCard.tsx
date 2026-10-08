"use client";

import React from "react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import {
  MANUAL_PAYMENT_METHODS,
  type usePaymentsViewModel,
} from "../viewmodels/usePaymentsViewModel";

interface PaymentRecordCardProps {
  canRecord: boolean;
  model: ReturnType<typeof usePaymentsViewModel>;
}

/**
 * Documentation for module export
 */
export function PaymentRecordCard({ canRecord, model }: PaymentRecordCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("money.payments.recordTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canRecord ? (
          <Alert variant="info">
            <AlertDescription>{t("money.payments.readOnly")}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label id="payment-invoice-label" htmlFor="payment-invoice-select">
                {t("money.payments.invoice")}
              </Label>
              <GenericSelect
                id="payment-invoice-select"
                aria-labelledby="payment-invoice-label"
                type="searchable"
                searchType="client"
                allowClear
                options={model.invoiceOptions}
                value={model.selectedInvoiceId}
                onValueChange={(value: string | string[]) =>
                  model.selectInvoice(Array.isArray(value) ? (value[0] ?? "") : value)
                }
                placeholder={t("money.payments.selectInvoice")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">{t("money.payments.amount")}</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={model.amount}
                  disabled={!model.selectedInvoice || model.saving}
                  onChange={(event) => model.setAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label id="payment-method-label" htmlFor="payment-method-select">
                  {t("money.payments.method")}
                </Label>
                <GenericSelect
                  id="payment-method-select"
                  aria-labelledby="payment-method-label"
                  type="single"
                  allowClear={false}
                  options={MANUAL_PAYMENT_METHODS.map((value) => ({
                    value,
                    label: t(`money.payments.methods.${value}`),
                  }))}
                  value={model.method}
                  onValueChange={(value: string | string[]) =>
                    model.setMethod(
                      (Array.isArray(value) ? value[0] : value) as typeof model.method
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reference">{t("money.payments.reference")}</Label>
                <Input
                  id="payment-reference"
                  value={model.reference}
                  disabled={model.saving}
                  onChange={(event) => model.setReference(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-reason">{t("money.payments.reason")}</Label>
                <Input
                  id="payment-reason"
                  value={model.reason}
                  disabled={model.saving}
                  onChange={(event) => model.setReason(event.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              disabled={!model.selectedInvoice || model.saving}
              onClick={() => void model.submit()}
            >
              {model.saving ? t("money.payments.saving") : t("money.payments.record")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
