/**
 * FeatureCatalogPicker — Dialog for adding features from the catalog to a plan.
 *
 * Shows unassigned features grouped by category with search filtering.
 * Uses a Dialog from @core/ui.
 */
"use client";

import { useState, useMemo } from "react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Zap, Search, Plus } from "lucide-react";
import type { TenantFeatureDefinition } from "../../../domain/entities/TenantPlan";

interface FeatureCatalogPickerProps {
  availableFeatures: TenantFeatureDefinition[];
  onSelect: (feature: TenantFeatureDefinition) => void;
  onClose: () => void;
  t: (key: string) => string;
  language: string;
}

export function FeatureCatalogPicker({
  availableFeatures,
  onSelect,
  onClose,
  t,
  language,
}: FeatureCatalogPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return availableFeatures;
    const q = search.toLowerCase();
    return availableFeatures.filter(
      (f) =>
        f.key.toLowerCase().includes(q) ||
        f.displayNameEn.toLowerCase().includes(q) ||
        f.displayNameAr.toLowerCase().includes(q) ||
        (f.category ?? "").toLowerCase().includes(q),
    );
  }, [availableFeatures, search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, TenantFeatureDefinition[]> = {};
    for (const f of filtered) {
      const cat = f.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    }
    return groups;
  }, [filtered]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
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
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("entitlements.featureDefinitions.searchPlaceholder") || "Search features..."}
            className="ps-9"
          />
        </div>

        {/* ── Feature List ── */}
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("common.noResults") || "No features found."}
            </div>
          ) : (
            Object.entries(grouped).map(([category, features]) => (
              <div key={category} className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {category}
                </p>
                <div className="space-y-1">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => onSelect(feature)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-accent/60 transition-colors text-start"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {language === "ar" ? feature.displayNameAr : feature.displayNameEn}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {feature.valueType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{feature.key}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
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
