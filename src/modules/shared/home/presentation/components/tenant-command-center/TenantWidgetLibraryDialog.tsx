"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import {
  Search,
  Plus,
  Check,
  Sparkles,
  TrendingUp,
  Compass,
  AlertTriangle,
  Layers,
  Zap,
  PieChart,
  History,
  BarChart3,
  Bell,
  Headphones,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  TenantWidgetId,
  TenantWidgetCategory,
  TenantOverviewWidgetItem,
} from "./tenantCustomizationTypes";
import { TENANT_WIDGET_REGISTRY } from "./tenantWidgetRegistry";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  TrendingUp,
  Compass,
  AlertTriangle,
  Layers,
  Zap,
  PieChart,
  History,
  BarChart3,
  Bell,
  Headphones,
};

interface TenantWidgetLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidgets: TenantOverviewWidgetItem[];
  onAddWidget: (widgetId: TenantWidgetId) => void;
}

const CATEGORIES: { id: TenantWidgetCategory | "all"; label: string }[] = [
  { id: "all", label: "All Widgets" },
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "operations", label: "Operations" },
  { id: "productivity", label: "Productivity" },
  { id: "people", label: "People & Support" },
];

export function TenantWidgetLibraryDialog({
  isOpen,
  onClose,
  currentWidgets,
  onAddWidget,
}: TenantWidgetLibraryDialogProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TenantWidgetCategory | "all">("all");

  const existingWidgetIds = useMemo(
    () => new Set(currentWidgets.map((w) => w.widgetId)),
    [currentWidgets]
  );

  const filteredWidgets = useMemo(() => {
    return TENANT_WIDGET_REGISTRY.filter((def) => {
      // Category match
      if (selectedCategory !== "all" && def.category !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = (t(def.titleKey) || def.id).toLowerCase();
        const desc = (t(def.descriptionKey) || "").toLowerCase();
        return title.includes(query) || desc.includes(query);
      }

      return true;
    });
  }, [searchQuery, selectedCategory, t]);

  const handleAdd = (widgetId: TenantWidgetId) => {
    onAddWidget(widgetId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-bold">
            {t("tenantCommandCenter.library.title") || "Widget Library"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t("tenantCommandCenter.library.subtitle") ||
              "Select widgets to add to your organization overview workspace."}
          </p>
        </DialogHeader>

        {/* Search & Category Filter */}
        <div className="shrink-0 space-y-3 pt-2 pb-1">
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("tenantCommandCenter.library.searchPlaceholder") || "Search available widgets..."}
              className="h-9 ps-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-2">
          {filteredWidgets.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center p-6 text-center">
              <Search className="h-6 w-6 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">
                {t("tenantCommandCenter.library.noWidgetsFound") || "No widgets found"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t("tenantCommandCenter.library.tryAnotherSearch") ||
                  "Try adjusting your search terms or category filter."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredWidgets.map((def) => {
                const IconComponent = ICON_MAP[def.iconName] || Layers;
                const isAlreadyAdded = def.singleton && existingWidgetIds.has(def.id);
                const title = t(def.titleKey) || def.id;
                const desc = t(def.descriptionKey) || "";

                return (
                  <div
                    key={def.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 transition-all hover:border-border/80 hover:shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-tight">
                              {title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground capitalize">
                              {def.category}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                          {def.defaultColSpan === 12
                            ? "Full width"
                            : def.defaultColSpan === 8
                            ? "2/3 width"
                            : def.defaultColSpan === 6
                            ? "1/2 width"
                            : "1/3 width"}
                        </Badge>
                      </div>

                      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 mb-3">
                        {desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/70">
                        {def.singleton ? "Singleton widget" : "Customizable widget"}
                      </span>
                      {isAlreadyAdded ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled
                          className="h-7 gap-1 px-2.5 text-[11px] text-muted-foreground"
                        >
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>{t("tenantCommandCenter.library.alreadyAdded") || "Added"}</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAdd(def.id)}
                          className="h-7 gap-1 px-2.5 text-[11px] font-semibold"
                        >
                          <Plus className="h-3 w-3" />
                          <span>{t("tenantCommandCenter.library.addWidget") || "Add Widget"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
