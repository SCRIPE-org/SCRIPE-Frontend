"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useInvoiceViewModel } from "../viewmodels/useInvoiceViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import type { InvoiceListItem } from "../../domain/entities/Invoice";
import { format } from "date-fns";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "secondary",
  Pending: "outline",
  Paid: "default",
  Overdue: "destructive",
  Void: "secondary",
  Refunded: "outline",
};

export function InvoiceListView() {
  // Load billing-scoped locale (billing/locales/) — not the shared entitlements locale
  useModuleLocales(() => import("../../../../locales"), "billing");

  const { t } = useI18n();
  const vm = useInvoiceViewModel();

  const config: CrudConfig<InvoiceListItem> = useMemo(
    () => ({
      titleKey: "billing.title",
      subtitleKey: "billing.description",
      resource: "invoices",
      hideAddButton: true,
      searchable: false,

      columns: [
        {
          key: "invoiceNumber",
          label: t("billing.columns.invoiceNumber"),
          render: (value: string) => (
            <span className="font-mono text-sm">{value}</span>
          ),
          sortable: true,
        },
        {
          key: "total",
          label: t("billing.columns.total"),
          render: (value: number, item: InvoiceListItem) => {
            try {
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: item.currency?.toUpperCase() ?? "USD",
              }).format(value);
            } catch {
              return `${item.currency} ${value.toFixed(2)}`;
            }
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
          render: (value: string) => (
            <span className="capitalize">{value}</span>
          ),
        },
        {
          key: "dueDate",
          label: t("billing.columns.dueDate"),
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "—",
        },
        {
          key: "paidAt",
          label: t("billing.columns.paidAt"),
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "—",
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "—",
        },
      ],

      getItemDisplayName: (item: InvoiceListItem) => item.invoiceNumber,
      hideActionsColumn: true,
    }),
    [t]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
