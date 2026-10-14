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
  CheckCircle2,
  Trash2,
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
  LayoutGrid,
  X,
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
  onRemoveWidget?: (widgetId: TenantWidgetId) => void;
}

type StatusFilter = "all" | "available" | "added";

const CATEGORIES: { id: TenantWidgetCategory | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
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
  onRemoveWidget,
}: TenantWidgetLibraryDialogProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TenantWidgetCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const existingWidgetIds = useMemo(
    () => new Set(currentWidgets.map((w) => w.widgetId)),
    [currentWidgets]
  );

  const totalCount = TENANT_WIDGET_REGISTRY.length;
  const addedCount = existingWidgetIds.size;
  const availableCount = Math.max(0, totalCount - addedCount);

  const filteredWidgets = useMemo(() => {
    return TENANT_WIDGET_REGISTRY.filter((def) => {
      const isAdded = def.singleton && existingWidgetIds.has(def.id);

      // Status filter
      if (statusFilter === "available" && isAdded) return false;
      if (statusFilter === "added" && !isAdded) return false;

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
    }).sort((a, b) => {
      // In "all" mode, sort available widgets first so users easily discover what to add
      if (statusFilter === "all") {
        const aAdded = existingWidgetIds.has(a.id);
        const bAdded = existingWidgetIds.has(b.id);
        if (aAdded !== bAdded) return aAdded ? 1 : -1;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, statusFilter, existingWidgetIds, t]);

  const handleAdd = (widgetId: TenantWidgetId) => {
    onAddWidget(widgetId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-h-[88vh] flex flex-col p-6 gap-4">
        {/* Header with Title and Quick Stats */}
        <DialogHeader className="shrink-0 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span>{t("tenantCommandCenter.library.title") || "Widget Library"}</span>
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("tenantCommandCenter.library.subtitle") ||
                  "Select widgets to add to your organization overview workspace."}
              </p>
            </div>

            {/* Visual Workspace Stats Counters */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{addedCount} {t("tenantCommandCenter.library.alreadyAdded") || "Added"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Plus className="h-3.5 w-3.5" />
                <span>{availableCount} {t("tenantCommandCenter.library.readyToAdd") || "Available"}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Filter Controls */}
        <div className="shrink-0 space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("tenantCommandCenter.library.searchPlaceholder") || "Search available widgets..."}
              className="h-9 ps-9 pe-8 text-xs bg-muted/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Segmented Status Tabs (All vs Available vs In Dashboard) */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{t("tenantCommandCenter.library.allWidgets") || "All Widgets"}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "available"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("tenantCommandCenter.library.readyToAdd") || "Available to Add"}</span>
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full font-bold ${
                  statusFilter === "available"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {availableCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("added")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === "added"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t("tenantCommandCenter.library.inDashboard") || "In Dashboard"}</span>
              <span
                className={`text-[10px] px-1.5 py-0 rounded-full font-bold ${
                  statusFilter === "added"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-500/15 text-emerald-400"
                }`}
              >
                {addedCount}
              </span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-secondary text-secondary-foreground border border-secondary-foreground/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-1">
          {filteredWidgets.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredWidgets.map((def) => {
                const IconComponent = ICON_MAP[def.iconName] || Layers;
                const isAlreadyAdded = def.singleton && existingWidgetIds.has(def.id);
                const title = t(def.titleKey) || def.id;
                const desc = t(def.descriptionKey) || "";

                const widthLabel =
                  def.defaultColSpan === 12
                    ? "Full width"
                    : def.defaultColSpan === 8
                    ? "2/3 width"
                    : def.defaultColSpan === 6
                    ? "1/2 width"
                    : "1/3 width";

                // Visual State 1: ALREADY ADDED TO DASHBOARD
                if (isAlreadyAdded) {
                  return (
                    <div
                      key={def.id}
                      className="flex flex-col justify-between rounded-xl border border-emerald-500/35 bg-emerald-950/10 dark:bg-emerald-950/25 p-3.5 transition-all shadow-xs ring-1 ring-emerald-500/20 relative"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shrink-0">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground leading-tight flex items-center gap-1.5">
                                <span>{title}</span>
                              </h4>
                              <span className="text-[10px] text-emerald-400/80 font-medium capitalize">
                                {def.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 text-muted-foreground border-border/40 font-normal"
                            >
                              {widthLabel}
                            </Badge>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>{t("tenantCommandCenter.library.alreadyAdded") || "Added"}</span>
                            </Badge>
                          </div>
                        </div>

                        <p className="text-[11px] leading-relaxed text-muted-foreground/90 line-clamp-2 mb-3">
                          {desc}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-emerald-500/20 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400/80 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{t("tenantCommandCenter.library.inWorkspace") || "Active in Workspace"}</span>
                        </span>

                        {onRemoveWidget ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveWidget(def.id)}
                            className="h-7 gap-1 px-2.5 text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t("tenantCommandCenter.library.removeFromLayout") || "Remove"}</span>
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                            <Check className="h-3 w-3" />
                            <span>{t("tenantCommandCenter.library.alreadyAdded") || "Added"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Visual State 2: AVAILABLE TO ADD
                return (
                  <div
                    key={def.id}
                    className="flex flex-col justify-between rounded-xl border border-border/80 bg-card hover:border-primary/60 hover:bg-card/95 hover:shadow-md p-3.5 transition-all group relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                            <IconComponent className="h-4 w-4" />
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

                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-normal border-border/60 bg-muted/40 shrink-0"
                        >
                          {widthLabel}
                        </Badge>
                      </div>

                      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 mb-3">
                        {desc}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground/70">
                        {def.singleton ? "Singleton widget" : "Customizable widget"}
                      </span>

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleAdd(def.id)}
                        className="h-7 gap-1.5 px-3 text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{t("tenantCommandCenter.library.addWidget") || "Add Widget"}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Done Button */}
        <div className="shrink-0 pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{addedCount}</span>
            <span>of</span>
            <span className="font-semibold text-foreground">{totalCount}</span>
            <span>widgets active in workspace</span>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold cursor-pointer"
          >
            {t("tenantCommandCenter.library.done") || "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
