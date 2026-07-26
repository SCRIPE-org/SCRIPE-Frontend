// FILE-EXCEPTION: file length
/**
 * FeaturesTab — Feature assignment editor for an edition.
 *
 * Consumes backend-pre-grouped FeatureModuleGroup[] — NO client-side useMemo groupBy.
 * Backend delivers Module → Category → Feature[] hierarchy via GET /features/grouped.
 *
 * Includes:
 * - Overflow policy selector
 * - Collapsible feature module cards (from backend groups)
 * - FeatureControl (Boolean switch, numeric input, enum select, text input)
 */
"use client";

import { useState } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  ChevronDown,
  ChevronRight,
  Zap,
  ChevronsUpDown,
  Shield,
  Tag,
  Languages,
  Star,
  Trash2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  Feature,
  FeatureModuleGroup,
} from "@modules/entitlements/features/src/domain/entities/Feature";
import type { Edition } from "../../domain/entities/Edition";

// ── Types ──
type TFn = (key: string) => string;

interface FeaturesTabProps {
  edition: Edition;
  /** Backend-pre-grouped: Module → Category → Feature[]. Zero client-side groupBy. */
  moduleGroups: FeatureModuleGroup[];
  getEffectiveValue: (feature: Feature) => string;
  getEffectiveLabel: (featureName: string) => { en: string; ar: string };
  getEffectiveHighlight: (featureName: string) => { isHighlight: boolean; highlightOrder: number };
  setLocalValue: (featureName: string, value: string) => void;
  setLocalLabel: (featureName: string, field: "en" | "ar", value: string) => void;
  setLocalHighlight: (
    featureName: string,
    field: "isHighlight" | "highlightOrder",
    value: boolean | number
  ) => void;
  removeFeature: (featureId: string) => void;
  isRemovingFeature: boolean;
  overflowPolicy: string;
  setOverflowPolicy: (policy: string) => void;
  overflowPolicyChanged: boolean;
  collapsedModules: Record<string, boolean>;
  toggleModule: (moduleName: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

/**
 * Presentation UI component rendering the features tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeaturesTab({
  edition,
  moduleGroups,
  getEffectiveValue,
  getEffectiveLabel,
  getEffectiveHighlight,
  setLocalValue,
  setLocalLabel,
  setLocalHighlight,
  removeFeature,
  isRemovingFeature,
  overflowPolicy,
  setOverflowPolicy,
  overflowPolicyChanged,
  collapsedModules,
  toggleModule,
  expandAll,
  collapseAll,
}: FeaturesTabProps) {
  const { t, language } = useI18n();
  // Track which features have their label section expanded
  const [expandedLabels, setExpandedLabels] = useState<Record<string, boolean>>({});
  const toggleLabelExpanded = (featureName: string) =>
    setExpandedLabels((prev) => ({ ...prev, [featureName]: !prev[featureName] }));

  // ── Total counts from backend groups (no client-side computation) ──
  const allFeatures = moduleGroups.flatMap((mg) => mg.categories.flatMap((cat) => cat.features));
  const enabledTotal = allFeatures.filter((f) => {
    const val = getEffectiveValue(f);
    return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
  }).length;

  return (
    <>
      {/* ─────── OVERFLOW POLICY ─────── */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-nx-ink-3" />
              <CardTitle className="text-sm font-medium">
                {t("entitlements.editions.overflowPolicy")}
              </CardTitle>
              {overflowPolicyChanged && (
                <Badge
                  variant="outline"
                  className="h-4 border-warning/30 bg-warning/5 text-[10px] text-warning"
                >
                  {t("common.modified")}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <Select value={overflowPolicy} onValueChange={setOverflowPolicy}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Block", "GracefulFreeze", "SoftDeactivate"] as const).map((policy) => (
                <SelectItem key={policy} value={policy}>
                  {t(`entitlements.editions.overflowPolicies.${policy}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-nx-ink-3">
            {t(`entitlements.editions.overflowPolicyHints.${overflowPolicy}`)}
          </p>
        </CardContent>
      </Card>

      {/* ─────── FEATURES HEADER ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-nx-accent" />
          <h2 className="text-lg font-semibold">{t("entitlements.features.title")}</h2>
          <Badge variant="secondary" className="text-xs">
            {enabledTotal}/{allFeatures.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const allCollapsed = Object.values(collapsedModules).every((v) => v);
            if (allCollapsed) {
              expandAll();
            } else {
              collapseAll();
            }
          }}
        >
          <ChevronsUpDown className="me-1 h-4 w-4" />
          {Object.values(collapsedModules).every((v) => v)
            ? t("common.expandAll")
            : t("common.collapseAll")}
        </Button>
      </div>

      {/* ─────── FEATURE MODULE CARDS (backend-grouped) ─────── */}
      {moduleGroups.map(({ module: moduleName, categories }) => {
        const isCollapsed = collapsedModules[moduleName] ?? true;
        const moduleFeatures = categories.flatMap((cat) => cat.features);
        const enabledCount = moduleFeatures.filter((f) => {
          const val = getEffectiveValue(f);
          return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
        }).length;

        return (
          <Card key={moduleName} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none py-3 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none"
              onClick={() => toggleModule(moduleName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-nx-ink-3 rtl:rotate-180" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-nx-ink-3" />
                  )}
                  <CardTitle className="text-base">{moduleName}</CardTitle>
                </div>
                <Badge variant="outline">
                  {enabledCount}/{moduleFeatures.length}
                </Badge>
              </div>
            </CardHeader>

            {!isCollapsed && (
              <CardContent className="pt-0">
                {categories.map(({ category: categoryName, features: categoryFeatures }) => (
                  <div key={categoryName}>
                    {categories.length > 1 && (
                      <div className="mt-2 flex items-center gap-2 border-b border-dashed border-nx-line py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                          {categoryName}
                        </span>
                        <Badge variant="secondary" className="h-4 text-[10px]">
                          {categoryFeatures.length}
                        </Badge>
                      </div>
                    )}
                    <div className="divide-y divide-nx-line">
                      {categoryFeatures.map((feature) => {
                        const value = getEffectiveValue(feature);
                        const serverFeature = edition.features.find(
                          (ef) => ef.featureName === feature.name
                        );
                        const isModified = serverFeature
                          ? serverFeature.value !== value
                          : value !== getFeatureDisabledDefault(feature.valueType);

                        // Label state
                        const effectiveLabel = getEffectiveLabel(feature.name);
                        const serverEn = serverFeature?.displayLabelEn ?? "";
                        const serverAr = serverFeature?.displayLabelAr ?? "";
                        const isLabelModified =
                          effectiveLabel.en !== serverEn || effectiveLabel.ar !== serverAr;
                        const isLabelExpanded = expandedLabels[feature.name] ?? false;
                        const isEnabled =
                          value === "true" ||
                          (feature.valueType === "Numeric" && parseInt(value) > 0) ||
                          (feature.valueType === "String" && value.trim() !== "");

                        return (
                          <div key={feature.id} className="border-b border-nx-line last:border-0">
                            {/* Feature row */}
                            <div className="flex items-center justify-between gap-4 py-3">
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {feature.getDisplayName(language)}
                                  </span>
                                  {isModified && (
                                    <span
                                      className="inline-block h-1.5 w-1.5 rounded-full bg-warning"
                                      title={t("common.modified")}
                                    />
                                  )}
                                  {isLabelModified && (
                                    <span
                                      className="inline-block h-1.5 w-1.5 rounded-full bg-info"
                                      title="Marketing label modified"
                                    />
                                  )}
                                </div>
                                <p className="font-mono text-xs text-nx-ink-3">
                                  {feature.name}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Label toggle button — only shown when feature is enabled */}
                                {isEnabled && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 gap-1 px-2 text-xs ${
                                      isLabelExpanded
                                        ? "text-nx-accent"
                                        : "text-nx-ink-3 hover:text-nx-ink"
                                    }`}
                                    onClick={() => toggleLabelExpanded(feature.name)}
                                    title="Edit marketing display label"
                                  >
                                    <Tag className="h-3 w-3" />
                                    <Languages className="h-3 w-3" />
                                  </Button>
                                )}
                                {/* Remove Feature button — only shown for features explicitly set on this edition */}
                                {serverFeature && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeFeature(serverFeature.featureId)}
                                    disabled={isRemovingFeature}
                                    title={t("entitlements.editions.removeFeature")}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <div className="flex-shrink-0">
                                  <FeatureControl
                                    valueType={feature.valueType}
                                    value={value}
                                    onChange={(v) => setLocalValue(feature.name, v)}
                                    featureName={feature.name}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Expandable label + highlight editor */}
                            {isLabelExpanded &&
                              isEnabled &&
                              (() => {
                                const highlight = getEffectiveHighlight(feature.name);
                                const serverHighlight = edition.features.find(
                                  (ef) => ef.featureName === feature.name
                                );
                                const isHighlightModified =
                                  highlight.isHighlight !==
                                    (serverHighlight?.isHighlight ?? false) ||
                                  highlight.highlightOrder !==
                                    (serverHighlight?.highlightOrder ?? 0);
                                return (
                                  <div className="mb-3 rounded-nx-md border border-info/30 bg-info/10 px-4 py-3">
                                    {/* ── Marketing Label ── */}
                                    <div className="mb-2 flex items-center gap-1.5">
                                      <Tag className="h-3.5 w-3.5 text-info" />
                                      <span className="text-xs font-semibold uppercase tracking-wider text-info">
                                        Marketing Display Label
                                      </span>
                                      <span className="text-xs text-nx-ink-3">
                                        — overrides how this feature appears on plan cards
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-nx-ink-3">
                                          🇺🇸 English label
                                        </Label>
                                        <Input
                                          type="text"
                                          value={effectiveLabel.en}
                                          onChange={(e) =>
                                            setLocalLabel(feature.name, "en", e.target.value)
                                          }
                                          placeholder="e.g. Up to 25 Admins"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-nx-ink-3">
                                          🇸🇦 Arabic label
                                        </Label>
                                        <Input
                                          type="text"
                                          dir="rtl"
                                          value={effectiveLabel.ar}
                                          onChange={(e) =>
                                            setLocalLabel(feature.name, "ar", e.target.value)
                                          }
                                          placeholder="مثال: حتى 25 مشرف"
                                          className="h-8 text-sm"
                                        />
                                      </div>
                                    </div>
                                    {(effectiveLabel.en || effectiveLabel.ar) && (
                                      <div className="mt-2 flex items-center gap-1">
                                        <span className="text-[10px] text-nx-ink-3">
                                          Preview:
                                        </span>
                                        {effectiveLabel.en && (
                                          <Badge variant="secondary" className="text-[10px]">
                                            {effectiveLabel.en}
                                          </Badge>
                                        )}
                                        {effectiveLabel.ar && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                            dir="rtl"
                                          >
                                            {effectiveLabel.ar}
                                          </Badge>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="ms-auto h-5 px-1 text-[10px] text-nx-ink-3 hover:text-destructive"
                                          onClick={() => {
                                            setLocalLabel(feature.name, "en", "");
                                            setLocalLabel(feature.name, "ar", "");
                                          }}
                                        >
                                          Clear
                                        </Button>
                                      </div>
                                    )}

                                    {/* ── Highlight ── */}
                                    <div className="mt-3 border-t border-info/30 pt-3">
                                      <div className="mb-2 flex items-center gap-1.5">
                                        <Star className="h-3.5 w-3.5 text-warning" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-warning">
                                          Plan Card Highlight
                                        </span>
                                        {isHighlightModified && (
                                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                          <Switch
                                            checked={highlight.isHighlight}
                                            onCheckedChange={(checked) =>
                                              setLocalHighlight(
                                                feature.name,
                                                "isHighlight",
                                                checked
                                              )
                                            }
                                            id={`highlight-${feature.id}`}
                                          />
                                          <Label
                                            htmlFor={`highlight-${feature.id}`}
                                            className="cursor-pointer text-xs"
                                          >
                                            Show in plan card highlights
                                          </Label>
                                        </div>
                                        {highlight.isHighlight && (
                                          <div className="flex items-center gap-2">
                                            <Label className="text-xs text-nx-ink-3">
                                              Order
                                            </Label>
                                            <Input
                                              type="number"
                                              min={0}
                                              value={highlight.highlightOrder}
                                              onChange={(e) =>
                                                setLocalHighlight(
                                                  feature.name,
                                                  "highlightOrder",
                                                  parseInt(e.target.value) || 0
                                                )
                                              }
                                              className="h-7 w-16 text-center text-xs"
                                            />
                                            <span className="text-[10px] text-nx-ink-3">
                                              lower = higher priority
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </>
  );
}

// ── Helpers ──
/**
 * Presentation UI component rendering the get feature disabled default.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function getFeatureDisabledDefault(valueType: string): string {
  switch (valueType?.toLowerCase()) {
    case "boolean":
      return "false";
    case "numeric":
      return "0";
    default:
      return "";
  }
}

function getEnumFeatureOptions(t: TFn): Record<string, { value: string; label: string }[]> {
  return {
    "Identity.AdminPoolMode": [
      { value: "shared", label: t("entitlements.features.sharedPool") },
      {
        value: "separate",
        label: t("entitlements.features.separatePool"),
      },
      {
        value: "per_child",
        label: t("entitlements.features.perChildPool"),
      },
    ],
  };
}

// ── Feature Control Component ──
function FeatureControl({
  valueType,
  value,
  onChange,
  featureName,
}: {
  valueType: string;
  value: string;
  onChange: (value: string) => void;
  featureName?: string;
}) {
  const { t } = useI18n();
  const enumOptions = featureName ? getEnumFeatureOptions(t)[featureName] : undefined;
  if (enumOptions) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-8 w-44"
          aria-label={featureName ?? t("entitlements.features.valueType")}
        >
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {enumOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (valueType === "Boolean") {
    return (
      <Switch
        aria-label={featureName ?? t("entitlements.features.valueType")}
        checked={value === "true"}
        onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
      />
    );
  }

  if (valueType === "Numeric") {
    return (
      <Input
        aria-label={featureName ?? t("entitlements.features.valueType")}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-24 text-end"
        min={-1}
      />
    );
  }

  return (
    <Input
      aria-label={featureName ?? t("entitlements.features.valueType")}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-40"
    />
  );
}
