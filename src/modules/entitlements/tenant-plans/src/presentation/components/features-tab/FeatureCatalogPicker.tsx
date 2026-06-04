/**
 * FeatureCatalogPicker — Dialog for adding features from the catalog to a plan.
 *
 * Shows unassigned features grouped by category with search filtering.
 * Groups come pre-structured from the backend via the viewmodel — zero client-side groupBy.
 * Only search filtering is done client-side (it's a UI filter, not a grouping operation).
 */
"use client";

import { useState } from "react";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
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
            <Zap className="h-5 w-5 text-primary" />
            {t("entitlements.featureDefinitions.pickFeature") || "Add Feature from Catalog"}
          </DialogTitle>
          <DialogDescription>
            {t("entitlements.featureDefinitions.pickFeatureDesc") ||
              "Select a feature to add to this plan. You can set its value after adding."}
          </DialogDescription>
        </DialogHeader>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              t("entitlements.featureDefinitions.searchPlaceholder") || "Search features..."
            }
            className="ps-9"
          />
        </div>

        {/* ── Feature List (backend-grouped — no client-side groupBy) ── */}
        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {isEmpty ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("common.noResults") || "No features found."}
            </div>
          ) : (
            filteredGroups.map(({ category, definitions }) => (
              <div key={category} className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                <div className="space-y-1">
                  {definitions.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => onSelect(feature)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-start transition-colors hover:bg-accent/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {language === "ar" ? feature.displayNameAr : feature.displayNameEn}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {feature.valueType}
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{feature.key}</p>
                      </div>
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
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
