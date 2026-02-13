"use client";

import {
      Aperture,
      Orbit,
      Zap,
      Clock3,
      Waves,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function VisualPreview({ variant }: { variant: string }) {
      if (variant === "glassmorphism") {
            return (
                  <div className="w-full aspect-[16/10] rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-400/40 via-fuchsia-400/30 to-cyan-400/40" />
                        <div className="w-[24%] bg-white/15 backdrop-blur-sm border-r border-white/20 p-1 pt-3 space-y-1 relative">
                              {[70, 55, 45].map((w, i) => (
                                    <div key={i} className="h-1 rounded-full bg-white/30" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="flex-1 flex flex-col relative">
                              <div className="h-[14%] bg-white/10 backdrop-blur-sm border-b border-white/15" />
                              <div className="flex-1 p-2">
                                    <div className="h-1.5 bg-white/25 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 bg-white/15 rounded-full w-1/2" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "galaxy") {
            return (
                  <div className="w-full aspect-[16/10] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-md overflow-hidden flex border border-slate-700/50" style={{ perspective: "200px" }}>
                        <div className="w-[24%] bg-slate-800 border-r border-slate-700 p-1 pt-3 space-y-1" style={{ boxShadow: "4px 0 15px rgba(0,0,0,0.4)" }}>
                              {[70, 55, 45].map((w, i) => (
                                    <div key={i} className="h-1 rounded-full bg-slate-600" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[14%] bg-slate-800/80 border-b border-slate-700" />
                              <div className="flex-1 p-2">
                                    <div className="h-4 bg-slate-700/80 rounded-lg mb-1.5 shadow-lg" />
                                    <div className="h-3 bg-slate-800/60 rounded-lg shadow" />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "neon") {
            return (
                  <div className="w-full aspect-[16/10] bg-[#0a0a0f] rounded-md overflow-hidden flex border border-cyan-500/30">
                        <div className="w-[24%] border-r border-cyan-500/20 p-1 pt-3 space-y-1" style={{ boxShadow: "inset -1px 0 8px rgba(0,255,255,0.05)" }}>
                              {[70, 55, 45].map((w, i) => (
                                    <div key={i} className="h-1 rounded-full bg-cyan-500/30" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[14%] border-b border-cyan-500/20" />
                              <div className="flex-1 p-2 relative">
                                    <div className="h-1.5 bg-cyan-500/20 rounded-full w-3/4 mb-1.5" />
                                    <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: "rgba(255,0,255,0.1)" }} />
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "retro") {
            return (
                  <div className="w-full aspect-[16/10] bg-[#008080] rounded-md overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50">
                        <div className="m-1 flex-1 bg-[#c0c0c0] flex flex-col" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}>
                              <div className="h-[18%] bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center px-1 gap-0.5">
                                    <div className="w-2 h-1 bg-white/50 rounded-sm" />
                                    <div className="flex-1" />
                                    <div className="flex gap-px">
                                          {['─', '□', '×'].map((c, i) => (
                                                <div key={i} className="w-2 h-2 bg-[#c0c0c0] flex items-center justify-center" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", fontSize: "4px", lineHeight: 1 }}>
                                                      <span className="text-black">{c}</span>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                              <div className="flex-1 p-1">
                                    <div className="h-1 bg-[#808080] rounded-none w-3/4 mb-1" />
                                    <div className="h-1 bg-[#808080]/60 rounded-none w-1/2" />
                              </div>
                        </div>
                        <div className="h-[12%] bg-[#c0c0c0] border-t border-white flex items-center px-1 gap-1" style={{ boxShadow: "inset 0 1px 0 #fff" }}>
                              <div className="h-[75%] px-1 bg-[#c0c0c0] flex items-center" style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080", fontSize: "3px" }}>
                                    <span className="text-black font-bold">Start</span>
                              </div>
                              <div className="flex-1" />
                              <div className="h-[65%] px-1 bg-[#c0c0c0]" style={{ boxShadow: "inset -1px -1px 0 #fff, inset 1px 1px 0 #808080", fontSize: "3px" }}>
                                    <span className="text-black">12:00</span>
                              </div>
                        </div>
                  </div>
            );
      }

      if (variant === "aurora") {
            return (
                  <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden flex border border-slate-200/50 dark:border-slate-700/50">
                        <div className="w-[24%] bg-gradient-to-b from-purple-500/60 via-blue-500/50 to-teal-500/60 p-1 pt-3 space-y-1">
                              {[70, 55, 45].map((w, i) => (
                                    <div key={i} className="h-1 rounded-full bg-white/30" style={{ width: `${w}%` }} />
                              ))}
                        </div>
                        <div className="flex-1 flex flex-col">
                              <div className="h-[14%] bg-white/60 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700" />
                              <div className="flex-1 p-2">
                                    <div className="h-4 rounded-lg bg-gradient-to-r from-purple-200/30 to-blue-200/30 dark:from-purple-900/20 dark:to-blue-900/20 p-1 mb-1.5 ring-1 ring-purple-400/20">
                                          <div className="h-1 bg-slate-400/40 rounded-full w-3/4" />
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
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
const visualLayouts: LayoutOption[] = [
      { value: "glassmorphism", icon: Aperture, preview: <VisualPreview variant="glassmorphism" /> },
      { value: "galaxy", icon: Orbit, preview: <VisualPreview variant="galaxy" /> },
      { value: "neon", icon: Zap, preview: <VisualPreview variant="neon" /> },
      { value: "retro", icon: Clock3, preview: <VisualPreview variant="retro" /> },
      { value: "aurora", icon: Waves, preview: <VisualPreview variant="aurora" /> },
];

export const VISUAL_LAYOUT_VALUES = visualLayouts.map((l) => l.value);

// ────────────────────────────────────────────
// Tab Component
// ────────────────────────────────────────────
export function VisualLayoutsTab() {
      const { t } = useI18n();
      const settings = useSettings();

      return (
            <LayoutCategorySection
                  layouts={visualLayouts}
                  category="visual"
                  selectedLayout={settings.layoutTemplate}
                  onSelectLayout={(v) => settings.setLayoutTemplate(v as any)}
                  t={t}
            />
      );
}
