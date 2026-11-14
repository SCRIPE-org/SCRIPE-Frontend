"use client";

import React, { useMemo } from "react";
import { SlidersHorizontal, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Popover, PopoverTrigger, PopoverContent } from "@core/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { previewNormalizedSample } from "../../domain/mapping-validation";
import type { DataExchangeCaseMode, DataExchangeTransformRule } from "../../domain/types";

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
  return count;
}

/**
 * Interactive normalization popover with live Raw -> Normalized preview
 * and 17-property MENA & enterprise normalization controls.
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
    <Popover>
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
        className="w-[420px] max-h-[min(520px,78vh)] overflow-y-auto p-4 border border-nx-line bg-nx-surface text-nx-ink"
      >
        <div className="space-y-4">
          {/* Header & Reset */}
          <div className="flex items-center justify-between border-b border-nx-line pb-2">
            <div>
              <h4 className="text-xs font-semibold text-nx-ink">
                {t("dataExchange.normalization.title")}
              </h4>
              <p className="text-[11px] text-nx-ink-3">
                {sourceColumnHeader} {targetFieldKey ? `→ ${targetFieldKey}` : ""}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1 px-2 text-[11px] text-nx-ink-2 hover:text-nx-ink"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t("dataExchange.normalization.resetRules")}</span>
            </Button>
          </div>

          {/* Live Preview Box */}
          <div className="rounded-nx-control border border-nx-line bg-nx-ground p-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-nx-ink-3">
              {t("dataExchange.normalization.preview")}
            </span>
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <span className="flex-1 truncate rounded bg-nx-surface px-2 py-1 text-nx-ink-2 border border-nx-line">
                {sampleValue || "—"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-nx-accent" />
              <span className="flex-1 truncate rounded bg-nx-surface px-2 py-1 font-mono font-medium text-nx-ink border border-nx-accent">
                {preview || "—"}
              </span>
            </div>
          </div>

          {/* Group 1: General & Text */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-nx-ink-2">
              {t("dataExchange.normalization.generalGroup")}
            </span>
            <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-trim-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.trimLabel")}
                </Label>
                <Switch
                  id={`norm-trim-${sourceColumnHeader}`}
                  checked={currentRule.trim !== false}
                  onCheckedChange={(checked) => update({ trim: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-ws-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.collapseWhitespaceLabel")}
                </Label>
                <Switch
                  id={`norm-ws-${sourceColumnHeader}`}
                  checked={currentRule.collapseWhitespace !== false}
                  onCheckedChange={(checked) => update({ collapseWhitespace: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-ucomp-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.unicodeCompatLabel")}
                </Label>
                <Switch
                  id={`norm-ucomp-${sourceColumnHeader}`}
                  checked={currentRule.normalizeUnicodeCompatibility !== false}
                  onCheckedChange={(checked) => update({ normalizeUnicodeCompatibility: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Label htmlFor={`norm-case-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.caseModeLabel")}
                </Label>
                <Select
                  value={currentRule.caseMode ?? "None"}
                  onValueChange={(val) => update({ caseMode: val as DataExchangeCaseMode })}
                >
                  <SelectTrigger id={`norm-case-${sourceColumnHeader}`} className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">{t("dataExchange.normalization.caseNone")}</SelectItem>
                    <SelectItem value="Lower">{t("dataExchange.normalization.caseLower")}</SelectItem>
                    <SelectItem value="Upper">{t("dataExchange.normalization.caseUpper")}</SelectItem>
                    <SelectItem value="Title">{t("dataExchange.normalization.caseTitle")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Label htmlFor={`norm-def-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.defaultValueLabel")}
                </Label>
                <Input
                  id={`norm-def-${sourceColumnHeader}`}
                  value={currentRule.defaultValue ?? ""}
                  placeholder={t("dataExchange.normalization.defaultValuePlaceholder")}
                  onChange={(e) => update({ defaultValue: e.target.value || null })}
                  className="h-7 w-36 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Arabic & MENA */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-nx-ink-2">
              {t("dataExchange.normalization.menaArabicGroup")}
            </span>
            <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-diacr-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.stripDiacriticsLabel")}
                </Label>
                <Switch
                  id={`norm-diacr-${sourceColumnHeader}`}
                  checked={currentRule.stripArabicDiacritics !== false}
                  onCheckedChange={(checked) => update({ stripArabicDiacritics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-arab-ltr-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.normalizeLettersLabel")}
                </Label>
                <Switch
                  id={`norm-arab-ltr-${sourceColumnHeader}`}
                  checked={Boolean(currentRule.normalizeArabicLetters)}
                  onCheckedChange={(checked) => update({ normalizeArabicLetters: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-null-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.canonicalizeNullLabel")}
                </Label>
                <Switch
                  id={`norm-null-${sourceColumnHeader}`}
                  checked={currentRule.canonicalizeNullTokens !== false}
                  onCheckedChange={(checked) => update({ canonicalizeNullTokens: checked })}
                />
              </div>
            </div>
          </div>

          {/* Group 3: Formats & Types */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-nx-ink-2">
              {t("dataExchange.normalization.formatsGroup")}
            </span>
            <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-curr-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.stripCurrencyLabel")}
                </Label>
                <Switch
                  id={`norm-curr-${sourceColumnHeader}`}
                  checked={currentRule.stripCurrencyAndGrouping !== false}
                  onCheckedChange={(checked) => update({ stripCurrencyAndGrouping: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-acct-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.accountingNegativesLabel")}
                </Label>
                <Switch
                  id={`norm-acct-${sourceColumnHeader}`}
                  checked={currentRule.convertAccountingNegatives !== false}
                  onCheckedChange={(checked) => update({ convertAccountingNegatives: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Label htmlFor={`norm-dial-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.defaultCountryCodeLabel")}
                </Label>
                <Input
                  id={`norm-dial-${sourceColumnHeader}`}
                  value={currentRule.defaultCountryDialCode ?? ""}
                  placeholder={t("dataExchange.normalization.defaultCountryCodePlaceholder")}
                  onChange={(e) => update({ defaultCountryDialCode: e.target.value || null })}
                  className="h-7 w-28 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`norm-email-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.normalizeEmailLabel")}
                </Label>
                <Switch
                  id={`norm-email-${sourceColumnHeader}`}
                  checked={Boolean(currentRule.normalizeEmailAddress)}
                  onCheckedChange={(checked) => update({ normalizeEmailAddress: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Label htmlFor={`norm-delim-${sourceColumnHeader}`} className="text-xs text-nx-ink">
                  {t("dataExchange.normalization.multiValueDelimiterLabel")}
                </Label>
                <Input
                  id={`norm-delim-${sourceColumnHeader}`}
                  value={currentRule.multiValueDelimiter ?? ""}
                  placeholder={t("dataExchange.normalization.multiValueDelimiterPlaceholder")}
                  onChange={(e) => update({ multiValueDelimiter: e.target.value || null })}
                  className="h-7 w-20 text-xs font-mono text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
