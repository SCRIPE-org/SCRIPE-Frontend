/**
 * FeaturesTab — Feature assignment editor for an edition.
 *
 * Includes:
 * - Overflow policy selector
 * - Collapsible feature module cards
 * - FeatureControl (Boolean switch, numeric input, enum select, text input)
 * - getFeatureDisabledDefault / getEnumFeatureOptions helpers
 */
"use client";

import { useMemo } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { ChevronDown, ChevronRight, Zap, ChevronsUpDown, Shield } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";
import type { Edition } from "../../domain/entities/Edition";

// ── Types ──
type TFn = (key: string) => string;

interface FeaturesTabProps {
  edition: Edition;
  features: Feature[];
  getEffectiveValue: (feature: Feature) => string;
  setLocalValue: (featureName: string, value: string) => void;
  overflowPolicy: string;
  setOverflowPolicy: (policy: string) => void;
  overflowPolicyChanged: boolean;
  collapsedModules: Record<string, boolean>;
  toggleModule: (moduleName: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export function FeaturesTab({
  edition,
  features,
  getEffectiveValue,
  setLocalValue,
  overflowPolicy,
  setOverflowPolicy,
  overflowPolicyChanged,
  collapsedModules,
  toggleModule,
  expandAll,
  collapseAll,
}: FeaturesTabProps) {
  const { t, language } = useI18n();

  // ── Group features by module → category ──
  const featuresByModule = useMemo(() => {
    if (!features) return {};
    const grouped: Record<string, Record<string, Feature[]>> = {};
    for (const f of features) {
      const mod = f.module || "Other";
      const cat = f.category || "General";
      if (!grouped[mod]) grouped[mod] = {};
      if (!grouped[mod][cat]) grouped[mod][cat] = [];
      grouped[mod][cat].push(f);
    }
    for (const mod of Object.keys(grouped)) {
      for (const cat of Object.keys(grouped[mod])) {
        grouped[mod][cat].sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
    return grouped;
  }, [features]);

  return (
    <>
      {/* ─────── OVERFLOW POLICY ─────── */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                {t("entitlements.editions.overflowPolicy")}
              </CardTitle>
              {overflowPolicyChanged && (
                <Badge
                  variant="outline"
                  className="h-4 border-amber-500/30 bg-amber-500/5 text-[10px] text-amber-600"
                >
                  {t("common.modified") || "Modified"}
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
          <p className="mt-2 text-xs text-muted-foreground">
            {t(`entitlements.editions.overflowPolicyHints.${overflowPolicy}`)}
          </p>
        </CardContent>
      </Card>

      {/* ─────── FEATURES HEADER ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("entitlements.features.title")}</h2>
          <Badge variant="secondary" className="text-xs">
            {(() => {
              const allFeats = features || [];
              const enabledTotal = allFeats.filter((f) => {
                const val = getEffectiveValue(f);
                return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
              }).length;
              return `${enabledTotal}/${allFeats.length}`;
            })()}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const allCollapsed = Object.values(collapsedModules).every((v) => v);
            allCollapsed ? expandAll() : collapseAll();
          }}
        >
          <ChevronsUpDown className="me-1 h-4 w-4" />
          {Object.values(collapsedModules).every((v) => v)
            ? t("common.expandAll") || "Expand All"
            : t("common.collapseAll") || "Collapse All"}
        </Button>
      </div>

      {/* ─────── FEATURE MODULE CARDS ─────── */}
      {Object.entries(featuresByModule).map(([moduleName, categories]) => {
        const isCollapsed = collapsedModules[moduleName] ?? true;
        const allFeatures = Object.values(categories).flat();
        const enabledCount = allFeatures.filter((f) => {
          const val = getEffectiveValue(f);
          return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
        }).length;

        return (
          <Card key={moduleName} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer select-none py-3 transition-colors hover:bg-accent/50"
              onClick={() => toggleModule(moduleName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base">{moduleName}</CardTitle>
                </div>
                <Badge variant="outline">
                  {enabledCount}/{allFeatures.length}
                </Badge>
              </div>
            </CardHeader>

            {!isCollapsed && (
              <CardContent className="pt-0">
                {Object.entries(categories).map(([categoryName, categoryFeatures]) => (
                  <div key={categoryName}>
                    {Object.keys(categories).length > 1 && (
                      <div className="mt-2 flex items-center gap-2 border-b border-dashed py-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {categoryName}
                        </span>
                        <Badge variant="secondary" className="h-4 text-[10px]">
                          {categoryFeatures.length}
                        </Badge>
                      </div>
                    )}
                    <div className="divide-y">
                      {categoryFeatures.map((feature) => {
                        const value = getEffectiveValue(feature);
                        const serverFeature = edition.features.find(
                          (ef) => ef.featureName === feature.name
                        );
                        const isModified = serverFeature
                          ? serverFeature.value !== value
                          : value !== getFeatureDisabledDefault(feature.valueType);

                        return (
                          <div
                            key={feature.id}
                            className="flex items-center justify-between gap-4 py-3"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {feature.getDisplayName(language)}
                                </span>
                                {isModified && (
                                  <span
                                    className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"
                                    title={t("common.modified") || "Modified"}
                                  />
                                )}
                              </div>
                              <p className="font-mono text-xs text-muted-foreground">
                                {feature.name}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              <FeatureControl
                                valueType={feature.valueType}
                                value={value}
                                onChange={(v) => setLocalValue(feature.name, v)}
                                featureName={feature.name}
                              />
                            </div>
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
      { value: "shared", label: t("entitlements.features.sharedPool") || "Shared Pool" },
      {
        value: "separate",
        label: t("entitlements.features.separatePool") || "Separate (Parent Independent)",
      },
      {
        value: "per_child",
        label: t("entitlements.features.perChildPool") || "Per Child (No Pool)",
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
        <SelectTrigger className="h-8 w-44">
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
        checked={value === "true"}
        onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
      />
    );
  }

  if (valueType === "Numeric") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-24 text-right"
        min={0}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-40"
    />
  );
}
