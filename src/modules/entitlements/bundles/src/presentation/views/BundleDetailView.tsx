/**
 * Bundle Detail View
 *
 * Premium detail page for managing a bundle's permission rules and feature rules.
 * Uses PICKER-based UI — users select from existing permissions/features,
 * never type codes manually.
 */
"use client";

import { useState, useMemo } from "react";
import { useBundleDetailViewModel } from "../viewmodels/useBundleDetailViewModel";
import type { PermissionItem } from "../viewmodels/useBundleDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Checkbox } from "@core/ui/checkbox";
import {
      ArrowLeft, ShieldCheck, ShieldX, Zap, Trash2, Loader2,
      Package, Lock, Search, Plus, Save, Undo2
} from "lucide-react";
import Link from "next/link";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";

interface BundleDetailViewProps {
      bundleId: string;
}

export function BundleDetailView({ bundleId }: BundleDetailViewProps) {
      const { t, language } = useI18n();
      const vm = useBundleDetailViewModel(bundleId);
      const [permSearch, setPermSearch] = useState("");
      const [featSearch, setFeatSearch] = useState("");
      const [selectedFeatureToAdd, setSelectedFeatureToAdd] = useState("");
      const [featureValueToAdd, setFeatureValueToAdd] = useState("");

      // ── Group permissions by category ──
      const permissionsByCategory = useMemo(() => {
            const filtered = vm.allPermissions.filter(p => {
                  if (!permSearch) return true;
                  const q = permSearch.toLowerCase();
                  return (
                        p.code.toLowerCase().includes(q) ||
                        (p.nameEn?.toLowerCase().includes(q)) ||
                        (p.nameAr?.toLowerCase().includes(q)) ||
                        (p.category?.toLowerCase().includes(q))
                  );
            });

            const grouped = new Map<string, PermissionItem[]>();
            for (const perm of filtered) {
                  const cat = perm.category || "General";
                  if (!grouped.has(cat)) grouped.set(cat, []);
                  grouped.get(cat)!.push(perm);
            }

            // Sort categories, then sort permissions within each category
            const sorted = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
            for (const [, perms] of sorted) {
                  perms.sort((a, b) => a.displayOrder - b.displayOrder);
            }
            return sorted;
      }, [vm.allPermissions, permSearch]);

      // ── Filter features not yet assigned ──
      const availableFeatures = useMemo(() => {
            return vm.allFeatures.filter(f => {
                  if (vm.assignedFeatNames.has(f.name)) return false;
                  if (!featSearch) return true;
                  const q = featSearch.toLowerCase();
                  return (
                        f.name.toLowerCase().includes(q) ||
                        (f.displayNameEn?.toLowerCase().includes(q)) ||
                        (f.displayNameAr?.toLowerCase().includes(q))
                  );
            });
      }, [vm.allFeatures, vm.assignedFeatNames, featSearch]);

      const handleAddFeature = () => {
            if (!selectedFeatureToAdd || !featureValueToAdd.trim()) return;
            vm.addFeatureRule(selectedFeatureToAdd, featureValueToAdd.trim());
            setSelectedFeatureToAdd("");
            setFeatureValueToAdd("");
      };

      // ── Loading state ──
      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      if (vm.error || !vm.bundle) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <p className="text-muted-foreground">{t("entitlements.bundles.notFound") || "Bundle not found"}</p>
                        <Link href="/entitlements/bundles">
                              <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                    {t("common.back") || "Back"}
                              </Button>
                        </Link>
                  </div>
            );
      }

      const bundle = vm.bundle;
      const isReadOnly = bundle.isSystem;
      const displayName = bundle.getDisplayName(language);

      return (
            <div className="space-y-6">
                  {/* ── Header ── */}
                  <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                              <Link href="/entitlements/bundles">
                                    <Button variant="ghost" size="icon">
                                          <ArrowLeft className="h-5 w-5" />
                                    </Button>
                              </Link>
                              <div>
                                    <div className="flex items-center gap-3">
                                          <Package className="h-6 w-6 text-primary" />
                                          <h1 className="text-2xl font-bold">{displayName}</h1>
                                          {isReadOnly && (
                                                <Badge variant="secondary" className="gap-1">
                                                      <Lock className="h-3 w-3" />
                                                      {t("entitlements.bundles.systemBadge") || "System"}
                                                </Badge>
                                          )}
                                    </div>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                          {bundle.name}
                                          {bundle.description && ` — ${bundle.description}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="outline">{bundle.scope}</Badge>
                                          <Badge variant="secondary" className="gap-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                {vm.pendingPermissions.length} {t("entitlements.bundles.permissions") || "permissions"}
                                          </Badge>
                                          <Badge variant="secondary" className="gap-1">
                                                <Zap className="h-3 w-3" />
                                                {vm.pendingFeatures.length} {t("entitlements.bundles.features") || "features"}
                                          </Badge>
                                          {vm.isDirty && (
                                                <Badge variant="outline" className="text-amber-600 border-amber-500/30">
                                                      {t("common.unsavedChanges") || "Unsaved changes"}
                                                </Badge>
                                          )}
                                    </div>
                              </div>
                        </div>
                        <div className="flex items-center gap-2">
                              {vm.isDirty && !isReadOnly && (
                                    <>
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={vm.discard}
                                                disabled={vm.isSaving}
                                                className="gap-1"
                                          >
                                                <Undo2 className="h-4 w-4" />
                                                {t("common.discard") || "Discard"}
                                          </Button>
                                          <Button
                                                size="sm"
                                                onClick={vm.save}
                                                disabled={vm.isSaving}
                                                className="gap-1 gradient-primary"
                                          >
                                                {vm.isSaving ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                      <Save className="h-4 w-4" />
                                                )}
                                                {t("common.save") || "Save"}
                                          </Button>
                                    </>
                              )}
                              {vm.isSaving && (
                                    <Badge variant="outline" className="gap-1 animate-pulse">
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                          {t("common.saving") || "Saving..."}
                                    </Badge>
                              )}
                        </div>
                  </div>

                  {isReadOnly && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
                              {t("entitlements.bundles.systemReadOnly") || "This is a system bundle and cannot be modified."}
                        </div>
                  )}

                  {/* ── Tabs ── */}
                  <Tabs defaultValue="permissions" className="space-y-4">
                        <TabsList>
                              <TabsTrigger value="permissions" className="gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    {t("entitlements.bundles.permissionRules") || "Permission Rules"}
                                    <Badge variant="secondary" className="text-xs">{vm.pendingPermissions.length}</Badge>
                              </TabsTrigger>
                              <TabsTrigger value="features" className="gap-2">
                                    <Zap className="h-4 w-4" />
                                    {t("entitlements.bundles.featureRules") || "Feature Rules"}
                                    <Badge variant="secondary" className="text-xs">{vm.pendingFeatures.length}</Badge>
                              </TabsTrigger>
                        </TabsList>

                        {/* ══════════════════════════════════════════
                            PERMISSION RULES TAB — Checkbox Picker 
                            ══════════════════════════════════════════ */}
                        <TabsContent value="permissions" className="space-y-4">
                              <Card>
                                    <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                                <ShieldCheck className="h-5 w-5 text-primary" />
                                                {t("entitlements.bundles.permissionRules") || "Permission Rules"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("entitlements.bundles.permissionRulesDesc") || "Select which permissions are granted when this bundle is applied."}
                                          </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          {/* Search */}
                                          <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                      value={permSearch}
                                                      onChange={(e) => setPermSearch(e.target.value)}
                                                      placeholder={t("entitlements.bundles.searchPermissions") || "Search permissions..."}
                                                      className="pl-9"
                                                />
                                          </div>

                                          {vm.isLoadingPickers ? (
                                                <div className="flex items-center justify-center py-8">
                                                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                          ) : permissionsByCategory.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                      {t("entitlements.bundles.noPermissionsFound") || "No permissions found."}
                                                </div>
                                          ) : (
                                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                                      {permissionsByCategory.map(([category, perms]) => (
                                                            <div key={category} className="space-y-2">
                                                                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-1">
                                                                        {category}
                                                                  </h4>
                                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                                                        {perms.map((perm) => {
                                                                              const isAssigned = vm.assignedPermCodes.has(perm.code);
                                                                              const permName = language === "ar"
                                                                                    ? (perm.nameAr || perm.code)
                                                                                    : (perm.nameEn || perm.code);

                                                                              return (
                                                                                    <label
                                                                                          key={perm.code}
                                                                                          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isReadOnly ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50"
                                                                                                } ${isAssigned ? "bg-primary/5 border border-primary/20" : ""}`}
                                                                                    >
                                                                                          <Checkbox
                                                                                                checked={isAssigned}
                                                                                                onCheckedChange={() => {
                                                                                                      if (isReadOnly) return;
                                                                                                      vm.togglePermission(perm.code, "grant");
                                                                                                }}
                                                                                                disabled={isReadOnly || vm.isSaving}
                                                                                          />
                                                                                          <div className="flex-1 min-w-0">
                                                                                                <div className="text-sm font-medium truncate">
                                                                                                      {permName}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground font-mono truncate">
                                                                                                      {perm.code}
                                                                                                </div>
                                                                                          </div>
                                                                                          {isAssigned && (
                                                                                                <Badge variant="default" className="text-xs shrink-0">
                                                                                                      {t("entitlements.bundles.grant") || "Grant"}
                                                                                                </Badge>
                                                                                          )}
                                                                                    </label>
                                                                              );
                                                                        })}
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </TabsContent>

                        {/* ══════════════════════════════════════════
                            FEATURE RULES TAB — Dropdown Picker
                            ══════════════════════════════════════════ */}
                        <TabsContent value="features" className="space-y-4">
                              <Card>
                                    <CardHeader>
                                          <CardTitle className="text-lg flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-primary" />
                                                {t("entitlements.bundles.featureRules") || "Feature Rules"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("entitlements.bundles.featureRulesDesc") || "Select features and set their values for this bundle."}
                                          </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          {/* Add feature picker */}
                                          {!isReadOnly && (
                                                <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                                                      <Select value={selectedFeatureToAdd} onValueChange={setSelectedFeatureToAdd}>
                                                            <SelectTrigger className="flex-1">
                                                                  <SelectValue placeholder={t("entitlements.bundles.selectFeature") || "Select a feature..."} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                  {availableFeatures.map(f => {
                                                                        const label = language === "ar"
                                                                              ? (f.displayNameAr || f.name)
                                                                              : (f.displayNameEn || f.name);
                                                                        return (
                                                                              <SelectItem key={f.name} value={f.name}>
                                                                                    <span className="flex items-center gap-2">
                                                                                          <span>{label}</span>
                                                                                          <span className="text-xs text-muted-foreground font-mono">({f.name})</span>
                                                                                    </span>
                                                                              </SelectItem>
                                                                        );
                                                                  })}
                                                            </SelectContent>
                                                      </Select>
                                                      <Input
                                                            value={featureValueToAdd}
                                                            onChange={(e) => setFeatureValueToAdd(e.target.value)}
                                                            placeholder={t("entitlements.bundles.featValuePlaceholder") || "Value (true/false/100)"}
                                                            className="w-[180px]"
                                                            onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                                                      />
                                                      <Button onClick={handleAddFeature} size="sm" disabled={!selectedFeatureToAdd || !featureValueToAdd.trim() || vm.isSaving}>
                                                            <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                                                            {t("common.add") || "Add"}
                                                      </Button>
                                                </div>
                                          )}

                                          {/* Current feature rules — from LOCAL pending state */}
                                          {vm.pendingFeatures.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                      {t("entitlements.bundles.noFeatRules") || "No feature rules defined yet."}
                                                </div>
                                          ) : (
                                                <div className="divide-y rounded-lg border">
                                                      {vm.pendingFeatures.map((rule) => {
                                                            const feat = vm.allFeatures.find(f => f.name === rule.featureName);
                                                            const featLabel = feat
                                                                  ? (language === "ar" ? (feat.displayNameAr || feat.name) : (feat.displayNameEn || feat.name))
                                                                  : rule.featureName;

                                                            return (
                                                                  <div
                                                                        key={rule.featureName}
                                                                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                                                                  >
                                                                        <div className="flex items-center gap-3">
                                                                              <Zap className="h-4 w-4 text-amber-500" />
                                                                              <div>
                                                                                    <div className="text-sm font-medium">{featLabel}</div>
                                                                                    <div className="text-xs text-muted-foreground font-mono">{rule.featureName}</div>
                                                                              </div>
                                                                              <span className="text-muted-foreground">=</span>
                                                                              <Badge variant={
                                                                                    rule.value === "true" ? "default" :
                                                                                          rule.value === "false" ? "destructive" : "secondary"
                                                                              }>
                                                                                    {rule.value}
                                                                              </Badge>
                                                                        </div>
                                                                        {!isReadOnly && (
                                                                              <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                                                    onClick={() => vm.removeFeatureRule(rule.featureName)}
                                                                                    disabled={vm.isSaving}
                                                                              >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                              </Button>
                                                                        )}
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          )}
                                    </CardContent>
                              </Card>
                        </TabsContent>
                  </Tabs>
            </div>
      );
}
