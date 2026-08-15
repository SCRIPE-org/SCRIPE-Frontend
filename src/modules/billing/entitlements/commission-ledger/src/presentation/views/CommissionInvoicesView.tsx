"use client";

import { useCommissionLedgerViewModel } from "../viewmodels/useCommissionLedgerViewModel";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import type { CommissionInvoice } from "../../domain/entities/CommissionInvoice";

/**
 * Presentation UI component rendering the commission invoices view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommissionInvoicesView() {
  const { t } = useI18n();
  const vm = useCommissionLedgerViewModel();

  // For tenants, we just show the invoices table and a "Pay Now" action if overdue/unpaid
  const invoiceColumnsWithActions = vm.invoiceTable.columns.map((col) => {
    if (col.key === "actions") {
      return {
        ...col,
        render: (value: unknown, invoice: CommissionInvoice) => {
          if (invoice.status === "Paid" || invoice.status === "Waived") return null;

          // No online payment-initiation flow exists yet for tenant-facing
          // commission invoices (the repository only exposes retry-charge and
          // waive, both admin actions) — the CTA is disabled with an
          // explanation rather than left enabled and silently inert.
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button variant="default" size="sm" disabled>
                    {t("entitlements.commissionLedger.payNow")}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {t("entitlements.commissionLedger.payNowUnavailable")}
              </TooltipContent>
            </Tooltip>
          );
        },
      };
    }
    return col;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("entitlements.commissionLedger.invoices")}
        </h1>
        <p className="text-sm text-nx-ink-2">
          {t("entitlements.commissionLedger.invoicesSubtitle")}
        </p>
      </div>

      <GenericCrudView
        viewModel={{
          items: vm.invoiceTable.items,
          loading: vm.invoiceTable.isLoading,
        }}
        columns={invoiceColumnsWithActions}
        pagination={{
          page: vm.invoiceTable.pagination.page,
          pageSize: vm.invoiceTable.pagination.pageSize,
          itemsCount: vm.invoiceTable.pagination.totalCount,
          pagesCount: vm.invoiceTable.pagination.totalPages,
          onPageChange: vm.invoiceTable.pagination.onPageChange,
        }}
        config={{
          titleKey: "",
          subtitleKey: "",
          columns: invoiceColumnsWithActions,
          hideAddButton: true,
        }}
      />
    </div>
  );
}
