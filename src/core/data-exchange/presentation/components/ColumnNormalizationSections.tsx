"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeCaseMode, DataExchangeTransformRule } from "../../domain/types";

export interface ColumnNormalizationSectionsProps {
  sourceColumnHeader: string;
  targetFieldKey?: string;
  targetDataType?: string;
  sampleValue?: string;
  rule: DataExchangeTransformRule;
  onUpdate: (patch: Partial<DataExchangeTransformRule>) => void;
}

export type SmartPresetType = "arabic" | "date" | "numeric" | "phone" | "email" | null;

/**
 * Determines recommended smart preset based on target schema data type or Arabic sample text.
 */
export function detectSmartPreset(
  targetDataType?: string,
  targetFieldKey?: string,
  sampleValue?: string
): { type: SmartPresetType; labelKey: string } | null {
  const isArabicSample = sampleValue ? /[\u0600-\u06FF]/.test(sampleValue) : false;
  if (isArabicSample) {
    return { type: "arabic", labelKey: "dataExchange.normalization.recommendedForArabic" };
  }

  const dt = targetDataType?.toLowerCase() ?? "";
  const key = targetFieldKey?.toLowerCase() ?? "";

  if (dt === "datetime" || dt === "date" || key.includes("date") || key.includes("atutc")) {
    return { type: "date", labelKey: "dataExchange.normalization.recommendedForType" };
  }
  if (dt === "decimal" || dt === "double" || dt === "int32" || dt === "money" || key.includes("amount") || key.includes("price")) {
    return { type: "numeric", labelKey: "dataExchange.normalization.recommendedForType" };
  }
  if (dt === "phonenumber" || key.includes("phone") || key.includes("mobile")) {
    return { type: "phone", labelKey: "dataExchange.normalization.recommendedForType" };
  }
  if (dt === "emailaddress" || key.includes("email")) {
    return { type: "email", labelKey: "dataExchange.normalization.recommendedForType" };
  }
  return null;
}

/**
 * Grouped form sections for the 17-property data exchange normalizer engine.
 * Dynamically prioritizes the context-relevant section at the top of the scrollable container.
 */
export function ColumnNormalizationSections({
  sourceColumnHeader,
  targetFieldKey,
  targetDataType,
  sampleValue,
  rule,
  onUpdate,
}: ColumnNormalizationSectionsProps) {
  const { t } = useI18n();

  const smartPreset = useMemo(
    () => detectSmartPreset(targetDataType, targetFieldKey, sampleValue),
    [targetDataType, targetFieldKey, sampleValue]
  );

  const applyPreset = () => {
    if (!smartPreset) return;
    switch (smartPreset.type) {
      case "arabic":
        onUpdate({
          stripArabicDiacritics: true,
          normalizeArabicLetters: true,
          canonicalizeNullTokens: true,
          collapseWhitespace: true,
        });
        break;
      case "date":
        onUpdate({
          dateFormat: rule.dateFormat || "YYYY-MM-DD",
          sourceTimeZoneId: rule.sourceTimeZoneId || "UTC",
          canonicalizeNullTokens: true,
        });
        break;
      case "numeric":
        onUpdate({
          stripCurrencyAndGrouping: true,
          convertAccountingNegatives: true,
          canonicalizeNullTokens: true,
        });
        break;
      case "phone":
        onUpdate({
          defaultCountryDialCode: rule.defaultCountryDialCode || "+966",
          trim: true,
          collapseWhitespace: true,
        });
        break;
      case "email":
        onUpdate({
          normalizeEmailAddress: true,
          trim: true,
          caseMode: "Lower",
          lowercase: true,
          uppercase: false,
        });
        break;
    }
  };

  const generalSection = (
    <div key="general" className="space-y-2">
      <span className="text-[11px] font-semibold text-nx-ink-2">{t("dataExchange.normalization.generalGroup")}</span>
      <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-trim-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.trimLabel")}</Label>
          <Switch id={`norm-trim-${sourceColumnHeader}`} checked={rule.trim !== false} onCheckedChange={(c) => onUpdate({ trim: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-ws-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.collapseWhitespaceLabel")}</Label>
          <Switch id={`norm-ws-${sourceColumnHeader}`} checked={rule.collapseWhitespace !== false} onCheckedChange={(c) => onUpdate({ collapseWhitespace: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-ucomp-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.unicodeCompatLabel")}</Label>
          <Switch id={`norm-ucomp-${sourceColumnHeader}`} checked={rule.normalizeUnicodeCompatibility !== false} onCheckedChange={(c) => onUpdate({ normalizeUnicodeCompatibility: c })} />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-case-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.caseModeLabel")}</Label>
          <Select
            value={rule.caseMode ?? "None"}
            onValueChange={(val) =>
              onUpdate({
                caseMode: val as DataExchangeCaseMode,
                uppercase: val === "Upper",
                lowercase: val === "Lower",
              })
            }
          >
            <SelectTrigger id={`norm-case-${sourceColumnHeader}`} className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[960]">
              <SelectItem value="None">{t("dataExchange.normalization.caseNone")}</SelectItem>
              <SelectItem value="Lower">{t("dataExchange.normalization.caseLower")}</SelectItem>
              <SelectItem value="Upper">{t("dataExchange.normalization.caseUpper")}</SelectItem>
              <SelectItem value="Title">{t("dataExchange.normalization.caseTitle")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-def-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.defaultValueLabel")}</Label>
          <Input id={`norm-def-${sourceColumnHeader}`} value={rule.defaultValue ?? ""} placeholder={t("dataExchange.normalization.defaultValuePlaceholder")} onChange={(e) => onUpdate({ defaultValue: e.target.value || null })} className="h-7 w-36 text-xs" />
        </div>
      </div>
    </div>
  );

  const menaArabicSection = (
    <div key="menaArabic" className="space-y-2">
      <span className="text-[11px] font-semibold text-nx-ink-2">{t("dataExchange.normalization.menaArabicGroup")}</span>
      <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-diacr-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.stripDiacriticsLabel")}</Label>
          <Switch id={`norm-diacr-${sourceColumnHeader}`} checked={rule.stripArabicDiacritics !== false} onCheckedChange={(c) => onUpdate({ stripArabicDiacritics: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-arlet-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.normalizeLettersLabel")}</Label>
          <Switch id={`norm-arlet-${sourceColumnHeader}`} checked={Boolean(rule.normalizeArabicLetters)} onCheckedChange={(c) => onUpdate({ normalizeArabicLetters: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-null-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.canonicalizeNullLabel")}</Label>
          <Switch id={`norm-null-${sourceColumnHeader}`} checked={rule.canonicalizeNullTokens !== false} onCheckedChange={(c) => onUpdate({ canonicalizeNullTokens: c })} />
        </div>
      </div>
    </div>
  );

  const formatsSection = (
    <div key="formats" className="space-y-2">
      <span className="text-[11px] font-semibold text-nx-ink-2">{t("dataExchange.normalization.formatsGroup")}</span>
      <div className="space-y-2 rounded-nx-control border border-nx-line bg-nx-raised/50 p-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-curr-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.stripCurrencyLabel")}</Label>
          <Switch id={`norm-curr-${sourceColumnHeader}`} checked={rule.stripCurrencyAndGrouping !== false} onCheckedChange={(c) => onUpdate({ stripCurrencyAndGrouping: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-accneg-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.accountingNegativesLabel")}</Label>
          <Switch id={`norm-accneg-${sourceColumnHeader}`} checked={rule.convertAccountingNegatives !== false} onCheckedChange={(c) => onUpdate({ convertAccountingNegatives: c })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`norm-email-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.normalizeEmailLabel")}</Label>
          <Switch id={`norm-email-${sourceColumnHeader}`} checked={Boolean(rule.normalizeEmailAddress)} onCheckedChange={(c) => onUpdate({ normalizeEmailAddress: c })} />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-dial-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.defaultCountryCodeLabel")}</Label>
          <Input id={`norm-dial-${sourceColumnHeader}`} value={rule.defaultCountryDialCode ?? ""} placeholder={t("dataExchange.normalization.defaultCountryCodePlaceholder")} onChange={(e) => onUpdate({ defaultCountryDialCode: e.target.value || null })} className="h-7 w-24 text-xs font-mono" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-datefmt-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.dateFormatLabel")}</Label>
          <Input id={`norm-datefmt-${sourceColumnHeader}`} value={rule.dateFormat ?? ""} placeholder={t("dataExchange.normalization.dateFormatPlaceholder")} onChange={(e) => onUpdate({ dateFormat: e.target.value || null })} className="h-7 w-32 text-xs font-mono" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-tz-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.sourceTimeZoneLabel")}</Label>
          <Input id={`norm-tz-${sourceColumnHeader}`} value={rule.sourceTimeZoneId ?? ""} placeholder={t("dataExchange.normalization.sourceTimeZonePlaceholder")} onChange={(e) => onUpdate({ sourceTimeZoneId: e.target.value || null })} className="h-7 w-32 text-xs font-mono" />
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <Label htmlFor={`norm-del-${sourceColumnHeader}`} className="text-xs text-nx-ink">{t("dataExchange.normalization.multiValueDelimiterLabel")}</Label>
          <Input id={`norm-del-${sourceColumnHeader}`} value={rule.multiValueDelimiter ?? ""} placeholder={t("dataExchange.normalization.multiValueDelimiterPlaceholder")} onChange={(e) => onUpdate({ multiValueDelimiter: e.target.value || null })} className="h-7 w-24 text-xs font-mono" />
        </div>
      </div>
    </div>
  );

  const orderedSections =
    smartPreset?.type === "arabic"
      ? [menaArabicSection, generalSection, formatsSection]
      : smartPreset?.type === "date" ||
          smartPreset?.type === "numeric" ||
          smartPreset?.type === "phone" ||
          smartPreset?.type === "email"
        ? [formatsSection, generalSection, menaArabicSection]
        : [generalSection, menaArabicSection, formatsSection];

  return (
    <div className="space-y-4">
      {smartPreset && (
        <div className="rounded-nx-control border border-nx-accent/40 bg-nx-accent-wash/30 p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-nx-accent shrink-0" />
            <span className="text-[11px] font-medium text-nx-ink truncate">
              {t(smartPreset.labelKey, { type: targetDataType || "" })}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyPreset}
            className="h-6 px-2 text-[10px] bg-nx-surface border-nx-line hover:border-nx-accent shrink-0 text-nx-ink"
          >
            {t("dataExchange.normalization.applySmartPreset")}
          </Button>
        </div>
      )}

      {orderedSections}
    </div>
  );
}
