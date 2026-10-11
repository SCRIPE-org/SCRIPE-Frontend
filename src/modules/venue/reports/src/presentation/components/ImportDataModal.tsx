"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@core/ui/table";
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
  const [pasteContent, setPasteContent] = useState("");
  const schema = IMPORT_SCHEMAS[importType];

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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isRtl ? "معالج استيراد البيانات المعتمدة" : "Staged Data Import Wizard"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? "استيراد آمن خاضع للتدقيق والتحقق المسبق عبر خدمات النطاق المعتمدة"
                    : "Secure, audited staged import utilizing authoritative domain workflows"}
                </DialogDescription>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                1
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                2
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                3
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  importStep === 4 ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isRtl ? "1. اختر نوع البيانات الآمن للاستيراد" : "1. Select Safe Import Scope"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportType("customers")}
                    className={`p-4 rounded-xl border text-start transition-all ${
                      importType === "customers"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Users className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isRtl ? "سجل العملاء" : "Customer Directory"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isRtl ? "أفراد وشركات (Party Kernel)" : "Individuals & Organizations"}
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportType("courts")}
                    className={`p-4 rounded-xl border text-start transition-all ${
                      importType === "courts"
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-1 ring-blue-600"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <Layers className="size-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isRtl ? "الملاعب والمساحات" : "Courts & Spaces"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isRtl ? "التكوين الأولي للمرافق" : "Basic Facility configuration"}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isRtl ? "2. رفع ملف Excel أو CSV" : "2. Upload Spreadsheet or CSV File"}
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                  <UploadCloud className="size-10 text-blue-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? "انقر لاختيار ملف أو اسحبه إلى هنا" : "Click to select .csv / .txt file or drag and drop"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    {isRtl ? "يدعم ملفات CSV و TSV و UTF-8" : "Supports UTF-8 CSV, TSV, or Tab-delimited files"}
                  </span>
                  <input
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
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {isRtl ? "أو الصق البيانات النصية مباشرة (CSV / TSV):" : "Or paste delimited table data directly:"}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 h-7"
                    onClick={() => {
                      if (importType === "customers") {
                        setPasteContent(`Name,Type,Email,Phone\nZaid Al-Mansoor,Person,zaid@example.com,+966501234567\nRiyadh Padel Academy,Organization,contact@riyadhpadel.com,+966509876543`);
                      } else {
                        setPasteContent(`Name,Category,Capacity\nCourt 1 - Outdoor,Padel,4\nCourt 2 - Indoor Panoramic,Padel,4\nTraining Pitch,Football,10`);
                      }
                    }}
                  >
                    <Copy className="size-3 me-1" />
                    {isRtl ? "تحميل عينة توضيحية" : "Load sample rows"}
                  </Button>
                </div>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Header1,Header2,...\nValue1,Value2,...`}
                  rows={4}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {pasteContent.trim().length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handlePasteSubmit}
                    className="gap-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <span>{isRtl ? "تحليل البيانات الملصقة" : "Parse Pasted Table"}</span>
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
                  {isRtl
                    ? `تم اكتشاف ${parsedTable.headers.length} أعمدة و ${parsedTable.rowCount} صفوف في الملف.`
                    : `Detected ${parsedTable.headers.length} columns and ${parsedTable.rowCount} rows in file.`}
                </span>
                <span className="font-bold">{schema.title}</span>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isRtl ? "مطابقة أعمدة الملف مع حقول النظام" : "Map File Columns to Target Fields"}
                </div>

                <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800">
                  {schema.fields.map((field) => (
                    <div key={field.key} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {field.label}
                          </span>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                              {isRtl ? "مطلوب" : "Required"}
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{field.description}</div>
                      </div>

                      <div className="w-full sm:w-64">
                        <select
                          value={columnMapping[field.key] || ""}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className="w-full text-xs h-9 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        >
                          <option value="">{isRtl ? "-- اختر العمود --" : "-- Select Column --"}</option>
                          {parsedTable.headers.map((hdr) => (
                            <option key={hdr} value={hdr}>
                              {hdr}
                            </option>
                          ))}
                        </select>
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
                    <span className="text-xs font-bold">{isRtl ? "صفوف صالحة" : "Valid Rows"}</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                    {validationReport.validCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    <span className="text-xs font-bold">{isRtl ? "تحذيرات" : "Warnings"}</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">
                    {validationReport.warningCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/20">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Copy className="size-4" />
                    <span className="text-xs font-bold">{isRtl ? "سجلات مكررة" : "Duplicates"}</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
                    {validationReport.duplicateCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <XCircle className="size-4" />
                    <span className="text-xs font-bold">{isRtl ? "غير صالحة" : "Invalid Rows"}</span>
                  </div>
                  <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-1">
                    {validationReport.invalidCount}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="w-16">{isRtl ? "الصف" : "Row #"}</TableHead>
                      <TableHead>{isRtl ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRtl ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isRtl ? "التفاصيل" : "Details"}</TableHead>
                      <TableHead>{isRtl ? "ملاحظات الفحص" : "Validation Audit"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationReport.rows.slice(0, 15).map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {row.rowNumber}
                        </TableCell>
                        <TableCell>
                          {row.status === "valid" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-[10px]">
                              {isRtl ? "صالح" : "Valid"}
                            </Badge>
                          )}
                          {row.status === "warning" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px]">
                              {isRtl ? "تحذير" : "Warning"}
                            </Badge>
                          )}
                          {row.status === "duplicate" && (
                            <Badge className="bg-purple-500/10 text-purple-600 border-purple-300 text-[10px]">
                              {isRtl ? "مكرر" : "Duplicate"}
                            </Badge>
                          )}
                          {row.status === "invalid" && (
                            <Badge variant="destructive" className="text-[10px]">
                              {isRtl ? "مرفوض" : "Invalid"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {row.data.name || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {importType === "customers"
                            ? `${row.data.type || "Person"} | ${row.data.email || "-"}`
                            : `${row.data.category || "-"} (Cap: ${row.data.capacity || "-"})`}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 dark:text-slate-400">
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
                  <Loader2 className="size-10 animate-spin text-blue-600 mx-auto" />
                  <div className="text-base font-bold">
                    {isRtl ? "جارٍ تنفيذ الاستيراد عبر خدمات النطاق..." : "Committing import via domain services..."}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isRtl
                      ? "جاري الحفظ الآمن وسجلات التدقيق المعتمدة"
                      : "Ensuring authoritative validation and tenant isolation"}
                  </div>
                </div>
              ) : importSummaryResult ? (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? "اكتملت عملية الاستيراد" : "Import Process Completed"}
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isRtl ? "السجلات الناجحة:" : "Successful Records:"}</span>
                      <span className="font-bold text-emerald-600">{importSummaryResult.successCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{isRtl ? "السجلات المتعثرة:" : "Failed Records:"}</span>
                      <span className="font-bold text-rose-600">{importSummaryResult.errorCount}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
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
                <span>{isRtl ? "السابق" : "Back"}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={isCommitting}
              className="text-xs"
            >
              {importStep === 4 ? (isRtl ? "إغلاق" : "Close") : (isRtl ? "إلغاء" : "Cancel")}
            </Button>

            {importStep === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={onExecuteValidation}
                className="gap-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700"
              >
                <span>{isRtl ? "فحص وتحقق من البيانات" : "Validate Rows"}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </Button>
            )}

            {importStep === 3 && validationReport && (
              <Button
                type="button"
                size="sm"
                onClick={onCommitImport}
                disabled={!validationReport.canCommit || isCommitting}
                className="gap-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isCommitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>
                  {isRtl
                    ? `تأكيد استيراد (${validationReport.validCount + validationReport.warningCount}) سجل`
                    : `Commit Import (${validationReport.validCount + validationReport.warningCount} rows)`}
                </span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
