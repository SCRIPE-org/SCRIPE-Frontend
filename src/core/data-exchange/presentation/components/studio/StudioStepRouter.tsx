"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { StudioUploadStep } from "./StudioUploadStep";
import { StudioMappingStep } from "./StudioMappingStep";
import { StudioDryRunStep } from "./StudioDryRunStep";
import { StudioResultsStep } from "./StudioResultsStep";
import type { DataExchangeColumnDescriptor } from "../../../domain/types";
import type { useDataExchangeStudioViewModel } from "../../viewmodels/useDataExchangeStudioViewModel";

export interface StudioStepRouterProps {
  vm: ReturnType<typeof useDataExchangeStudioViewModel>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  multiSheetEntityKeys?: string[];
  mappableTargets: DataExchangeColumnDescriptor[];
  onPromptReplaceFile: () => void;
  onMinimizeToBackground: () => void;
  onCopyCredentials: () => void;
}

/**
 * Step switcher rendering the appropriate wizard step based on studio state.
 */
export function StudioStepRouter({
  vm,
  fileInputRef,
  multiSheetEntityKeys,
  mappableTargets,
  onPromptReplaceFile,
  onMinimizeToBackground,
  onCopyCredentials,
}: StudioStepRouterProps) {
  const { t } = useI18n();

  const deduplicatedSchemaWarnings = React.useMemo(() => {
    const all = vm.inspectResult?.sheets.flatMap((s) => s.schemaWarnings ?? []) ?? [];
    if (all.length === 0) return [];
    const seen = new Set<string>();
    return all.filter((w) => {
      const key = `${w.code}|${w.sheetName ?? ""}|${w.presetName ?? ""}|${w.entityKey ?? ""}|${(w.items ?? []).join(",")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [vm.inspectResult]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
      {vm.isLoadingMeta && (
        <div className="flex h-64 items-center justify-center gap-2 text-sm text-nx-ink-2">
          <Loader2 className="h-5 w-5 animate-spin text-nx-accent" />
          <span>{t("dataExchange.upload.loadingMeta")}</span>
        </div>
      )}

      {!vm.isLoadingMeta && vm.step === "upload" && (
        <StudioUploadStep
          isMultiSheet={vm.isMultiSheet}
          onToggleMultiSheet={(checked) => vm.setIsMultiSheet(checked)}
          isInspecting={vm.isInspecting}
          isDownloading={vm.isDownloading}
          fileInputRef={fileInputRef}
          onFileChosen={(files) => {
            const f = files?.[0];
            if (f) void vm.inspectUploadedFile(f, vm.isMultiSheet);
          }}
          onDownloadTemplate={(fmt, multi) => vm.downloadTemplate(fmt, multi)}
          multiSheetEntityKeys={multiSheetEntityKeys}
          schemaWarnings={deduplicatedSchemaWarnings}
        />
      )}

      {!vm.isLoadingMeta &&
        vm.step === "mapping" &&
        vm.inspectResult &&
        vm.activeSheet &&
        vm.activeSheetState && (
          <StudioMappingStep
            vm={vm}
            mappableTargets={mappableTargets}
            onPromptReplaceFile={onPromptReplaceFile}
          />
        )}

      {!vm.isLoadingMeta && vm.step === "dryRun" && vm.dryRunResult && (
        <StudioDryRunStep dryRunResult={vm.dryRunResult} />
      )}

      {!vm.isLoadingMeta && vm.step === "results" && vm.executeResult && (
        <StudioResultsStep
          executeResult={vm.executeResult}
          polledJob={vm.polledJob}
          credentialsDismissed={vm.credentialsDismissed}
          isDownloading={vm.isDownloading}
          isCancelling={vm.isCancelling}
          onMinimizeToBackground={onMinimizeToBackground}
          onCancelJob={vm.cancelJob}
          onResetWorkflow={onPromptReplaceFile}
          onDownloadRejected={vm.downloadRejectedWorkbook}
          onCopyCredentials={onCopyCredentials}
          onDismissCredentials={() =>
            vm.dismissCredentials ? vm.dismissCredentials() : vm.setCredentialsDismissed(true)
          }
        />
      )}
    </div>
  );
}
