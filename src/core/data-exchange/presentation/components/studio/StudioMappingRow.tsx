"use client";

import React from "react";
import { Badge } from "@core/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { TableCell, TableRow } from "@core/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { ColumnNormalizationPopover } from "../ColumnNormalizationPopover";
import type {
  DataExchangeColumnDescriptor,
  DataExchangeColumnMapping,
  MappingCompatibilityIssue,
} from "../../../domain/types";

const UNMAPPED_SENTINEL = "__UNMAPPED__";

/**
 * Returns localized human-readable message for a mapping compatibility issue.
 */
export function getIssueMessage(
  issue: MappingCompatibilityIssue,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  switch (issue.reasonCode) {
    case "TYPE_MISMATCH":
      return t("dataExchange.tooltips.issueTypeMismatch", {
        sample: issue.sampleValue || "",
      });
    case "NON_NUMERIC_VALUES":
      return t("dataExchange.tooltips.issueNonNumeric", {
        sample: issue.sampleValue || "",
      });
    case "INVALID_BOOL":
      return t("dataExchange.tooltips.issueInvalidBool", {
        sample: issue.sampleValue || "",
      });
    case "INVALID_DATE":
      return t("dataExchange.tooltips.issueInvalidDate", {
        sample: issue.sampleValue || "",
      });
    case "READ_ONLY":
      return t("dataExchange.tooltips.issueReadOnly");
    case "RESTRICTED":
      return t("dataExchange.tooltips.issueRestricted");
    default:
      return issue.reasonCode;
  }
}

export interface StudioMappingRowProps {
  header: string;
  isDiag: boolean;
  samples: string[];
  currentMapping?: DataExchangeColumnMapping;
  targetCol?: DataExchangeColumnDescriptor;
  issue?: MappingCompatibilityIssue;
  mappableTargets: DataExchangeColumnDescriptor[];
  onUpdateMapping: (update: Partial<DataExchangeColumnMapping>) => void;
}

/**
 * Single source-to-target column mapping row in Studio Step 2 with validation badges,
 * compatibility hover tooltips, and column normalization triggers.
 */
export function StudioMappingRow({
  header,
  isDiag,
  samples,
  currentMapping,
  targetCol,
  issue,
  mappableTargets,
  onUpdateMapping,
}: StudioMappingRowProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const rowId = `dx-mapping-row-${header.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const isCustomField =
    targetCol &&
    (targetCol.key.startsWith("cf:") || targetCol.dataType === "CustomField");

  const issueText = issue ? getIssueMessage(issue, t) : null;

  return (
    <TableRow
      id={rowId}
      className={cn(issue ? "bg-destructive/5 border-s-2 border-s-destructive" : "")}
    >
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
                className="font-mono text-xs max-w-[120px] truncate"
                title={s}
              >
                {s}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-nx-ink-3">—</span>
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-[240px]">
        {isDiag ? (
          <span className="text-xs text-nx-ink-3">
            {t("dataExchange.actions.ignoreColumn")}
          </span>
        ) : (
          <div className="space-y-1">
            {issue ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Select
                      value={currentMapping?.targetFieldKey || UNMAPPED_SENTINEL}
                      onValueChange={(val) =>
                        onUpdateMapping({
                          targetFieldKey: val === UNMAPPED_SENTINEL ? "" : val,
                        })
                      }
                    >
                      <SelectTrigger
                        className="border-destructive text-destructive font-medium h-8 text-xs"
                        aria-invalid="true"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[960]">
                        <SelectItem value={UNMAPPED_SENTINEL}>
                          {t("dataExchange.mapping.unmappedOption")}
                        </SelectItem>
                        {mappableTargets.map((col) => (
                          <SelectItem key={col.key} value={col.key}>
                            {(isAr ? col.displayNameAr : col.displayNameEn) +
                              (col.isRequired ? ` *` : "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="z-[960] max-w-sm border-destructive/40 bg-nx-surface text-nx-ink p-3 space-y-1"
                >
                  <p className="font-semibold text-destructive text-xs">
                    {t("dataExchange.tooltips.incompatibleHeader")}: {issue.reasonCode}
                  </p>
                  <p className="text-[11px] text-nx-ink-2">{issueText}</p>
                  {issue.sampleValue && (
                    <p className="text-[11px] text-nx-ink-2">
                      {t("dataExchange.tooltips.incompatibleSample", {
                        sample: issue.sampleValue,
                      })}
                    </p>
                  )}
                  <p className="text-[11px] text-nx-ink-3">
                    {t("dataExchange.tooltips.incompatibleSuggestion")}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Select
                value={currentMapping?.targetFieldKey || UNMAPPED_SENTINEL}
                onValueChange={(val) =>
                  onUpdateMapping({
                    targetFieldKey: val === UNMAPPED_SENTINEL ? "" : val,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs border-nx-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[960]">
                  <SelectItem value={UNMAPPED_SENTINEL}>
                    {t("dataExchange.mapping.unmappedOption")}
                  </SelectItem>
                  {mappableTargets.map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {(isAr ? col.displayNameAr : col.displayNameEn) +
                        (col.isRequired ? ` *` : "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {issue && (
              <p className="text-[11px] text-destructive font-medium">
                {issueText} ({issue.reasonCode})
              </p>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {targetCol ? (
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="font-mono text-xs">
              {targetCol.dataType}
            </Badge>
            {isCustomField && (
              <Badge variant="secondary" className="text-[10px]">
                {t("dataExchange.customFieldBadge")}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-xs text-nx-ink-3">—</span>
        )}
      </TableCell>
      <TableCell>
        <ColumnNormalizationPopover
          sourceColumnHeader={header}
          targetFieldKey={currentMapping?.targetFieldKey}
          targetDataType={targetCol?.dataType}
          sampleValue={samples[0] || ""}
          rule={currentMapping?.transform}
          onChange={(updatedRule) =>
            onUpdateMapping({
              transform: updatedRule,
            })
          }
        />
      </TableCell>
    </TableRow>
  );
}
