"use client";

import { useCallback, useState } from "react";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { entitlementsContainer } from "@modules/entitlements/di";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import type { InvoiceListItem } from "../../domain/entities/Invoice";

/**
 * Invoice ViewModel — uses useCrudViewModel for pagination, search, and state.
 * Invoices are read-only (no create/update/delete from the frontend).
 *
 * All invoice actions (download PDF, send email) are exposed as callbacks
 * from this hook, following the View → ViewModel → Repository data flow.
 */
export function useInvoiceViewModel() {
  const { billingRepository } = entitlementsContainer;
  const { t } = useI18n();
  const { toast, success, error: toastError } = useEnhancedToast();
  const [loadingAction, setLoadingAction] = useState<Record<string, boolean>>({});

  // ── CRUD Read-Only ──
  const vm = useCrudViewModel<InvoiceListItem, never, never>(
    ["entitlements", "invoices"],
    {
      getAll: async (params) => {
        const res = await billingRepository.getInvoices({
          page: params.page,
          pageSize: params.pageSize,
        });
        return {
          items: res.items ?? [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: Math.max(1, Math.ceil(res.totalCount / params.pageSize)),
          },
        };
      },
      // Read-only — no create, update, delete
    }
  );

  // ── Download PDF ──
  const handleDownloadPdf = useCallback(async (item: InvoiceListItem) => {
    const key = `pdf-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));

    const processingToast = toast({
      title: t("billing.actions.downloadingPdf") || "Downloading PDF...",
      description: item.invoiceNumber,
      variant: "info",
      duration: 30000,
    });

    try {
      const blob = await billingRepository.downloadInvoicePdf(item.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${item.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      processingToast.dismiss();
      success({
        title: t("billing.actions.downloadSuccess") || "PDF Downloaded",
        description: `${item.invoiceNumber} — ${t("billing.actions.downloadSuccessDesc") || "Invoice saved to your downloads."}`,
      });
    } catch (err: unknown) {
      processingToast.dismiss();

      // DownloadInterceptedError is thrown globally by ApiService.getBlob()
      // when IDM/FDM/any download manager intercepts the download.
      if (err instanceof DownloadInterceptedError) {
        success({
          title: t("billing.actions.downloadSuccess") || "PDF Downloaded",
          description: `${item.invoiceNumber} — ${t("billing.actions.downloadSuccessDesc") || "Captured by your download manager."}`,
        });
      } else {
        toastError({
          title: t("billing.actions.downloadError") || "Download Failed",
          description: t("billing.actions.downloadErrorDesc") || "Failed to download invoice PDF. Please try again.",
        });
      }
    } finally {
      setLoadingAction((prev) => ({ ...prev, [key]: false }));
    }
  }, [t, toast, success, toastError, billingRepository]);

  // ── Send Email ──
  const handleSendEmail = useCallback(async (item: InvoiceListItem) => {
    const key = `email-${item.id}`;
    setLoadingAction((prev) => ({ ...prev, [key]: true }));

    const processingToast = toast({
      title: t("billing.actions.sendingEmail") || "Sending Invoice Email...",
      description: item.invoiceNumber,
      variant: "info",
      duration: 30000,
    });

    try {
      await billingRepository.sendInvoiceEmail(item.id);

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
  }, [t, toast, success, toastError, billingRepository]);

  // ── Bulk Download All PDFs ──
  const handleBulkDownloadPdf = useCallback(async () => {
    const items = vm.items as InvoiceListItem[];
    if (!items || items.length === 0) return;

    const bulkKey = "bulk-pdf";
    setLoadingAction((prev) => ({ ...prev, [bulkKey]: true }));

    toast({
      title: t("billing.actions.bulkDownloading") || "Downloading All Invoices...",
      description: `${items.length} invoices`,
      variant: "info",
      duration: 3000,
    });

    let downloaded = 0;
    let failed = 0;

    for (const item of items) {
      try {
        const blob = await billingRepository.downloadInvoicePdf(item.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${item.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        downloaded++;
      } catch {
        failed++;
      }

      // Small delay to avoid overwhelming the browser download queue
      await new Promise((r) => setTimeout(r, 300));
    }

    if (failed === 0) {
      success({
        title: t("billing.actions.bulkDownloadSuccess") || "All Invoices Downloaded",
        description: `${downloaded} ${t("billing.actions.invoicesDownloaded") || "invoices saved to downloads."}`,
      });
    } else {
      toastError({
        title: t("billing.actions.bulkDownloadPartial") || "Partial Download",
        description: `${downloaded} ${t("common.success") || "success"}, ${failed} ${t("common.failed") || "failed"}`,
      });
    }

    setLoadingAction((prev) => ({ ...prev, [bulkKey]: false }));
  }, [vm.items, t, toast, success, toastError, billingRepository]);

  return {
    ...vm,
    loadingAction,
    handleDownloadPdf,
    handleSendEmail,
    handleBulkDownloadPdf,
  };
}
