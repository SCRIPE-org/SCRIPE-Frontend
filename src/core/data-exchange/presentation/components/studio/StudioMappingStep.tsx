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

  const scrollToRow = useCallback((fieldKey: string) => {
    const el = document.getElementById(
      `dx-mapping-row-${fieldKey.replace(/[^a-zA-Z0-9_-]/g, "_")}`
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  if (!inspectResult || !activeSheet || !activeSheetState) return null;

  return (
    <div className="space-y-5">
      <StudioMappingControlsBar vm={vm} onPromptReplaceFile={onPromptReplaceFile} />

      {/* Jump-to-Row Validation Error Banners */}
      {(activeMissingRequired.length > 0 || activeCompatibilityIssues.length > 0) && (
        <div className="space-y-2">
          {activeMissingRequired.length > 0 && (
            <Alert variant="warning" className="border-warning/30 bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <AlertDescription className="flex flex-wrap items-center gap-1.5 text-xs text-nx-ink">
                <span>{t("dataExchange.mapping.requiredMissing")}</span>
                {activeMissingRequired.map((col) => (
                  <Button
                    key={col.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => scrollToRow(col.key)}
                    className="h-5 px-1.5 text-[10px] border-warning/40 text-warning hover:bg-warning/20"
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
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <AlertDescription className="flex flex-wrap items-center gap-1.5 text-xs">
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
                    className="h-5 px-1.5 text-[10px] border-destructive/40 text-destructive hover:bg-destructive/20 font-mono"
                    title={t("dataExchange.tooltips.jumpToField", {
                      field: issue.sourceColumnHeader,
                    })}
                  >
                    {issue.sourceColumnHeader} ({issue.reasonCode})
                  </Button>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Source-to-Target Column Mapping Table */}
      <Card className="border-nx-line bg-nx-surface overflow-hidden">
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
                .slice(0, 3)
                .map((r) => r[header])
                .filter((v): v is string => Boolean(v && v.trim().length > 0));

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
