"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";
import type { PatQuickPreset } from "../../utils/patScopeTaxonomy";
import { Search, Sparkles } from "lucide-react";

/** Filter tier options for narrowing the permission studio list. */
export type PatScopeTierFilter = "all" | "read" | "write" | "selected";

/** Props for PatScopeToolbarSection. */
export interface PatScopeToolbarSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  presets: PatQuickPreset[];
  hasCatalog: boolean;
  searchQuery: string;
  tierFilter: PatScopeTierFilter;
  activeModule: string;
  modules: Array<[string, { total: number; selected: number }]>;
  totalCount: number;
  selectedCount: number;
  matchingCount: number;
  onApplyPreset: (scopes: string[]) => void;
  onSearchChange: (val: string) => void;
  onTierFilterChange: (tier: PatScopeTierFilter) => void;
  onModuleChange: (mod: string) => void;
  onSelectAllVisible: () => void;
  onClearVisible: () => void;
}

/**
 * Search bar, quick least-privilege presets, access-tier tabs, and module filter chips
 * for the Personal Access Token Permission Studio.
 */
export function PatScopeToolbarSection({
  t,
  presets,
  hasCatalog,
  searchQuery,
  tierFilter,
  activeModule,
  modules,
  totalCount,
  selectedCount,
  matchingCount,
  onApplyPreset,
  onSearchChange,
  onTierFilterChange,
  onModuleChange,
  onSelectAllVisible,
  onClearVisible,
}: PatScopeToolbarSectionProps) {
  return (
    <div className="space-y-4">
      {hasCatalog && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-nx-ink-3">
            <Sparkles className="h-3 w-3 text-nx-accent" aria-hidden="true" />
            {t("profile.integrations.quickPresetsLabel")}:
          </span>
          {presets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              size="sm"
              variant="outline"
              data-testid={`pat-preset-${preset.id}`}
              onClick={() => onApplyPreset(preset.scopes)}
              className="h-7 px-2.5 text-[11px]"
            >
              {t(`profile.integrations.preset.${preset.id}`)}
              {preset.scopes.length > 0 && (
                <span className="ms-1 font-mono text-nx-ink-3">({preset.scopes.length})</span>
              )}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        <div className="relative w-full">
          <Search
            className="h-3.5 w-3.5 text-nx-ink-3 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            data-testid="pat-scope-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("profile.integrations.scopeSearchPlaceholder")}
            className="h-9 w-full text-xs ps-8"
          />
        </div>

        <Tabs
          value={tierFilter}
          onValueChange={(v) => onTierFilterChange(v as PatScopeTierFilter)}
        >
          <TabsList variant="pill" className="h-9 flex-wrap">
            <TabsTrigger value="all" className="text-xs px-2.5">
              {t("profile.integrations.tierTabAll")}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs px-2.5">
              {t("profile.integrations.tierReadOnly")}
            </TabsTrigger>
            <TabsTrigger value="write" className="text-xs px-2.5">
              {t("profile.integrations.tierWrite")}
            </TabsTrigger>
            <TabsTrigger value="selected" className="text-xs px-2.5">
              {t("profile.integrations.tierSelected", { count: selectedCount })}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {modules.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={activeModule === "all" ? "default" : "outline"}
            onClick={() => onModuleChange("all")}
            className={
              activeModule === "all"
                ? "h-7 px-2.5 text-[11px] bg-nx-accent-fill text-nx-on-fill font-semibold"
                : "h-7 px-2.5 text-[11px]"
            }
          >
            {t("profile.integrations.allModulesTab", { count: totalCount })}
          </Button>
          {modules.map(([modName, counts]) => {
            const isAct = activeModule === modName;
            return (
              <Button
                key={modName}
                type="button"
                size="sm"
                variant={isAct ? "default" : "outline"}
                onClick={() => onModuleChange(modName)}
                className={
                  isAct
                    ? "h-7 px-2.5 text-[11px] bg-nx-accent-fill text-nx-on-fill font-semibold gap-1"
                    : "h-7 px-2.5 text-[11px] gap-1"
                }
              >
                <span>{modName}</span>
                {counts.selected > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      isAct
                        ? "h-4 px-1 text-[10px] border-current text-current"
                        : "h-4 px-1 text-[10px] border-nx-accent/40 text-nx-accent"
                    }
                  >
                    {counts.selected}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-nx-ink-3 border-b border-nx-line pb-2">
        <span>{t("profile.integrations.showingMatchingScopes", { count: matchingCount })}</span>
        {matchingCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSelectAllVisible}
              className="h-6 px-2 text-[11px] text-nx-accent"
            >
              {t("profile.integrations.selectAllVisible")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearVisible}
              className="h-6 px-2 text-[11px] text-nx-ink-3"
            >
              {t("profile.integrations.clearVisible")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
