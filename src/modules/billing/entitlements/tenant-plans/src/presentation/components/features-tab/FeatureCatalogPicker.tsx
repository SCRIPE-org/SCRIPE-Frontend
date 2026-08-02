// UI-EXCEPTION: compact studio layout
/**
 * FeatureCatalogPicker — Dialog for adding features from the catalog to a plan.
 *
 * Shows unassigned features grouped by category with search filtering.
 * Groups come pre-structured from the backend via the viewmodel — zero client-side groupBy.
 * Only search filtering is done client-side (it's a UI filter, not a grouping operation).
 */
"use client";

import { useState } from "react";
import { resolveBilingualLabel } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { EmptyState } from "@core/ui/empty-state";
import { Zap, Search, Plus } from "lucide-react";
import type {
  TenantFeatureDefinition,
  TenantFeatureDefinitionCategoryGroup,
} from "../../../domain/entities/TenantPlan";

interface FeatureCatalogPickerProps {
  /** Backend-pre-grouped available (unassigned) active feature definitions */
  availableGrouped: TenantFeatureDefinitionCategoryGroup[];
  onSelect: (feature: TenantFeatureDefinition) => void;
  onClose: () => void;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the feature catalog picker.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeatureCatalogPicker({
  availableGrouped,
  onSelect,
  onClose,
  t,
  language,
}: FeatureCatalogPickerProps) {
  const [search, setSearch] = useState("");

  // Client-side search filter only — group structure comes from the backend
  const filteredGroups = search.trim()
    ? availableGrouped
        .map((group) => ({
          ...group,
          definitions: group.definitions.filter((f) => {
            const q = search.toLowerCase();
            return (
              f.key.toLowerCase().includes(q) ||
              f.displayNameEn.toLowerCase().includes(q) ||
              f.displayNameAr.toLowerCase().includes(q) ||
              f.category.toLowerCase().includes(q)
            );
          }),
        }))
        .filter((g) => g.definitions.length > 0)
    : availableGrouped;

  const isEmpty = filteredGroups.length === 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="flex max-h-[70vh] max-w-lg flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {t("entitlements.featureDefinitions.pickFeature")}
          </DialogTitle>
          <DialogDescription>
            {t("entitlements.featureDefinitions.pickFeatureDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* ── Search ── */}
        <div className="relative">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("entitlements.featureDefinitions.searchPlaceholder")}
            className="ps-9"
          />
        </div>

        {/* ── Feature List (backend-grouped — no client-side groupBy) ── */}
        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {isEmpty ? (
            <EmptyState bare size="sm" title={t("common.noResults")} />
          ) : (
            filteredGroups.map(({ category, definitions }) => (
              <div key={category} className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                  {category}
                </p>
                <div className="space-y-1">
                  {definitions.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => onSelect(feature)}
                      className="flex w-full items-center justify-between rounded-nx-sm px-3 py-2.5 text-start transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {resolveBilingualLabel(feature.displayNameEn, feature.displayNameAr, language)}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {feature.valueType}
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-nx-ink-3">{feature.key}</p>
                      </div>
                      <Plus className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
