"use client";

import { Orbit, Zap, Clock3 } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { LayoutCategorySection, type LayoutOption } from "./shared";

// Wave C: the retired wallpaper-effect layouts were removed from this picker;
// a stored value keeps deserialising (the LayoutTemplate union is untouched)
// but cannot be re-selected.

// ────────────────────────────────────────────
// Previews
// ────────────────────────────────────────────
function VisualPreview({ variant }: { variant: string }) {
  if (variant === "galaxy") {
    return (
      <div
        className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{ perspective: "200px" }}
      >
        <div
          className="w-[24%] space-y-1 border-r border-slate-700 bg-slate-800 p-1 pt-3"
          style={{ boxShadow: "4px 0 15px rgba(0,0,0,0.4)" }}
        >
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-slate-600" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="h-[14%] border-b border-slate-700 bg-slate-800/80" />
          <div className="flex-1 p-2">
            <div className="mb-1.5 h-4 rounded-lg bg-slate-700/80 shadow-lg" />
            <div className="h-3 rounded-lg bg-slate-800/60 shadow" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "neon") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-cyan-500/30 bg-[#0a0a0f]">
        <div
          className="w-[24%] space-y-1 border-r border-cyan-500/20 p-1 pt-3"
          style={{ boxShadow: "inset -1px 0 8px rgba(0,255,255,0.05)" }}
        >
          {[70, 55, 45].map((w, i) => (
            <div key={i} className="h-1 rounded-full bg-cyan-500/30" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="h-[14%] border-b border-cyan-500/20" />
          <div className="relative flex-1 p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-cyan-500/20" />
            <div
              className="h-1.5 w-1/2 rounded-full"
              style={{ backgroundColor: "rgba(255,0,255,0.1)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "retro") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-[#008080] dark:border-slate-700/50">
        <div
          className="m-1 flex flex-1 flex-col bg-[#c0c0c0]"
          style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080" }}
        >
          <div className="flex h-[18%] items-center gap-0.5 bg-gradient-to-r from-[#000080] to-[#1084d0] px-1">
            <div className="h-1 w-2 rounded-sm bg-white/50" />
            <div className="flex-1" />
            <div className="flex gap-px">
              {["─", "□", "×"].map((c, i) => (
                <div
                  key={i}
                  className="flex h-2 w-2 items-center justify-center bg-[#c0c0c0]"
                  style={{
                    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
                    fontSize: "4px",
                    lineHeight: 1,
                  }}
                >
                  <span className="text-black">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-1">
            <div className="mb-1 h-1 w-3/4 rounded-none bg-[#808080]" />
            <div className="h-1 w-1/2 rounded-none bg-[#808080]/60" />
          </div>
        </div>
        <div
          className="flex h-[12%] items-center gap-1 border-t border-white bg-[#c0c0c0] px-1"
          style={{ boxShadow: "inset 0 1px 0 #fff" }}
        >
          <div
            className="flex h-[75%] items-center bg-[#c0c0c0] px-1"
            style={{
              boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #808080",
              fontSize: "3px",
            }}
          >
            <span className="font-bold text-black">Start</span>
          </div>
          <div className="flex-1" />
          <div
            className="h-[65%] bg-[#c0c0c0] px-1"
            style={{
              boxShadow: "inset -1px -1px 0 #fff, inset 1px 1px 0 #808080",
              fontSize: "3px",
            }}
          >
            <span className="text-black">12:00</span>
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
  { value: "galaxy", icon: Orbit, preview: <VisualPreview variant="galaxy" /> },
  { value: "neon", icon: Zap, preview: <VisualPreview variant="neon" /> },
  { value: "retro", icon: Clock3, preview: <VisualPreview variant="retro" /> },
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
