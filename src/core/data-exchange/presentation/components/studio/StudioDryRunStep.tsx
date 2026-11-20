"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { getEntityDisplayName } from "../../utils/entity-display-names";
import type { DataExchangeDryRunResponseDto } from "../../../domain/types";

export interface StudioDryRunStepProps {
  dryRunResult: DataExchangeDryRunResponseDto;
}

/**
 * Step 3: Pre-flight dry-run and quota guard panel displaying per-sheet metrics,
 * topological validation diagnostics, and tenant quota allowance telemetry.
 */
export function StudioDryRunStep({ dryRunResult }: StudioDryRunStepProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";

  return (
    <div className="space-y-5">
      {/* Quota / Readiness Alert */}
      {!dryRunResult.quotaPassed ? (
        <Alert variant="destructive" className="border-destructive/35 bg-destructive/10 text-nx-danger">
          <XCircle className="h-4 w-4 text-nx-danger shrink-0" />
          <AlertTitle className="text-sm font-semibold text-nx-ink">{t("dataExchange.dryRun.quotaBlockedTitle")}</AlertTitle>
          <AlertDescription className="text-xs text-nx-ink-2 mt-1">
            {dryRunResult.quotaDenialReason || t("dataExchange.dryRun.quotaBlockedDesc")}
          </AlertDescription>
        </Alert>
      ) : dryRunResult.validRows === 0 ? (
        <Alert variant="destructive" className="border-destructive/35 bg-destructive/10 text-nx-danger">
          <XCircle className="h-4 w-4 text-nx-danger shrink-0" />
          <AlertTitle className="text-sm font-semibold text-nx-ink">{t("dataExchange.dryRun.zeroValidTitle")}</AlertTitle>
          <AlertDescription className="text-xs text-nx-ink-2 mt-1">
            {t("dataExchange.dryRun.zeroValidDesc")}
          </AlertDescription>
        </Alert>
      ) : dryRunResult.invalidRows > 0 ? (
        <Alert variant="warning" className="border-warning-strong/40 bg-warning/15 text-nx-warning-strong">
          <AlertTriangle className="h-4 w-4 text-nx-warning-strong shrink-0" />
          <AlertTitle className="text-sm font-semibold text-nx-ink">{t("dataExchange.dryRun.partialReadyTitle")}</AlertTitle>
          <AlertDescription className="text-xs text-nx-ink mt-1">
            {t("dataExchange.dryRun.partialReadyDesc", {
              valid: dryRunResult.validRows,
              invalid: dryRunResult.invalidRows,
            })}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="success" className="border-success/30 bg-success/10">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <AlertTitle className="text-sm font-semibold">{t("dataExchange.dryRun.allValidTitle")}</AlertTitle>
          <AlertDescription className="text-xs text-nx-ink-2 mt-1">
            {t("dataExchange.dryRun.allValidDesc", { valid: dryRunResult.validRows })}
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: t("dataExchange.dryRun.totalRows"), value: dryRunResult.totalRows, tone: "text-nx-ink" },
          { label: t("dataExchange.dryRun.validRows"), value: dryRunResult.validRows, tone: "text-success" },
          {
            label: t("dataExchange.dryRun.invalidRows"),
            value: dryRunResult.invalidRows,
            tone: dryRunResult.invalidRows > 0 ? "text-nx-danger" : "text-nx-ink-2",
          },
          { label: t("dataExchange.dryRun.estimatedInserts"), value: dryRunResult.estimatedNewInserts, tone: "text-nx-accent" },
          { label: t("dataExchange.dryRun.estimatedUpdates"), value: dryRunResult.estimatedUpdates, tone: "text-info" },
        ].map((metric) => (
          <Card key={metric.label} className="border-nx-line bg-nx-surface p-4 text-nx-ink">
            <p className="text-xs text-nx-ink-2">{metric.label}</p>
            <p className={cn("mt-1 font-mono text-2xl font-bold tabular-nums", metric.tone)}>
              {metric.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Per-Sheet Summary with Localized Entity Display Names */}
      {dryRunResult.sheetSummaries.length > 0 && (
        <Card className="border-nx-line bg-nx-surface overflow-hidden">
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
              {dryRunResult.sheetSummaries.map((s) => (
                <TableRow key={`${s.sheetName}-${s.entityKey}`}>
                  <TableCell className="font-medium text-nx-ink">{s.sheetName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-nx-ink text-xs">
                        {getEntityDisplayName(s.entityKey, t, isAr)}
                      </span>
                      <span dir="ltr" className="font-mono text-[10px] text-nx-ink-3">
                        {s.entityKey}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-success font-medium">
                    {s.validRows}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums text-nx-danger font-medium">
                    {s.invalidRows}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-[10px]"
                      variant={s.quotaPassed ? "success" : "destructive"}
                    >
                      {s.quotaPassed ? (
                        s.quotaRemainingSlots !== null && s.quotaRemainingSlots !== undefined ? (
                          <bdi dir="ltr" className="font-mono tabular-nums">
                            {s.quotaRemainingSlots}
                          </bdi>
                        ) : (
                          t("dataExchange.hub.unlimited")
                        )
                      ) : (
                        s.quotaDenialReason ?? t("dataExchange.dryRun.quotaBlockedBadge")
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Sample Validation Errors */}
      {dryRunResult.sampleErrors.length > 0 && (
        <Card className="border-nx-line bg-nx-surface overflow-hidden">
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
              {dryRunResult.sampleErrors.map((err, idx) => (
                <TableRow key={`${err.rowNumber}-${err.columnKey}-${idx}`}>
                  <TableCell className="font-mono tabular-nums text-xs">{err.rowNumber}</TableCell>
                  <TableCell className="text-xs">{err.sheetName}</TableCell>
                  <TableCell dir="ltr" className="font-mono text-xs text-nx-ink">{err.columnKey}</TableCell>
                  <TableCell>
                    <Badge variant="destructive" dir="ltr" className="font-mono text-[10px]">
                      {err.errorCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-nx-ink-2">{err.errorMessage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
