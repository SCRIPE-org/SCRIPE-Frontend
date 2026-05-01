"use client";
/**
 * ExportButton — Dropdown button for exporting analytics data.
 * Supports CSV, Excel, and PDF formats with all optional sections.
 * Shows toast notifications for export success/failure feedback.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/ui/use-toast";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, File, CheckCircle2 } from "lucide-react";

interface ExportButtonProps {
  onExport: (format: string) => Promise<void>;
  disabled?: boolean;
}

const FORMAT_LABELS: Record<string, string> = {
  csv: "CSV",
  xlsx: "Excel",
  pdf: "PDF",
};

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setLoading(format);
    try {
      await onExport(format);
      toast({
        title: t("entitlements.analytics.export.success") || "Export Complete",
        description:
          t("entitlements.analytics.export.successDesc") ||
          `Your ${FORMAT_LABELS[format] ?? format} file has been downloaded.`,
      });
    } catch {
      toast({
        title: t("entitlements.analytics.export.error") || "Export Failed",
        description:
          t("entitlements.analytics.export.errorDesc") ||
          "Something went wrong while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !!loading}
          loading={!!loading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {t("entitlements.analytics.export.button")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={loading === "csv"}
          className="gap-2"
        >
          <FileText className="h-4 w-4 text-emerald-500" />
          {t("entitlements.analytics.export.csv")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={loading === "xlsx"}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          {t("entitlements.analytics.export.excel")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={loading === "pdf"}
          className="gap-2"
        >
          <File className="h-4 w-4 text-red-500" />
          {t("entitlements.analytics.export.pdf")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
