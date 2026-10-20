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
  onReset,
  isRtl,
}: ImportDataModalProps) {
  const { t } = useI18n();
  const [pasteContent, setPasteContent] = useState("");
  const commitAttemptedRef = useRef(false);
  const schema = IMPORT_SCHEMAS[importType];

  const handleCommitImport = async () => {
    if (commitAttemptedRef.current || isCommitting) return;

    // The import API has no durable business-intent key. Keep one attempt per
    // modal session so a response-loss retry cannot resubmit already-created rows.
    commitAttemptedRef.current = true;
    await onCommitImport();
  };

  const handleReset = () => {
    commitAttemptedRef.current = false;
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
      <DialogContent dir={isRtl ? "rtl" : "ltr"} className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-nx-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-nx-accent/10 text-nx-accent flex items-center justify-center">
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
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 1 ? "bg-nx-accent text-nx-accent-contrast" : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                1
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 2 ? "bg-nx-accent text-nx-accent-contrast" : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                2
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 3 ? "bg-nx-accent text-nx-accent-contrast" : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                3
              </span>
              <span className="text-nx-line">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep === 4 ? "bg-emerald-600 text-white" : "bg-nx-surfaceSubtle text-nx-ink-3"
                }`}
              >
                4
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* STEP 1: Upload and Select Type */}
          {importStep === 1 && (
            <div className="space-y-6">
              {/* Scope Selection (A13: Safe Scope Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">
                  {t("venueReports.import.stepOne")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => setImportType("customers")}
                    variant="outline"
                    className={`h-auto min-h-20 w-full justify-start whitespace-normal p-4 text-start transition-all ${
                      importType === "customers"
                        ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                        : "border-nx-line hover:border-nx-line/80 bg-nx-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-nx-accent/10 text-nx-accent flex items-center justify-center">
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
                        ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                        : "border-nx-line hover:border-nx-line/80 bg-nx-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-nx-accent/10 text-nx-accent flex items-center justify-center">
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
                <label className="border-2 border-dashed border-nx-line hover:border-nx-accent rounded-nx-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-nx-surfaceSubtle/40 hover:bg-nx-surfaceSubtle/70 transition-colors">
                  <UploadCloud className="size-10 text-nx-accent mb-2" />
                  <span className="text-sm font-semibold text-nx-ink">
                    {t("venueReports.import.dropFile")}
                  </span>
                  <span className="text-xs text-nx-ink-3 mt-1">
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
                    className="text-xs text-nx-accent h-7"
                    onClick={() => {
                      if (importType === "customers") {
                        setPasteContent(`Name,Type,Email,Phone\nZaid Al-Mansoor,Person,zaid@example.com,+966501234567\nRiyadh Padel Academy,Organization,contact@riyadhpadel.com,+966509876543`);
                      } else {
                        setPasteContent(`Name,Category,Capacity\nCourt 1 - Outdoor,Padel,4\nCourt 2 - Indoor Panoramic,Padel,4\nTraining Pitch,Football,10`);
                      }
                    }}
                  >
                    <Copy className="size-3 me-1" />
                    {t("venueReports.import.sampleRows")}
                  </Button>
                </div>
                <Textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={t("venueReports.import.pastePlaceholder")}
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-nx-lg border border-nx-line bg-nx-surface text-nx-ink focus:ring-1 focus:ring-nx-accent focus:outline-none"
                />
                {pasteContent.trim().length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePasteSubmit}
                    className="gap-1.5 text-xs bg-nx-accent text-nx-accent-contrast hover:bg-nx-accent/90"
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
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                <span>
                  {t("venueReports.import.detectedRows", { columns: parsedTable.headers.length, rows: parsedTable.rowCount })}
                </span>
                <span className="font-bold">{schema.title}</span>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-nx-ink-2">
                  {t("venueReports.import.mapColumns")}
                </div>

                <div className="space-y-2 border border-nx-line rounded-nx-lg divide-y divide-nx-line">
                  {schema.fields.map((field) => (
                    <div key={field.key} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-nx-ink">
                            {field.label}
                          </span>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              {t("venueReports.import.required")}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-nx-ink-3">{field.description}</div>
                      </div>

                      <div className="w-full sm:w-64">
                        <Select
                          value={columnMapping[field.key] || "unmapped"}
                          onValueChange={(headerName) => handleMappingChange(field.key, headerName === "unmapped" ? "" : headerName)}
                        >
                          <SelectTrigger aria-label={field.label} className="h-9 text-xs">
                            <SelectValue placeholder={t("venueReports.import.selectColumn")} />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="unmapped">{t("venueReports.import.selectColumn")}</SelectItem>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.validRows")}</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                    {validationReport.validCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.warnings")}</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">
                    {validationReport.warningCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Copy className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.duplicates")}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
                    {validationReport.duplicateCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <XCircle className="size-4" />
                    <span className="text-xs font-bold">{t("venueReports.import.invalidRows")}</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-1">
                    {validationReport.invalidCount}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-nx-line rounded-nx-lg overflow-hidden">
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
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px]">
                              {t("venueReports.import.valid")}
                            </Badge>
                          )}
                          {row.status === "warning" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px]">
                              {t("venueReports.import.warning")}
                            </Badge>
                          )}
                          {row.status === "duplicate" && (
                            <Badge className="bg-purple-500/10 text-purple-600 border-purple-300 text-[10px]">
                              {t("venueReports.import.duplicate")}
                            </Badge>
                          )}
                          {row.status === "invalid" && (
                            <Badge variant="destructive" className="text-[10px]">
                              {t("venueReports.import.rejected")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-nx-ink">
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
            <div className="py-8 text-center space-y-4">
              {isCommitting ? (
                <div className="space-y-3">
                  <Loader2 className="size-10 animate-spin text-nx-accent mx-auto" />
                  <div className="text-base font-bold text-nx-ink">
                    {t("venueReports.import.committing")}
                  </div>
                  <div className="text-xs text-nx-ink-3">
                    {t("venueReports.import.committingDescription")}
                  </div>
                </div>
              ) : importSummaryResult ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-nx-ink">
                    {t("venueReports.import.completed")}
                  </h3>
                  <div className="p-4 rounded-xl bg-nx-surfaceSubtle border border-nx-line text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-nx-ink-2">{t("venueReports.import.successfulRecords")}</span>
                      <span className="font-bold text-emerald-600">{importSummaryResult.successCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-nx-ink-2">{t("venueReports.import.failedRecords")}</span>
                      <span className="font-bold text-rose-600">{importSummaryResult.errorCount}</span>
                    </div>
                  </div>
                  {importSummaryResult.errors.length > 0 && (
                    <div className="text-start rounded-xl border border-nx-line bg-nx-surfaceSubtle p-4 text-xs space-y-2">
                      <h4 className="font-semibold text-nx-ink">{t("venueReports.import.rowErrors")}</h4>
                      <ul className="list-disc ps-5 space-y-1 text-nx-ink-2">
                        {importSummaryResult.errors.map((message, index) => (
                          <li key={`${index}-${message}`}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <DialogFooter className="pt-4 border-t border-nx-line flex items-center justify-between">
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
                className="gap-1.5 text-xs bg-nx-accent text-nx-accent-contrast hover:bg-nx-accent/90"
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
                className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isCommitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>
                  {t("venueReports.import.commitRows", { count: validationReport.validCount + validationReport.warningCount })}
                </span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
