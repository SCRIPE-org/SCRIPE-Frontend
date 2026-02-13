"use client";

import {
      LayoutList,
      PanelRight,
      Command,
      Layers,
      Monitor,
} from "lucide-react";
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
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[14%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
                              <div className="w-6 h-[70%] bg-primary/20 rounded-t-sm" />
                              <div className="w-6 h-[60%] bg-slate-200 dark:bg-slate-700 rounded-t-sm" />
                              <div className="w-6 h-[60%] bg-slate-200 dark:bg-slate-700 rounded-t-sm" />
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[20%] bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-1">
                                    <div className="space-y-1 mt-1">
                                          {[85, 65, 70].map((w, i) => (
                                                <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                          ))}
                                    </div>
                              </div>
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "dual") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[20%] bg-slate-200 dark:bg-slate-800 rounded-l-md p-1 space-y-1 pt-3">
                              {[70, 55, 60].map((w, i) => (
                                    <div key={i} className="h-1 bg-slate-400/40 rounded-full" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="flex-1 border-x border-slate-200 dark:border-slate-700 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                        <div className="w-[25%] bg-slate-50 dark:bg-slate-800 p-1.5 pt-3 space-y-1">
                              {[80, 60].map((w, i) => (
                                    <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                  </div>
            );
      }

      if (variant === "command") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                              <div className="w-16 h-5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    <span className="text-[5px] font-mono text-muted-foreground">⌘K</span>
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "stacked") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden border border-slate-200/50 dark:border-slate-700/50 relative">
                        <div className="h-[14%] bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700" />
                        <div className="absolute top-[14%] left-0 w-[24%] h-[86%] bg-slate-200/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-sm border-r border-slate-300 dark:border-slate-600 p-1 space-y-1 pt-2">
                              {[70, 55, 60, 50].map((w, i) => (
                                    <div key={i} className="h-1 bg-slate-400/40 rounded-full" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="p-2 ml-[5%]">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mb-1.5" />
                              <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "hud") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                        <div className="h-[18%] bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 px-3">
                              {[false, true, false, false, false].map((active, i) => (
                                    <div
                                          key={i}
                                          className={cn(
                                                "w-3 h-3 rounded",
                                                active
                                                      ? "bg-primary/30 ring-1 ring-primary/50"
                                                      : "bg-slate-300 dark:bg-slate-600"
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
