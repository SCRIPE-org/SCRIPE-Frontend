"use client";

/**
 * The settings rail — one vertical, grouped, searchable list of destinations
 * that replaced the 7-tab bar and the nested appearance tabs. A group with a
 * single destination renders as its own leaf row; a group with several expands
 * to list them. The active destination wears the lit edge (accent wash + a 2px
 * inset accent bar); everything else stays quiet until hovered.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { SettingsGroup, SettingsItem } from "./settings-nav";

/** Rail label: an owning section's i18n title, or the literal fallback. */
export function itemLabel(item: SettingsItem, t: (key: string) => string): string {
  if (item.label) return item.label;
  return item.labelKey ? t(item.labelKey) : item.id;
}

interface SettingsRailProps {
  groups: SettingsGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  /** When a search is active every visible group is forced open. */
  filtering: boolean;
}

export function SettingsRail({ groups, activeId, onSelect, filtering }: SettingsRailProps) {
  const { t } = useI18n();

  // Groups the user has explicitly collapsed. Everything is open by default so
  // the whole map is scannable. The group owning the active destination is
  // always forced open (see `open` below), so a newly-active destination
  // reveals its group and the active group can never be collapsed shut — a
  // render-time derivation rather than a synchronous setState in an effect.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const renderItem = (item: SettingsItem) => {
    const active = item.id === activeId;
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-9 w-full items-center gap-2.5 rounded-nx-sm px-2.5 text-sm outline-none",
          "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:shadow-nx-focus",
          active
            ? "bg-nx-accent-wash text-nx-ink"
            : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute inset-y-1 w-0.5 rounded-full bg-nx-accent [inset-inline-start:0]"
          />
        )}
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{itemLabel(item, t)}</span>
      </button>
    );
  };

  return (
    <nav aria-label={t("settings.pageTitle")} className="flex flex-col gap-1">
      {groups.map((group) => {
        // Single-destination groups collapse into their own selectable leaf —
        // no header, no chevron, no wasted vertical step.
        if (group.items.length === 1) {
          return renderItem(group.items[0]);
        }

        // Force-open while this group owns the active destination, so navigating
        // into a collapsed group reveals it and the active group stays open.
        const ownsActive = group.items.some((it) => it.id === activeId);
        const open = filtering || ownsActive || !collapsed.has(group.id);
        const GroupIcon = group.icon;
        return (
          <div key={group.id} className="flex flex-col">
            <button
              type="button"
              onClick={() =>
                setCollapsed((prev) => {
                  const next = new Set(prev);
                  if (next.has(group.id)) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })
              }
              aria-expanded={open}
              className={cn(
                "flex h-9 w-full items-center gap-2.5 rounded-nx-sm px-2.5 text-sm font-medium outline-none",
                "text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus"
              )}
            >
              <GroupIcon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-start">{t(group.labelKey)}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  open ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>

            {/* Height+opacity reveal with no JS measurement (grid-rows 0fr→1fr),
                stripped under prefers-reduced-motion. */}
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-0.5 flex flex-col gap-0.5 ps-3.5">
                  {group.items.map(renderItem)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {groups.length === 0 && (
        <p className="px-2.5 py-6 text-center text-sm text-nx-ink-3">{t("common.noResults")}</p>
      )}
    </nav>
  );
}
