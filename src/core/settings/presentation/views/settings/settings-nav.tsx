"use client";

/**
 * The group nav and the search index.
 *
 * The nav is six rows. That is the whole map — no chevrons, no nesting, no
 * second level to remember you are inside. Each group panel is code-split, so
 * opening Settings pulls the charts bundle only if you ask for charts.
 *
 * Search works on *controls*, not on groups: `matchRows` filters the flat row
 * registry, and the results list names the group each hit lives in so choosing
 * one both switches group and jumps to the control.
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  SETTINGS_GROUPS,
  SETTING_ROWS,
  type GroupId,
  type SettingRowMeta,
  type SettingsGroupMeta,
} from "./settings-map";

// A centred spinner keeps the content column from collapsing while a group
// chunk resolves. It is passed as an inline `{ loading: PanelLoader }` literal
// to each dynamic() — Turbopack needs to read that options object statically,
// so a shared options object cannot be passed by reference.
const PanelLoader = () => (
  <div className="flex justify-center py-16">
    <LoadingSpinner size="sm" />
  </div>
);

const AppearanceGroup = dynamic(
  () => import("./groups/appearance-group").then((m) => ({ default: m.AppearanceGroup })),
  { loading: PanelLoader }
);
const LayoutGroup = dynamic(
  () => import("./groups/layout-group").then((m) => ({ default: m.LayoutGroup })),
  { loading: PanelLoader }
);
const ComponentsGroup = dynamic(
  () => import("./groups/components-group").then((m) => ({ default: m.ComponentsGroup })),
  { loading: PanelLoader }
);
const BrandingGroup = dynamic(
  () => import("./groups/branding-group").then((m) => ({ default: m.BrandingGroup })),
  { loading: PanelLoader }
);
const BehaviorGroup = dynamic(
  () => import("./groups/behavior-group").then((m) => ({ default: m.BehaviorGroup })),
  { loading: PanelLoader }
);
const ChartsGroup = dynamic(
  () => import("./groups/charts-group").then((m) => ({ default: m.ChartsGroup })),
  { loading: PanelLoader }
);

export const GROUP_PANELS: Record<GroupId, ComponentType> = {
  appearance: AppearanceGroup,
  layout: LayoutGroup,
  components: ComponentsGroup,
  branding: BrandingGroup,
  behavior: BehaviorGroup,
  charts: ChartsGroup,
};

/** How many settings each group holds — shown as a quiet count in the nav. */
export const GROUP_COUNTS: Record<GroupId, number> = SETTING_ROWS.reduce(
  (counts, row) => {
    counts[row.group] += 1;
    return counts;
  },
  { appearance: 0, layout: 0, components: 0, branding: 0, behavior: 0, charts: 0 } as Record<
    GroupId,
    number
  >
);

// ── Search ────────────────────────────────────────────────────────────────

export function rowLabel(row: SettingRowMeta, t: (key: string) => string): string {
  return row.titleKey ? t(row.titleKey) : (row.title ?? row.id);
}

export function groupLabel(group: SettingsGroupMeta, t: (key: string) => string): string {
  return t(group.titleKey);
}

/**
 * Match rows against a query. A row matches on its own title, its supporting
 * line, its group's name, or any of its `terms` (the persisted field names) —
 * so "table", "grid", "tableStyle" and "Components" all find the table row.
 */
export function matchRows(query: string, t: (key: string) => string): SettingRowMeta[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return SETTING_ROWS.filter((row) => {
    const group = SETTINGS_GROUPS.find((entry) => entry.id === row.group);
    const haystack = [
      rowLabel(row, t),
      row.descKey ? t(row.descKey) : (row.description ?? ""),
      group ? groupLabel(group, t) : "",
      ...(row.terms ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

// ── The nav ───────────────────────────────────────────────────────────────

export function GroupNav({
  activeId,
  onSelect,
}: {
  activeId: GroupId;
  onSelect: (id: GroupId) => void;
}) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("settings.pageTitle")}
      className="flex gap-1 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible xl:pb-0"
    >
      {SETTINGS_GROUPS.map((group) => {
        const active = group.id === activeId;
        const Icon = group.icon;
        return (
          <button
            key={group.id}
            type="button"
            onClick={() => onSelect(group.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 rounded-nx-md px-3 py-2 text-sm outline-none",
              "transition-[background-color,color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:shadow-nx-focus xl:w-full",
              active
                ? "bg-nx-accent-wash text-nx-ink"
                : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
            )}
          >
            {/* The lit edge: light collects on the active row only. */}
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 w-0.5 rounded-full bg-nx-accent [inset-inline-start:0]"
              />
            )}
            <Icon aria-hidden className="h-4 w-4 shrink-0" />
            <span className="truncate font-medium">{groupLabel(group, t)}</span>
            <span
              className={cn(
                "ms-auto hidden text-xs tabular-nums xl:inline",
                active ? "text-nx-ink-2" : "text-nx-ink-3"
              )}
            >
              {GROUP_COUNTS[group.id]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export { SETTINGS_GROUPS, SETTING_ROWS };
export type { GroupId, SettingRowMeta, SettingsGroupMeta };
