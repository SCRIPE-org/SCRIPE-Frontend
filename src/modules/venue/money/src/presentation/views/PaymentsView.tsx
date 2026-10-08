"use client";

import { useSearchParams } from "next/navigation";
import { Banknote, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueMoneyNav } from "@modules/venue";
import { usePaymentsViewModel } from "../viewmodels/usePaymentsViewModel";
import { PaymentRecordCard } from "../components/PaymentRecordCard";
import { PaymentRefundCard } from "../components/PaymentRefundCard";
import { PaymentAllocateCard } from "../components/PaymentAllocateCard";
import { PaymentTimelineCard } from "../components/PaymentTimelineCard";
import { PaymentRecentListCard } from "../components/PaymentRecentListCard";

/**
 * Documentation for module export
 */
export function PaymentsView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const canView = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canCreatePayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canUpdateAllocations = usePermission(
    VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE
  );
  const canRecord = canCreatePayment && canUpdateAllocations;
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
    return (
      <EmptyState
        icon={Lock}
        title={t("money.permission.title")}
        description={t("money.permission.description")}
      />
    );
  }
  if (model.loading) return <LoadingSpinner showText={false} />;

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-payments">
      <VenueMoneyNav />
      <PageHeader
        icon={Banknote}
        title={t("money.payments.title")}
        description={t("money.payments.description")}
      />
      {model.error && (
        <Alert variant="destructive">
          <AlertTitle>{t("money.error.title")}</AlertTitle>
          <AlertDescription>{model.error}</AlertDescription>
        </Alert>
      )}
      {model.notice && (
        <Alert variant="success">
          <AlertDescription>
            {t(
              model.notice === "refunded"
                ? "money.payments.refund.saved"
                : model.notice === "allocated"
                ? "money.payments.allocated"
                : "money.payments.saved"
            )}
          </AlertDescription>
        </Alert>
      )}

      <PaymentRecordCard canRecord={canRecord} model={model} />
      {model.refundPayment && <PaymentRefundCard model={model} />}
      {model.allocatingPayment && <PaymentAllocateCard model={model} />}
      {model.timeline && <PaymentTimelineCard model={model} />}
      <PaymentRecentListCard
        model={model}
        canRecord={canRecord}
        canRefund={canRefund}
      />
    </div>
  );
}
