"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
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
      <DialogContent className="flex max-w-3xl flex-col gap-4 p-6 sm:max-h-[88vh]">
        {/* Header with Title and Quick Stats */}
        <DialogHeader className="shrink-0 space-y-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span>{t("tenantCommandCenter.library.title") || "Widget Library"}</span>
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("tenantCommandCenter.library.subtitle") ||
                  "Select widgets to add to your organization overview workspace."}
              </p>
            </div>

            {/* Visual Workspace Stats Counters */}
            <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {addedCount} {t("tenantCommandCenter.library.alreadyAdded") || "Added"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Plus className="h-3.5 w-3.5" />
                <span>
                  {availableCount} {t("tenantCommandCenter.library.readyToAdd") || "Available"}
                </span>
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
              placeholder={
                t("tenantCommandCenter.library.searchPlaceholder") || "Search available widgets..."
              }
              className="h-9 bg-muted/20 pe-8 ps-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2.5 top-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Segmented Status Tabs (All vs Available vs In Dashboard) */}
          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                statusFilter === "all"
                  ? "shadow-xs border border-border/60 bg-background text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <span>{t("tenantCommandCenter.library.allWidgets") || "All Widgets"}</span>
              <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
                {totalCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                statusFilter === "available"
                  ? "shadow-xs bg-primary font-bold text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("tenantCommandCenter.library.readyToAdd") || "Available to Add"}</span>
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
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
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                statusFilter === "added"
                  ? "shadow-xs bg-emerald-600 font-bold text-white"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t("tenantCommandCenter.library.inDashboard") || "In Dashboard"}</span>
              <span
                className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
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
                className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "border border-secondary-foreground/20 bg-secondary font-semibold text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto py-1 pr-1">
          {filteredWidgets.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center p-6 text-center">
              <Search className="mb-2 h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs font-semibold text-foreground">
                {t("tenantCommandCenter.library.noWidgetsFound") || "No widgets found"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
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
                      className="shadow-xs relative flex flex-col justify-between rounded-xl border border-emerald-500/35 bg-emerald-950/10 p-3.5 ring-1 ring-emerald-500/20 transition-all dark:bg-emerald-950/25"
                    >
                      <div>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="flex items-center gap-1.5 text-xs font-bold leading-tight text-foreground">
                                <span>{title}</span>
                              </h4>
                              <span className="text-[10px] font-medium capitalize text-emerald-400/80">
                                {def.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="border-border/40 px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                            >
                              {widthLabel}
                            </Badge>
                            <Badge className="flex items-center gap-1 border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>
                                {t("tenantCommandCenter.library.alreadyAdded") || "Added"}
                              </span>
                            </Badge>
                          </div>
                        </div>

                        <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/90">
                          {desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-emerald-500/20 pt-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>
                            {t("tenantCommandCenter.library.inWorkspace") || "Active in Workspace"}
                          </span>
                        </span>

                        {onRemoveWidget ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onRemoveWidget(def.id)}
                            className="h-7 cursor-pointer gap-1 border-destructive/30 px-2.5 text-[11px] text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>
                              {t("tenantCommandCenter.library.removeFromLayout") || "Remove"}
                            </span>
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 rounded bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
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
                    className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 transition-all hover:border-primary/60 hover:bg-card/95 hover:shadow-md"
                  >
                    <div>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary transition-transform group-hover:scale-105">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold leading-tight text-foreground">
                              {title}
                            </h4>
                            <span className="text-[10px] capitalize text-muted-foreground">
                              {def.category}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className="shrink-0 border-border/60 bg-muted/40 px-1.5 py-0 text-[10px] font-normal"
                        >
                          {widthLabel}
                        </Badge>
                      </div>

                      <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                      <span className="text-[10px] text-muted-foreground/70">
                        {def.singleton ? "Singleton widget" : "Customizable widget"}
                      </span>

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => handleAdd(def.id)}
                        className="shadow-xs h-7 cursor-pointer gap-1.5 bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
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
        <div className="flex shrink-0 items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
            className="h-8 cursor-pointer px-4 text-xs font-semibold"
          >
            {t("tenantCommandCenter.library.done") || "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
