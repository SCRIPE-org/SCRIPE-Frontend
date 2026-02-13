"use client";

import {
      PanelLeft,
      LayoutDashboard,
      PanelLeftClose,
      Sparkles,
      Minus,
      Square,
      Columns3,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function SidebarPreview({ variant }: { variant: string }) {
      // ── Minimal: topbar-only, no sidebar at all ──
      if (variant === "minimal") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[16%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex gap-1 flex-1">
                                    {[18, 14, 16, 12].map((w, i) => (
                                          <div key={i} className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                        </div>
                        <div className="flex-1 p-3">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-2" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 mb-2" />
                              <div className="h-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full w-2/3" />
                        </div>
                  </div>
            );
      }

      // ── Floating: dashed ghost sidebar ──
      if (variant === "floating") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[14%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2 gap-1">
                              <div className="w-2.5 h-2 bg-slate-400 dark:bg-slate-500 rounded-sm" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex-1 flex relative">
                              <div className="w-[24%] mx-1 my-1 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center">
                                    <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                              </div>
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      // ── Modern: icon rail + expandable panel ──
      if (variant === "modern") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[8%] bg-gradient-to-b from-slate-700 to-slate-800 rounded-l-md flex flex-col items-center pt-2 gap-1">
                              {[false, true, false, false].map((active, i) => (
                                    <div key={i} className={cn("w-2 h-2 rounded", active ? "bg-primary/80" : "bg-white/20")} />
                              ))}
                        </div>
                        <div className="w-[18%] bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 p-1 pt-2">
                              <div className="space-y-1">
                                    {[65, 50, 55].map((w, i) => (
                                          <div key={i} className="h-1 bg-slate-300/60 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[14%] bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-700/50" />
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      // ── Standard sidebar layouts: classic, compact, elegant, navigation ──
      const configs: Record<string, { sidebar: string; header: string; extra?: React.ReactNode; sidebarContent?: React.ReactNode }> = {
            classic: {
                  sidebar: "w-[26%] bg-slate-200 dark:bg-slate-700 border-r border-slate-300 dark:border-slate-600 rounded-l-md",
                  header: "h-[12%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700",
                  sidebarContent: (
                        <div className="p-1.5 space-y-1 mt-2">
                              <div className="h-1.5 bg-white/30 rounded border border-white/10 mb-1.5" />
                              {[70, 55, 45, 60].map((w, i) => (
                                    <div key={i} className="h-1 rounded-full bg-white/20" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                  ),
            },
            compact: {
                  sidebar: "w-[16%] bg-slate-200 dark:bg-slate-700 rounded-l-md",
                  header: "h-[10%] bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700",
            },
            elegant: {
                  sidebar: "w-[24%] bg-gradient-to-b from-indigo-900/90 to-violet-900/90 rounded-l-md mx-0.5 my-0.5 rounded-lg",
                  header: "h-[14%] bg-white/80 dark:bg-slate-800/80",
            },
            navigation: {
                  sidebar: "w-[10%] bg-slate-800 rounded-l-md",
                  header: "h-[14%] bg-white dark:bg-slate-900",
                  extra: <div className="w-[18%] border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />,
            },
      };

      const c = configs[variant] || configs.classic;

      return (
            <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                  <div className={cn(c.sidebar)}>
                        {c.sidebarContent || (
                              <div className="p-1.5 space-y-1 mt-3">
                                    {[70, 55, 45, 60].map((w, i) => (
                                          <div key={i} className={cn("h-1 rounded-full bg-white/20")} style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                        )}
                  </div>
                  {c.extra}
                  <div className="flex-1 flex flex-col">
                        <div className={cn(c.header)} />
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                        </div>
                  </div>
            </div>
      );
}

// ────────────────────────────────────────────
// Layout Data
// ────────────────────────────────────────────
const sidebarLayouts: LayoutOption[] = [
      { value: "modern", icon: PanelLeft, preview: <SidebarPreview variant="modern" /> },
      { value: "classic", icon: LayoutDashboard, preview: <SidebarPreview variant="classic" /> },
      { value: "compact", icon: PanelLeftClose, preview: <SidebarPreview variant="compact" /> },
      { value: "elegant", icon: Sparkles, preview: <SidebarPreview variant="elegant" /> },
      { value: "minimal", icon: Minus, preview: <SidebarPreview variant="minimal" /> },
      { value: "floating", icon: Square, preview: <SidebarPreview variant="floating" /> },
      { value: "navigation", icon: Columns3, preview: <SidebarPreview variant="navigation" /> },
];

export const SIDEBAR_LAYOUT_VALUES = sidebarLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function SidebarLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={sidebarLayouts}
                  category="sidebar"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
