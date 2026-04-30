"use client";

import { useCommissionLedgerViewModel } from "../viewmodels/useCommissionLedgerViewModel";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { CommissionInvoice } from "../../domain/entities/CommissionInvoice";

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

          return (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Here we would integrate with payment flow if gateway is configured.
                // For now, it redirects to the tenant gateways to configure a payment method if not set.
              }}
            >
              {t("entitlements.commissionLedger.payNow") || "Pay Now"}
            </Button>
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
          {t("entitlements.commissionLedger.invoices") || "Commission Invoices"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.commissionLedger.invoicesSubtitle") || "View your commission invoices charged by the platform."}
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
