/**
 * FeaturesTab — Interactive Feature Assignment Editor for TenantPlan Detail
 *
 * Mirrors Edition's FeaturesTab with:
 * - Pull features from TenantFeatureDefinition catalog
 * - Boolean: Toggle Switch
 * - Numeric: Number Input
 * - String: Text Input
 * - Grouped by category with collapse/expand
 * - Change tracking with modified indicators
 * - Add/remove features from the catalog
 *
 * Stripe-ready: Feature assignments are the data layer that Stripe Connect
 * (Phase 10) will use to gate product access.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Zap, ChevronDown, ChevronRight, ChevronsUpDown, Plus, Trash2,
  Save, Loader2, CheckCircle2,
} from "lucide-react";
import type { TenantPlan, TenantPlanFeatureData, TenantFeatureDefinition } from "../../domain/entities/TenantPlan";
import type { UpsertTenantPlanFeatureRequest } from "../../domain/entities/TenantPlanRequests";
import { FeatureCatalogPicker } from "./features-tab/FeatureCatalogPicker";
import { FeatureControl } from "./features-tab/FeatureControl";
import { FeatureRow } from "./features-tab/FeatureRow";
import Link from "next/link";

interface FeaturesTabProps {
  plan: TenantPlan;
  featureCatalog: TenantFeatureDefinition[];
  onSaveFeatures: (features: UpsertTenantPlanFeatureRequest[]) => void;
  isSaving: boolean;
  t: (key: string) => string;
  language: string;
}

export function FeaturesTab({
  plan,
  featureCatalog,
  onSaveFeatures,
  isSaving,
  t,
  language,
}: FeaturesTabProps) {
  // ── Local state for editable feature list ──
  const [localFeatures, setLocalFeatures] = useState<Map<string, { value: string; overrideLabel?: string }>>(
    () => {
      const map = new Map<string, { value: string; overrideLabel?: string }>();
      for (const f of plan.features || []) {
        map.set(f.featureDefinitionId, {
          value: f.value,
          overrideLabel: f.overrideLabel,
        });
      }
      return map;
    },
  );

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);

  // ── Compute assigned feature IDs ──
  const assignedIds = useMemo(() => new Set(localFeatures.keys()), [localFeatures]);

  // ── Available (unassigned) features from catalog ──
  const availableFeatures = useMemo(
    () => featureCatalog.filter((f) => f.isActive && !assignedIds.has(f.id)),
    [featureCatalog, assignedIds],
  );

  // ── Assigned features enriched with catalog metadata ──
  const assignedFeatures = useMemo(() => {
    const catalogMap = new Map(featureCatalog.map((f) => [f.id, f]));
    const result: Array<{ definition: TenantFeatureDefinition; value: string; overrideLabel?: string }> = [];
    for (const [defId, data] of localFeatures) {
      const def = catalogMap.get(defId);
      if (def) {
        result.push({ definition: def, ...data });
      }
    }
    result.sort((a, b) => a.definition.sortOrder - b.definition.sortOrder);
    return result;
  }, [localFeatures, featureCatalog]);

  // ── Group by category ──
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof assignedFeatures> = {};
    for (const item of assignedFeatures) {
      const cat = item.definition.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [assignedFeatures]);

  // ── Change tracking ──
  const hasChanges = useMemo(() => {
    const originalMap = new Map<string, string>();
    for (const f of plan.features || []) {
      originalMap.set(f.featureDefinitionId, f.value);
    }
    if (localFeatures.size !== originalMap.size) return true;
    for (const [id, data] of localFeatures) {
      if (!originalMap.has(id) || originalMap.get(id) !== data.value) return true;
    }
    return false;
  }, [localFeatures, plan.features]);

  // ── Handlers ──
  const setValue = useCallback((defId: string, value: string) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      const existing = next.get(defId);
      next.set(defId, { value, overrideLabel: existing?.overrideLabel });
      return next;
    });
  }, []);

  const addFeature = useCallback((def: TenantFeatureDefinition) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      next.set(def.id, { value: def.defaultValue || (def.isBoolean ? "false" : "0") });
      return next;
    });
    setShowPicker(false);
  }, []);

  const removeFeature = useCallback((defId: string) => {
    setLocalFeatures((prev) => {
      const next = new Map(prev);
      next.delete(defId);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    const features: UpsertTenantPlanFeatureRequest[] = [];
    for (const [defId, data] of localFeatures) {
      features.push({
        featureDefinitionId: defId,
        value: data.value,
        overrideLabel: data.overrideLabel,
      });
    }
    onSaveFeatures(features);
  }, [localFeatures, onSaveFeatures]);

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const toggleAll = useCallback(() => {
    const allCollapsed = Object.values(collapsedCategories).every((v) => v);
    const newState: Record<string, boolean> = {};
    for (const cat of Object.keys(groupedByCategory)) {
      newState[cat] = !allCollapsed;
    }
    setCollapsedCategories(newState);
  }, [collapsedCategories, groupedByCategory]);

  const categories = Object.keys(groupedByCategory);
  const allCollapsed = categories.length > 0 && categories.every((c) => collapsedCategories[c]);

  // ── Empty State ──
  if (featureCatalog.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {t("entitlements.featureDefinitions.emptyCatalog") ||
              "No features defined yet. Create features in the Feature Catalog first."}
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <a href="/entitlements/tenant-feature-definitions">
              <Plus className="h-4 w-4 me-1" />
              {t("entitlements.featureDefinitions.goToCatalog") || "Go to Feature Catalog"}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─────── TOOLBAR ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {t("entitlements.tenantPlans.tabFeatures") || "Features"}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {assignedFeatures.length}/{featureCatalog.filter((f) => f.isActive).length}
          </Badge>
          {hasChanges && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/5">
              {t("common.unsavedChanges") || "Unsaved Changes"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {categories.length > 1 && (
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              <ChevronsUpDown className="h-4 w-4 me-1" />
              {allCollapsed
                ? (t("common.expandAll") || "Expand All")
                : (t("common.collapseAll") || "Collapse All")}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/entitlements/tenant-feature-definitions">
              {t("entitlements.featureDefinitions.manageCatalog") || "Manage Catalog"}
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPicker(true)} disabled={availableFeatures.length === 0}>
            <Plus className="h-4 w-4 me-1" />
            {t("entitlements.featureDefinitions.addFeature") || "Add Feature"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin me-1" />
            ) : (
              <Save className="h-4 w-4 me-1" />
            )}
            {t("common.save") || "Save"}
          </Button>
        </div>
      </div>

      {/* ─────── FEATURE CATALOG PICKER DIALOG ─────── */}
      {showPicker && (
        <FeatureCatalogPicker
          availableFeatures={availableFeatures}
          onSelect={addFeature}
          onClose={() => setShowPicker(false)}
          t={t}
          language={language}
        />
      )}

      {/* ─────── FEATURE GROUPS ─────── */}
      {assignedFeatures.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.noFeatures") || "No features assigned to this plan yet."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("entitlements.tenantPlans.noFeaturesHint") ||
                "Click 'Add Feature' to assign features from your catalog."}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByCategory).map(([category, items]) => {
          const isCollapsed = collapsedCategories[category] ?? false;

          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer select-none hover:bg-accent/50 transition-colors py-3"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-base">{category}</CardTitle>
                  </div>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="pt-0">
                  <div className="divide-y">
                    {items.map((item) => {
                      // Track if this value was modified vs. the server state
                      const originalFeature = (plan.features || []).find(
                        (f) => f.featureDefinitionId === item.definition.id,
                      );
                      const isModified = originalFeature
                        ? originalFeature.value !== item.value
                        : true; // newly added = modified

                      return (
                        <FeatureRow
                          key={item.definition.id}
                          definition={item.definition}
                          value={item.value}
                          isModified={isModified}
                          isNew={!originalFeature}
                          onValueChange={(v) => setValue(item.definition.id, v)}
                          onRemove={() => removeFeature(item.definition.id)}
                          language={language}
                          t={t}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
