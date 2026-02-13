"use client";

import {
      MessageSquare,
      MapPin,
      Rss,
      CalendarDays,
      Users,
      TerminalSquare,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function IndustryPreview({ variant }: { variant: string }) {
      if (variant === "chat") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[20%] bg-slate-100 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-0.5">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={cn("flex items-center gap-0.5 p-0.5 rounded", i === 1 ? "bg-primary/10" : "")}>
                                          <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                    </div>
                              ))}
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-1.5">
                                    <div className="w-1 h-1 bg-primary/40 rounded" />
                                    <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full ms-1" />
                              </div>
                              <div className="flex-1 p-1.5 space-y-1">
                                    <div className="flex gap-0.5">
                                          <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full shrink-0" />
                                          <div className="bg-slate-100 dark:bg-slate-800 rounded p-0.5 max-w-[60%]">
                                                <div className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full w-full" />
                                          </div>
                                    </div>
                                    <div className="flex gap-0.5 justify-end">
                                          <div className="bg-primary/20 rounded p-0.5 max-w-[50%]">
                                                <div className="h-0.5 bg-primary/60 rounded-full w-full" />
                                          </div>
                                    </div>
                              </div>
                              <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center px-1.5">
                                    <div className="flex-1 h-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "map") {
            return (
                  <div className="w-full aspect-[16/10] rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50 relative bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20">
                        <div className="absolute top-1 left-1 right-1 flex items-center justify-between">
                              <div className="w-5 h-2 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm flex items-center justify-center">
                                    <div className="w-3 h-0.5 bg-slate-400 rounded-full" />
                              </div>
                              <div className="flex gap-0.5">
                                    <div className="w-2 h-2 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm" />
                                    <div className="w-2 h-2 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm" />
                              </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <div className="w-2 h-2 bg-red-500 rounded-full shadow-md" />
                        </div>
                        <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
                              <div className="w-2 h-2 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm flex items-center justify-center text-[4px]">+</div>
                              <div className="w-2 h-2 bg-white/80 dark:bg-slate-800/80 rounded shadow-sm flex items-center justify-center text-[4px]">−</div>
                        </div>
                  </div>
            );
      }

      if (variant === "feed") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[15%] bg-white dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-1">
                              {[false, true, false, false].map((a, i) => (
                                    <div key={i} className={cn("w-2 h-2 rounded mx-auto", a ? "bg-primary/40" : "bg-slate-200 dark:bg-slate-700")} />
                              ))}
                        </div>
                        <div className="flex-1 p-1 pt-2 space-y-1 flex flex-col items-center">
                              {[1, 2].map((i) => (
                                    <div key={i} className="w-[80%] bg-white dark:bg-slate-800 rounded border border-slate-200/50 dark:border-slate-700/50 p-1">
                                          <div className="flex items-center gap-0.5 mb-0.5">
                                                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                          </div>
                                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                                    </div>
                              ))}
                        </div>
                        <div className="w-[20%] bg-white dark:bg-slate-800 border-s border-slate-200 dark:border-slate-700 p-1 pt-2">
                              <div className="h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full w-2/3 mb-1" />
                              <div className="space-y-0.5">
                                    <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                                    <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "calendar") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[22%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-1.5">
                              <div className="grid grid-cols-7 gap-px mb-1">
                                    {Array.from({ length: 14 }).map((_, i) => (
                                          <div key={i} className={cn("w-1 h-1 rounded-sm", i === 5 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700")} />
                                    ))}
                              </div>
                              <div className="space-y-0.5 mt-1">
                                    {[55, 65].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-1.5">
                                    <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                                    <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                                    <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded" />
                              </div>
                              <div className="flex-1 p-1">
                                    <div className="grid grid-cols-7 gap-px h-full">
                                          {Array.from({ length: 7 }).map((_, i) => (
                                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-sm p-px">
                                                      {i === 2 && <div className="w-full h-0.5 bg-primary/30 rounded-full mt-0.5" />}
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "crm") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[14%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1 h-2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 max-w-[40%]" />
                              <div className="w-2 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="h-[16%] bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 px-2">
                              {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex flex-col items-center">
                                          <div className="w-4 h-1 bg-primary/20 rounded mb-0.5" />
                                          <div className="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                    </div>
                              ))}
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[18%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-1.5 space-y-0.5">
                                    {[55, 65, 50].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 p-1.5">
                                    <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "terminal") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-950 rounded-md overflow-hidden flex flex-col border border-slate-700/50">
                        <div className="h-[12%] bg-slate-900 flex items-center px-1.5 gap-0.5">
                              <div className="w-1 h-1 rounded-full bg-red-500" />
                              <div className="w-1 h-1 rounded-full bg-yellow-500" />
                              <div className="w-1 h-1 rounded-full bg-green-500" />
                              <div className="flex-1" />
                              <div className="w-5 h-0.5 bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[20%] bg-slate-900/50 border-e border-slate-700/50 p-1 pt-1.5 space-y-0.5">
                                    {[1, 2, 3].map((i) => (
                                          <div key={i} className="flex items-center gap-0.5">
                                                <div className="w-1 h-0.5 bg-green-500/60 rounded-full" />
                                                <div className="w-4 h-0.5 bg-slate-500 rounded-full" />
                                          </div>
                                    ))}
                              </div>
                              <div className="flex-1 p-1.5">
                                    <div className="flex items-center gap-0.5 mb-1">
                                          <div className="w-1 h-0.5 bg-green-400 rounded-full" />
                                          <div className="w-6 h-0.5 bg-slate-500 rounded-full" />
                                    </div>
                                    <div className="h-0.5 bg-slate-600 rounded-full w-1/2 mb-0.5" />
                                    <div className="h-0.5 bg-slate-700 rounded-full w-1/3" />
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
const industryLayouts: LayoutOption[] = [
      { value: "chat", icon: MessageSquare, preview: <IndustryPreview variant="chat" /> },
      { value: "map", icon: MapPin, preview: <IndustryPreview variant="map" /> },
      { value: "feed", icon: Rss, preview: <IndustryPreview variant="feed" /> },
      { value: "calendar", icon: CalendarDays, preview: <IndustryPreview variant="calendar" /> },
      { value: "crm", icon: Users, preview: <IndustryPreview variant="crm" /> },
      { value: "terminal", icon: TerminalSquare, preview: <IndustryPreview variant="terminal" /> },
];

export const INDUSTRY_LAYOUT_VALUES = industryLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function IndustryLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={industryLayouts}
                  category="industry"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
