"use client";

import Link from "next/link";
import { AlertCircle, ReceiptText, RefreshCw, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { useReceivablesViewModel } from "../viewmodels/useReceivablesViewModel";

function money(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function ReceivablesView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, language, direction } = useI18n();
  const canView = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canRecordPayment =
    usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE) &&
    usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const model = useReceivablesViewModel(canView, t("money.error.description"));

  if (!canView)
    return (
      <EmptyState
        icon={Lock}
        title={t("money.permission.title")}
        description={t("money.permission.description")}
      />
    );
  if (model.loading) return <LoadingSpinner showText={false} />;
  if (model.error)
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("money.error.title")}
        description={model.error}
        action={
          <Button variant="outline" onClick={() => void model.load()}>
            <RefreshCw className="size-4" />
            {t("money.retry")}
          </Button>
        }
      />
    );
  if (!model.items?.length)
    return (
      <EmptyState
        icon={ReceiptText}
        title={t("money.receivables.empty.title")}
        description={t("money.receivables.empty.description")}
      />
    );
  return (
    <div className="space-y-6" dir={direction} data-testid="venue-receivables">
      <PageHeader
        icon={ReceiptText}
        title={t("money.receivables.title")}
        description={t("money.receivables.description")}
      />
      <div className="space-y-3">
        {model.items.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base" dir="ltr">
                  {invoice.invoiceNumber}
                </CardTitle>
                <p className="mt-1 text-sm text-nx-ink-2">
                  {t("money.receivables.issued", {
                    value: new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
                      new Date(invoice.issuedAtUtc)
                    ),
                  })}
                </p>
              </div>
              <Badge variant={invoice.outstandingAmount > 0 ? "warning" : "active"}>
                {invoice.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end justify-between gap-4">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <dt className="text-nx-ink-3">{t("money.receivables.total")}</dt>
                  <dd className="font-medium">
                    {money(invoice.effectiveTotalAmount, invoice.currencyCode, language)}
                  </dd>
                </div>
                <div>
                  <dt className="text-nx-ink-3">{t("money.receivables.outstanding")}</dt>
                  <dd className="font-medium">
                    {money(invoice.outstandingAmount, invoice.currencyCode, language)}
                  </dd>
                </div>
              </dl>
              {canRecordPayment && invoice.outstandingAmount > 0 && (
                <Button size="sm" asChild>
                  <Link href={`/venue/money/payments?invoiceId=${encodeURIComponent(invoice.id)}`}>
                    {t("money.receivables.recordPayment")}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
