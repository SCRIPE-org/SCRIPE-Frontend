/**
 * FeaturesTab — Interactive Feature Assignment Editor for TenantPlan Detail
 *
 * NOW USES LIFTED STATE from the viewmodel (passed via props).
 * This ensures state persists when the user switches tabs.
 *
 * Grouping comes 100% from the backend via useTenantPlanDetailViewModel:
 * - groupedByCategory: assigned features grouped by category (backend-structured)
 * - availableGrouped: unassigned active features grouped by category (backend-structured)
 *
 * ZERO client-side useMemo+reduce for grouping — backend does all of it.
 */
"use client";

import { useState, useCallback } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Save,
  CheckCircle2,
} from "lucide-react";
import type { TenantPlan, TenantFeatureDefinition, TenantFeatureDefinitionCategoryGroup } from "../../domain/entities/TenantPlan";
import { FeatureCatalogPicker } from "./features-tab/FeatureCatalogPicker";
import { FeatureRow } from "./features-tab/FeatureRow";
import Link from "next/link";

// ── Types from the viewmodel (passed as props) ──
interface AssignedFeatureItem {
  definition: TenantFeatureDefinition;
  value: string;
  overrideLabel?: string;
  isModified: boolean;
  isNew: boolean;
}

interface AssignedFeatureCategoryGroup {
  category: string;
  items: AssignedFeatureItem[];
}

interface FeaturesTabProps {
  plan: TenantPlan;
  /** Total count of active features (for badge: assigned/total) */
  totalActiveFeatureCount: number;
  /** Assigned features pre-grouped by category — backend-structured, zero client-side groupBy */
  groupedByCategory: AssignedFeatureCategoryGroup[];
  /** Unassigned active features pre-grouped by category — for FeatureCatalogPicker */
  availableGrouped: TenantFeatureDefinitionCategoryGroup[];
  /** Lifted state from viewmodel */
  localFeatures: Map<string, { value: string; overrideLabel?: string }>;
  setFeatureValue: (defId: string, value: string) => void;
  addFeature: (def: TenantFeatureDefinition) => void;
  removeFeature: (defId: string) => void;
  hasChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
  t: (key: string) => string;
  language: string;
}

export function FeaturesTab({
  plan,
  totalActiveFeatureCount,
  groupedByCategory,
  availableGrouped,
  setFeatureValue,
  addFeature,
  removeFeature,
  hasChanges,
  onSave,
  isSaving,
  t,
  language,
}: FeaturesTabProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showPicker, setShowPicker] = useState(false);

  // Total assigned count across all groups
  const assignedCount = groupedByCategory.reduce((sum, g) => sum + g.items.length, 0);

  // ── Handlers ──
  const handleAddFeature = useCallback(
    (def: TenantFeatureDefinition) => {
      addFeature(def);
      setShowPicker(false);
    },
    [addFeature]
  );

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const toggleAll = useCallback(() => {
    const allCollapsed = groupedByCategory.every((g) => collapsedCategories[g.category]);
    const newState: Record<string, boolean> = {};
    for (const g of groupedByCategory) {
      newState[g.category] = !allCollapsed;
    }
    setCollapsedCategories(newState);
  }, [collapsedCategories, groupedByCategory]);

  const allCollapsed =
    groupedByCategory.length > 0 && groupedByCategory.every((g) => collapsedCategories[g.category]);

  const hasAvailable = availableGrouped.some((g) => g.definitions.length > 0);

  // ── Empty Catalog State ──
  if (totalActiveFeatureCount === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Zap className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {t("entitlements.featureDefinitions.emptyCatalog") ||
              "No features defined yet. Create features in the Feature Catalog first."}
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href="/entitlements/tenant-feature-definitions">
              <Plus className="me-1 h-4 w-4" />
              {t("entitlements.featureDefinitions.goToCatalog") || "Go to Feature Catalog"}
            </Link>
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
            {assignedCount}/{totalActiveFeatureCount}
          </Badge>
          {hasChanges && (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/5 text-xs text-amber-600"
            >
              {t("common.unsavedChanges") || "Unsaved Changes"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {groupedByCategory.length > 1 && (
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              <ChevronsUpDown className="me-1 h-4 w-4" />
              {allCollapsed
                ? t("common.expandAll") || "Expand All"
                : t("common.collapseAll") || "Collapse All"}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/entitlements/tenant-feature-definitions">
              {t("entitlements.featureDefinitions.manageCatalog") || "Manage Catalog"}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
            disabled={!hasAvailable}
          >
            <Plus className="me-1 h-4 w-4" />
            {t("entitlements.featureDefinitions.addFeature") || "Add Feature"}
          </Button>
          <Button size="sm" onClick={onSave} disabled={!hasChanges} loading={isSaving}>
            {!isSaving && <Save className="me-1 h-4 w-4" />}
            {t("common.save") || "Save"}
          </Button>
        </div>
      </div>

      {/* ─────── FEATURE CATALOG PICKER DIALOG ─────── */}
      {showPicker && (
        <FeatureCatalogPicker
          availableGrouped={availableGrouped}
          onSelect={handleAddFeature}
          onClose={() => setShowPicker(false)}
          t={t}
          language={language}
        />
      )}

      {/* ─────── FEATURE GROUPS ─────── */}
      {groupedByCategory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.noFeatures") || "No features assigned to this plan yet."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("entitlements.tenantPlans.noFeaturesHint") ||
                "Click 'Add Feature' to assign features from your catalog."}
            </p>
          </CardContent>
        </Card>
      ) : (
        groupedByCategory.map(({ category, items }) => {
          const isCollapsed = collapsedCategories[category] ?? false;

          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer select-none py-3 transition-colors hover:bg-accent/50"
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
                    {items.map((item) => (
                      <FeatureRow
                        key={item.definition.id}
                        definition={item.definition}
                        value={item.value}
                        isModified={item.isModified}
                        isNew={item.isNew}
                        onValueChange={(v) => setFeatureValue(item.definition.id, v)}
                        onRemove={() => removeFeature(item.definition.id)}
                        language={language}
                        t={t}
                      />
                    ))}
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
