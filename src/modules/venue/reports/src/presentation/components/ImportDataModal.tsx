"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@core/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
  Layers,
} from "lucide-react";
import {
  ImportType,
  ParsedTableData,
  ValidationReport,
  IMPORT_SCHEMAS,
} from "../../utils/excelDataImport";

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  importStep: 1 | 2 | 3 | 4;
  setImportStep: (step: 1 | 2 | 3 | 4) => void;
  importType: ImportType;
  setImportType: (type: ImportType) => void;
  parsedTable: ParsedTableData | null;
  columnMapping: Record<string, string>;
  setColumnMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validationReport: ValidationReport | null;
  isCommitting: boolean;
  importSummaryResult: { successCount: number; errorCount: number; errors: string[] } | null;
  onFileSelect: (rawContent: string) => void;
  onExecuteValidation: () => void;
  onCommitImport: () => Promise<void>;
  onRetryFailedCustomers: () => Promise<void>;
  onReset: () => void;
  isRtl: boolean;
}

export function ImportDataModal({
  isOpen,
  onClose,
  importStep,
  setImportStep,
  importType,
  setImportType,
  parsedTable,
  columnMapping,
  setColumnMapping,
  validationReport,
  isCommitting,
  importSummaryResult,
  onFileSelect,
  onExecuteValidation,
  onCommitImport,
  onRetryFailedCustomers,
  onReset,
  isRtl,
}: ImportDataModalProps) {
  const { t } = useI18n();
  const [pasteContent, setPasteContent] = useState("");
  const commitInProgressRef = useRef(false);
  const schema = IMPORT_SCHEMAS[importType];

  const handleCommitImport = async () => {
    if (commitInProgressRef.current || isCommitting) return;
    commitInProgressRef.current = true;
    try {
      await onCommitImport();
    } finally {
      commitInProgressRef.current = false;
    }
  };

  const handleRetryFailedCustomers = async () => {
    if (commitInProgressRef.current || isCommitting) return;
    commitInProgressRef.current = true;
    try {
      await onRetryFailedCustomers();
    } finally {
      commitInProgressRef.current = false;
    }
  };

  const handleReset = () => {
    commitInProgressRef.current = false;
    onReset();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileSelect(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (pasteContent.trim().length > 0) {
      onFileSelect(pasteContent);
    }
  };

  const handleMappingChange = (fieldKey: string, headerName: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fieldKey]: headerName,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir={isRtl ? "rtl" : "ltr"}
        className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-6"
      >
        <DialogHeader className="border-b border-nx-line pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-nx-accent/10 flex size-9 items-center justify-center rounded-lg text-nx-accent">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-nx-ink">
                  {t("venueReports.import.title")}
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">
                  {t("venueReports.import.description")}
                </DialogDescription>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="hidden items-center gap-1.5 text-xs font-semibold sm:flex">
              <span
                className={`rounded-full px-2 py-0.5 ${
                  importStep >= 1
                    ? "text-nx-accent-contrast bg-nx-accent"
                    : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                1
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`rounded-full px-2 py-0.5 ${
                  importStep >= 2
                    ? "text-nx-accent-contrast bg-nx-accent"
                    : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                2
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`rounded-full px-2 py-0.5 ${
                  importStep >= 3
                    ? "text-nx-accent-contrast bg-nx-accent"
                    : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                3
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`rounded-full px-2 py-0.5 ${
                  importStep === 4
                    ? "bg-emerald-600 text-white"
                    : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                4
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {/* STEP 1: Upload and Select Type */}
          {importStep === 1 && (
            <div className="space-y-6">
              {/* Scope Selection (A13: Safe Scope Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">
                  {t("venueReports.import.stepOne")}
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => setImportType("customers")}
                    variant="outline"
                    className={`h-auto min-h-20 w-full justify-start whitespace-normal p-4 text-start transition-all ${
                      importType === "customers"
                        ? "bg-nx-accent/5 border-nx-accent ring-1 ring-nx-accent"
                        : "hover:border-nx-line/80 border-nx-line bg-nx-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-nx-accent/10 flex size-8 items-center justify-center rounded-lg text-nx-accent">
                        <Users className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-nx-ink">
                          {t("venueReports.import.customers")}
                        </div>
                        <div className="text-xs text-nx-ink-2">
                          {t("venueReports.import.parties")}
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setImportType("courts")}
                    variant="outline"
                    className={`h-auto min-h-20 w-full justify-start whitespace-normal p-4 text-start transition-all ${
                      importType === "courts"
                        ? "bg-nx-accent/5 border-nx-accent ring-1 ring-nx-accent"
                        : "hover:border-nx-line/80 border-nx-line bg-nx-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-nx-accent/10 flex size-8 items-center justify-center rounded-lg text-nx-accent">
                        <Layers className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-nx-ink">
                          {t("venueReports.import.courts")}
                        </div>
                        <div className="text-xs text-nx-ink-2">
                          {t("venueReports.import.facilitySetup")}
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">
                  {t("venueReports.import.upload")}
                </label>
                <label className="rounded-nx-xl bg-nx-surfaceSubtle/40 hover:bg-nx-surfaceSubtle/70 flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-nx-line p-8 transition-colors hover:border-nx-accent">
                  <UploadCloud className="mb-2 size-10 text-nx-accent" />
                  <span className="text-sm font-semibold text-nx-ink">
                    {t("venueReports.import.dropFile")}
                  </span>
                  <span className="mt-1 text-xs text-nx-ink-3">
                    {t("venueReports.import.supportedFormats")}
                  </span>
                  <Input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Quick Paste Alternative */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-nx-ink-2">
                    {t("venueReports.import.pasteHint")}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-nx-accent"
                    onClick={() => {
                      if (importType === "customers") {
                        setPasteContent(
                          `Name,Type,Email,Phone\nZaid Al-Mansoor,Person,zaid@example.com,+966501234567\nRiyadh Padel Academy,Organization,contact@riyadhpadel.com,+966509876543`
                        );
                      } else {
                        setPasteContent(
                          `Name,Category,Capacity\nCourt 1 - Outdoor,Padel,4\nCourt 2 - Indoor Panoramic,Padel,4\nTraining Pitch,Football,10`
                        );
                      }
                    }}
                  >
                    <Copy className="me-1 size-3" />
                    {t("venueReports.import.sampleRows")}
                  </Button>
                </div>
                <Textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={t("venueReports.import.pastePlaceholder")}
                  rows={4}
                  className="w-full rounded-nx-lg border border-nx-line bg-nx-surface p-3 font-mono text-xs text-nx-ink focus:outline-none focus:ring-1 focus:ring-nx-accent"
                />
                {pasteContent.trim().length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePasteSubmit}
                    className="text-nx-accent-contrast hover:bg-nx-accent/90 gap-1.5 bg-nx-accent text-xs"
                  >
                    <span>{t("venueReports.import.parsePasted")}</span>
                    <ArrowRight className="size-3 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {importStep === 2 && parsedTable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                <span>
                  {t("venueReports.import.detectedRows", {
                    columns: parsedTable.headers.length,
                    rows: parsedTable.rowCount,
                  })}
                </span>
                <span className="font-bold">{schema.title}</span>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">
                  {t("venueReports.import.mapColumns")}
                </div>

                <div className="space-y-2 divide-y divide-nx-line rounded-nx-lg border border-nx-line">
                  {schema.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-nx-ink">{field.label}</span>
                          {field.required && (
                            <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                              {t("venueReports.import.required")}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-nx-ink-3">{field.description}</div>
                      </div>

                      <div className="w-full sm:w-64">
                        <Select
                          value={columnMapping[field.key] || "unmapped"}
                          onValueChange={(headerName) =>
                            handleMappingChange(
                              field.key,
                              headerName === "unmapped" ? "" : headerName
                            )
                          }
                        >
                          <SelectTrigger aria-label={field.label} className="h-9 text-xs">
                            <SelectValue placeholder={t("venueReports.import.selectColumn")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unmapped">
                              {t("venueReports.import.selectColumn")}
                            </SelectItem>
                            {parsedTable.headers.map((hdr) => (
                              <SelectItem key={hdr} value={hdr}>
                                {hdr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Validate and Preview (A12: valid, warnings, invalid, duplicates) */}
          {importStep === 3 && validationReport && (
            <div className="space-y-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.validRows")}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {validationReport.validCount}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.warnings")}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {validationReport.warningCount}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-800/50 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Copy className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.duplicates")}</span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {validationReport.duplicateCount}
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-800/50 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <XCircle className="size-4" />
                    <span className="text-xs font-bold">
                      {t("venueReports.import.invalidRows")}
                    </span>
                  </div>
                  <div className="mt-1 text-2xl font-bold text-rose-800 dark:text-rose-200">
                    {validationReport.invalidCount}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="overflow-hidden rounded-nx-lg border border-nx-line">
                <Table>
                  <TableHeader className="bg-nx-surfaceSubtle/80">
                    <TableRow>
                      <TableHead className="w-16">{t("venueReports.import.rowNumber")}</TableHead>
                      <TableHead>{t("venueReports.import.status")}</TableHead>
                      <TableHead>{t("venueReports.import.name")}</TableHead>
                      <TableHead>{t("venueReports.import.details")}</TableHead>
                      <TableHead>{t("venueReports.import.validationAudit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationReport.rows.slice(0, 15).map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="font-mono text-xs text-nx-ink-3">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell>
                          {row.status === "valid" && (
                            <Badge className="border-emerald-300 bg-emerald-500/10 text-[10px] text-emerald-600">
                              {t("venueReports.import.valid")}
                            </Badge>
                          )}
                          {row.status === "warning" && (
                            <Badge className="border-amber-300 bg-amber-500/10 text-[10px] text-amber-600">
                              {t("venueReports.import.warning")}
                            </Badge>
                          )}
                          {row.status === "duplicate" && (
                            <Badge className="border-purple-300 bg-purple-500/10 text-[10px] text-purple-600">
                              {t("venueReports.import.duplicate")}
                            </Badge>
                          )}
                          {row.status === "invalid" && (
                            <Badge variant="destructive" className="text-[10px]">
                              {t("venueReports.import.rejected")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-nx-ink">
                          {row.data.name || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-nx-ink-2">
                          {importType === "customers"
                            ? `${row.data.type || "Person"} | ${row.data.email || "-"}`
                            : `${row.data.category || "-"} (Cap: ${row.data.capacity || "-"})`}
                        </TableCell>
                        <TableCell className="text-xs text-nx-ink-3">
                          {row.messages.join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* STEP 4: Execution / Result */}
          {importStep === 4 && (
            <div className="space-y-4 py-8 text-center">
              {isCommitting ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto size-10 animate-spin text-nx-accent" />
                  <div className="text-base font-bold text-nx-ink">
                    {t("venueReports.import.committing")}
                  </div>
                  <div className="text-xs text-nx-ink-3">
                    {t("venueReports.import.committingDescription")}
                  </div>
                </div>
              ) : importSummaryResult ? (
                <div className="mx-auto max-w-md space-y-4">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-nx-ink">
                    {t("venueReports.import.completed")}
                  </h3>
                  <div className="bg-nx-surfaceSubtle space-y-2 rounded-xl border border-nx-line p-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-nx-ink-2">
                        {t("venueReports.import.successfulRecords")}
                      </span>
                      <span className="font-bold text-emerald-600">
                        {importSummaryResult.successCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-nx-ink-2">
                        {t("venueReports.import.failedRecords")}
                      </span>
                      <span className="font-bold text-rose-600">
                        {importSummaryResult.errorCount}
                      </span>
                    </div>
                  </div>
                  {importSummaryResult.errors.length > 0 && (
                    <div className="bg-nx-surfaceSubtle space-y-2 rounded-xl border border-nx-line p-4 text-start text-xs">
                      <h4 className="font-semibold text-nx-ink">
                        {t("venueReports.import.rowErrors")}
                      </h4>
                      <ul className="list-disc space-y-1 ps-5 text-nx-ink-2">
                        {importSummaryResult.errors.map((message, index) => (
                          <li key={`${index}-${message}`}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importType === "customers" && importSummaryResult.errorCount > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleRetryFailedCustomers}
                      disabled={isCommitting}
                      className="bg-nx-accent text-xs text-nx-accent-contrast hover:bg-nx-accent/90"
                    >
                      {isCommitting ? (
                        <Loader2 className="me-1 size-3 animate-spin" />
                      ) : null}
                      {t("venueReports.import.retryFailedCustomers")}
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <DialogFooter className="flex items-center justify-between border-t border-nx-line pt-4">
          <div>
            {importStep > 1 && importStep < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportStep(Math.max(1, importStep - 1) as 1 | 2 | 3)}
                disabled={isCommitting}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="size-3 rtl:rotate-180" />
                <span>{t("venueReports.import.back")}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isCommitting}
              className="text-xs"
            >
              {importStep === 4 ? t("venueReports.import.close") : t("venueReports.import.cancel")}
            </Button>

            {importStep === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={onExecuteValidation}
                className="text-nx-accent-contrast hover:bg-nx-accent/90 gap-1.5 bg-nx-accent text-xs"
              >
                <span>{t("venueReports.import.validate")}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Button>
            )}

            {importStep === 3 && validationReport && (
              <Button
                type="button"
                size="sm"
                onClick={handleCommitImport}
                disabled={!validationReport.canCommit || isCommitting}
                className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {isCommitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>
                  {t("venueReports.import.commitRows", {
                    count: validationReport.validCount + validationReport.warningCount,
                  })}
                </span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
