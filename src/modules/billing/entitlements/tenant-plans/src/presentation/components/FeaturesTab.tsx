/* eslint-disable unused-imports/no-unused-vars */
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
import { EmptyState } from "@core/ui/empty-state";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Save,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@core/common/utils";
import type {
  TenantPlan,
  TenantFeatureDefinition,
  TenantFeatureDefinitionCategoryGroup,
} from "../../domain/entities/TenantPlan";
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

/**
 * Presentation UI component rendering the features tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
        <CardContent>
          <EmptyState
            bare
            icon={Zap}
            title={t("entitlements.featureDefinitions.emptyCatalog")}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/entitlements/tenant-feature-definitions">
                  <Plus className="me-1 h-4 w-4" aria-hidden="true" />
                  {t("entitlements.featureDefinitions.goToCatalog")}
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ─────── TOOLBAR ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-nx-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{t("entitlements.tenantPlans.tabFeatures")}</h2>
          <Badge variant="secondary" className="text-xs">
            {assignedCount}/{totalActiveFeatureCount}
          </Badge>
          {hasChanges && (
            <Badge variant="warning" className="text-xs">
              {t("common.unsavedChanges")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {groupedByCategory.length > 1 && (
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              <ChevronsUpDown className="me-1 h-4 w-4" aria-hidden="true" />
              {allCollapsed ? t("common.expandAll") : t("common.collapseAll")}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/entitlements/tenant-feature-definitions">
              {t("entitlements.featureDefinitions.manageCatalog")}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
            disabled={!hasAvailable}
          >
            <Plus className="me-1 h-4 w-4" aria-hidden="true" />
            {t("entitlements.featureDefinitions.addFeature")}
          </Button>
          <Button size="sm" onClick={onSave} disabled={!hasChanges} loading={isSaving}>
            {!isSaving && <Save className="me-1 h-4 w-4" aria-hidden="true" />}
            {t("common.save")}
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
          <CardContent>
            <EmptyState
              bare
              icon={CheckCircle2}
              title={t("entitlements.tenantPlans.noFeatures")}
              description={t("entitlements.tenantPlans.noFeaturesHint")}
            />
          </CardContent>
        </Card>
      ) : (
        groupedByCategory.map(({ category, items }) => {
          const isCollapsed = collapsedCategories[category] ?? false;

          return (
            <Card key={category} className="overflow-hidden">
              <CardHeader className="py-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleCategory(category)}
                  aria-expanded={!isCollapsed}
                  className={cn(
                    "flex h-auto w-full items-center justify-between gap-2 p-0 rounded-nx-sm text-start hover:bg-transparent",
                    "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-nx-ink-3 rtl:rotate-180"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
                    )}
                    <CardTitle className="text-base">{category}</CardTitle>
                  </div>
                  <Badge variant="outline">{items.length}</Badge>
                </Button>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="pt-0">
                  <div className="divide-y divide-nx-line">
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
