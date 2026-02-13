"use client";

import {
      Anchor,
      Briefcase,
      BookOpen,
      Search,
      AlignVerticalJustifyStart,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function StructuralPreview({ variant }: { variant: string }) {
      if (variant === "dock") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[10%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                        <div className="h-[16%] border-t border-slate-200 dark:border-slate-700 flex items-end justify-center gap-1 pb-1 px-3">
                              {[2, 2.5, 3, 3.5, 3, 2.5, 2].map((h, i) => (
                                    <div key={i} className={cn("rounded bg-slate-300 dark:bg-slate-600 transition-all", i === 3 && "bg-primary/40")} style={{ width: `${h * 2.5}px`, height: `${h * 2.5}px` }} />
                              ))}
                        </div>
                  </div>
            );
      }

      if (variant === "executive") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[16%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                              <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[8%] bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-0.5">
                              <div className="w-3 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                              <div className="w-1 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                              <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[10%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
                              <div className="w-5 h-[70%] border-b-2 border-primary" />
                              <div className="w-5 h-[60%]" />
                              <div className="w-5 h-[60%]" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "magazine") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[6%] bg-slate-200 dark:bg-slate-800 flex flex-col items-center pt-2 gap-1">
                              {[false, true, false, false].map((a, i) => (
                                    <div key={i} className={cn("w-1.5 h-1.5 rounded", a ? "bg-primary/60" : "bg-slate-400/30")} />
                              ))}
                        </div>
                        <div className="flex-1 flex justify-center">
                              <div className="w-[60%] p-2">
                                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 mb-1" />
                                    <div className="h-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full w-2/3" />
                              </div>
                        </div>
                        <div className="w-[18%] bg-slate-50 dark:bg-slate-800/60 border-l border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-1">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                              <div className="h-3 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                        </div>
                  </div>
            );
      }

      if (variant === "spotlight") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[8%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex items-center justify-center py-2.5">
                              <div className="w-[65%] h-3 bg-white dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-600 flex items-center px-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              </div>
                        </div>
                        <div className="flex items-center justify-center gap-1 pb-1.5">
                              {[true, false, false, false].map((a, i) => (
                                    <div key={i} className={cn("h-1.5 rounded-full", a ? "w-4 bg-primary/30" : "w-3 bg-slate-300 dark:bg-slate-600")} />
                              ))}
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "rail") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[8%] bg-slate-200 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 flex flex-col items-center pt-2 gap-1.5">
                              {[false, true, false, false, false].map((a, i) => (
                                    <div key={i} className={cn("w-2 h-2 rounded", a ? "bg-primary/60 ring-1 ring-primary/30" : "bg-slate-400/30")} />
                              ))}
                        </div>
                        <div className="relative flex-1">
                              <div className="absolute top-3 left-1 w-[30%] bg-white dark:bg-slate-800 rounded shadow-lg border border-slate-200 dark:border-slate-700 p-1 space-y-0.5">
                                    <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full w-4/5" />
                                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-3/5" />
                                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                              </div>
                              <div className="flex-1 flex flex-col">
                                    <div className="h-[14%] bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50" />
                                    <div className="flex-1 p-2 pt-10">
                                          <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                                          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
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
const structuralLayouts: LayoutOption[] = [
      { value: "dock", icon: Anchor, preview: <StructuralPreview variant="dock" /> },
      { value: "executive", icon: Briefcase, preview: <StructuralPreview variant="executive" /> },
      { value: "magazine", icon: BookOpen, preview: <StructuralPreview variant="magazine" /> },
      { value: "spotlight", icon: Search, preview: <StructuralPreview variant="spotlight" /> },
      { value: "rail", icon: AlignVerticalJustifyStart, preview: <StructuralPreview variant="rail" /> },
];

export const STRUCTURAL_LAYOUT_VALUES = structuralLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function StructuralLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={structuralLayouts}
                  category="structural"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
