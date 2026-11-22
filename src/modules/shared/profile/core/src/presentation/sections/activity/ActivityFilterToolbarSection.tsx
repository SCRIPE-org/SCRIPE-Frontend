"use client";

import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { ActivityOutcomeFilter, DateRangePreset } from "../../utils/activity-console.utils";
import { Search } from "lucide-react";

/**
 * Translation callback signature used by Activity section components.
 */
export type ActivityTranslateFn = (key: string, params?: Record<string, string | number>) => string;

interface DatePresetOption {
  id: DateRangePreset;
  testId: string;
  labelKey: string;
}

const DATE_PRESET_OPTIONS: readonly DatePresetOption[] = [
  { id: "ALL", testId: "activity-range-all", labelKey: "profile.activity.rangeAll" },
  { id: "24H", testId: "activity-range-24h", labelKey: "profile.activity.range24h" },
  { id: "7D", testId: "activity-range-7d", labelKey: "profile.activity.range7d" },
  { id: "30D", testId: "activity-range-30d", labelKey: "profile.activity.range30d" },
  { id: "CUSTOM", testId: "activity-range-custom", labelKey: "profile.activity.rangeCustom" },
];

/**
 * Props for ActivityFilterToolbarSection.
 */
export interface ActivityFilterToolbarSectionProps {
  t: ActivityTranslateFn;
  searchInput: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  knownCategories: string[];
  outcomeFilter: ActivityOutcomeFilter;
  onOutcomeChange: (value: ActivityOutcomeFilter) => void;
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  customFromLocal: string;
  onCustomFromChange: (value: string) => void;
  customToLocal: string;
  onCustomToChange: (value: string) => void;
}

/**
 * Pure filter toolbar providing search, category/outcome server selectors,
 * UTC time-window presets, and custom UTC date range inputs.
 */
export function ActivityFilterToolbarSection({
  t,
  searchInput,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  knownCategories,
  outcomeFilter,
  onOutcomeChange,
  datePreset,
  onDatePresetChange,
  customFromLocal,
  onCustomFromChange,
  customToLocal,
  onCustomToChange,
}: ActivityFilterToolbarSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute start-3 top-2.5 h-3.5 w-3.5 text-nx-ink-3 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            data-testid="activity-search-input"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("profile.audit.searchPlaceholder")}
            className="text-xs ps-8 h-9 bg-nx-raised border-nx-line text-nx-ink"
          />
        </div>

        <div className="w-full md:w-52">
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
              <SelectValue placeholder={t("profile.activity.allCategories")} />
            </SelectTrigger>
            <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
              <SelectItem value="ALL" className="text-xs">
                {t("profile.activity.allCategories")}
              </SelectItem>
              {knownCategories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <Select
            value={outcomeFilter}
            onValueChange={(val) => onOutcomeChange(val as ActivityOutcomeFilter)}
          >
            <SelectTrigger className="w-full text-xs h-9 bg-nx-raised border-nx-line text-nx-ink">
              <SelectValue placeholder={t("profile.audit.allOutcomes")} />
            </SelectTrigger>
            <SelectContent className="bg-nx-surface border-nx-line text-nx-ink">
              <SelectItem value="ALL" className="text-xs">
                {t("profile.audit.allOutcomes")}
              </SelectItem>
              <SelectItem value="SUCCESS" className="text-xs">
                {t("profile.audit.onlySuccess")}
              </SelectItem>
              <SelectItem value="FAILURE" className="text-xs">
                {t("profile.audit.onlyFailure")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-nx-line">
        <span className="text-[11px] font-semibold text-nx-ink-3">
          {t("profile.activity.dateRangeLabel")}:
        </span>
        {DATE_PRESET_OPTIONS.map((opt) => (
          <Button
            key={opt.id}
            type="button"
            size="sm"
            variant={datePreset === opt.id ? "default" : "outline"}
            data-testid={opt.testId}
            onClick={() => onDatePresetChange(opt.id)}
            className={
              datePreset === opt.id
                ? "h-7 text-[11px] bg-nx-accent-fill text-nx-on-fill font-semibold"
                : "h-7 text-[11px]"
            }
          >
            {t(opt.labelKey)}
          </Button>
        ))}
      </div>

      {datePreset === "CUSTOM" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="activity-custom-from" className="text-[11px] text-nx-ink-2">
              {t("profile.activity.fromUtcLabel")}
            </Label>
            <Input
              id="activity-custom-from"
              type="datetime-local"
              value={customFromLocal}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="h-8 text-xs bg-nx-raised border-nx-line text-nx-ink"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-custom-to" className="text-[11px] text-nx-ink-2">
              {t("profile.activity.toUtcLabel")}
            </Label>
            <Input
              id="activity-custom-to"
              type="datetime-local"
              value={customToLocal}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="h-8 text-xs bg-nx-raised border-nx-line text-nx-ink"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
