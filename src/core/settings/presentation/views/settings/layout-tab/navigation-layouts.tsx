"use client";

import { ArrowDownUp, LayoutGrid, Route, Ribbon, TreePine, Maximize } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function NavigationPreview({ variant }: { variant: string }) {
  if (variant === "bottombar") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[10%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
        <div className="flex h-[16%] items-center justify-around border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800">
          {[false, true, false, false, false].map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  "h-2 w-2 rounded",
                  active ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                )}
              />
              <div className="h-0.5 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "megamenu") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className="h-1 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="h-[30%] border-b border-slate-200 bg-slate-50/80 p-1.5 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="grid h-full grid-cols-3 gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-0.5 rounded bg-white p-1 dark:bg-slate-700">
                <div className="h-0.5 w-2/3 rounded-full bg-slate-400 dark:bg-slate-500" />
                <div className="h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-600" />
                <div className="h-0.5 w-4/5 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "breadcrumb") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
        </div>
        <div className="flex h-[10%] items-center gap-1 border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="h-0.5 w-3 rounded-full bg-primary/40" />
          <div className="h-0.5 w-1 rounded-full bg-slate-300" />
          <div className="h-0.5 w-4 rounded-full bg-primary/40" />
          <div className="h-0.5 w-1 rounded-full bg-slate-300" />
          <div className="h-0.5 w-3 rounded-full bg-foreground/60" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "ribbon") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[8%] items-end gap-1 bg-slate-50 px-2 dark:bg-slate-800">
          {[true, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "h-[70%] w-5 rounded-t-sm",
                a ? "bg-white dark:bg-slate-900" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
        <div className="flex h-[18%] items-center gap-1 border-b border-slate-200 bg-white px-1.5 dark:border-slate-700 dark:bg-slate-800/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="h-2 w-2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-0.5 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          ))}
          <div className="mx-0.5 h-3/4 w-px bg-slate-200 dark:bg-slate-700" />
          {[5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="h-2 w-2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-0.5 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "treeview") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[25%] border-r border-slate-200 bg-slate-50 p-1.5 pt-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-0.5">
              <div className="h-1 w-1 rounded-sm bg-slate-400" />
              <div className="h-0.5 w-6 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
            <div className="ms-2 space-y-1">
              <div className="flex items-center gap-0.5">
                <div className="h-1 w-1 rounded-sm bg-primary" />
                <div className="h-0.5 w-5 rounded-full bg-primary/60" />
              </div>
              <div className="flex items-center gap-0.5">
                <div className="h-1 w-1 rounded-sm bg-slate-300 dark:bg-slate-600" />
                <div className="h-0.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="h-1 w-1 rounded-sm bg-slate-400" />
              <div className="h-0.5 w-5 rounded-full bg-slate-400 dark:bg-slate-500" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded bg-slate-300 dark:bg-slate-600" />
          <div className="flex-1" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="space-y-1.5 text-center">
            <div className="mx-auto h-1 w-10 rounded-full bg-white/60" />
            <div className="mx-auto h-1 w-8 rounded-full bg-white/40" />
            <div className="mx-auto h-1 w-9 rounded-full bg-white/40" />
            <div className="mx-auto h-1 w-7 rounded-full bg-white/30" />
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
const navigationLayouts: LayoutOption[] = [
  { value: "bottombar", icon: ArrowDownUp, preview: <NavigationPreview variant="bottombar" /> },
  { value: "megamenu", icon: LayoutGrid, preview: <NavigationPreview variant="megamenu" /> },
  { value: "breadcrumb", icon: Route, preview: <NavigationPreview variant="breadcrumb" /> },
  { value: "ribbon", icon: Ribbon, preview: <NavigationPreview variant="ribbon" /> },
  { value: "treeview", icon: TreePine, preview: <NavigationPreview variant="treeview" /> },
  { value: "overlay", icon: Maximize, preview: <NavigationPreview variant="overlay" /> },
];

export const NAVIGATION_LAYOUT_VALUES = navigationLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function NavigationLayoutsTab() {
  const { t } = useI18n();
  const settings = useSettings();

  return (
    <LayoutCategorySection
      layouts={navigationLayouts}
      category="navigation"
      selectedLayout={settings.layoutTemplate}
      onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
      t={t}
    />
  );
}
