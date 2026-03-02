/**
 * Edition Detail View
 *
 * Features-only detail page with collapsible module sections,
 * grouped by Module → Category, with raw feature code displayed.
 */
"use client";

import { useMemo } from "react";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import {
      Save, ArrowLeft, Loader2, Undo2, ChevronDown, ChevronRight,
      Zap, ChevronsUpDown
} from "lucide-react";
import Link from "next/link";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";
import { VersionsTab } from "../components/VersionsTab";

interface EditionDetailViewProps {
      editionId: string;
}

export function EditionDetailView({ editionId }: EditionDetailViewProps) {
      const { t, language } = useI18n();
      const vm = useEditionDetailViewModel(editionId);

      // ── Group features by module → category ──
      const featuresByModule = useMemo(() => {
            if (!vm.features) return {};
            const grouped: Record<string, Record<string, Feature[]>> = {};
            for (const f of vm.features) {
                  const mod = f.module || "Other";
                  const cat = f.category || "General";
                  if (!grouped[mod]) grouped[mod] = {};
                  if (!grouped[mod][cat]) grouped[mod][cat] = [];
                  grouped[mod][cat].push(f);
            }
            // Sort features within each category by sortOrder
            for (const mod of Object.keys(grouped)) {
                  for (const cat of Object.keys(grouped[mod])) {
                        grouped[mod][cat].sort((a, b) => a.sortOrder - b.sortOrder);
                  }
            }
            return grouped;
      }, [vm.features]);

      // ── Loading state ──
      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      if (vm.error || !vm.edition) {
            return (
                  <div className="text-center p-8">
                        <p className="text-destructive">{vm.error?.message || "Edition not found"}</p>
                        <Link href="/entitlements/editions">
                              <Button variant="ghost" className="mt-4">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t("common.back") || "Back to Editions"}
                              </Button>
                        </Link>
                  </div>
            );
      }

      const edition = vm.edition;

      return (
            <div className="space-y-6">
                  {/* ── Header ── */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                              <Link href="/entitlements/editions">
                                    <Button variant="ghost" size="icon">
                                          <ArrowLeft className="h-5 w-5" />
                                    </Button>
                              </Link>
                              <div>
                                    <h1 className="text-3xl font-bold tracking-tight">{edition.getDisplayName(language)}</h1>
                                    <p className="text-muted-foreground">
                                          {edition.description || t("entitlements.editions.manageFeaturesDescription") || "Manage features and quotas for this edition"}
                                    </p>
                              </div>
                        </div>
                        <div className="flex items-center gap-2">
                              {vm.hasUnsavedChanges && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                          {t("common.unsavedChanges") || "Unsaved changes"}
                                    </Badge>
                              )}
                              {vm.hasUnsavedChanges && (
                                    <>
                                          <Button variant="ghost" onClick={vm.discardChanges} disabled={vm.isSaving}>
                                                <Undo2 className="h-4 w-4 mr-1" />
                                                {t("common.discard") || "Discard"}
                                          </Button>
                                          <Button onClick={vm.saveAllFeatures} disabled={vm.isSaving} className="gap-1 gradient-primary">
                                                {vm.isSaving ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                      <Save className="h-4 w-4" />
                                                )}
                                                {t("common.saveChanges") || "Save Changes"}
                                          </Button>
                                    </>
                              )}
                        </div>
                  </div>

                  {/* ── Overflow Policy Card ── */}
                  <Card>
                        <CardHeader className="py-3">
                              <CardTitle className="text-base">{t("entitlements.editions.overflowPolicy") || "Downgrade Overflow Policy"}</CardTitle>
                              <p className="text-xs text-muted-foreground">{t("entitlements.editions.overflowPolicyDesc") || "What happens when resources exceed limits after downgrading."}</p>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                              <div className="flex items-center gap-4">
                                    <Select
                                          value={vm.overflowPolicy}
                                          onValueChange={vm.updateOverflowPolicy}
                                          disabled={vm.isUpdatingOverflowPolicy}
                                    >
                                          <SelectTrigger className="w-[280px]">
                                                <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {(["Block", "GracefulFreeze", "SoftDeactivate"] as const).map((policy) => (
                                                      <SelectItem key={policy} value={policy}>
                                                            {t(`entitlements.editions.overflowPolicies.${policy}`) || policy}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                                    {vm.isUpdatingOverflowPolicy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                    {t(`entitlements.editions.overflowPolicyHints.${vm.overflowPolicy}`) || ""}
                              </p>
                        </CardContent>
                  </Card>

                  {/* ── Feature count + Expand/Collapse ── */}
                  <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                              <Zap className="h-5 w-5 text-primary" />
                              <h2 className="text-lg font-semibold">{t("entitlements.features.title") || "Features"}</h2>
                              <Badge variant="secondary" className="text-xs">
                                    {(() => {
                                          const allFeats = vm.features || [];
                                          const enabledTotal = allFeats.filter(f => {
                                                const val = vm.getEffectiveValue(f);
                                                return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
                                          }).length;
                                          return `${enabledTotal}/${allFeats.length}`;
                                    })()}
                              </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                              const allCollapsed = Object.values(vm.collapsedModules).every(v => v);
                              allCollapsed ? vm.expandAll() : vm.collapseAll();
                        }}>
                              <ChevronsUpDown className="h-4 w-4 mr-1" />
                              {Object.values(vm.collapsedModules).every(v => v) ? (t("common.expandAll") || "Expand All") : (t("common.collapseAll") || "Collapse All")}
                        </Button>
                  </div>

                  {/* ── Module Accordion Cards ── */}
                  {Object.entries(featuresByModule).map(([moduleName, categories]) => {
                        const isCollapsed = vm.collapsedModules[moduleName] ?? true;
                        const allFeatures = Object.values(categories).flat();
                        const enabledCount = allFeatures.filter(f => {
                              const val = vm.getEffectiveValue(f);
                              return val === "true" || (f.valueType === "Numeric" && parseInt(val) > 0);
                        }).length;

                        return (
                              <Card key={moduleName} className="overflow-hidden">
                                    <CardHeader
                                          className="cursor-pointer select-none hover:bg-accent/50 transition-colors py-3"
                                          onClick={() => vm.toggleModule(moduleName)}
                                    >
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                      {isCollapsed ? (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
                                                {Object.entries(categories).map(([categoryName, features]) => (
                                                      <div key={categoryName}>
                                                            {/* Category sub-header */}
                                                            {Object.keys(categories).length > 1 && (
                                                                  <div className="flex items-center gap-2 py-2 mt-2 border-b border-dashed">
                                                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{categoryName}</span>
                                                                        <Badge variant="secondary" className="text-[10px] h-4">{features.length}</Badge>
                                                                  </div>
                                                            )}
                                                            <div className="divide-y">
                                                                  {features.map(feature => {
                                                                        const value = vm.getEffectiveValue(feature);
                                                                        const serverFeature = edition.features.find(ef => ef.featureName === feature.name);
                                                                        const isModified = serverFeature ? serverFeature.value !== value : value !== getFeatureDisabledDefault(feature.valueType);

                                                                        return (
                                                                              <div key={feature.id} className="flex items-center justify-between py-3 gap-3">
                                                                                    <div className="space-y-0.5 flex-1 min-w-0">
                                                                                          <div className="flex items-center gap-2">
                                                                                                <span className="font-medium text-sm">{feature.getDisplayName(language)}</span>
                                                                                                {isModified && (
                                                                                                      <Badge variant="outline" className="text-[10px] h-4 text-amber-600 border-amber-500/30">Modified</Badge>
                                                                                                )}
                                                                                          </div>
                                                                                          <p className="text-xs text-muted-foreground font-mono">{feature.name}</p>
                                                                                          {feature.description && (
                                                                                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                                                                                          )}
                                                                                    </div>

                                                                                    <div className="flex-shrink-0">
                                                                                          <FeatureControl
                                                                                                valueType={feature.valueType}
                                                                                                value={value}
                                                                                                onChange={(v) => vm.setLocalValue(feature.name, v)}
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

                  {/* ── Version History Tab ── */}
                  <VersionsTab editionId={editionId} />
            </div>
      );
}

// ── Disabled default helper ──
function getFeatureDisabledDefault(valueType: string): string {
      switch (valueType?.toLowerCase()) {
            case "boolean": return "false";
            case "numeric": return "0";
            default: return "";
      }
}

// ── Known enum features with allowed values ──
const ENUM_FEATURE_OPTIONS: Record<string, { value: string; label: string }[]> = {
      "Identity.AdminPoolMode": [
            { value: "shared", label: "Shared Pool" },
            { value: "separate", label: "Separate (Parent Independent)" },
            { value: "per_child", label: "Per Child (No Pool)" },
      ],
};

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
      // Check if this is a known enum feature
      const enumOptions = featureName ? ENUM_FEATURE_OPTIONS[featureName] : undefined;
      if (enumOptions) {
            return (
                  <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-44 h-8">
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
                        className="w-24 text-right h-8"
                        min={0}
                  />
            );
      }

      return (
            <Input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-40 h-8"
            />
      );
}
