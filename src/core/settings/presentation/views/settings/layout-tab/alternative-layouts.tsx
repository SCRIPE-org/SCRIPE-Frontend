"use client";

import { LayoutList, PanelRight, Command, Layers, Monitor } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function AlternativePreview({ variant }: { variant: string }) {
  if (variant === "tabbed") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[14%] items-end gap-1 border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-[70%] w-6 rounded-t-sm bg-primary/20" />
          <div className="h-[60%] w-6 rounded-t-sm bg-slate-200 dark:bg-slate-700" />
          <div className="h-[60%] w-6 rounded-t-sm bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] border-r border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <div className="mt-1 space-y-1">
              {[85, 65, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-slate-300 dark:bg-slate-600"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1 p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="h-1.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dual") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[20%] space-y-1 rounded-l-md bg-slate-200 p-1 pt-3 dark:bg-slate-800">
          {[70, 55, 60].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-slate-400/40" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex-1 border-x border-slate-200 p-2 dark:border-slate-700">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="w-[25%] space-y-1 bg-slate-50 p-1.5 pt-3 dark:bg-slate-800">
          {[80, 60].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-slate-300 dark:bg-slate-600"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "command") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] w-full items-center border-b border-slate-200 bg-slate-100 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-5 w-16 items-center justify-center rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <span className="font-mono text-[5px] text-muted-foreground">⌘K</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="h-[14%] border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
        <div className="absolute left-0 top-[14%] h-[86%] w-[24%] space-y-1 border-r border-slate-300 bg-slate-200/90 p-1 pt-2 shadow-lg backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/90">
          {[70, 55, 60, 50].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-slate-400/40" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="ml-[5%] p-2">
          <div className="mb-1.5 h-1.5 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "hud") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-100 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
        <div className="flex h-[18%] items-center justify-center gap-1.5 border-t border-slate-200 bg-slate-100 px-3 dark:border-slate-700 dark:bg-slate-800">
          {[false, true, false, false, false].map((active, i) => (
            <div
              key={i}
              className={cn(
                "h-3 w-3 rounded",
                active ? "bg-primary/30 ring-1 ring-primary/50" : "bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────
// Layout Data
// ────────────────────────────────────────────
const alternativeLayouts: LayoutOption[] = [
  { value: "tabbed", icon: LayoutList, preview: <AlternativePreview variant="tabbed" /> },
  { value: "dual", icon: PanelRight, preview: <AlternativePreview variant="dual" /> },
  { value: "command", icon: Command, preview: <AlternativePreview variant="command" /> },
  { value: "stacked", icon: Layers, preview: <AlternativePreview variant="stacked" /> },
  { value: "hud", icon: Monitor, preview: <AlternativePreview variant="hud" /> },
];

export const ALTERNATIVE_LAYOUT_VALUES = alternativeLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function AlternativeLayoutsTab() {
  const { t } = useI18n();
  const settings = useSettings();

  return (
    <LayoutCategorySection
      layouts={alternativeLayouts}
      category="alternative"
      selectedLayout={settings.layoutTemplate}
      onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
      t={t}
    />
  );
}
