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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { MoreHorizontal, Download, Mail, Loader2, FileText, CheckCircle } from "lucide-react";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
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
  const { toast, success, error: toastError } = useEnhancedToast();
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({});

  const handleDownloadPdf = useCallback(async (item: InvoiceListItem) => {
    const key = `pdf-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));

    // Show processing toast immediately for user feedback
    const processingToast = toast({
      title: t("billing.actions.downloadingPdf") || "Downloading PDF...",
      description: item.invoiceNumber,
      variant: "info",
      duration: 30000, // long duration, will be dismissed manually
    });

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

      // Dismiss processing toast and show success
      processingToast.dismiss();
      success({
        title: t("billing.actions.downloadSuccess") || "PDF Downloaded",
        description: `${item.invoiceNumber} — ${t("billing.actions.downloadSuccessDesc") || "Invoice saved to your downloads."}`,
      });
    } catch {
      processingToast.dismiss();
      toastError({
        title: t("billing.actions.downloadError") || "Download Failed",
        description: t("billing.actions.downloadErrorDesc") || "Failed to download invoice PDF. Please try again.",
      });
    } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  }, [t, toast, success, toastError]);

  const handleSendEmail = useCallback(async (item: InvoiceListItem) => {
    const key = `email-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));

    // Show processing toast immediately for user feedback
    const processingToast = toast({
      title: t("billing.actions.sendingEmail") || "Sending Invoice Email...",
      description: item.invoiceNumber,
      variant: "info",
      duration: 30000,
    });

    try {
      const { billingRepository } = entitlementsContainer;
      await billingRepository.sendInvoiceEmail(item.id);

      // Dismiss processing toast and show success
      processingToast.dismiss();
      success({
        title: t("billing.actions.emailSent") || "✓ Invoice Email Sent",
        description: t("billing.actions.emailSentDesc") || `Invoice ${item.invoiceNumber} has been sent to the tenant admin successfully.`,
      });
    } catch {
      processingToast.dismiss();
      toastError({
        title: t("billing.actions.emailError") || "Email Failed",
        description: t("billing.actions.emailErrorDesc") || "Failed to send invoice email. Please check your SMTP settings and try again.",
      });
    } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  }, [t, toast, success, toastError]);

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
      renderActions: (item: InvoiceListItem) => {
        const pdfLoading = loadingAction[`pdf-${item.id}`];
        const emailLoading = loadingAction[`email-${item.id}`];
        const anyLoading = pdfLoading || emailLoading;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative"
              >
                {anyLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              <DropdownMenuItem
                onClick={() => handleDownloadPdf(item)}
                disabled={pdfLoading}
                className="gap-2"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {pdfLoading
                  ? (t("billing.actions.downloading") || "Downloading...")
                  : (t("billing.actions.downloadPdf") || "Download PDF")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleSendEmail(item)}
                disabled={emailLoading}
                className="gap-2"
              >
                {emailLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {emailLoading
                  ? (t("billing.actions.sending") || "Sending...")
                  : (t("billing.actions.sendEmail") || "Send to Tenant Email")}
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
