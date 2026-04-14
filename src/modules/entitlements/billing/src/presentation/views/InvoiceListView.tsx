"use client";

import { useMemo, useCallback, useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useInvoiceViewModel } from "../viewmodels/useInvoiceViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { MoreHorizontal, Download, Mail, Loader2 } from "lucide-react";
import { useToast } from "@core/hooks/use-toast";
import type { InvoiceListItem } from "../../domain/entities/Invoice";
import { entitlementsContainer } from "@modules/entitlements/di";
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
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({});

  const handleDownloadPdf = useCallback(async (item: InvoiceListItem) => {
    const key = `pdf-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const { billingRepository } = entitlementsContainer;
      const blob = await billingRepository.downloadInvoicePdf(item.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${item.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: t("billing.actions.downloadSuccess") || "PDF Downloaded",
        description: item.invoiceNumber,
      });
    } catch {
      toast({
        title: t("billing.actions.downloadError") || "Download Failed",
        description: t("billing.actions.downloadErrorDesc") || "Failed to download invoice PDF.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  }, [t, toast]);

  const handleSendEmail = useCallback(async (item: InvoiceListItem) => {
    const key = `email-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));
    try {
      const { billingRepository } = entitlementsContainer;
      await billingRepository.sendInvoiceEmail(item.id);
      toast({
        title: t("billing.actions.emailSent") || "Email Sent",
        description: t("billing.actions.emailSentDesc") || `Invoice ${item.invoiceNumber} sent to the tenant admin.`,
      });
    } catch {
      toast({
        title: t("billing.actions.emailError") || "Email Failed",
        description: t("billing.actions.emailErrorDesc") || "Failed to send invoice email.",
        variant: "destructive",
      });
    } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  }, [t, toast]);

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
          key: "tenantName",
          label: t("billing.columns.tenantName") || "Tenant",
          render: (value: string) => (
            <span className="font-medium">{value || "—"}</span>
          ),
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
      hideActionsColumn: false,
      customActionsRenderer: (item: InvoiceListItem) => {
        const pdfLoading = loadingAction[`pdf-${item.id}`];
        const emailLoading = loadingAction[`email-${item.id}`];

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleDownloadPdf(item)}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t("billing.actions.downloadPdf") || "Download PDF"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSendEmail(item)}
                disabled={emailLoading}
              >
                {emailLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {t("billing.actions.sendEmail") || "Send Email"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
    [t, loadingAction, handleDownloadPdf, handleSendEmail]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
