"use client";

import {
      LayoutDashboard,
      Footprints,
      BookDown,
      PanelTop,
      SplitSquareHorizontal,
      Mail,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function WorkspacePreview({ variant }: { variant: string }) {
      if (variant === "hub") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1" />
                              <div className="w-3 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>
                        <div className="flex-1 p-1.5">
                              <div className="grid grid-cols-3 gap-1 h-full">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                          <div key={i} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-1 flex flex-col items-center justify-center gap-0.5">
                                                <div className="w-2 h-2 rounded bg-primary/20" />
                                                <div className="w-4 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "wizard") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="h-[14%] flex items-center justify-center gap-1 px-3">
                              {[true, true, false, false].map((done, i) => (
                                    <div key={i} className="flex items-center gap-0.5">
                                          <div className={cn("w-2 h-2 rounded-full", done ? "bg-primary" : "bg-slate-300 dark:bg-slate-600")} />
                                          {i < 3 && <div className={cn("w-3 h-0.5", done ? "bg-primary/40" : "bg-slate-200 dark:bg-slate-700")} />}
                                    </div>
                              ))}
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                  </div>
            );
      }

      if (variant === "shelf") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50 relative">
                        <div className="h-[12%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="flex-1 p-2">
                              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                              <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                        </div>
                        <div className="h-[35%] bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-xl p-1.5">
                              <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full mx-auto mb-1" />
                              <div className="grid grid-cols-4 gap-0.5">
                                    {[1, 2, 3, 4].map((i) => (
                                          <div key={i} className="flex flex-col items-center gap-0.5">
                                                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded" />
                                                <div className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "collapseheader") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[6%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-2 opacity-40">
                              <div className="w-2 h-1 rounded bg-slate-300" />
                        </div>
                        <div className="h-[10%] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-end px-2 gap-1">
                              {[true, false, false].map((a, i) => (
                                    <div key={i} className={cn("h-[70%] w-4", a ? "border-b-2 border-primary" : "")} />
                              ))}
                        </div>
                        <div className="flex-1 p-2 flex">
                              <div className="w-[22%] border-e border-slate-200 dark:border-slate-700 pe-1 space-y-1 pt-1">
                                    {[70, 55, 60].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 ps-2">
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "splitpane") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-[10%] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="flex flex-1">
                              <div className="w-[20%] bg-slate-50 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 space-y-0.5 pt-1.5">
                                    {[65, 50, 55].map((w, i) => (
                                          <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                                    ))}
                              </div>
                              <div className="flex-1 flex flex-col">
                                    <div className="flex-1 p-1.5">
                                          <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3 mb-1" />
                                          <div className="h-1 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2" />
                                    </div>
                                    <div className="h-[30%] bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-1">
                                          <div className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full w-1/2 mb-0.5" />
                                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                                    </div>
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "inbox") {
            return (
                  <div className="w-full aspect-[16/10] bg-white dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[18%] bg-slate-100 dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-0.5">
                              {[60, 50, 55, 45].map((w, i) => (
                                    <div key={i} className="h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="w-[30%] bg-slate-50 dark:bg-slate-800/50 border-e border-slate-200 dark:border-slate-700 p-1 pt-2 space-y-1">
                              {[1, 2, 3].map((i) => (
                                    <div key={i} className={cn("p-0.5 rounded", i === 1 ? "bg-primary/10" : "")}>
                                          <div className="h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full w-3/4 mb-0.5" />
                                          <div className="h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
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

      return null;
}

// ────────────────────────────────────────────
// Layout Data
// ────────────────────────────────────────────
const workspaceLayouts: LayoutOption[] = [
      { value: "hub", icon: LayoutDashboard, preview: <WorkspacePreview variant="hub" /> },
      { value: "wizard", icon: Footprints, preview: <WorkspacePreview variant="wizard" /> },
      { value: "shelf", icon: BookDown, preview: <WorkspacePreview variant="shelf" /> },
      { value: "collapseheader", icon: PanelTop, preview: <WorkspacePreview variant="collapseheader" /> },
      { value: "splitpane", icon: SplitSquareHorizontal, preview: <WorkspacePreview variant="splitpane" /> },
      { value: "inbox", icon: Mail, preview: <WorkspacePreview variant="inbox" /> },
];

export const WORKSPACE_LAYOUT_VALUES = workspaceLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function WorkspaceLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={workspaceLayouts}
                  category="workspace"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
