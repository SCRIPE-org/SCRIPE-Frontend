"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { TooltipProvider } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { useDataExchangeStudioViewModel } from "../viewmodels/useDataExchangeStudioViewModel";
import { buildJobFromExecution } from "../utils/build-job";
import { buildCredentialsCsv } from "../utils/credentials-csv";
import { getEntityDisplayName } from "../utils/entity-display-names";
import { StudioConfirmExitDialog } from "./studio/StudioConfirmExitDialog";
import { StudioFooter } from "./studio/StudioFooter";
import { StudioHeader } from "./studio/StudioHeader";
import { StudioStepRouter } from "./studio/StudioStepRouter";
import { StudioStepper } from "./studio/StudioStepper";

export interface DataExchangeStudioOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKey: string;
  initialMultiSheet?: boolean;
  multiSheetEntityKeys?: string[];
  initialPresetId?: string;
  onImportComplete?: () => void;
}

/**
 * Full-viewport elevated SCRIPE Data Exchange Studio portal overlay.
 * Renders an isolated 4-stage pipeline above application chrome with unsaved progress guard,
 * interactive column mapping, type compatibility tooltips, and partial commit recovery.
 */
export function DataExchangeStudioOverlay({
  open,
  onOpenChange,
  entityKey,
  initialMultiSheet = false,
  multiSheetEntityKeys,
  initialPresetId,
  onImportComplete,
}: DataExchangeStudioOverlayProps) {
  const { direction, language, t } = useI18n();
  const isAr = language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"close" | "reset">("close");

  const vm = useDataExchangeStudioViewModel({
    open,
    entityKey,
    initialMultiSheet,
    multiSheetEntityKeys,
    initialPresetId,
    onImportComplete,
  });

  const hasUnacknowledgedCredentials =
    !vm.credentialsDismissed &&
    (vm.executeResult?.ephemeralCredentials?.length ?? 0) > 0;

  const hasUnsavedProgress =
    Boolean(vm.inspectResult) &&
    (vm.step !== "results" || hasUnacknowledgedCredentials);

  const handleDirectClose = useCallback(() => {
    setConfirmExitOpen(false);
    vm.resetWorkflow();
    onOpenChange(false);
  }, [vm, onOpenChange]);

  const handleRequestClose = useCallback(() => {
    if (hasUnsavedProgress) {
      setConfirmAction("close");
      setConfirmExitOpen(true);
    } else {
      handleDirectClose();
    }
  }, [hasUnsavedProgress, handleDirectClose]);

  const handleConfirmDialogAction = useCallback(() => {
    setConfirmExitOpen(false);
    if (confirmAction === "reset") {
      vm.resetWorkflow();
    } else {
      handleDirectClose();
    }
  }, [confirmAction, vm, handleDirectClose]);

  const handlePromptReplaceFile = useCallback(() => {
    if (hasUnsavedProgress) {
      setConfirmAction("reset");
      setConfirmExitOpen(true);
    } else {
      vm.resetWorkflow();
    }
  }, [hasUnsavedProgress, vm]);

  const entityLabel = getEntityDisplayName(
    entityKey,
    t,
    isAr,
    vm.primaryDescriptor
  );

  const handleBack = () => {
    if (vm.step === "mapping") {
      setConfirmAction("reset");
      setConfirmExitOpen(true);
    } else if (vm.step === "dryRun") {
      vm.setStep("mapping");
    }
  };

  const handleCopyCredentials = async () => {
    const creds = vm.executeResult?.ephemeralCredentials;
    if (!creds || creds.length === 0) return;
    await navigator.clipboard.writeText(buildCredentialsCsv(creds));
    vm.setInfoBanner(t("dataExchange.results.credentialsCopied"));
  };

  const handleCommitBackground = async () => {
    const result = await vm.commitImport({ runInBackground: true });
    if (result?.jobId) {
      const job = buildJobFromExecution(result, vm.inspectResult, entityKey, vm.isMultiSheet, vm.importMode, vm.onboardingMode, null);
      useDataExchangeJobsStore.getState().trackJob(job);
      toast.info({
        id: "dx-job-" + job.id,
        title: `${entityLabel} · ${t("dataExchange.dock.toastTitleJobRunning")}`,
        description: t("dataExchange.studio.jobQueuedToast"),
      });
      handleDirectClose();
    }
  };

  const handleMinimizeToBackground = useCallback(() => {
    if (!vm.executeResult) return;
    const j = buildJobFromExecution(vm.executeResult, vm.inspectResult, entityKey, vm.isMultiSheet, vm.importMode, vm.onboardingMode, vm.polledJob);
    useDataExchangeJobsStore.getState().trackJob(j);
    toast.info({
      id: "dx-job-" + j.id,
      title: `${entityLabel} · ${t("dataExchange.dock.toastTitleJobRunning")}`,
      description: t("dataExchange.studio.jobQueuedToast"),
    });
    handleDirectClose();
  }, [vm, entityKey, entityLabel, t, handleDirectClose]);

  if (!open) return null;
  const steps = [
    { id: "upload" as const, label: t("dataExchange.steps.upload") },
    { id: "mapping" as const, label: t("dataExchange.steps.mapping") },
    { id: "dryRun" as const, label: t("dataExchange.steps.dryRun") },
    { id: "results" as const, label: t("dataExchange.steps.results") },
  ];
  const stepIdx = steps.findIndex((s) => s.id === vm.step);
  const progressPercent = ((stepIdx + 1) / steps.length) * 100;
  const canProceedToDryRun =
    Boolean(vm.inspectResult) && vm.sheetStates.length > 0 && vm.totalCompatibilityIssues === 0 && vm.totalMissingRequired === 0;

  const activeDesc = vm.activeDescriptorResponse?.descriptor;
  const mappableTargets = (activeDesc?.columns ?? []).filter(
    (c) => c.isMappable && !c.isAutoGenerated && c.direction !== "SystemGenerated" && c.direction !== "ExportOnly" && !vm.activeRestrictedSet.has(c.key)
  );

  return (
    <TooltipProvider>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleRequestClose();
          }
        }}
      >
        <DialogContent
          dir={direction}
          aria-label={t("dataExchange.title")}
          data-testid="data-exchange-studio-overlay"
          onEscapeKeyDown={(e) => {
            if (
              confirmExitOpen ||
              document.querySelector(
                "[data-radix-popper-content-wrapper], [role='listbox']"
              )
            ) {
              e.preventDefault();
              return;
            }
            if (hasUnsavedProgress) {
              e.preventDefault();
              setConfirmAction("close");
              setConfirmExitOpen(true);
            }
          }}
          className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 flex flex-col w-screen max-w-none h-screen max-h-none overflow-hidden rounded-none border-0 bg-nx-ground text-nx-ink p-0 gap-0 shadow-none data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 [&>button:last-child]:hidden"
        >
          <DialogTitle className="sr-only">{t("dataExchange.title")}</DialogTitle>
          <DialogDescription className="sr-only">{entityLabel}</DialogDescription>

          <Input
            ref={fileInputRef}
            id="dx-file-upload-input"
            type="file"
            accept=".xlsx,.csv,.tsv"
            aria-label={t("dataExchange.actions.chooseFile")}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setConfirmExitOpen(false);
                void vm.inspectUploadedFile(f, vm.isMultiSheet);
                e.target.value = "";
              }
            }}
          />

          <StudioHeader
            entityKey={entityKey}
            entityLabel={entityLabel}
            isMultiSheet={vm.isMultiSheet}
            step={vm.step}
            canGoBack={vm.step === "mapping" || vm.step === "dryRun"}
            onBack={handleBack}
            onClose={handleRequestClose}
          />

          <StudioStepper
            steps={steps}
            currentStep={vm.step}
            progressPercent={progressPercent}
            errorBanner={vm.errorBanner}
            infoBanner={vm.infoBanner}
            onDismissError={() => vm.setErrorBanner(null)}
            onDismissInfo={() => vm.setInfoBanner(null)}
          />

          <StudioStepRouter
            vm={vm}
            fileInputRef={fileInputRef}
            multiSheetEntityKeys={vm.resolvedMultiSheetEntityKeys}
            mappableTargets={mappableTargets}
            onPromptReplaceFile={handlePromptReplaceFile}
            onMinimizeToBackground={handleMinimizeToBackground}
            onCopyCredentials={handleCopyCredentials}
          />

          <StudioFooter
            vm={vm}
            canProceedToDryRun={canProceedToDryRun}
            onCommitBackground={handleCommitBackground}
            onPromptReplaceFile={handlePromptReplaceFile}
            onCloseStudio={handleRequestClose}
          />
        </DialogContent>
      </Dialog>

      <StudioConfirmExitDialog
        open={confirmExitOpen}
        onConfirm={handleConfirmDialogAction}
        onCancel={() => setConfirmExitOpen(false)}
      />
    </TooltipProvider>
  );
}
