"use client";

import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileSpreadsheet,
  KeyRound,
  Layers,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Checkbox } from "@core/ui/checkbox";
import { Switch } from "@core/ui/switch";
import { Progress } from "@core/ui/progress";
import { ScrollArea } from "@core/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { useDataExchangeStudioViewModel } from "../viewmodels/useDataExchangeStudioViewModel";
import { formatByteSize } from "../../domain/mapping-validation";
import { ColumnNormalizationPopover } from "./ColumnNormalizationPopover";
import type {
  DataExchangeExecuteImportResponseDto,
  DataExchangeIdentityOnboardingMode,
  DataExchangeImportMode,
  DataTransferJobDto,
  MappingCompatibilityIssue,
} from "../../domain/types";

const UNMAPPED_SENTINEL = "__UNMAPPED__";

export interface DataExchangeStudioOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKey: string;
  initialMultiSheet?: boolean;
  multiSheetEntityKeys?: string[];
  onImportComplete?: () => void;
}

function getIssueMessage(
  issue: MappingCompatibilityIssue,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  switch (issue.reasonCode) {
    case "NON_NUMERIC_VALUES":
      return t("dataExchange.mapping.nonNumericValues", {
        sample: issue.sampleValue ?? "",
      });
    case "INVALID_BOOL":
      return t("dataExchange.mapping.invalidBoolValues", {
        sample: issue.sampleValue ?? "",
      });
    case "INVALID_DATE":
      return t("dataExchange.mapping.invalidDateValues", {
        sample: issue.sampleValue ?? "",
      });
    case "READ_ONLY":
      return t("dataExchange.mapping.readOnlyTarget");
    case "RESTRICTED":
      return t("dataExchange.mapping.restrictedTarget");
    default:
      return t("dataExchange.mapping.compatibilityBlocked", { count: 1 });
  }
}


function buildJobFromExecution(
  result: DataExchangeExecuteImportResponseDto,
  inspectResult: { entityKey?: string; format?: string; fileName?: string } | null | undefined,
  entityKey: string,
  isMultiSheet: boolean,
  importMode: string,
  onboardingMode: string,
  polledJob: DataTransferJobDto | null
): DataTransferJobDto {
  if (polledJob) return polledJob;
  return {
    id: result.jobId,
    kind: "Import",
    entityKey: inspectResult?.entityKey ?? entityKey,
    isMultiSheet,
    importMode,
    onboardingMode,
    fileFormat: inspectResult?.format ?? "xlsx",
    originalFileName: inspectResult?.fileName ?? null,
    status: result.status,
    totalRows: result.totalRows,
    processedRows: result.processedRows ?? 0,
    progressPercent: 0,
    validRows: result.committedRows,
    committedRows: result.committedRows,
    createdRows: result.createdRows,
    updatedRows: result.updatedRows,
    rejectedRows: result.rejectedRows,
    errorSummary: result.errorSummary ?? null,
    hasRejectedWorkbook: result.hasRejectedWorkbook,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    expiresAtUtc: new Date(Date.now() + 86400000).toISOString(),
  };
}

/**
 * Full-viewport elevated SCRIPE Data Exchange Studio overlay.
 * Renders a 4-stage pipeline above the workspace chrome with Cancel/Back/Commit controls,
 * interactive spreadsheet-to-schema column mapping, type compatibility enforcement,
 * pre-flight quota guard, partial commit recovery, and ephemeral onboarding vault.
 */
export function DataExchangeStudioOverlay({
  open,
  onOpenChange,
  entityKey,
  initialMultiSheet = false,
  multiSheetEntityKeys,
  onImportComplete,
}: DataExchangeStudioOverlayProps) {
  const { direction, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const vm = useDataExchangeStudioViewModel({
    open,
    entityKey,
    initialMultiSheet,
    multiSheetEntityKeys,
    onImportComplete,
  });

  const handleClose = () => {
    vm.resetWorkflow();
    onOpenChange(false);
  };

  const handleFileChosen = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    vm.inspectUploadedFile(file, vm.isMultiSheet);
  };

  const handleCopyCredentials = async () => {
    const creds = vm.executeResult?.ephemeralCredentials;
    if (!creds || creds.length === 0) return;
    const header = "rowNumber,email,username,oneTimePassword";
    const lines = creds.map(
      (c) => `${c.rowNumber},"${c.email}","${c.username}","${c.oneTimePassword}"`
    );
    await navigator.clipboard.writeText([header, ...lines].join("\n"));
    vm.setInfoBanner(t("dataExchange.results.credentialsCopied"));
  };

  const primaryDesc = vm.primaryDescriptor?.descriptor;
  const entityLabel = primaryDesc
    ? vm.isAr
      ? primaryDesc.displayNameAr
      : primaryDesc.displayNameEn
    : entityKey;

  const steps: { id: "upload" | "mapping" | "dryRun" | "results"; label: string }[] = [
    { id: "upload", label: t("dataExchange.steps.upload") },
    { id: "mapping", label: t("dataExchange.steps.mapping") },
    { id: "dryRun", label: t("dataExchange.steps.dryRun") },
    { id: "results", label: t("dataExchange.steps.results") },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === vm.step);
  const progressPercent = ((currentStepIdx + 1) / steps.length) * 100;
  const canProceedToDryRun =
    Boolean(vm.inspectResult) &&
    vm.sheetStates.length > 0 &&
    vm.totalCompatibilityIssues === 0 &&
    vm.totalMissingRequired === 0;

  const activeDesc = vm.activeDescriptorResponse?.descriptor;
  const mappableTargets = (activeDesc?.columns ?? []).filter(
    (col) =>
      col.isMappable &&
      !col.isAutoGenerated &&
      col.direction !== "SystemGenerated" &&
      col.direction !== "ExportOnly" &&
      !vm.activeRestrictedSet.has(col.key)
  );

  const readOnlyTargets = (activeDesc?.columns ?? []).filter(
    (col) =>
      !col.isMappable ||
      col.isAutoGenerated ||
      col.direction === "SystemGenerated" ||
      col.direction === "ExportOnly"
  );

  const liveJobStatus = vm.polledJob?.status ?? vm.executeResult?.status;
  const isAsyncRunning =
    vm.step === "results" &&
    (liveJobStatus === "Queued" || liveJobStatus === "Running");

  const finalTotalRows = vm.polledJob?.totalRows ?? vm.executeResult?.totalRows ?? 0;
  const finalCommitted = vm.polledJob?.committedRows ?? vm.executeResult?.committedRows ?? 0;
  const finalCreated = vm.polledJob?.createdRows ?? vm.executeResult?.createdRows ?? 0;
  const finalUpdated = vm.polledJob?.updatedRows ?? vm.executeResult?.updatedRows ?? 0;
  const finalRejected = vm.polledJob?.rejectedRows ?? vm.executeResult?.rejectedRows ?? 0;
  const finalHasRejected =
    vm.polledJob?.hasRejectedWorkbook ?? vm.executeResult?.hasRejectedWorkbook ?? false;

  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : onOpenChange(true))}>
      <DialogContent
        dir={direction}
        className="flex max-h-[90vh] h-[90vh] w-[96vw] max-w-[1440px] flex-col gap-0 overflow-hidden border border-nx-line bg-nx-ground p-0 text-nx-ink"
      >
        {/* Top Studio Pipeline Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-nx-line bg-nx-surface px-6 py-4 pe-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-control border border-nx-line bg-nx-raised text-nx-accent">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2 text-base font-semibold text-nx-ink">
                <span>{t("dataExchange.title")}</span>
                <Badge variant="default">{entityLabel}</Badge>
                {vm.isMultiSheet && (
                  <Badge variant="info">
                    <Layers className="me-1 h-3 w-3" />
                    {t("dataExchange.upload.multiSheetBadge")}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("dataExchange.subtitle")}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {vm.step !== "upload" && vm.step !== "results" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  vm.setStep(vm.step === "dryRun" ? "mapping" : "upload")
                }
              >
                <BackIcon className="me-1.5 h-3.5 w-3.5" />
                {t("dataExchange.actions.back")}
              </Button>
            )}
          </div>
        </header>

        {/* Visual Stepper + Progress Strip */}
        <div className="border-b border-nx-line bg-nx-surface px-6 py-3">
          <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((s, idx) => {
              const isActive = s.id === vm.step;
              const isDone = idx < currentStepIdx;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-2 rounded-nx-control border px-3 py-1.5 text-xs font-medium",
                    isActive
                      ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                      : isDone
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-nx-line bg-nx-raised text-nx-ink-3"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-current shrink-0" />
                  )}
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        {/* Status Banners */}
        {(vm.errorBanner || vm.infoBanner || vm.isDryRunning) && (
          <div className="space-y-2 border-b border-nx-line bg-nx-surface px-6 py-3">
            {vm.isDryRunning && (
              <Alert variant="info">
                <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
                <AlertDescription>{t("dataExchange.dryRun.running")}</AlertDescription>
              </Alert>
            )}
            {vm.errorBanner && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{vm.errorBanner}</AlertDescription>
              </Alert>
            )}
            {vm.infoBanner && (
              <Alert variant="info">
                <AlertDescription>{vm.infoBanner}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Studio Body */}
        <ScrollArea className="flex-1 px-6 py-5">
          {vm.isLoadingMeta ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-nx-ink-2">
              <Loader2 className="h-5 w-5 animate-spin text-nx-accent" />
              <span>{t("dataExchange.upload.loadingMeta")}</span>
            </div>
          ) : null}

          {/* STEP 1: UPLOAD & SMART TEMPLATES */}
          {!vm.isLoadingMeta && vm.step === "upload" && (
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileChosen(e.dataTransfer.files);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-nx-lg border border-dashed p-10 text-center transition-colors",
                    isDragging
                      ? "border-nx-accent bg-nx-accent-wash"
                      : "border-nx-line-hi bg-nx-surface hover:border-nx-accent"
                  )}
                >
                  <UploadCloud className="mb-3 h-10 w-10 text-nx-accent" />
                  <h3 className="text-base font-semibold text-nx-ink">
                    {t("dataExchange.upload.dropTitle")}
                  </h3>
                  <p className="mt-1 max-w-md text-xs text-nx-ink-2">
                    {t("dataExchange.upload.dropHint")}
                  </p>

                  {vm.isInspecting && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-nx-accent">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("dataExchange.upload.inspecting")}</span>
                    </div>
                  )}

                  <Input
                    ref={fileInputRef}
                    id="dx-file-upload-input"
                    type="file"
                    accept=".xlsx,.csv,.tsv"
                    className="hidden"
                    onChange={(e) => handleFileChosen(e.target.files)}
                  />

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="default"
                      loading={vm.isInspecting}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="me-2 h-4 w-4" />
                      {t("dataExchange.actions.chooseFile")}
                    </Button>

                    {multiSheetEntityKeys && multiSheetEntityKeys.length > 1 && (
                      <div className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-raised px-3 py-1.5">
                        <Switch
                          id="dx-multisheet-toggle"
                          checked={vm.isMultiSheet}
                          onCheckedChange={(checked) => vm.setIsMultiSheet(checked)}
                        />
                        <Label
                          htmlFor="dx-multisheet-toggle"
                          className="cursor-pointer text-xs text-nx-ink"
                        >
                          {t("dataExchange.actions.multiSheetMigration")}
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <Alert variant="info">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    {t("dataExchange.upload.securityNote")}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Right Panel: Smart Templates & Quota */}
              <div className="space-y-4">
                <Card className="border-nx-line bg-nx-surface p-5">
                  <h4 className="text-sm font-semibold text-nx-ink">
                    {t("dataExchange.upload.needTemplateTitle")}
                  </h4>
                  <p className="mt-1 text-xs text-nx-ink-2">
                    {t("dataExchange.upload.needTemplateDesc")}
                  </p>
                  <div className="mt-4 space-y-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start"
                      loading={vm.isDownloading}
                      onClick={() => vm.downloadTemplate("xlsx", false)}
                    >
                      <Download className="me-2 h-4 w-4 shrink-0 text-nx-accent" />
                      {t("dataExchange.actions.downloadTemplateXlsx")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start"
                      loading={vm.isDownloading}
                      onClick={() => vm.downloadTemplate("csv", false)}
                    >
                      <Download className="me-2 h-4 w-4 shrink-0" />
                      {t("dataExchange.actions.downloadTemplateCsv")}
                    </Button>
                    {multiSheetEntityKeys && multiSheetEntityKeys.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full whitespace-normal h-auto min-h-10 py-2.5 text-start justify-start"
                        loading={vm.isDownloading}
                        onClick={() => vm.downloadTemplate("xlsx", true)}
                      >
                        <Layers className="me-2 h-4 w-4 shrink-0 text-nx-accent" />
                        {t("dataExchange.actions.downloadMultiSheetTemplate")}
                      </Button>
                    )}
                  </div>
                </Card>

                {vm.primaryDescriptor && (
                  <Card className="border-nx-line bg-nx-surface p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-nx-ink-2">
                        {t("dataExchange.dryRun.quotaTitle")}
                      </span>
                      <Badge
                        dir="ltr"
                        className="font-mono"
                        variant={
                          vm.primaryDescriptor.isQuotaEnforced ? "warning" : "success"
                        }
                      >
                        {vm.primaryDescriptor.isQuotaEnforced
                          ? vm.primaryDescriptor.quotaRemainingSlots ?? 0
                          : t("dataExchange.hub.unlimited")}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-nx-ink-3">
                      {vm.primaryDescriptor.isQuotaEnforced
                        ? t("dataExchange.dryRun.quotaSummary", {
                            remaining: vm.primaryDescriptor.quotaRemainingSlots ?? 0,
                            max: vm.primaryDescriptor.quotaMaxLimit ?? 0,
                            used: vm.primaryDescriptor.quotaUsed ?? 0,
                            reserved: vm.primaryDescriptor.quotaReserved ?? 0,
                          })
                        : t("dataExchange.dryRun.quotaUnlimited")}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE COLUMN MAPPING WORKBENCH */}
          {!vm.isLoadingMeta &&
            vm.step === "mapping" &&
            vm.inspectResult &&
            vm.activeSheet &&
            vm.activeSheetState && (
              <div className="space-y-5">
                {/* Top File + Express Ribbon */}
                <Card className="flex flex-wrap items-center justify-between gap-3 border-nx-line bg-nx-surface p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" dir="ltr" className="font-mono">
                      {t("dataExchange.upload.fileSummary", {
                        name: vm.inspectResult.fileName,
                        size: formatByteSize(vm.inspectResult.byteSize),
                        sheets: vm.inspectResult.sheets.length,
                      })}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => vm.setStep("upload")}
                    >
                      <RotateCcw className="me-1.5 h-3.5 w-3.5" />
                      {t("dataExchange.actions.changeFile")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={vm.reAutoMapActiveSheet}
                    >
                      <Sparkles className="me-1.5 h-3.5 w-3.5 text-nx-accent" />
                      {t("dataExchange.actions.autoMap")}
                    </Button>
                  </div>

                  {/* Preset Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {vm.presets.length > 0 && (
                      <Select
                        onValueChange={(id) => {
                          const found = vm.presets.find((p) => p.id === id);
                          if (found) vm.applyPreset(found);
                        }}
                      >
                        <SelectTrigger className="w-52">
                          <SelectValue placeholder={t("dataExchange.actions.loadPresets")} />
                        </SelectTrigger>
                        <SelectContent>
                          {vm.presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      value={vm.presetNameInput}
                      onChange={(e) => vm.setPresetNameInput(e.target.value)}
                      placeholder={t("dataExchange.mapping.presetNamePlaceholder")}
                      className="w-52"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={vm.isSavingPreset}
                      disabled={!vm.presetNameInput.trim()}
                      onClick={vm.saveCurrentPreset}
                    >
                      <Save className="me-1.5 h-3.5 w-3.5" />
                      {t("dataExchange.actions.savePreset")}
                    </Button>
                  </div>
                </Card>

                {/* Express Auto-Skip Banner */}
                {vm.expressReady && (
                  <Alert
                    variant="success"
                    className="flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <AlertTitle>{t("dataExchange.mapping.expressReadyTitle")}</AlertTitle>
                      <AlertDescription>
                        {t("dataExchange.mapping.expressReadyDesc")}
                      </AlertDescription>
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      loading={vm.isDryRunning}
                      onClick={vm.runDryRun}
                    >
                      <Sparkles className="me-1.5 h-4 w-4" />
                      {t("dataExchange.actions.expressDryRun")}
                    </Button>
                  </Alert>
                )}

                {/* Multi-Sheet Navigation Tabs */}
                {vm.inspectResult.sheets.length > 1 && (
                  <Tabs
                    value={vm.activeSheetState.sheetName}
                    onValueChange={vm.setActiveSheetName}
                  >
                    <TabsList variant="pill" className="flex-wrap">
                      {vm.inspectResult.sheets.map((s) => {
                        const sheetIssueCount =
                          (vm.compatibilityIssuesBySheet[s.sheetName]?.length ?? 0) +
                          (vm.missingRequiredBySheet[s.sheetName]?.length ?? 0);
                        return (
                          <TabsTrigger
                            key={s.sheetName}
                            value={s.sheetName}
                            className="gap-1.5"
                          >
                            <span>
                              {t("dataExchange.mapping.sheetTabLabel", {
                                sheet: s.sheetName,
                                rows: s.estimatedRowCount,
                              })}
                            </span>
                            {sheetIssueCount > 0 ? (
                              <Badge
                                variant="warning"
                                className="px-1.5 py-0 text-[10px]"
                              >
                                {t("dataExchange.mapping.sheetIssuesCount", {
                                  count: sheetIssueCount,
                                })}
                              </Badge>
                            ) : (
                              <CheckCircle2
                                className="h-3.5 w-3.5 text-success"
                                aria-label={t("dataExchange.mapping.sheetValid")}
                              />
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                )}

                {/* Batch Execution & Onboarding Settings Bar */}
                <Card className="grid grid-cols-1 gap-4 border-nx-line bg-nx-surface p-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-nx-ink-2">
                    {t("dataExchange.mapping.importModeLabel")}
                  </Label>
                  <Select
                    value={vm.isMultiSheet ? vm.activeSheetState.mode : vm.importMode}
                    onValueChange={(val) => {
                      const nextMode = val as DataExchangeImportMode;
                      if (vm.isMultiSheet) {
                        vm.updateSheetMeta(vm.activeSheetState!.sheetName, {
                          mode: nextMode,
                        });
                      } else {
                        vm.setImportMode(nextMode);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeDesc?.supportedModes ?? ["Insert", "Update", "Upsert"]).map(
                        (mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode === "Insert"
                              ? t("dataExchange.mapping.modeInsert")
                              : mode === "Update"
                                ? t("dataExchange.mapping.modeUpdate")
                                : t("dataExchange.mapping.modeUpsert")}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {vm.isMultiSheet && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-nx-ink-2">
                      {t("dataExchange.mapping.sheetTargetEntity")}
                    </Label>
                    <Select
                      value={vm.activeSheetState.entityKey}
                      onValueChange={(val) =>
                        vm.updateSheetMeta(vm.activeSheetState!.sheetName, {
                          entityKey: val,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(vm.descriptorByEntity).map((d) => (
                          <SelectItem
                            key={d.descriptor.entityKey}
                            value={d.descriptor.entityKey}
                          >
                            {vm.isAr
                              ? d.descriptor.displayNameAr
                              : d.descriptor.displayNameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {activeDesc?.supportsIdentityOnboardingModes && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-nx-ink-2">
                      {t("dataExchange.mapping.onboardingModeLabel")}
                    </Label>
                    <Select
                      value={vm.onboardingMode}
                      onValueChange={(val) =>
                        vm.setOnboardingMode(val as DataExchangeIdentityOnboardingMode)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="StagedPendingInvite">
                          {t("dataExchange.mapping.onboardingStaged")}
                        </SelectItem>
                        <SelectItem value="ThrottledActivationEmails">
                          {t("dataExchange.mapping.onboardingThrottled")}
                        </SelectItem>
                        <SelectItem value="OneTimeAutoPassword">
                          {t("dataExchange.mapping.onboardingOneTime")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-col justify-end gap-2">
                  {activeDesc?.supportsBulkAutoCreateLookup && (
                    <div className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2">
                      <Checkbox
                        id="dx-auto-create-lookups"
                        checked={vm.allowCreateMissingLookups}
                        onCheckedChange={(checked) =>
                          vm.setAllowCreateMissingLookups(checked === true)
                        }
                      />
                      <Label
                        htmlFor="dx-auto-create-lookups"
                        className="cursor-pointer text-xs text-nx-ink"
                      >
                        {t("dataExchange.mapping.autoCreateLookups")}
                      </Label>
                    </div>
                  )}
                </div>
              </Card>

              {/* Validation Guard Messages */}
              {(vm.activeMissingRequired.length > 0 ||
                vm.activeCompatibilityIssues.length > 0) && (
                <div className="space-y-2">
                  {vm.activeMissingRequired.length > 0 && (
                    <Alert variant="warning">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="flex flex-wrap items-center gap-1.5">
                        <span>{t("dataExchange.mapping.requiredMissing")}</span>
                        {vm.activeMissingRequired.map((col) => (
                          <Badge key={col.key} variant="warning">
                            {vm.isAr ? col.displayNameAr : col.displayNameEn}
                          </Badge>
                        ))}
                      </AlertDescription>
                    </Alert>
                  )}
                  {vm.activeCompatibilityIssues.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("dataExchange.mapping.compatibilityBlocked", {
                          count: vm.activeCompatibilityIssues.length,
                        })}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Split-Screen Source-to-Target Column Mapping Table */}
              <Card className="border-nx-line bg-nx-surface">
                <Table>
                  <TableHeader sticky>
                    <TableRow>
                      <TableHead>{t("dataExchange.mapping.sourceColumn")}</TableHead>
                      <TableHead>{t("dataExchange.mapping.samplePreview")}</TableHead>
                      <TableHead>{t("dataExchange.mapping.targetField")}</TableHead>
                      <TableHead>{t("dataExchange.mapping.dataType")}</TableHead>
                      <TableHead>{t("dataExchange.mapping.transforms")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.activeSheet.headers.map((header) => {
                      const suggestion = vm.activeSheet!.suggestedMappings.find(
                        (s) => s.sourceColumnHeader.toLowerCase() === header.toLowerCase()
                      );
                      const isDiag = suggestion?.isDiagnosticColumn ?? false;
                      const currentMapping = vm.activeSheetState!.mappings.find(
                        (m) => m.sourceColumnHeader === header
                      );
                      const targetCol = mappableTargets.find(
                        (c) =>
                          c.key.toLowerCase() ===
                          (currentMapping?.targetFieldKey ?? "").toLowerCase()
                      );
                      const issue = vm.activeCompatibilityIssues.find(
                        (i) => i.sourceColumnHeader === header
                      );
                      const samples = vm.activeSheet!.sampleRows
                        .slice(0, 3)
                        .map((r) => r[header])
                        .filter((v): v is string => Boolean(v && v.trim().length > 0));

                      return (
                        <TableRow key={header}>
                          <TableCell className="font-medium text-nx-ink">
                            <div className="flex flex-col gap-1">
                              <span dir="ltr" className="w-fit font-mono text-xs">
                                {header}
                              </span>
                              {isDiag && (
                                <Badge variant="secondary" className="w-fit text-[10px]">
                                  {t("dataExchange.mapping.diagnosticAutoIgnored")}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {samples.length > 0 ? (
                                samples.map((s, i) => (
                                  <Badge
                                    key={`${header}-${i}`}
                                    variant="secondary"
                                    dir="ltr"
                                    className="font-mono text-xs"
                                  >
                                    {s}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-nx-ink-3">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[230px]">
                            {isDiag ? (
                              <span className="text-xs text-nx-ink-3">
                                {t("dataExchange.actions.ignoreColumn")}
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <Select
                                  value={
                                    currentMapping?.targetFieldKey || UNMAPPED_SENTINEL
                                  }
                                  onValueChange={(val) =>
                                    vm.updateColumnMapping(
                                      vm.activeSheetState!.sheetName,
                                      header,
                                      {
                                        targetFieldKey:
                                          val === UNMAPPED_SENTINEL ? "" : val,
                                      }
                                    )
                                  }
                                >
                                  <SelectTrigger aria-invalid={Boolean(issue)}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={UNMAPPED_SENTINEL}>
                                      {t("dataExchange.mapping.unmappedOption")}
                                    </SelectItem>
                                    {mappableTargets.map((col) => (
                                      <SelectItem key={col.key} value={col.key}>
                                        {(vm.isAr
                                          ? col.displayNameAr
                                          : col.displayNameEn) +
                                          (col.isRequired
                                            ? ` ${t("dataExchange.mapping.requiredStar")}`
                                            : "") +
                                          ((col.key.startsWith("cf:") || col.dataType === "CustomField")
                                            ? ` [${t("dataExchange.customFieldBadge")}]`
                                            : "")}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {issue && (
                                  <p className="text-xs text-destructive">
                                    {getIssueMessage(issue, t)}
                                  </p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {targetCol ? (
                              <div className="flex flex-wrap items-center gap-1">
                                {(targetCol.key.startsWith("cf:") || targetCol.dataType === "CustomField") && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    {t("dataExchange.customFieldBadge")}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  dir="ltr"
                                  className="font-mono text-[10px]"
                                >
                                  {targetCol.dataType}
                                </Badge>
                                {targetCol.isRequired && (
                                  <Badge variant="warning">
                                    {t("dataExchange.mapping.requiredStar")}
                                  </Badge>
                                )}
                                {targetCol.isNaturalKey && (
                                  <Badge variant="info">
                                    {t("dataExchange.mapping.naturalKeyBadge")}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-nx-ink-3">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {currentMapping?.targetFieldKey && !isDiag ? (
                              <ColumnNormalizationPopover
                                sourceColumnHeader={header}
                                targetFieldKey={currentMapping.targetFieldKey}
                                targetDataType={targetCol?.dataType}
                                sampleValue={samples[0]}
                                rule={currentMapping.transform}
                                onChange={(nextRule) =>
                                  vm.updateColumnMapping(
                                    vm.activeSheetState!.sheetName,
                                    header,
                                    { transform: nextRule }
                                  )
                                }
                              />
                            ) : (
                              <span className="text-xs text-nx-ink-3">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>

              {/* System-Generated Read-Only Transparency Pill Strip */}
              {readOnlyTargets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-nx-control border border-nx-line bg-nx-raised px-4 py-2.5 text-xs text-nx-ink-2">
                  <span>{t("dataExchange.mapping.autoGeneratedReadOnly")}:</span>
                  {readOnlyTargets.map((col) => (
                    <Badge key={col.key} variant="secondary">
                      {vm.isAr ? col.displayNameAr : col.displayNameEn}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PRE-FLIGHT DRY-RUN & QUOTA GATE */}
          {!vm.isLoadingMeta && vm.step === "dryRun" && vm.dryRunResult && (
            <div className="space-y-5">
              {/* Quota / Readiness Alert */}
              {!vm.dryRunResult.quotaPassed ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.dryRun.quotaBlockedTitle")}</AlertTitle>
                  <AlertDescription>
                    {vm.dryRunResult.quotaDenialReason ||
                      t("dataExchange.dryRun.quotaBlockedDesc")}
                  </AlertDescription>
                </Alert>
              ) : vm.dryRunResult.validRows === 0 ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.dryRun.zeroValidTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("dataExchange.dryRun.zeroValidDesc")}
                  </AlertDescription>
                </Alert>
              ) : vm.dryRunResult.invalidRows > 0 ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.dryRun.partialReadyTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("dataExchange.dryRun.partialReadyDesc", {
                      valid: vm.dryRunResult.validRows,
                      invalid: vm.dryRunResult.invalidRows,
                    })}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.dryRun.allValidTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("dataExchange.dryRun.allValidDesc", {
                      valid: vm.dryRunResult.validRows,
                    })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Metrics Strip */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  {
                    label: t("dataExchange.dryRun.totalRows"),
                    value: vm.dryRunResult.totalRows,
                    tone: "text-nx-ink",
                  },
                  {
                    label: t("dataExchange.dryRun.validRows"),
                    value: vm.dryRunResult.validRows,
                    tone: "text-success",
                  },
                  {
                    label: t("dataExchange.dryRun.invalidRows"),
                    value: vm.dryRunResult.invalidRows,
                    tone:
                      vm.dryRunResult.invalidRows > 0
                        ? "text-destructive"
                        : "text-nx-ink-2",
                  },
                  {
                    label: t("dataExchange.dryRun.estimatedInserts"),
                    value: vm.dryRunResult.estimatedNewInserts,
                    tone: "text-nx-accent",
                  },
                  {
                    label: t("dataExchange.dryRun.estimatedUpdates"),
                    value: vm.dryRunResult.estimatedUpdates,
                    tone: "text-info",
                  },
                ].map((metric) => (
                  <Card
                    key={metric.label}
                    className="border-nx-line bg-nx-surface p-4"
                  >
                    <p className="text-xs text-nx-ink-2">{metric.label}</p>
                    <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums", metric.tone)}>
                      {metric.value}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Per-Sheet Summary */}
              {vm.dryRunResult.sheetSummaries.length > 0 && (
                <Card className="border-nx-line bg-nx-surface">
                  <div className="border-b border-nx-line px-4 py-3 text-sm font-semibold text-nx-ink">
                    {t("dataExchange.dryRun.sheetBreakdownTitle")}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dataExchange.dryRun.sheetCol")}</TableHead>
                        <TableHead>{t("dataExchange.hub.entityCol")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.validRows")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.invalidRows")}</TableHead>
                        <TableHead>{t("dataExchange.hub.quotaCol")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vm.dryRunResult.sheetSummaries.map((s) => (
                        <TableRow key={`${s.sheetName}-${s.entityKey}`}>
                          <TableCell className="font-medium">{s.sheetName}</TableCell>
                          <TableCell dir="ltr" className="font-mono text-xs">
                            {s.entityKey}
                          </TableCell>
                          <TableCell className="font-mono tabular-nums text-success">
                            {s.validRows}
                          </TableCell>
                          <TableCell className="font-mono tabular-nums text-destructive">
                            {s.invalidRows}
                          </TableCell>
                          <TableCell>
                            <Badge
                              dir="ltr"
                              className="font-mono"
                              variant={s.quotaPassed ? "success" : "error"}
                            >
                              {s.quotaPassed
                                ? s.quotaRemainingSlots ?? t("dataExchange.hub.unlimited")
                                : s.quotaDenialReason ??
                                  t("dataExchange.dryRun.quotaBlockedBadge")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {/* Sample Validation Errors */}
              {vm.dryRunResult.sampleErrors.length > 0 && (
                <Card className="border-nx-line bg-nx-surface">
                  <div className="border-b border-nx-line px-4 py-3 text-sm font-semibold text-nx-ink">
                    {t("dataExchange.dryRun.sampleErrorsTitle")}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("dataExchange.dryRun.rowCol")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.sheetCol")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.fieldCol")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.codeCol")}</TableHead>
                        <TableHead>{t("dataExchange.dryRun.messageCol")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vm.dryRunResult.sampleErrors.map((err, idx) => (
                        <TableRow key={`${err.rowNumber}-${err.columnKey}-${idx}`}>
                          <TableCell className="font-mono tabular-nums">
                            {err.rowNumber}
                          </TableCell>
                          <TableCell>{err.sheetName}</TableCell>
                          <TableCell dir="ltr" className="font-mono text-xs">
                            {err.columnKey}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="error"
                              dir="ltr"
                              className="font-mono text-[10px]"
                            >
                              {err.errorCode}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-nx-ink-2">
                            {err.errorMessage}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          )}

          {/* STEP 4: EXECUTION RESULTS & RECOVERY */}
          {!vm.isLoadingMeta && vm.step === "results" && vm.executeResult && (
            <div className="mx-auto max-w-4xl space-y-5">
              {isAsyncRunning ? (
                <Alert variant="info" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
                    <AlertTitle className="mb-0">{t("dataExchange.results.processingTitle")}</AlertTitle>
                  </div>
                  <AlertDescription className="space-y-3">
                    <p>{t("dataExchange.results.processingDesc")}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-nx-ink-2">
                        <span>
                          {t("dataExchange.studio.processedProgress", {
                            processed: vm.polledJob?.processedRows ?? 0,
                            total: finalTotalRows,
                          })}
                        </span>
                        <span className="font-mono">{vm.polledJob?.progressPercent ?? 0}%</span>
                      </div>
                      <Progress value={vm.polledJob?.progressPercent ?? 0} />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const j = buildJobFromExecution(
                            vm.executeResult!,
                            vm.inspectResult,
                            entityKey,
                            vm.isMultiSheet,
                            vm.importMode,
                            vm.onboardingMode,
                            vm.polledJob
                          );
                          useDataExchangeJobsStore.getState().trackJob(j);
                          toast.info(t("dataExchange.studio.jobQueuedToast"));
                          handleClose();
                        }}
                      >
                        {t("dataExchange.studio.minimizeToBackground")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        loading={vm.isCancelling}
                        onClick={vm.cancelJob}
                      >
                        {t("dataExchange.studio.cancelJob")}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : liveJobStatus === "Failed" || liveJobStatus === "Cancelled" ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.results.failedTitle")}</AlertTitle>
                  <AlertDescription>
                    {vm.polledJob?.errorSummary ?? vm.executeResult.errorSummary}
                  </AlertDescription>
                </Alert>
              ) : finalRejected > 0 ? (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>
                    {t("dataExchange.results.completedWithErrorsTitle")}
                  </AlertTitle>
                  <AlertDescription>
                    {t("dataExchange.results.rejectedHelpDesc")}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>{t("dataExchange.results.completedTitle")}</AlertTitle>
                  <AlertDescription>
                    {t("dataExchange.results.committedRows")}:{" "}
                    <span dir="ltr" className="font-mono">
                      {finalCommitted} / {finalTotalRows}
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Results Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Card className="border-nx-line bg-nx-surface p-4">
                  <p className="text-xs text-nx-ink-2">
                    {t("dataExchange.results.committedRows")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-success">
                    {finalCommitted}
                  </p>
                </Card>
                <Card className="border-nx-line bg-nx-surface p-4">
                  <p className="text-xs text-nx-ink-2">
                    {t("dataExchange.results.createdRows")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-nx-accent">
                    {finalCreated}
                  </p>
                </Card>
                <Card className="border-nx-line bg-nx-surface p-4">
                  <p className="text-xs text-nx-ink-2">
                    {t("dataExchange.results.updatedRows")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-info">
                    {finalUpdated}
                  </p>
                </Card>
                <Card className="border-nx-line bg-nx-surface p-4">
                  <p className="text-xs text-nx-ink-2">
                    {t("dataExchange.results.rejectedRows")}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-destructive">
                    {finalRejected}
                  </p>
                </Card>
              </div>

              {/* Rejected Rows Workbook Download */}
              {finalHasRejected && !isAsyncRunning && (
                <Card className="flex flex-wrap items-center justify-between gap-4 border-warning/40 bg-warning/10 p-5">
                  <div>
                    <h4 className="text-sm font-semibold text-nx-ink">
                      {t("dataExchange.results.rejectedHelpTitle")}
                    </h4>
                    <p className="mt-1 text-xs text-nx-ink-2">
                      {t("dataExchange.results.rejectedHelpDesc")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={vm.resetWorkflow}
                    >
                      <RotateCcw className="me-2 h-4 w-4" />
                      {t("dataExchange.actions.changeFile")}
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      loading={vm.isDownloading}
                      onClick={vm.downloadRejectedWorkbook}
                    >
                      <Download className="me-2 h-4 w-4" />
                      {t("dataExchange.actions.downloadRejected")}
                    </Button>
                  </div>
                </Card>
              )}

              {/* One-Time Ephemeral Credentials Vault */}
              {!vm.credentialsDismissed &&
                vm.executeResult.ephemeralCredentials &&
                vm.executeResult.ephemeralCredentials.length > 0 && (
                  <Card className="space-y-3 border-destructive/40 bg-nx-surface p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-destructive" />
                        <div>
                          <h4 className="text-sm font-semibold text-nx-ink">
                            {t("dataExchange.results.credentialsWarningTitle")}
                          </h4>
                          <p className="text-xs text-nx-ink-2">
                            {t("dataExchange.results.credentialsWarningDesc")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleCopyCredentials}
                        >
                          <Copy className="me-1.5 h-3.5 w-3.5" />
                          {t("dataExchange.actions.copyCredentials")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => vm.setCredentialsDismissed(true)}
                        >
                          <ClipboardCheck className="me-1.5 h-3.5 w-3.5" />
                          {t("dataExchange.actions.dismissCredentials")}
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("dataExchange.dryRun.rowCol")}</TableHead>
                          <TableHead>
                            {t("dataExchange.results.credentialsEmail")}
                          </TableHead>
                          <TableHead>
                            {t("dataExchange.results.credentialsUsername")}
                          </TableHead>
                          <TableHead>
                            {t("dataExchange.results.credentialsPassword")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vm.executeResult.ephemeralCredentials.map((cred) => (
                          <TableRow key={`${cred.rowNumber}-${cred.email}`}>
                            <TableCell className="font-mono tabular-nums">
                              {cred.rowNumber}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono text-xs">
                              {cred.email}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono text-xs">
                              {cred.username}
                            </TableCell>
                            <TableCell dir="ltr" className="font-mono text-xs">
                              {cred.oneTimePassword}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}

              {/* Presets quick cleanup summary if needed */}
              {vm.presets.length > 0 && (
                <Card className="flex flex-wrap items-center gap-2 border-nx-line bg-nx-surface px-4 py-3 text-xs text-nx-ink-2">
                  <span>{t("dataExchange.actions.loadPresets")}:</span>
                  {vm.presets.map((p) => (
                    <Badge key={p.id} variant="secondary" className="gap-1.5">
                      <span>{p.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        aria-label={t("dataExchange.actions.deletePreset")}
                        onClick={() => vm.removePreset(p.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Bottom Persistent Footer Action Bar */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-nx-line bg-nx-surface px-6 py-4">
          <div dir="ltr" className="font-mono text-xs text-nx-ink-3">
            {vm.primaryDescriptor?.descriptor.owningModule
              ? `${vm.primaryDescriptor.descriptor.owningModule} · ${entityKey}`
              : entityKey}
          </div>

          <div className="flex items-center gap-2">
            {vm.step === "mapping" && (
              <Button
                type="button"
                variant="default"
                loading={vm.isDryRunning}
                disabled={!canProceedToDryRun || vm.isDryRunning}
                onClick={vm.runDryRun}
              >
                {t("dataExchange.actions.nextDryRun")}
              </Button>
            )}

            {vm.step === "dryRun" && vm.dryRunResult && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  loading={vm.isExecuting}
                  disabled={
                    !vm.dryRunResult.canExecute ||
                    !vm.dryRunResult.quotaPassed ||
                    vm.dryRunResult.validRows === 0 ||
                    vm.isExecuting
                  }
                  onClick={async () => {
                    const result = await vm.commitImport({ runInBackground: true });
                    if (result?.jobId) {
                      const j = buildJobFromExecution(
                        result,
                        vm.inspectResult,
                        entityKey,
                        vm.isMultiSheet,
                        vm.importMode,
                        vm.onboardingMode,
                        null
                      );
                      useDataExchangeJobsStore.getState().trackJob(j);
                      toast.info(t("dataExchange.studio.jobQueuedToast"));
                      handleClose();
                    }
                  }}
                >
                  {t("dataExchange.studio.runInBackground")}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  loading={vm.isExecuting}
                  disabled={
                    !vm.dryRunResult.canExecute ||
                    !vm.dryRunResult.quotaPassed ||
                    vm.dryRunResult.validRows === 0 ||
                    vm.isExecuting
                  }
                  onClick={() => vm.commitImport()}
                >
                  {t("dataExchange.actions.executeImport")}
                </Button>
              </>
            )}

            {vm.step === "results" && (
              <>
                <Button type="button" variant="outline" onClick={vm.resetWorkflow}>
                  <RotateCcw className="me-2 h-4 w-4" />
                  {t("dataExchange.actions.changeFile")}
                </Button>
                <Button type="button" variant="default" onClick={handleClose}>
                  {t("dataExchange.actions.close")}
                </Button>
              </>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
