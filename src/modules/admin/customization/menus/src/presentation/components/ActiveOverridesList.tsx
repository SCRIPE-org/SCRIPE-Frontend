/**
 * Active Overrides List
 *
 * Bottom panel: shows all active overrides for the current scope.
 * Each entry shows what was changed and provides a remove button.
 * Click an entry to select that item in the tree + panel.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import type { ActiveOverrideEntry } from "../viewmodels/useMenuCustomizeViewModel";
import { Trash2, Pencil, EyeOff, ArrowUpDown, FolderInput, Sparkles } from "lucide-react";
import { cn } from "@core/common/utils";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ActiveOverridesListProps {
  overrides: ActiveOverrideEntry[];
  language: string;
  selectedItemId: string | null;
  onSelectItem: (nodeId: string) => void;
  onRemoveOverride: (overrideId: string) => void;
  isDeleting: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ActiveOverridesList({
  overrides,
  language,
  selectedItemId,
  onSelectItem,
  onRemoveOverride,
  isDeleting,
}: ActiveOverridesListProps) {
  const { t } = useI18n();

  if (overrides.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            bare
            size="sm"
            icon={Sparkles}
            title={t("menus.noActiveOverrides")}
            description={t("menus.noActiveOverridesHint")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t("menus.activeOverridesTitle")}
            <Badge variant="secondary" className="ms-2 text-[10px]">
              {overrides.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {overrides.map((entry) => {
            const itemName = language === "ar" ? entry.itemNameAr : entry.itemNameEn;
            const isSelected = selectedItemId === entry.menuItemId;

            return (
              <div
                key={entry.overrideId}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelectItem(entry.menuItemId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectItem(entry.menuItemId);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-nx-md px-3 py-2",
                  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:shadow-nx-focus",
                  isSelected
                    ? "bg-nx-accent-wash ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
                    : "hover:bg-nx-hover"
                )}
              >
                {/* Item name */}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-nx-ink">
                  {itemName}
                </span>

                {/* Change badges */}
                <div className="flex shrink-0 items-center gap-1">
                  {entry.override.nameEnOverride && (
                    <Badge
                      variant="outline"
                      className="gap-0.5 border-0 bg-info/15 px-1.5 py-0 text-[9px] text-info"
                    >
                      <Pencil className="h-2 w-2" aria-hidden="true" />
                      {t("menus.badgeRenamed")}
                    </Badge>
                  )}
                  {entry.override.orderOverride != null && (
                    <Badge
                      variant="outline"
                      className="gap-0.5 border-0 bg-nx-accent-wash px-1.5 py-0 text-[9px] text-nx-accent"
                    >
                      <ArrowUpDown className="h-2 w-2" aria-hidden="true" />
                      {t("menus.badgeReordered")}
                    </Badge>
                  )}
                  {entry.override.parentMenuItemIdOverride && (
                    <Badge
                      variant="outline"
                      className="gap-0.5 border-0 bg-success/15 px-1.5 py-0 text-[9px] text-success"
                    >
                      <FolderInput className="h-2 w-2" aria-hidden="true" />
                      {t("menus.badgeMoved")}
                    </Badge>
                  )}
                  {entry.override.isHidden && (
                    <Badge
                      variant="outline"
                      className="gap-0.5 border-0 bg-destructive/15 px-1.5 py-0 text-[9px] text-destructive"
                    >
                      <EyeOff className="h-2 w-2" aria-hidden="true" />
                      {t("menus.badgeHidden")}
                    </Badge>
                  )}
                </div>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-nx-ink-3 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveOverride(entry.overrideId);
                  }}
                  disabled={isDeleting}
                  aria-label={t("menus.removeOverride")}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
