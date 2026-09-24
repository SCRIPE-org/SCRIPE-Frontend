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
  const vm = useCrudViewModel<InvoiceListItem, never, never>(["entitlements", "invoices"], {
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
  });

  // ── Download PDF ──
  const handleDownloadPdf = useCallback(
    async (item: InvoiceListItem) => {
      const key = `pdf-${item.id}`;
      setLoadingAction((prev) => ({ ...prev, [key]: true }));

      const processingToast = toast({
        title: t("billing.actions.downloadingPdf"),
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
          title: t("billing.actions.downloadSuccess"),
          description: `${item.invoiceNumber} — ${t("billing.actions.downloadSuccessDesc")}`,
        });
      } catch (err: unknown) {
        processingToast.dismiss();

        // DownloadInterceptedError is thrown globally by ApiService.getBlob()
        // when IDM/FDM/any download manager intercepts the download.
        if (err instanceof DownloadInterceptedError) {
          success({
            title: t("billing.actions.downloadSuccess"),
            description: `${item.invoiceNumber} — ${t("billing.actions.downloadSuccessDesc")}`,
          });
        } else {
          toastError({
            title: t("billing.actions.downloadError"),
            description: t("billing.actions.downloadErrorDesc"),
          });
        }
      } finally {
        setLoadingAction((prev) => ({ ...prev, [key]: false }));
      }
    },
    [t, toast, success, toastError, billingRepository]
  );

  // ── Send Email ──
  const handleSendEmail = useCallback(
    async (item: InvoiceListItem) => {
      const key = `email-${item.id}`;
      setLoadingAction((prev) => ({ ...prev, [key]: true }));

      const processingToast = toast({
        title: t("billing.actions.sendingEmail"),
        description: item.invoiceNumber,
        variant: "info",
        duration: 30000,
      });

      try {
        await billingRepository.sendInvoiceEmail(item.id);

        processingToast.dismiss();
        success({
          title: t("billing.actions.emailSent"),
          description: t("billing.actions.emailSentDesc"),
        });
      } catch {
        processingToast.dismiss();
        toastError({
          title: t("billing.actions.emailError"),
          description: t("billing.actions.emailErrorDesc"),
        });
      } finally {
        setLoadingAction((prev) => ({ ...prev, [key]: false }));
      }
    },
    [t, toast, success, toastError, billingRepository]
  );

  // ── Bulk Download All PDFs ──
  const vmItems = vm.items;
  const handleBulkDownloadPdf = useCallback(async () => {
    const items = vmItems as InvoiceListItem[];
    if (!items || items.length === 0) return;

    const bulkKey = "bulk-pdf";
    setLoadingAction((prev) => ({ ...prev, [bulkKey]: true }));

    toast({
      title: t("billing.actions.bulkDownloading"),
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
        title: t("billing.actions.bulkDownloadSuccess"),
        description: `${downloaded} ${t("billing.actions.invoicesDownloaded")}`,
      });
    } else {
      toastError({
        title: t("billing.actions.bulkDownloadPartial"),
        description: `${downloaded} ${t("common.success")}, ${failed} ${t("common.failed")}`,
      });
    }

    setLoadingAction((prev) => ({ ...prev, [bulkKey]: false }));
  }, [vmItems, t, toast, success, toastError, billingRepository]);

  return {
    ...vm,
    loadingAction,
    handleDownloadPdf,
    handleSendEmail,
    handleBulkDownloadPdf,
  };
}
