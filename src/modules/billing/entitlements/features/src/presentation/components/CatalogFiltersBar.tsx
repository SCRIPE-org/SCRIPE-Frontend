/**
 * CatalogFiltersBar Component
 *
 * Renders the search input and filtering dropdowns for the feature catalog.
 * Supports filtering by module, value type (Boolean, Numeric, String), and enforcement control.
 */
"use client";

import { Search } from "lucide-react";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

/** Sentinel value representing an unfiltered selection across all categories. */
export const ALL_FILTER = "__all";

/** Standard module list used for default catalog categorization. */
export const CANONICAL_MODULES = [
  "Identity",
  "Entitlements",
  "Compliance",
  "Communication",
  "Integrations",
  "Media",
  "OrganizationCore",
  "PartyKernel",
  "Hrms",
  "CustomFields",
  "WorkManagement",
  "Analytics",
  "Plugins",
  "Marketplace",
] as const;

/** Valid enforcement filter selection options. */
export type EnforcementFilter = typeof ALL_FILTER | "enforced" | "marketing";

/**
 * Properties for the CatalogFiltersBar component.
 */
export interface CatalogFiltersBarProps {
  /** Current search query string. */
  searchValue: string;
  /** Active module filter identifier. */
  moduleFilter: string;
  /** Active feature value type filter identifier. */
  valueTypeFilter: string;
  /** Active enforcement control filter. */
  enforcementFilter: EnforcementFilter;
  /** Available module identifiers for the module selection dropdown. */
  modules: string[];
  /** Localization dictionary lookup function. */
  t: (key: string) => string;
  /** Callback fired when the search text input changes. */
  onSearchChange: (value: string) => void;
  /** Callback fired when the module selection changes. */
  onModuleChange: (value: string) => void;
  /** Callback fired when the value type selection changes. */
  onValueTypeChange: (value: string) => void;
  /** Callback fired when the enforcement selection changes. */
  onEnforcementChange: (value: EnforcementFilter) => void;
}

/**
 * Renders the responsive search and filter controls row above the feature catalog grid.
 */
export function CatalogFiltersBar({
  searchValue,
  moduleFilter,
  valueTypeFilter,
  enforcementFilter,
  modules,
  t,
  onSearchChange,
  onModuleChange,
  onValueTypeChange,
  onEnforcementChange,
}: CatalogFiltersBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_180px_180px]">
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
          aria-hidden="true"
        />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("entitlements.features.searchPlaceholder")}
          className="ps-9"
          aria-label={t("entitlements.features.searchPlaceholder")}
        />
      </div>
      <Select value={moduleFilter} onValueChange={onModuleChange}>
        <SelectTrigger aria-label={t("entitlements.features.filterByModule")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER}>{t("entitlements.features.allModules")}</SelectItem>
          {modules.map((mod) => (
            <SelectItem key={mod} value={mod}>
              {mod}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={valueTypeFilter} onValueChange={onValueTypeChange}>
        <SelectTrigger aria-label={t("entitlements.features.filterByType")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER}>{t("entitlements.features.allTypes")}</SelectItem>
          <SelectItem value="Boolean">{t("entitlements.features.boolean")}</SelectItem>
          <SelectItem value="Numeric">{t("entitlements.features.numeric")}</SelectItem>
          <SelectItem value="String">{t("entitlements.features.string")}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={enforcementFilter}
        onValueChange={(value) => onEnforcementChange(value as EnforcementFilter)}
      >
        <SelectTrigger aria-label={t("entitlements.features.filterByEnforcement")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER}>{t("entitlements.features.allControls")}</SelectItem>
          <SelectItem value="enforced">{t("entitlements.features.enforced")}</SelectItem>
          <SelectItem value="marketing">{t("entitlements.features.marketingOnly")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
