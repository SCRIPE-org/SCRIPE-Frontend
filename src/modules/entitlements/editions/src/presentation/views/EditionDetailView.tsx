/**
 * Edition Detail View
 *
 * Premium detail page with two tabs:
 * 1. Features — collapsible module sections with toggle/input controls
 * 2. Bundles — attach/detach bundles to this edition
 *
 * All features default to disabled/0 . When bundles are attached,
 * their features are reflected as sources.
 */
"use client";

import { useState, useMemo } from "react";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
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
      Package, Zap, Trash2, Plus, ChevronsUpDown
} from "lucide-react";
import Link from "next/link";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";

interface EditionDetailViewProps {
      editionId: string;
}

export function EditionDetailView({ editionId }: EditionDetailViewProps) {
      const { t, language } = useI18n();
      const vm = useEditionDetailViewModel(editionId);
      const [selectedBundleToAdd, setSelectedBundleToAdd] = useState("");

      // ── Group features by module ──
      const featuresByModule = useMemo(() => {
            if (!vm.features) return {};
            const grouped: Record<string, Feature[]> = {};
            for (const f of vm.features) {
                  const mod = f.module || "other";
                  if (!grouped[mod]) grouped[mod] = [];
                  grouped[mod].push(f);
            }
            // Sort features within each module by sortOrder
            for (const mod of Object.keys(grouped)) {
                  grouped[mod].sort((a, b) => a.sortOrder - b.sortOrder);
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
                                          {edition.description || t("entitlements.editions.manageFeaturesDescription") || "Manage features and bundles for this edition"}
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

                  {/* ── Tabs ── */}
                  <Tabs defaultValue="features" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-md">
                              <TabsTrigger value="features" className="gap-1">
                                    <Zap className="h-4 w-4" />
                                    {t("entitlements.features.title") || "Features"}
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                          {vm.features?.length || 0}
                                    </Badge>
                              </TabsTrigger>
                              <TabsTrigger value="bundles" className="gap-1">
                                    <Package className="h-4 w-4" />
                                    {t("entitlements.bundles.title") || "Bundles"}
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                          {vm.attachedBundles.length}
                                    </Badge>
                              </TabsTrigger>
                        </TabsList>

                        {/* ═══════ FEATURES TAB ═══════ */}
                        <TabsContent value="features" className="mt-4 space-y-4">
                              {/* Expand/Collapse all */}
                              <div className="flex justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                          const allCollapsed = Object.values(vm.collapsedModules).every(v => v);
                                          allCollapsed ? vm.expandAll() : vm.collapseAll();
                                    }}>
                                          <ChevronsUpDown className="h-4 w-4 mr-1" />
                                          {Object.values(vm.collapsedModules).every(v => v) ? (t("common.expandAll") || "Expand All") : (t("common.collapseAll") || "Collapse All")}
                                    </Button>
                              </div>

                              {Object.entries(featuresByModule).map(([moduleName, features]) => {
                                    const isCollapsed = vm.collapsedModules[moduleName] ?? true;
                                    const enabledCount = features.filter(f => {
                                          const val = vm.getEffectiveValue(f.id, f);
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
                                                                  {enabledCount}/{features.length}
                                                            </Badge>
                                                      </div>
                                                </CardHeader>

                                                {!isCollapsed && (
                                                      <CardContent className="pt-0 divide-y">
                                                            {features.map(feature => {
                                                                  const value = vm.getEffectiveValue(feature.id, feature);
                                                                  const serverFeature = edition.features.find(ef => ef.featureId === feature.id);
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
                                                                                          onChange={(v) => vm.setLocalValue(feature.id, v)}
                                                                                    />
                                                                              </div>
                                                                        </div>
                                                                  );
                                                            })}
                                                      </CardContent>
                                                )}
                                          </Card>
                                    );
                              })}
                        </TabsContent>

                        {/* ═══════ BUNDLES TAB ═══════ */}
                        <TabsContent value="bundles" className="mt-4 space-y-4">
                              {/* Add Bundle */}
                              <Card>
                                    <CardHeader className="py-3">
                                          <CardTitle className="text-base">{t("entitlements.editions.attachBundle") || "Attach Bundle"}</CardTitle>
                                          <CardDescription>{t("entitlements.editions.attachBundleDescription") || "Select a bundle to attach to this edition"}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex gap-2">
                                          <Select value={selectedBundleToAdd} onValueChange={setSelectedBundleToAdd}>
                                                <SelectTrigger className="flex-1">
                                                      <SelectValue placeholder={t("entitlements.editions.selectBundle") || "Select a bundle..."} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {vm.availableBundles.map(b => (
                                                            <SelectItem key={b.id} value={b.id}>
                                                                  {language === "ar"
                                                                        ? (b.displayNameAr || b.displayNameEn || b.name)
                                                                        : (b.displayNameEn || b.name)}
                                                            </SelectItem>
                                                      ))}
                                                      {vm.availableBundles.length === 0 && (
                                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                                  {t("entitlements.editions.allBundlesAttached") || "All bundles are already attached"}
                                                            </div>
                                                      )}
                                                </SelectContent>
                                          </Select>
                                          <Button
                                                onClick={() => {
                                                      if (selectedBundleToAdd) {
                                                            vm.attachBundle(selectedBundleToAdd);
                                                            setSelectedBundleToAdd("");
                                                      }
                                                }}
                                                disabled={!selectedBundleToAdd || vm.isAttaching}
                                                className="gap-1"
                                          >
                                                {vm.isAttaching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                {t("common.add") || "Add"}
                                          </Button>
                                    </CardContent>
                              </Card>

                              {/* Attached Bundles */}
                              {vm.attachedBundles.length === 0 ? (
                                    <Card>
                                          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                                                <Package className="h-8 w-8 mr-3 opacity-50" />
                                                <span>{t("entitlements.editions.noBundles") || "No bundles attached to this edition yet."}</span>
                                          </CardContent>
                                    </Card>
                              ) : (
                                    <div className="space-y-3">
                                          {vm.attachedBundles.map(bundle => (
                                                <Card key={bundle.bundleId}>
                                                      <CardContent className="flex items-center justify-between py-4">
                                                            <div className="space-y-1">
                                                                  <div className="font-medium">
                                                                        {language === "ar"
                                                                              ? (bundle.displayNameAr || bundle.displayNameEn || bundle.bundleName)
                                                                              : (bundle.displayNameEn || bundle.bundleName)}
                                                                  </div>
                                                                  <p className="text-xs text-muted-foreground font-mono">{bundle.bundleName}</p>
                                                                  {bundle.description && (
                                                                        <p className="text-sm text-muted-foreground">{bundle.description}</p>
                                                                  )}
                                                                  <div className="flex gap-2 mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                              {bundle.permissionRuleCount} {t("entitlements.permissions") || "permissions"}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="text-xs">
                                                                              {bundle.featureRuleCount} {t("entitlements.featureRules") || "feature rules"}
                                                                        </Badge>
                                                                  </div>
                                                            </div>
                                                            <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  className="text-destructive hover:text-destructive"
                                                                  onClick={() => vm.detachBundle(bundle.bundleId)}
                                                                  disabled={vm.isDetaching}
                                                            >
                                                                  {vm.isDetaching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                            </Button>
                                                      </CardContent>
                                                </Card>
                                          ))}
                                    </div>
                              )}
                        </TabsContent>
                  </Tabs>
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

// ── Feature Control Component ──
function FeatureControl({
      valueType,
      value,
      onChange,
}: {
      valueType: string;
      value: string;
      onChange: (value: string) => void;
}) {
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
