"use client";

import {
      Columns2,
      ArrowUpDown,
      Focus,
      PanelRightOpen,
      Kanban,
      Grid3X3,
} from "lucide-react";
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
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[10%] bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
                              {[true, false, false, false].map((a, i) => (
                                    <div key={i} className={cn("h-[70%] w-5 border-b-2", a ? "border-primary" : "border-transparent")} />
                              ))}
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[20%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-1.5 space-y-0.5">
                                    {[60, 50, 55].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "topside") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1 flex items-center gap-1">
                                    {[true, false, false].map((a, i) => (
                                          <div key={i} className={cn("w-4 h-1 rounded-full", a ? "bg-primary/40" : "bg-slate-300 dark:bg-slate-600")} />
                                    ))}
                              </div>
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[20%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-1.5 space-y-0.5">
                                    {[55, 65, 50].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "focus") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50 relative">
                        <div className="flex-1 flex items-center justify-center p-2">
                              <div className="w-[60%] space-y-1.5">
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-3/4" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-4/5" />
                              </div>
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
                              {[false, true, false, false].map((a, i) => (
                                    <div key={i} className={cn("w-1.5 h-1.5 rounded-full", a ? "bg-primary" : "bg-slate-300 dark:bg-slate-600")} />
                              ))}
                        </div>
                  </div>
            );
      }

      if (variant === "multipanel") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[18%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-1.5 space-y-0.5">
                                    {[55, 65, 50].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 p-1.5">
                                    <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mb-1" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                              </div>
                              <div className="w-[22%] bg-slate-50 dark:bg-slate-800 border-s border-slate-200 dark:border-slate-700 p-1 pt-1.5 space-y-1">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full w-3/4" />
                                    <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "kanban") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                        </div>
                        <div className="flex-1 flex gap-1 p-1">
                              {[3, 2, 1, 2].map((cards, col) => (
                                    <div key={col} className="flex-1 bg-white dark:bg-slate-800 rounded p-0.5 space-y-0.5">
                                          <div className="h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full w-2/3 mb-0.5" />
                                          {Array.from({ length: cards }).map((_, i) => (
                                                <div key={i} className="h-2 bg-slate-100 dark:bg-slate-700 rounded" />
                                          ))}
                                    </div>
                              ))}
                        </div>
                  </div>
            );
      }

      if (variant === "bento") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                        </div>
                        <div className="flex-1 p-1">
                              <div className="grid grid-cols-3 grid-rows-2 gap-0.5 h-full">
                                    <div className="col-span-2 bg-white dark:bg-slate-800 rounded flex items-center justify-center">
                                          <div className="w-4 h-2 bg-primary/20 rounded" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded flex items-center justify-center">
                                          <div className="w-3 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 rounded flex items-center justify-center">
                                          <div className="w-3 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                                    </div>
                                    <div className="col-span-2 bg-white dark:bg-slate-800 rounded flex items-center justify-center">
                                          <div className="w-4 h-2 bg-slate-200 dark:bg-slate-700 rounded" />
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
