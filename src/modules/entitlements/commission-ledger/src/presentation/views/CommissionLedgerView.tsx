"use client";

import { useCommissionLedgerViewModel } from "../viewmodels/useCommissionLedgerViewModel";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Button } from "@core/ui/button";
import { RefreshCw, XCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { CommissionInvoice } from "../../domain/entities/CommissionInvoice";

export function CommissionLedgerView() {
  const { t } = useI18n();
  const vm = useCommissionLedgerViewModel();

  // Extend invoice columns with actions
  const invoiceColumnsWithActions = vm.invoiceTable.columns.map((col) => {
    if (col.key === "actions") {
      return {
        ...col,
        render: (value: unknown, invoice: CommissionInvoice) => {
          if (invoice.status === "Paid" || invoice.status === "Waived") return null;

          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => vm.actions.retry(invoice.id)}
                disabled={vm.actions.isRetrying}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                {t("entitlements.commissionLedger.retryCharge")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  vm.actions.waive(invoice.id, t("entitlements.commissionLedger.adminWaiver"))
                }
                disabled={vm.actions.isWaiving}
                className="text-destructive"
              >
                <XCircle className="mr-1 h-4 w-4" />
                {t("entitlements.commissionLedger.waive")}
              </Button>
            </div>
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
          {t("entitlements.commissionLedger.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("entitlements.commissionLedger.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="ledgers" className="w-full">
        <TabsList>
          <TabsTrigger value="ledgers">
            {t("entitlements.commissionLedger.ledgerEntries")}
          </TabsTrigger>
          <TabsTrigger value="invoices">{t("entitlements.commissionLedger.invoices")}</TabsTrigger>
        </TabsList>
        <TabsContent value="ledgers" className="mt-4">
          <GenericCrudView
            viewModel={{
              items: vm.ledgerTable.items,
              loading: vm.ledgerTable.isLoading,
            }}
            columns={vm.ledgerTable.columns}
            pagination={{
              page: vm.ledgerTable.pagination.page,
              pageSize: vm.ledgerTable.pagination.pageSize,
              itemsCount: vm.ledgerTable.pagination.totalCount,
              pagesCount: vm.ledgerTable.pagination.totalPages,
              onPageChange: vm.ledgerTable.pagination.onPageChange,
            }}
            config={{
              titleKey: "",
              subtitleKey: "",
              columns: vm.ledgerTable.columns,
              hideAddButton: true,
            }}
          />
        </TabsContent>
        <TabsContent value="invoices" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
