"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import type { AccountColleagueOption } from "../../../domain/entities/SovereignAccountEntities";
import { Loader2, Search, X } from "lucide-react";

/**
 * Props for ColleaguePickerField.
 */
export interface ColleaguePickerFieldProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  colleagueQuery: string;
  selectedColleague: AccountColleagueOption | null;
  colleagues: AccountColleagueOption[];
  isSearchingColleagues: boolean;
  onQueryChange: (value: string) => void;
  onSelectColleague: (colleague: AccountColleagueOption) => void;
  onClearColleague: () => void;
}

/**
 * Searchable backend colleague selector combobox inside GrantDelegationModal.
 */
export function ColleaguePickerField({
  t,
  colleagueQuery,
  selectedColleague,
  colleagues,
  isSearchingColleagues,
  onQueryChange,
  onSelectColleague,
  onClearColleague,
}: ColleaguePickerFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-nx-ink">
        {t("profile.governance.colleagueLabel")}
      </Label>

      {selectedColleague ? (
        <div className="p-3 rounded-xl border border-nx-accent/40 bg-nx-accent-wash flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-nx-ink truncate">
              {selectedColleague.displayName}
            </p>
            <p className="text-[11px] font-mono text-nx-ink-2 truncate">
              {selectedColleague.email}
              {selectedColleague.roleSummary ? ` · ${selectedColleague.roleSummary}` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearColleague}
            className="h-7 px-2 text-xs text-nx-ink-2"
            aria-label={t("profile.common.cancel")}
          >
            <X className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search
              className="h-3.5 w-3.5 text-nx-ink-3 absolute start-3 top-1/2 -translate-y-1/2"
              style={{ minWidth: 14, minHeight: 14 }}
            />
            <Input
              data-testid="colleague-search-input"
              value={colleagueQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t("profile.governance.colleagueSearchPlaceholder")}
              className="ps-9 h-9 text-xs"
            />
          </div>

          <div className="max-h-40 overflow-y-auto rounded-xl border border-nx-line bg-nx-ground divide-y divide-nx-line">
            {isSearchingColleagues ? (
              <div className="p-3 text-xs text-nx-ink-3 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-nx-accent" />
                <span>{t("profile.governance.searchingColleagues")}</span>
              </div>
            ) : colleagues.length === 0 ? (
              <p className="p-3 text-xs text-nx-ink-3">
                {t("profile.governance.noColleaguesFound")}
              </p>
            ) : (
              colleagues.map((col) => (
                <Button
                  key={col.id}
                  type="button"
                  variant="ghost"
                  data-testid={`colleague-option-${col.id}`}
                  onClick={() => onSelectColleague(col)}
                  className="w-full h-auto justify-between px-3 py-2.5 rounded-none text-start hover:bg-nx-surface"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-nx-ink block truncate">
                      {col.displayName}
                    </span>
                    <span className="text-[11px] font-mono text-nx-ink-3 block truncate">
                      {col.email}
                      {col.staffCode ? ` · ${col.staffCode}` : ""}
                    </span>
                  </div>
                  {col.roleSummary && (
                    <Badge variant="outline" className="text-[10px] border-nx-line shrink-0">
                      {col.roleSummary}
                    </Badge>
                  )}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
