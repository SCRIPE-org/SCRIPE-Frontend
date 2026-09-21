"use client";

import { useSearchParams } from "next/navigation";
import { Banknote, Lock, RefreshCw } from "lucide-react";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { MANUAL_PAYMENT_METHODS, usePaymentsViewModel } from "../viewmodels/usePaymentsViewModel";

export function PaymentsView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const canView = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canRecord = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE)
    && usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const canReceipt = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIPTS_CREATE);
  const canRefund = usePermission(VENUE_PERMISSIONS.FINANCE_REFUNDS_APPROVE);
  const model = usePaymentsViewModel({
    canView,
    canRecord,
    canIssueReceipt: canReceipt,
    canRefund,
    initialInvoiceId: searchParams.get("invoiceId"),
    messages: {
      fallbackError: t("money.error.description"),
      validation: t("money.payments.validation"),
      allocationPending: (payment) => t("money.payments.allocationPending", { payment }),
    },
  });

  if (!canView) {
    return <EmptyState icon={Lock} title={t("money.permission.title")} description={t("money.permission.description")} />;
  }
  if (model.loading) return <LoadingSpinner showText={false} />;

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-payments">
      <PageHeader icon={Banknote} title={t("money.payments.title")} description={t("money.payments.description")} />
      {model.error && <Alert variant="destructive"><AlertTitle>{t("money.error.title")}</AlertTitle><AlertDescription>{model.error}</AlertDescription></Alert>}
      {model.notice && <Alert variant="success"><AlertDescription>{t(model.notice === "refunded" ? "money.payments.refund.saved" : "money.payments.saved")}</AlertDescription></Alert>}
      <Card>
        <CardHeader><CardTitle>{t("money.payments.recordTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {!canRecord ? (
            <Alert variant="info"><AlertDescription>{t("money.payments.readOnly")}</AlertDescription></Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t("money.payments.invoice")}</Label>
                <GenericSelect type="searchable" searchType="client" allowClear aria-label={t("money.payments.invoice")}
                  options={model.invoiceOptions} value={model.selectedInvoiceId}
                  onValueChange={(value: string | string[]) => model.selectInvoice(Array.isArray(value) ? value[0] ?? "" : value)}
                  placeholder={t("money.payments.selectInvoice")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment-amount">{t("money.payments.amount")}</Label>
                  <Input id="payment-amount" type="number" min={0.01} step="0.01" value={model.amount}
                    disabled={!model.selectedInvoice || model.saving} onChange={(event) => model.setAmount(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("money.payments.method")}</Label>
                  <GenericSelect type="single" allowClear={false} aria-label={t("money.payments.method")}
                    options={MANUAL_PAYMENT_METHODS.map((value) => ({ value, label: t(`money.payments.methods.${value}`) }))}
                    value={model.method}
                    onValueChange={(value: string | string[]) => model.setMethod((Array.isArray(value) ? value[0] : value) as typeof model.method)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-reference">{t("money.payments.reference")}</Label>
                  <Input id="payment-reference" value={model.reference} disabled={model.saving} onChange={(event) => model.setReference(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-reason">{t("money.payments.reason")}</Label>
                  <Input id="payment-reason" value={model.reason} disabled={model.saving} onChange={(event) => model.setReason(event.target.value)} />
                </div>
              </div>
              <Button type="button" disabled={!model.selectedInvoice || model.saving} onClick={() => void model.submit()}>
                {model.saving ? t("money.payments.saving") : t("money.payments.record")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      {model.refundPayment && (
        <Card>
          <CardHeader><CardTitle>{t("money.payments.refund.title")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info"><AlertDescription>{t("money.payments.refund.description")}</AlertDescription></Alert>
            <div className="space-y-2">
              <Label>{t("money.payments.invoice")}</Label>
              <GenericSelect type="searchable" searchType="client" allowClear={false} aria-label={t("money.payments.refund.selectInvoice")}
                options={model.refundInvoiceOptions} value={model.refundInvoiceId}
                onValueChange={(value: string | string[]) => model.setRefundInvoiceId(Array.isArray(value) ? value[0] ?? "" : value)}
                placeholder={t("money.payments.refund.selectInvoice")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="refund-amount">{t("money.payments.amount")}</Label><Input id="refund-amount" type="number" min={0.01} step="0.01" value={model.refundAmount} disabled={model.refunding} onChange={(event) => model.setRefundAmount(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="refund-reference">{t("money.payments.reference")}</Label><Input id="refund-reference" value={model.refundReference} disabled={model.refunding} onChange={(event) => model.setRefundReference(event.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="refund-reason">{t("money.payments.reason")}</Label><Input id="refund-reason" value={model.refundReason} disabled={model.refunding} onChange={(event) => model.setRefundReason(event.target.value)} /></div>
            </div>
            <Button type="button" disabled={model.refunding} onClick={() => void model.submitRefund()}>{model.refunding ? t("money.payments.refund.saving") : t("money.payments.refund.record")}</Button>
          </CardContent>
        </Card>
      )}
      {model.timeline && (
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>{t("money.payments.timeline.title", { payment: model.timeline.payment.paymentNumber })}</CardTitle><Button size="sm" variant="outline" onClick={model.closeTimeline}>{t("money.payments.timeline.close")}</Button></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-sm font-medium text-nx-ink">{t("money.payments.timeline.allocations")}</p>{model.timeline.allocations.length ? <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">{model.timeline.allocations.map((item) => <li key={item.id}>{item.amount}</li>)}</ul> : <p className="mt-2 text-sm text-nx-ink-2">{t("money.payments.timeline.none")}</p>}</div>
            <div><p className="text-sm font-medium text-nx-ink">{t("money.payments.timeline.receipts")}</p>{model.timeline.receipts.length ? <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">{model.timeline.receipts.map((item) => <li key={item.id} dir="ltr">{item.receiptNumber}</li>)}</ul> : <p className="mt-2 text-sm text-nx-ink-2">{t("money.payments.timeline.none")}</p>}</div>
            <div><p className="text-sm font-medium text-nx-ink">{t("money.payments.timeline.refunds")}</p>{model.timeline.refunds.length ? <ul className="mt-2 space-y-1 text-sm text-nx-ink-2">{model.timeline.refunds.map((item) => <li key={item.id}>{item.amount} — {item.reason}</li>)}</ul> : <p className="mt-2 text-sm text-nx-ink-2">{t("money.payments.timeline.none")}</p>}</div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("money.payments.recent")}</CardTitle>
          <Button size="sm" variant="outline" onClick={() => void model.load()}><RefreshCw className="size-4" />{t("money.retry")}</Button>
        </CardHeader>
        <CardContent>
          {model.payments?.length ? (
            <ul className="space-y-2">
              {model.payments.map((payment) => (
                <li key={payment.id} className="border-nx-border flex flex-wrap justify-between gap-2 rounded-lg border p-3">
                  <span className="font-medium" dir="ltr">{payment.paymentNumber}</span>
                  <span>{payment.currencyCode} {payment.amount}</span>
                  <span className="text-sm text-nx-ink-2">{payment.method}</span>
                  <Button size="sm" variant="outline" disabled={model.timelineLoading} onClick={() => void model.openTimeline(payment.id)}>{t("money.payments.timeline.action")}</Button>
                  {canRefund && <Button size="sm" variant="outline" onClick={() => model.beginRefund(payment)}>{t("money.payments.refund.action")}</Button>}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-nx-ink-2">{t("money.payments.empty")}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
