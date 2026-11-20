"use client";

import React, { memo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@core/ui/select";
import type { PartyDirectorySort } from "../viewmodels/usePartyDirectoryViewModel";
import { Search, LayoutGrid, List } from "lucide-react";

export interface PartyToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: PartyDirectorySort;
  onSortChange: (value: PartyDirectorySort) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

/**
 * Filter and view-mode toolbar for the Party Directory.
 */
export const PartyToolbar = memo(function PartyToolbar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: PartyToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="border-nx-line flex flex-col gap-3 rounded-xl border bg-nx-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("party.directory.searchPlaceholder")}
          className="bg-nx-raised border-nx-line ps-9 pe-3"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={sortBy}
          onValueChange={(val) => onSortChange(val as PartyDirectorySort)}
        >
          <SelectTrigger className="bg-nx-raised border-nx-line w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">{t("party.directory.sortNameAsc")}</SelectItem>
            <SelectItem value="name_desc">{t("party.directory.sortNameDesc")}</SelectItem>
            <SelectItem value="newest">{t("party.directory.sortNewest")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="bg-nx-raised border-nx-line flex items-center rounded-lg border p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("table")}
            className={`h-7 w-7 rounded-md p-1.5 transition-colors ${
              viewMode === "table"
                ? "bg-nx-surface text-nx-ink"
                : "text-nx-ink-3 hover:text-nx-ink"
            }`}
            title={t("party.directory.viewTable")}
            aria-label={t("party.directory.viewTable")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className={`h-7 w-7 rounded-md p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-nx-surface text-nx-ink"
                : "text-nx-ink-3 hover:text-nx-ink"
            }`}
            title={t("party.directory.viewGrid")}
            aria-label={t("party.directory.viewGrid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
