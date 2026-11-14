"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import { useI18n } from "@core/providers/i18n-provider";
import { previewNormalizedSample } from "../../domain/mapping-validation";
import type { DataExchangeTransformRule } from "../../domain/types";
import { ColumnNormalizationSections } from "./ColumnNormalizationSections";

export interface ColumnNormalizationPopoverProps {
  sourceColumnHeader: string;
  targetFieldKey?: string;
  targetDataType?: string;
  sampleValue?: string;
  rule?: DataExchangeTransformRule | null;
  onChange: (rule: DataExchangeTransformRule) => void;
}

/**
 * Calculates count of custom or non-default normalization transforms configured.
 */
export function countActiveTransforms(rule?: DataExchangeTransformRule | null): number {
  if (!rule) return 0;
  let count = 0;
  if (rule.trim !== false) count++;
  if (rule.collapseWhitespace !== false) count++;
  if (rule.canonicalizeNullTokens !== false) count++;
  if (rule.normalizeUnicodeCompatibility !== false) count++;
  if (rule.stripArabicDiacritics !== false) count++;
  if (rule.normalizeArabicLetters) count++;
  if (rule.stripCurrencyAndGrouping !== false) count++;
  if (rule.convertAccountingNegatives !== false) count++;
  if (rule.caseMode && rule.caseMode !== "None") count++;
  if (rule.defaultCountryDialCode) count++;
  if (rule.normalizeEmailAddress) count++;
  if (rule.multiValueDelimiter) count++;
  if (rule.defaultValue) count++;
  if (rule.dateFormat) count++;
  if (rule.sourceTimeZoneId) count++;
  return count;
}

/**
 * Interactive normalization popover with live Raw -> Normalized preview,
 * sticky header, sticky live transformation simulation, scrollable body,
 * context-smart presets, and 17-property MENA & enterprise normalization engine.
 */
export function ColumnNormalizationPopover({
  sourceColumnHeader,
  targetFieldKey,
  targetDataType,
  sampleValue = "Sample Value (1,250.50 SAR)",
  rule,
  onChange,
}: ColumnNormalizationPopoverProps) {
  const { t, direction } = useI18n();
  const [open, setOpen] = useState(false);

  const currentRule: DataExchangeTransformRule = useMemo(
    () => ({
      trim: rule?.trim ?? true,
      collapseWhitespace: rule?.collapseWhitespace ?? true,
      normalizeUnicodeCompatibility: rule?.normalizeUnicodeCompatibility ?? true,
      stripArabicDiacritics: rule?.stripArabicDiacritics ?? true,
      normalizeArabicLetters: rule?.normalizeArabicLetters ?? false,
      canonicalizeNullTokens: rule?.canonicalizeNullTokens ?? true,
      caseMode: rule?.caseMode ?? "None",
      stripCurrencyAndGrouping: rule?.stripCurrencyAndGrouping ?? true,
      convertAccountingNegatives: rule?.convertAccountingNegatives ?? true,
      defaultCountryDialCode: rule?.defaultCountryDialCode ?? null,
      normalizeEmailAddress: rule?.normalizeEmailAddress ?? false,
      multiValueDelimiter: rule?.multiValueDelimiter ?? null,
      defaultValue: rule?.defaultValue ?? null,
      dateFormat: rule?.dateFormat ?? null,
      sourceTimeZoneId: rule?.sourceTimeZoneId ?? null,
    }),
    [rule]
  );

  const preview = useMemo(
    () => previewNormalizedSample(sampleValue, currentRule, targetDataType),
    [sampleValue, currentRule, targetDataType]
  );

  const activeCount = useMemo(() => countActiveTransforms(currentRule), [currentRule]);

  const update = (patch: Partial<DataExchangeTransformRule>) => {
    onChange({ ...currentRule, ...patch });
  };

  const handleReset = () => {
    onChange({
      trim: true,
      collapseWhitespace: true,
      normalizeUnicodeCompatibility: true,
      stripArabicDiacritics: true,
      normalizeArabicLetters: false,
      canonicalizeNullTokens: true,
      caseMode: "None",
      stripCurrencyAndGrouping: true,
      convertAccountingNegatives: true,
      defaultCountryDialCode: null,
      normalizeEmailAddress: false,
      multiValueDelimiter: null,
      defaultValue: null,
      dateFormat: null,
      sourceTimeZoneId: null,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 px-2.5 text-xs border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
          data-testid={`dx-norm-trigger-${sourceColumnHeader}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-nx-ink-2" />
          <span>{t("dataExchange.normalization.title")}</span>
          <Badge variant="secondary" className="ms-1 h-4 px-1 text-[10px]">
            {activeCount}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        dir={direction}
        side="left"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="w-[440px] max-w-[calc(100vw-2rem)] max-h-[min(600px,82vh)] p-0 flex flex-col overflow-hidden bg-nx-surface border-nx-line text-nx-ink z-[950] shadow-nx-popover"
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-nx-line bg-nx-surface p-3.5">
          <div className="min-w-0 flex-1 me-2">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-nx-ink truncate">
                {t("dataExchange.normalization.title")}
              </h4>
              {targetDataType && (
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {targetDataType}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-nx-ink-3 truncate mt-0.5">
              {sourceColumnHeader} {targetFieldKey ? `→ ${targetFieldKey}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 gap-1 px-2 text-[11px] text-nx-ink-2 hover:text-nx-ink shrink-0"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("dataExchange.normalization.resetRules")}</span>
          </Button>
        </div>

        {/* Sticky Live Transformation Preview */}
        <div className="shrink-0 bg-nx-raised border-b border-nx-line p-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-nx-ink-3">
            {t("dataExchange.normalization.preview")}
          </span>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span
              className="flex-1 truncate rounded bg-nx-surface px-2 py-1 text-nx-ink-2 border border-nx-line"
              title={sampleValue}
            >
              {sampleValue || "—"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-nx-accent" />
            <span
              className="flex-1 truncate rounded bg-nx-surface px-2 py-1 font-mono font-medium text-nx-ink border border-nx-accent"
              title={preview}
            >
              {preview || "—"}
            </span>
          </div>
        </div>

        {/* Dedicated Scrollable Body (NEVER no-scrollbar!) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5">
          <ColumnNormalizationSections
            sourceColumnHeader={sourceColumnHeader}
            targetFieldKey={targetFieldKey}
            targetDataType={targetDataType}
            sampleValue={sampleValue}
            rule={currentRule}
            onUpdate={update}
          />
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 bg-nx-raised border-t border-nx-line p-3 flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px]">
            {t("dataExchange.normalization.activeRules", { count: activeCount })}
          </Badge>
          <Button
            type="button"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-7 px-3 text-xs bg-nx-accent text-nx-on-fill hover:opacity-90 font-medium"
          >
            {t("dataExchange.normalization.done")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
