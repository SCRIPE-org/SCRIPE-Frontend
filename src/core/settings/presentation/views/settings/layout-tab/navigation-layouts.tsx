"use client";

import {
      ArrowDownUp,
      LayoutGrid,
      Route,
      Ribbon,
      TreePine,
      Maximize,
} from "lucide-react";
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
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[10%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                        <div className="h-[16%] bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-4">
                              {[false, true, false, false, false].map((active, i) => (
                                    <div key={i} className="flex flex-col items-center gap-0.5">
                                          <div className={cn("w-2 h-2 rounded", active ? "bg-primary" : "bg-slate-300 dark:bg-slate-600")} />
                                          <div className="w-2 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    </div>
                              ))}
                        </div>
                  </div>
            );
      }

      if (variant === "megamenu") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                              <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[30%] bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-1.5">
                              <div className="grid grid-cols-3 gap-1 h-full">
                                    {[1, 2, 3].map((i) => (
                                          <div key={i} className="bg-white dark:bg-slate-700 rounded p-1 space-y-0.5">
                                                <div className="h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full w-2/3" />
                                                <div className="h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full w-full" />
                                                <div className="h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full w-4/5" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "breadcrumb") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                        </div>
                        <div className="h-[10%] bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-3 h-0.5 bg-primary/40 rounded-full" />
                              <div className="w-1 h-0.5 bg-slate-300 rounded-full" />
                              <div className="w-4 h-0.5 bg-primary/40 rounded-full" />
                              <div className="w-1 h-0.5 bg-slate-300 rounded-full" />
                              <div className="w-3 h-0.5 bg-foreground/60 rounded-full" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "ribbon") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[8%] bg-slate-50 dark:bg-slate-800 flex items-end px-2 gap-1">
                              {[true, false, false].map((a, i) => (
                                    <div key={i} className={cn("h-[70%] w-5 rounded-t-sm", a ? "bg-white dark:bg-slate-900" : "bg-slate-200 dark:bg-slate-700")} />
                              ))}
                        </div>
                        <div className="h-[18%] bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1 px-1.5">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-0.5">
                                          <div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                    </div>
                              ))}
                              <div className="w-px h-3/4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                              {[5, 6].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-0.5">
                                          <div className="w-2 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                    </div>
                              ))}
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "treeview") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[25%] bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-1.5 pt-2">
                              <div className="space-y-1">
                                    <div className="flex items-center gap-0.5">
                                          <div className="w-1 h-1 bg-slate-400 rounded-sm" />
                                          <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                                    </div>
                                    <div className="ms-2 space-y-1">
                                          <div className="flex items-center gap-0.5">
                                                <div className="w-1 h-1 bg-primary rounded-sm" />
                                                <div className="w-5 h-0.5 bg-primary/60 rounded-full" />
                                          </div>
                                          <div className="flex items-center gap-0.5">
                                                <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-sm" />
                                                <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                          </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                          <div className="w-1 h-1 bg-slate-400 rounded-sm" />
                                          <div className="w-5 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                                    </div>
                              </div>
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "overlay") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50 relative">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded bg-slate-300 dark:bg-slate-600" />
                              <div className="flex-1" />
                        </div>
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                              <div className="space-y-1.5 text-center">
                                    <div className="h-1 bg-white/60 rounded-full w-10 mx-auto" />
                                    <div className="h-1 bg-white/40 rounded-full w-8 mx-auto" />
                                    <div className="h-1 bg-white/40 rounded-full w-9 mx-auto" />
                                    <div className="h-1 bg-white/30 rounded-full w-7 mx-auto" />
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
