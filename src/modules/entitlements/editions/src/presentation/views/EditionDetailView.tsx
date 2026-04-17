/**
 * Edition Detail View — Complete Redesign
 *
 * Modern, clean layout with:
 * - Clean header with edition info
 * - Tab navigation: Features | Pricing | Versions
 * - Collapsible feature modules
 * - Overflow policy card
 * - Version history section
 * - Sticky bottom action bar (appears when changes are pending)
 */
"use client";

import { useMemo, useState } from "react";
import { useEditionDetailViewModel } from "../viewmodels/useEditionDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import {
      ArrowLeft, Loader2, Undo2, ChevronDown, ChevronRight,
      Zap, ChevronsUpDown, GitBranch, Bolt, Shield, DollarSign, Tag,
} from "lucide-react";
import Link from "next/link";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";
import { VersionsTab } from "../components/VersionsTab";
import { PricingTab } from "../components/PricingTab";
import { PromotionsTab } from "../components/PromotionsTab";
import { useModuleLocales } from "@core/hooks/use-module-locales";

interface EditionDetailViewProps {
      editionId: string;
}

export function EditionDetailView({ editionId }: EditionDetailViewProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
      const { t, language, direction } = useI18n();
      const vm = useEditionDetailViewModel(editionId);

      // ── Tabs ──
      const [activeTab, setActiveTab] = useState<"features" | "pricing" | "versions" | "promotions">("features");

      // ── Dialogs ──
      const [showVersionDialog, setShowVersionDialog] = useState(false);
      const [versionNotes, setVersionNotes] = useState("");
      const [showDirectApplyDialog, setShowDirectApplyDialog] = useState(false);

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
            for (const mod of Object.keys(grouped)) {
                  for (const cat of Object.keys(grouped[mod])) {
                        grouped[mod][cat].sort((a, b) => a.sortOrder - b.sortOrder);
                  }
            }
            return grouped;
      }, [vm.features]);

      // ── Count modified features ──
      const modifiedCount = useMemo(() => {
            if (!vm.edition || !vm.features) return 0;
            let count = 0;
            for (const feature of vm.features) {
                  const effectiveVal = vm.getEffectiveValue(feature);
                  const serverFeature = vm.edition.features.find(ef => ef.featureName === feature.name);
                  const serverVal = serverFeature?.value ?? getFeatureDisabledDefault(feature.valueType);
                  if (effectiveVal !== serverVal) count++;
            }
            if (vm.overflowPolicyChanged) count++;
            return count;
      }, [vm]);

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
                                    <ArrowLeft className="h-4 w-4 me-2" />
                                    {t("common.back")}
                              </Button>
                        </Link>
                  </div>
            );
      }

      const edition = vm.edition;
      const isBusy = vm.isCreatingVersion || vm.isDirectApplying;

      // ── Handlers ──
      const handleCreateVersion = () => {
            vm.createVersionWithChanges(versionNotes || undefined);
            setShowVersionDialog(false);
            setVersionNotes("");
      };

      const handleDirectApply = () => {
            vm.directApplyChanges();
            setShowDirectApplyDialog(false);
      };

      return (
            <div className="space-y-6 pb-24">
                  {/* ─────── HEADER ─────── */}
                  <div className="flex items-start gap-3">
                        <Link href="/entitlements/editions">
                              <Button variant="ghost" size="icon" className="mt-1 shrink-0">
                                    <ArrowLeft className="h-5 w-5" />
                              </Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                              <h1 className="text-2xl font-bold tracking-tight">
                                    {edition.getDisplayName(language)}
                              </h1>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                    {edition.description || t("entitlements.editions.manageFeaturesDescription")}
                              </p>
                        </div>
                  </div>

                  {/* ─────── TAB NAVIGATION ─────── */}
                  <div className="flex items-center gap-1 border-b">
                        {([
                              { id: "features" as const, label: t("entitlements.features.title") || "Features", icon: <Zap className="h-3.5 w-3.5" /> },
                              { id: "pricing" as const, label: t("entitlements.pricing.title") || "Pricing", icon: <DollarSign className="h-3.5 w-3.5" /> },
                              { id: "promotions" as const, label: t("entitlements.promotions.title") || "Promotions", icon: <Tag className="h-3.5 w-3.5" /> },
                              { id: "versions" as const, label: t("entitlements.editions.versions.title") || "Versions", icon: <GitBranch className="h-3.5 w-3.5" /> },
                        ]).map((tab) => (
                              <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
                                          ? "border-primary text-primary"
                                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                          }`}
                              >
                                    {tab.icon}
                                    {tab.label}
                              </button>
                        ))}
                  </div>

                  {/* ─────── TAB CONTENT ─────── */}
                  {activeTab === "pricing" && (
                        <PricingTab
                              editionId={editionId}
                              allowMonthly={edition.allowMonthly}
                              allowYearly={edition.allowYearly}
                              allowLifetime={edition.allowLifetime}
                        />
                  )}

                  {activeTab === "promotions" && (
                        <PromotionsTab
                              editionId={editionId}
                              allowMonthly={edition.allowMonthly}
                              allowYearly={edition.allowYearly}
                              allowLifetime={edition.allowLifetime}
                        />
                  )}

                  {activeTab === "versions" && (
                        <VersionsTab editionId={editionId} />
                  )}

                  {activeTab === "features" && (
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
                                                      {vm.overflowPolicyChanged && (
                                                            <Badge variant="outline" className="text-[10px] h-4 text-amber-600 border-amber-500/30 bg-amber-500/5">
                                                                  {t("common.modified") || "Modified"}
                                                            </Badge>
                                                      )}
                                                </div>
                                          </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 pb-4">
                                          <Select
                                                value={vm.overflowPolicy}
                                                onValueChange={vm.setOverflowPolicy}
                                          >
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
                                          <p className="text-xs text-muted-foreground mt-2">
                                                {t(`entitlements.editions.overflowPolicyHints.${vm.overflowPolicy}`)}
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
                                          <ChevronsUpDown className="h-4 w-4 me-1" />
                                          {Object.values(vm.collapsedModules).every(v => v)
                                                ? (t("common.expandAll") || "Expand All")
                                                : (t("common.collapseAll") || "Collapse All")}
                                    </Button>
                              </div>

                              {/* ─────── FEATURE MODULE CARDS ─────── */}
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
                                                                        <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                                                                  ) : (
                                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                  )}
                                                                  <CardTitle className="text-base">{moduleName}</CardTitle>
                                                            </div>
                                                            <Badge variant="outline">{enabledCount}/{allFeatures.length}</Badge>
                                                      </div>
                                                </CardHeader>

                                                {!isCollapsed && (
                                                      <CardContent className="pt-0">
                                                            {Object.entries(categories).map(([categoryName, features]) => (
                                                                  <div key={categoryName}>
                                                                        {Object.keys(categories).length > 1 && (
                                                                              <div className="flex items-center gap-2 py-2 mt-2 border-b border-dashed">
                                                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                                          {categoryName}
                                                                                    </span>
                                                                                    <Badge variant="secondary" className="text-[10px] h-4">
                                                                                          {features.length}
                                                                                    </Badge>
                                                                              </div>
                                                                        )}
                                                                        <div className="divide-y">
                                                                              {features.map(feature => {
                                                                                    const value = vm.getEffectiveValue(feature);
                                                                                    const serverFeature = edition.features.find(ef => ef.featureName === feature.name);
                                                                                    const isModified = serverFeature
                                                                                          ? serverFeature.value !== value
                                                                                          : value !== getFeatureDisabledDefault(feature.valueType);

                                                                                    return (
                                                                                          <div key={feature.id} className="flex items-center justify-between py-3 gap-4">
                                                                                                <div className="space-y-0.5 flex-1 min-w-0">
                                                                                                      <div className="flex items-center gap-2">
                                                                                                            <span className="font-medium text-sm">
                                                                                                                  {feature.getDisplayName(language)}
                                                                                                            </span>
                                                                                                            {isModified && (
                                                                                                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" title={t("common.modified") || "Modified"} />
                                                                                                            )}
                                                                                                      </div>
                                                                                                      <p className="text-xs text-muted-foreground font-mono">{feature.name}</p>
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

                        </> /* end features tab */
                  )}

                  {/* ═══════ STICKY BOTTOM ACTION BAR ═══════ */}
                  {vm.hasUnsavedChanges && (
                        <div className="fixed bottom-0 inset-x-0 z-50">
                              <div className="border-t bg-background/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
                                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3">
                                          <div className="flex items-center justify-between gap-4">
                                                {/* Left: change indicator */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                                      <div className="min-w-0">
                                                            <p className="text-sm font-medium">
                                                                  {t("entitlements.editions.pendingChanges")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}
                                                            </p>
                                                      </div>
                                                </div>

                                                {/* Right: actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                      {/* Discard */}
                                                      <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={vm.discardChanges}
                                                            disabled={isBusy}
                                                      >
                                                            <Undo2 className="h-4 w-4 me-1" />
                                                            {t("common.discard")}
                                                      </Button>

                                                      {/* Apply Now (secondary) */}
                                                      <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowDirectApplyDialog(true)}
                                                            disabled={isBusy}
                                                      >
                                                            {vm.isDirectApplying ? (
                                                                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                                                            ) : (
                                                                  <Bolt className="h-4 w-4 me-1" />
                                                            )}
                                                            {t("entitlements.editions.directApply")}
                                                      </Button>

                                                      {/* Save as Version (primary) */}
                                                      <Button
                                                            size="sm"
                                                            onClick={() => setShowVersionDialog(true)}
                                                            disabled={isBusy}
                                                            className="gradient-primary"
                                                      >
                                                            {vm.isCreatingVersion ? (
                                                                  <Loader2 className="h-4 w-4 animate-spin me-1" />
                                                            ) : (
                                                                  <GitBranch className="h-4 w-4 me-1" />
                                                            )}
                                                            {t("entitlements.editions.saveAsVersion")}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* ═══════ SAVE AS VERSION DIALOG ═══════ */}
                  <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
                        <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                          <GitBranch className="h-5 w-5 text-primary" />
                                          {t("entitlements.editions.saveAsVersion")}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {t("entitlements.editions.saveAsVersionDesc")}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 py-2">
                                    <div className="space-y-1.5">
                                          <label className="text-sm font-medium">
                                                {t("entitlements.editions.versionNotesLabel")}
                                          </label>
                                          <Textarea
                                                placeholder={t("entitlements.editions.versions.changeNotesPlaceholder")}
                                                value={versionNotes}
                                                onChange={(e) => setVersionNotes(e.target.value)}
                                                className="min-h-[80px] resize-none"
                                          />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
                                          <Zap className="h-3.5 w-3.5 shrink-0" />
                                          <span>{t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}</span>
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="ghost" onClick={() => setShowVersionDialog(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          onClick={handleCreateVersion}
                                          disabled={isBusy}
                                          className="gradient-primary"
                                    >
                                          {vm.isCreatingVersion && <Loader2 className="h-4 w-4 animate-spin me-1" />}
                                          <GitBranch className="h-4 w-4 me-1" />
                                          {t("entitlements.editions.createAndPublish")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* ═══════ DIRECT APPLY CONFIRMATION DIALOG ═══════ */}
                  <Dialog open={showDirectApplyDialog} onOpenChange={setShowDirectApplyDialog}>
                        <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                          <Bolt className="h-5 w-5" />
                                          {t("entitlements.editions.directApplyConfirmTitle")}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {t("entitlements.editions.directApplyConfirmDesc")}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-md p-2.5">
                                    <Bolt className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span>{t("entitlements.editions.pendingChangesCount", { count: modifiedCount })}</span>
                              </div>
                              <DialogFooter>
                                    <Button variant="ghost" onClick={() => setShowDirectApplyDialog(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={handleDirectApply}
                                          disabled={isBusy}
                                    >
                                          {vm.isDirectApplying && <Loader2 className="h-4 w-4 animate-spin me-1" />}
                                          <Bolt className="h-4 w-4 me-1" />
                                          {t("entitlements.editions.applyNow")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}

// ── Helpers ──
function getFeatureDisabledDefault(valueType: string): string {
      switch (valueType?.toLowerCase()) {
            case "boolean": return "false";
            case "numeric": return "0";
            default: return "";
      }
}

// ── Known enum features with allowed values ──
function getEnumFeatureOptions(t: (key: string) => string): Record<string, { value: string; label: string }[]> {
      return {
            "Identity.AdminPoolMode": [
                  { value: "shared", label: t("entitlements.features.sharedPool") || "Shared Pool" },
                  { value: "separate", label: t("entitlements.features.separatePool") || "Separate (Parent Independent)" },
                  { value: "per_child", label: t("entitlements.features.perChildPool") || "Per Child (No Pool)" },
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
                        <SelectTrigger className="w-44 h-8">
                              <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                              {enumOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
