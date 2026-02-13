"use client";

import {
      Newspaper,
      Clapperboard,
      Vault,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function SpecializedPreview({ variant }: { variant: string }) {
      if (variant === "newspaper") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[8%] bg-slate-50 dark:bg-slate-800 flex items-center px-2">
                              <div className="w-8 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                              <div className="flex-1" />
                              <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[14%] border-b-2 border-foreground/10 flex items-center px-2 gap-1">
                              <div className="w-3 h-3 rounded-full bg-primary/30" />
                              <div className="w-6 h-1 bg-slate-400 dark:bg-slate-500 rounded-full" />
                        </div>
                        <div className="h-[10%] border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
                              {[true, false, false, false].map((a, i) => (
                                    <div key={i} className={cn("h-[60%] w-5 border-b-2", a ? "border-foreground" : "border-transparent")} />
                              ))}
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "cinema") {
            return (
                  <div className="w-full aspect-[16/10] rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[45%] bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30 relative">
                              <div className="absolute top-0 left-0 right-0 h-[30%] flex items-center px-2 gap-1">
                                    <div className="w-2 h-2 bg-white/40 rounded" />
                                    <div className="flex-1" />
                                    <div className="w-3 h-1 bg-white/30 rounded-full" />
                                    <div className="w-2 h-1 bg-white/30 rounded-full" />
                              </div>
                              <div className="absolute bottom-2 left-2">
                                    <div className="h-1.5 bg-white/60 rounded-full w-12 mb-1" />
                                    <div className="h-1 bg-white/30 rounded-full w-8" />
                              </div>
                        </div>
                        <div className="h-3 bg-gradient-to-b from-primary/10 to-transparent" />
                        <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "vault") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-3 h-2 bg-primary/30 rounded-sm" />
                              <div className="w-5 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                              <div className="flex-1" />
                              <div className="w-4 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex-1 bg-white/95 dark:bg-slate-800/95 p-1.5">
                              <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                              <div className="grid grid-cols-3 gap-1">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                          <div key={i} className="p-0.5">
                                                <div className="h-0.5 bg-slate-400/40 rounded-full w-3/4 mb-0.5" />
                                                <div className="space-y-px">
                                                      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded" />
                                                      <div className="h-1 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                                                </div>
                                          </div>
                                    ))}
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
const specializedLayouts: LayoutOption[] = [
      { value: "newspaper", icon: Newspaper, preview: <SpecializedPreview variant="newspaper" /> },
      { value: "cinema", icon: Clapperboard, preview: <SpecializedPreview variant="cinema" /> },
      { value: "vault", icon: Vault, preview: <SpecializedPreview variant="vault" /> },
];

export const SPECIALIZED_LAYOUT_VALUES = specializedLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function SpecializedLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={specializedLayouts}
                  category="specialized"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
