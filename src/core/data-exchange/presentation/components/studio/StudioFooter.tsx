"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import type { useDataExchangeStudioViewModel } from "../../viewmodels/useDataExchangeStudioViewModel";

export interface StudioFooterProps {
  vm: ReturnType<typeof useDataExchangeStudioViewModel>;
  canProceedToDryRun: boolean;
  onCommitBackground: () => void;
  onPromptReplaceFile: () => void;
  onCloseStudio: () => void;
}

/**
 * Sticky bottom footer bar across all studio steps with disabled button
 * blocker tooltips and background batch execution triggers.
 */
export function StudioFooter({
  vm,
  canProceedToDryRun,
  onCommitBackground,
  onPromptReplaceFile,
  onCloseStudio,
}: StudioFooterProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";

  const {
    step,
    primaryDescriptor,
    isDryRunning,
    isExecuting,
    totalCompatibilityIssues,
    totalMissingRequired,
    activeMissingRequired,
    dryRunResult,
    runDryRun,
    commitImport,
  } = vm;

  const entityKey = primaryDescriptor?.descriptor.entityKey ?? "";
  const owningModule = primaryDescriptor?.descriptor.owningModule;
  const commitDisabled =
    !dryRunResult?.canExecute || !dryRunResult?.quotaPassed || (dryRunResult?.validRows ?? 0) === 0 || isExecuting;
  const missingFieldNames = activeMissingRequired.map((c) => (isAr ? c.displayNameAr : c.displayNameEn));

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-nx-line bg-nx-surface px-4 py-3.5 sm:px-6 shrink-0">
      <div dir="ltr" className="font-mono text-xs text-nx-ink-3">
        {owningModule ? `${owningModule} · ${entityKey}` : entityKey}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {step !== "results" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCloseStudio}
            className="h-8 text-xs text-nx-ink-2 hover:text-nx-ink"
            data-testid="studio-footer-cancel-btn"
          >
            {t("dataExchange.actions.cancel")}
          </Button>
        )}

        {step === "mapping" && (
          !canProceedToDryRun ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block cursor-not-allowed">
                  <Button
                    type="button"
                    variant="default"
                    disabled
                    className="pointer-events-none font-medium h-8 text-xs"
                    data-testid="studio-dryrun-btn"
                  >
                    {t("dataExchange.actions.nextDryRun")}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm border-nx-line bg-nx-surface text-nx-ink p-3 space-y-1">
                <p className="font-semibold text-xs text-nx-danger">
                  {t("dataExchange.tooltips.blockersSummary", {
                    issues: totalCompatibilityIssues,
                    missing: totalMissingRequired,
                  })}
                </p>
                {missingFieldNames.length > 0 && (
                  <p className="text-[11px] text-nx-ink-2">
                    {t("dataExchange.tooltips.missingFieldsList", {
                      fields: missingFieldNames.join(", "),
                    })}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              type="button"
              variant="default"
              loading={isDryRunning}
              onClick={runDryRun}
              className="font-medium h-8 text-xs"
              data-testid="studio-dryrun-btn"
            >
              {t("dataExchange.actions.nextDryRun")}
            </Button>
          )
        )}

        {step === "dryRun" && (
          <>
            <Button
              type="button"
              variant="outline"
              loading={isExecuting}
              disabled={commitDisabled}
              onClick={onCommitBackground}
              className="border-nx-line text-xs h-8"
              data-testid="studio-run-bg-btn"
            >
              {t("dataExchange.studio.runInBackground")}
            </Button>
            <Button
              type="button"
              variant="default"
              loading={isExecuting}
              disabled={commitDisabled}
              onClick={() => commitImport()}
              className="font-medium text-xs h-8"
              data-testid="studio-commit-btn"
            >
              {t("dataExchange.actions.executeImport")}
            </Button>
          </>
        )}

        {step === "results" && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onPromptReplaceFile}
              className="border-nx-line text-xs h-8"
              data-testid="studio-results-replace-file-btn"
            >
              <RotateCcw className="me-1.5 h-3.5 w-3.5" />
              <span>{t("dataExchange.actions.changeFile")}</span>
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={onCloseStudio}
              className="font-medium text-xs h-8"
              data-testid="studio-results-close-btn"
            >
              {t("dataExchange.actions.close")}
            </Button>
          </>
        )}
      </div>
    </footer>
  );
}
