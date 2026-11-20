"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CreditCard,
  ExternalLink,
  Lock,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { PageHeader } from "@core/ui/page-header";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudAction, CrudConfig } from "@core/crud/components/generic-crud-view";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueMoneyNav } from "@modules/venue";
import type { MoneyInvoice } from "../../domain/entities/Money";
import { useReceivablesViewModel } from "../viewmodels/useReceivablesViewModel";
import { ReceivablesCurrencySummary } from "../components/receivables/ReceivablesCurrencySummary";
import { ReceivablesToolbar } from "../components/receivables/ReceivablesToolbar";
import { buildReceivablesColumns } from "../components/receivables/receivablesColumns";
import { ReceivablesCardGridItem } from "../components/receivables/ReceivablesCardGridItem";
import { ReceivablesSplitDetail } from "../components/receivables/ReceivablesSplitDetail";

/**
 * Authoritative Venue Customer Receivables & Invoices view.
 * Powered by GenericCrudView with Table, CardGrid, and SplitPane modes,
 * multi-currency isolated balance summaries, and a unified filter/search toolbar.
 */
export function ReceivablesView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const router = useRouter();
  const { t, language, direction } = useI18n();
  const canView = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canCreatePayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canUpdateAllocations = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const canRecordPayment = canCreatePayment && canUpdateAllocations;
  const searchParams = useSearchParams();

  const model = useReceivablesViewModel(
    canView,
    t("money.error.description"),
    searchParams.get("reservationId")
  );

  if (!canView) {
    return (
      <div className="space-y-6" dir={direction} data-testid="venue-receivables-denied">
        <EmptyState
          icon={Lock}
          title={t("money.permission.title")}
          description={t("money.permission.description")}
        />
      </div>
    );
  }

  if (model.error && model.loadedCount === 0) {
    return (
      <div className="space-y-6" dir={direction} data-testid="venue-receivables-error">
        <VenueMoneyNav />
        <EmptyState
          icon={AlertCircle}
          title={t("money.error.title")}
          description={model.error}
          action={
            <Button variant="outline" onClick={() => void model.refresh()}>
              <RefreshCw className="me-1.5 size-4" aria-hidden="true" />
              <span>{t("money.retry")}</span>
            </Button>
          }
        />
      </div>
    );
  }

  const columns = buildReceivablesColumns({ language, t });

  const crudConfig: CrudConfig<MoneyInvoice> = {
    titleKey: "money.receivables.title",
    subtitleKey: "money.receivables.description",
    itemTypeKey: "money.receivables.itemType",
    resource: "venue.money.receivables",
    hidePageHeader: true,
    hideAddButton: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    viewModes: ["Table", "CardGrid", "SplitPane"],
    defaultView: "Table",
    permissions: {
      canView,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
    toolbarContent: (
      <ReceivablesToolbar
        statusFilter={model.statusFilter}
        onStatusFilterChange={model.setStatusFilter}
        searchQuery={model.searchQuery}
        onSearchChange={model.setSearchQuery}
        t={t}
      />
    ),
    columns,
    getItemDisplayName: (invoice) => invoice.invoiceNumber,
    getActions: (_vm, tFn): CrudAction<MoneyInvoice>[] => [
      {
        label: tFn("money.receivables.recordPayment"),
        icon: <CreditCard className="size-3.5" aria-hidden="true" />,
        show: (invoice) => canRecordPayment && invoice.outstandingAmount > 0,
        onClick: (invoice) => {
          router.push(`/venue/money/payments?invoiceId=${encodeURIComponent(invoice.id)}`);
        },
      },
      {
        label: tFn("money.receivables.viewBooking"),
        icon: <ExternalLink className="size-3.5" aria-hidden="true" />,
        show: (invoice) => Boolean(invoice.reservationId),
        onClick: (invoice) => {
          if (invoice.reservationId) {
            router.push(`/venue/bookings/${encodeURIComponent(invoice.reservationId)}`);
          }
        },
      },
    ],
    renderCardGridItem: (invoice, actions) => (
      <ReceivablesCardGridItem
        invoice={invoice}
        actions={actions}
        canRecordPayment={canRecordPayment}
        language={language}
        t={t}
      />
    ),
    renderSplitDetail: (invoice, actions) => (
      <ReceivablesSplitDetail
        invoice={invoice}
        actions={actions}
        canRecordPayment={canRecordPayment}
        language={language}
        t={t}
      />
    ),
  };

  const emptyStateNode =
    model.loadedCount > 0 && model.hasActiveFilters ? (
      <EmptyState
        bare
        icon={ReceiptText}
        title={t("money.receivables.noSearchResults")}
        action={
          <Button variant="outline" size="sm" onClick={model.resetFilters} className="text-xs">
            {t("money.receivables.clearFilters")}
          </Button>
        }
      />
    ) : (
      <EmptyState
        bare
        icon={ReceiptText}
        title={t("money.receivables.empty.title")}
        description={t("money.receivables.empty.description")}
      />
    );

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-receivables">
      <VenueMoneyNav />

      <PageHeader
        icon={ReceiptText}
        title={t("money.receivables.title")}
        description={t("money.receivables.description")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void model.refresh()}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              <span>{t("money.refresh")}</span>
            </Button>
            {canRecordPayment && (
              <Button asChild variant="default" size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                <Link href="/venue/money/payments">{t("money.receivables.recordPayment")}</Link>
              </Button>
            )}
          </div>
        }
      />

      <ReceivablesCurrencySummary
        currencyTotals={model.currencyTotals}
        filteredCount={model.filteredItems.length}
        totalCount={model.totalCount}
        isPartial={model.isPartial}
        language={language}
        t={t}
      />

      <GenericCrudView<MoneyInvoice>
        config={crudConfig}
        columns={columns}
        viewModel={model}
        pagination={model.pagination}
        emptyState={emptyStateNode}
      />
    </div>
  );
}
