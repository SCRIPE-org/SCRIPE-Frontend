"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useInvoiceViewModel } from "../viewmodels/useInvoiceViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { MoreHorizontal, Download, Mail, FileDown } from "lucide-react";
import type { InvoiceListItem } from "../../domain/entities/Invoice";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { formatUtc } from "@core/common/utils";

// Invoice lifecycle states mapped onto the nx Badge semantic tones — paid reads
// success, overdue destructive, pending on the warning-strong "pending" chip;
// draft/void stay neutral, refunded is informational.
const STATUS_VARIANTS: Record<
  string,
  "success" | "warning" | "pending" | "destructive" | "info" | "secondary" | "inactive"
> = {
  Draft: "secondary",
  Pending: "pending",
  Paid: "success",
  Overdue: "destructive",
  Void: "inactive",
  Refunded: "info",
};

/**
 * InvoiceListView — Pure presentation component.
 *
 * All business logic (download, email, loading states, toasts) lives in
 * the ViewModel (useInvoiceViewModel), following the strict architecture:
 *   View → ViewModel → Repository → Service → IApiService → HTTP
 */
export function InvoiceListView() {
  // Load billing-scoped locale (billing/locales/) — not the shared entitlements locale
  useModuleLocales(() => import("../../../../core/locales"), "billing");

  const { t } = useI18n();
  const vm = useInvoiceViewModel();

  const config: CrudConfig<InvoiceListItem> = useMemo(
    () => ({
      titleKey: "billing.title",
      subtitleKey: "billing.description",
      resource: "invoices",
      hideAddButton: true,
      searchable: false,
      customActions: [
        {
          label: t("billing.actions.exportAllPdf") || "Export All PDFs",
          onClick: vm.handleBulkDownloadPdf,
          variant: "outline" as const,
          icon: <FileDown className="h-4 w-4" aria-hidden="true" />,
          loading: vm.loadingAction["bulk-pdf"] ?? false,
          disabled: !vm.items || vm.items.length === 0,
        },
      ],
      customHeaderContent: (
        <div className="-mt-2 mb-2 flex justify-end">
          <CurrencyDisplayToggle />
        </div>
      ),
      columns: [
        {
          key: "invoiceNumber",
          label: t("billing.columns.invoiceNumber"),
          render: (value: string) => <span className="font-mono text-sm">{value}</span>,
          sortable: true,
        },
        {
          key: "tenantName",
          label: t("billing.columns.tenantName") || "Tenant",
          render: (value: string) => <span className="font-medium">{value || "—"}</span>,
        },
        {
          key: "total",
          label: t("billing.columns.total"),
          // Money column: tabular figures so the digits column-align down the
          // list (the numeric treatment the nexus table variant carries).
          render: (value: number, item: InvoiceListItem) => {
            let formatted: string;
            try {
              formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: item.currency?.toUpperCase() ?? "USD",
              }).format(value);
            } catch {
              formatted = `${item.currency} ${value.toFixed(2)}`;
            }
            return <span className="tabular-nums">{formatted}</span>;
          },
        },
        {
          key: "status",
          label: t("billing.columns.status"),
          render: (value: string) => (
            <Badge variant={STATUS_VARIANTS[value] ?? "secondary"}>
              {t(`billing.status.${value}`) ?? value}
            </Badge>
          ),
        },
        {
          key: "billingCycle",
          label: t("billing.columns.billingCycle"),
          render: (value: string) => <span className="capitalize">{value}</span>,
        },
        {
          key: "dueDate",
          label: t("billing.columns.dueDate"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "—"),
        },
        {
          key: "paidAt",
          label: t("billing.columns.paidAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "—"),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "—"),
        },
      ],

      getItemDisplayName: (item: InvoiceListItem) => item.invoiceNumber,
      hideActionsColumn: false,
      renderActions: (item: InvoiceListItem) => {
        const pdfLoading = vm.loadingAction[`pdf-${item.id}`];
        const emailLoading = vm.loadingAction[`email-${item.id}`];
        const anyLoading = pdfLoading || emailLoading;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8"
                loading={anyLoading}
                aria-label={t("common.actions")}
              >
                {!anyLoading && <MoreHorizontal className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem
                onClick={() => vm.handleDownloadPdf(item)}
                disabled={pdfLoading}
                className="gap-2"
              >
                {pdfLoading ? (
                  <LoadingSpinner size="inline" showText={false} />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {pdfLoading
                  ? t("billing.actions.downloading") || "Downloading..."
                  : t("billing.actions.downloadPdf") || "Download PDF"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => vm.handleSendEmail(item)}
                disabled={emailLoading}
                className="gap-2"
              >
                {emailLoading ? (
                  <LoadingSpinner size="inline" showText={false} />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                )}
                {emailLoading
                  ? t("billing.actions.sending") || "Sending..."
                  : t("billing.actions.sendEmail") || "Send to Tenant Email"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
    [t, vm]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
