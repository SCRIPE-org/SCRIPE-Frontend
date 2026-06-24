"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/use-toast";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";

/**
 * Exported type defining parameters and fields for export format configurations.
 */
export type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: ".csv",
  json: ".json",
  xlsx: ".xlsx",
  pdf: ".pdf",
};

/**
 * React hook/ViewModel orchestrating state and data flows for report detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useReportDetailViewModel(id: string) {
  const { t } = useI18n();
  const { reportRepository } = complianceContainer;

  const [downloadFormat, setDownloadFormat] = useState<ExportFormat>("csv");

  const query = useQuery({
    queryKey: ["compliance", "report", id],
    queryFn: () => reportRepository.getById(id),
    refetchInterval: (q) => {
      const r = q.state.data as ComplianceReport | undefined;
      return r?.isPending ? 5_000 : false;
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (format: ExportFormat) => reportRepository.download(id, format),
    onSuccess: (blob, format) => {
      const ext = FORMAT_EXTENSIONS[format];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compliance-report-${id}${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("common.success"), variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  return {
    report: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    downloadFormat,
    setDownloadFormat,
    isDownloadingPending: downloadMutation.isPending,
    downloadExport: (format: ExportFormat) => downloadMutation.mutate(format),
  };
}
