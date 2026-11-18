"use client";

import React, { useCallback } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import { SchemaWarningsBanner } from "./SchemaWarningsBanner";
import { StudioMappingControlsBar } from "./StudioMappingControlsBar";
import { StudioMappingRow } from "./StudioMappingRow";
import type { DataExchangeColumnDescriptor } from "../../../domain/types";
import type { useDataExchangeStudioViewModel } from "../../viewmodels/useDataExchangeStudioViewModel";

export interface StudioMappingStepProps {
  vm: ReturnType<typeof useDataExchangeStudioViewModel>;
  mappableTargets: DataExchangeColumnDescriptor[];
  onPromptReplaceFile: () => void;
}

/**
 * Step 2: Interactive column mapping workbench with multi-sheet DAG indicators,
 * compatibility error hover tooltips, and jump-to-row error highlights.
 */
export function StudioMappingStep({
  vm,
  mappableTargets,
  onPromptReplaceFile,
}: StudioMappingStepProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";

  const {
    inspectResult,
    activeSheet,
    activeSheetState,
    activeMissingRequired,
    activeCompatibilityIssues,
    updateColumnMapping,
  } = vm;

  const scrollToRow = useCallback((header: string) => {
    const el = document.getElementById(
      `dx-mapping-row-${header.replace(/[^a-zA-Z0-9_-]/g, "_")}`
    );
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const trigger = el.querySelector<HTMLElement>('[role="combobox"]');
    trigger?.focus({ preventScroll: true });
  }, []);

  const scrollToMissingField = useCallback(
    (fieldKey: string) => {
      if (!activeSheet || !activeSheetState) return;
      const diagSet = new Set(
        activeSheet.suggestedMappings
          .filter((s) => s.isDiagnosticColumn)
          .map((s) => s.sourceColumnHeader.toLowerCase())
      );
      const nonDiagHeaders = activeSheet.headers.filter(
        (h) => !diagSet.has(h.toLowerCase())
      );

      // 1) Prefer row whose suggested mapping points to this required field
      const suggested = activeSheet.suggestedMappings.find(
        (s) =>
          !s.isDiagnosticColumn &&
          s.targetFieldKey?.toLowerCase() === fieldKey.toLowerCase()
      );
      if (suggested && nonDiagHeaders.includes(suggested.sourceColumnHeader)) {
        scrollToRow(suggested.sourceColumnHeader);
        return;
      }

      // 2) Otherwise jump to the first currently unmapped non-diagnostic row
      const firstUnmapped = nonDiagHeaders.find((header) => {
        const m = activeSheetState.mappings.find((x) => x.sourceColumnHeader === header);
        return !m?.targetFieldKey;
      });
      if (firstUnmapped) {
        scrollToRow(firstUnmapped);
        return;
      }

      // 3) Fallback to first non-diagnostic row
      if (nonDiagHeaders[0]) {
        scrollToRow(nonDiagHeaders[0]);
      }
    },
    [activeSheet, activeSheetState, scrollToRow]
  );

  if (!inspectResult || !activeSheet || !activeSheetState) return null;

  return (
    <div className="space-y-5">
      <StudioMappingControlsBar vm={vm} onPromptReplaceFile={onPromptReplaceFile} />

      <SchemaWarningsBanner warnings={activeSheet.schemaWarnings} />

      {/* Jump-to-Row Validation Error Banners */}
      {(activeMissingRequired.length > 0 || activeCompatibilityIssues.length > 0) && (
        <div className="space-y-2">
          {activeMissingRequired.length > 0 && (
            <Alert variant="warning" className="border-warning-strong/40 bg-warning/15 text-nx-warning-strong">
              <AlertTriangle className="h-4 w-4 text-nx-warning-strong shrink-0" />
              <AlertDescription className="flex flex-wrap items-center gap-1.5 text-xs text-nx-ink">
                <span>{t("dataExchange.mapping.requiredMissing")}</span>
                {activeMissingRequired.map((col) => (
                  <Button
                    key={col.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => scrollToMissingField(col.key)}
                    className="h-5 px-1.5 text-[10px] border-warning-strong/40 text-nx-warning-strong hover:bg-warning/20"
                    title={t("dataExchange.tooltips.jumpToField", {
                      field: isAr ? col.displayNameAr : col.displayNameEn,
                    })}
                  >
                    {isAr ? col.displayNameAr : col.displayNameEn} *
                  </Button>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {activeCompatibilityIssues.length > 0 && (
            <Alert variant="destructive" className="border-destructive/35 bg-destructive/10 text-nx-danger">
              <XCircle className="h-4 w-4 text-nx-danger shrink-0" />
              <AlertDescription className="flex flex-wrap items-center gap-1.5 text-xs text-nx-ink">
                <span>
                  {t("dataExchange.mapping.compatibilityBlocked", {
                    count: activeCompatibilityIssues.length,
                  })}
                </span>
                {activeCompatibilityIssues.map((issue) => (
                  <Button
                    key={issue.sourceColumnHeader}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => scrollToRow(issue.sourceColumnHeader)}
                    className="h-5 px-1.5 text-[10px] border-destructive/35 text-nx-danger hover:bg-destructive/15 font-mono"
                    title={t("dataExchange.tooltips.jumpToField", {
                      field: issue.sourceColumnHeader,
                    })}
                  >
                    <bdi dir="ltr">{issue.sourceColumnHeader}</bdi> ({issue.reasonCode})
                  </Button>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Source-to-Target Column Mapping Table */}
      <Card className="border-nx-line bg-nx-surface overflow-hidden [&>div]:max-h-[min(62dvh,640px)]">
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
            {activeSheet.headers.map((header) => {
              const suggestion = activeSheet.suggestedMappings.find(
                (s) => s.sourceColumnHeader.toLowerCase() === header.toLowerCase()
              );
              const isDiag = suggestion?.isDiagnosticColumn ?? false;
              const currentMapping = activeSheetState.mappings.find(
                (m) => m.sourceColumnHeader === header
              );
              const targetCol = mappableTargets.find(
                (c) => c.key.toLowerCase() === (currentMapping?.targetFieldKey ?? "").toLowerCase()
              );
              const issue = activeCompatibilityIssues.find(
                (i) => i.sourceColumnHeader === header
              );
              const samples = activeSheet.sampleRows
                .map((r) => r[header])
                .filter((v): v is string => Boolean(v && v.trim().length > 0))
                .slice(0, 3);

              return (
                <StudioMappingRow
                  key={header}
                  header={header}
                  isDiag={isDiag}
                  samples={samples}
                  currentMapping={currentMapping}
                  targetCol={targetCol}
                  issue={issue}
                  mappableTargets={mappableTargets}
                  onUpdateMapping={(update) =>
                    updateColumnMapping(activeSheetState.sheetName, header, update)
                  }
                />
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
