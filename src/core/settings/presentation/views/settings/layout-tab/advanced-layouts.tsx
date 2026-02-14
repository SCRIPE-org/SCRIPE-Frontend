"use client";

import { Columns2, ArrowUpDown, Focus, PanelRightOpen, Kanban, Grid3X3 } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function AdvancedPreview({ variant }: { variant: string }) {
  if (variant === "dualheader") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex h-[10%] items-end gap-1 border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800/50">
          {[true, false, false, false].map((a, i) => (
            <div
              key={i}
              className={cn("h-[70%] w-5 border-b-2", a ? "border-primary" : "border-transparent")}
            />
          ))}
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] space-y-0.5 border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[60, 50, 55].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex-1 p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "topside") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[14%] items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex flex-1 items-center gap-1">
            {[true, false, false].map((a, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-4 rounded-full",
                  a ? "bg-primary/40" : "bg-slate-300 dark:bg-slate-600"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] space-y-0.5 border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[55, 65, 50].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex-1 p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "focus") {
    return (
      <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex flex-1 items-center justify-center p-2">
          <div className="w-[60%] space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800/50" />
            <div className="h-1 w-4/5 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {[false, true, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                a ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "multipanel") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
        </div>
        <div className="flex flex-1">
          <div className="w-[18%] space-y-0.5 border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[55, 65, 50].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex-1 p-1.5">
            <div className="mb-1 h-1 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
          <div className="w-[22%] space-y-1 border-s border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-0.5 w-3/4 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="h-0.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "kanban") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
        </div>
        <div className="flex flex-1 gap-1 p-1">
          {[3, 2, 1, 2].map((cards, col) => (
            <div key={col} className="flex-1 space-y-0.5 rounded bg-white p-0.5 dark:bg-slate-800">
              <div className="mb-0.5 h-0.5 w-2/3 rounded-full bg-slate-400 dark:bg-slate-500" />
              {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="h-2 rounded bg-slate-100 dark:bg-slate-700" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "bento") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
        </div>
        <div className="flex-1 p-1">
          <div className="grid h-full grid-cols-3 grid-rows-2 gap-0.5">
            <div className="col-span-2 flex items-center justify-center rounded bg-white dark:bg-slate-800">
              <div className="h-2 w-4 rounded bg-primary/20" />
            </div>
            <div className="flex items-center justify-center rounded bg-white dark:bg-slate-800">
              <div className="h-2 w-3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex items-center justify-center rounded bg-white dark:bg-slate-800">
              <div className="h-2 w-3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="col-span-2 flex items-center justify-center rounded bg-white dark:bg-slate-800">
              <div className="h-2 w-4 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// Layout Data
// ────────────────────────────────────────────
const advancedLayouts: LayoutOption[] = [
  { value: "dualheader", icon: Columns2, preview: <AdvancedPreview variant="dualheader" /> },
  { value: "topside", icon: ArrowUpDown, preview: <AdvancedPreview variant="topside" /> },
  { value: "focus", icon: Focus, preview: <AdvancedPreview variant="focus" /> },
  { value: "multipanel", icon: PanelRightOpen, preview: <AdvancedPreview variant="multipanel" /> },
  { value: "kanban", icon: Kanban, preview: <AdvancedPreview variant="kanban" /> },
  { value: "bento", icon: Grid3X3, preview: <AdvancedPreview variant="bento" /> },
];

export const ADVANCED_LAYOUT_VALUES = advancedLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function AdvancedLayoutsTab() {
  const { t } = useI18n();
  const settings = useSettings();

  return (
    <LayoutCategorySection
      layouts={advancedLayouts}
      category="advanced"
      selectedLayout={settings.layoutTemplate}
      onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
      t={t}
    />
  );
}
