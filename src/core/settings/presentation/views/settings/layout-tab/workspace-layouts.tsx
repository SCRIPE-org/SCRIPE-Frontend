"use client";

import {
  LayoutDashboard,
  Footprints,
  BookDown,
  PanelTop,
  SplitSquareHorizontal,
  Mail,
  Columns2,
  Layers,
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
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex-1 p-1.5">
          <div className="grid h-full grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-0.5 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="h-2 w-2 rounded bg-primary/20" />
                <div className="h-0.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "wizard") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
        <div className="flex h-[14%] items-center justify-center gap-1 px-3">
          {[true, true, false, false].map((done, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  done ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
                )}
              />
              {i < 3 && (
                <div
                  className={cn(
                    "h-0.5 w-3",
                    done ? "bg-primary/40" : "bg-slate-200 dark:bg-slate-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "shelf") {
    return (
      <div className="relative flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
        <div className="h-[35%] rounded-t-xl border-t border-slate-200 bg-slate-100 p-1.5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto mb-1 h-0.5 w-6 rounded-full bg-slate-400 dark:bg-slate-500" />
          <div className="grid grid-cols-4 gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="h-2 w-2 rounded bg-slate-300 dark:bg-slate-600" />
                <div className="h-0.5 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "collapseheader") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[6%] items-center border-b border-slate-200/50 bg-slate-50 px-2 opacity-40 dark:border-slate-700/50 dark:bg-slate-800">
          <div className="h-1 w-2 rounded bg-slate-300" />
        </div>
        <div className="flex h-[10%] items-end gap-1 border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
          {[true, false, false].map((a, i) => (
            <div key={i} className={cn("h-[70%] w-4", a ? "border-b-2 border-primary" : "")} />
          ))}
        </div>
        <div className="flex flex-1 p-2">
          <div className="w-[22%] space-y-1 border-e border-slate-200 pe-1 pt-1 dark:border-slate-700">
            {[70, 55, 60].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex-1 ps-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "splitpane") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[10%] items-center border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] space-y-0.5 border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[65, 50, 55].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex-1 p-1.5">
              <div className="mb-1 h-1 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
            </div>
            <div className="h-[30%] border-t border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-0.5 h-0.5 w-1/2 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="h-0.5 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inbox") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[18%] space-y-0.5 border-e border-slate-200 bg-slate-100 p-1 pt-2 dark:border-slate-700 dark:bg-slate-800">
          {[60, 50, 55, 45].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="w-[30%] space-y-1 border-e border-slate-200 bg-slate-50 p-1 pt-2 dark:border-slate-700 dark:bg-slate-800/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("rounded p-0.5", i === 1 ? "bg-primary/10" : "")}>
              <div className="mb-0.5 h-0.5 w-3/4 rounded-full bg-slate-400 dark:bg-slate-500" />
              <div className="h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (variant === "scripe") {
    // Preview shows the shell's own physics: matte surfaces, and exactly one
    // element emitting — the active rail glyph and its edge light.
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-[#07070c]">
        {/* Icon rail */}
        <div className="relative flex w-[8%] flex-col items-center gap-1 border-e border-white/10 bg-[#0c0c13] p-1 pt-1.5">
          <div
            className="h-2 w-2 rounded-[2px]"
            style={{ background: "oklch(0.68 0.18 var(--workspace-hue, 262))" }}
          />
          <div className="mt-1 space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-[2px] bg-white/20"
                style={
                  i === 1
                    ? {
                        background: "oklch(0.82 0.13 calc(var(--workspace-hue, 262) + 78))",
                        boxShadow: "0 0 5px oklch(0.82 0.13 calc(var(--workspace-hue, 262) + 78))",
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
        {/* Navigation panel */}
        <div className="w-[22%] space-y-1 border-e border-white/10 bg-[#0c0c13] p-1 pt-1.5">
          {[65, 50, 55, 45].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full"
              style={{
                width: `${w}%`,
                background: i === 0 ? "rgba(242,240,250,0.85)" : "rgba(242,240,250,0.22)",
              }}
            />
          ))}
        </div>
        {/* Content field with the KPI strip's lit top edge */}
        <div className="flex-1 p-1.5">
          <div className="mb-1 h-1 w-2/3 rounded-full bg-white/70" />
          <div
            className="mt-1.5 h-3 w-full rounded-[2px] border border-white/10 bg-[#111119]"
            style={{ borderTopColor: "oklch(0.68 0.18 var(--workspace-hue, 262) / 0.55)" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "nexus") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        {/* Primary rail: narrow icon strip */}
        <div className="flex w-[8%] flex-col items-center gap-1 border-e border-slate-200 bg-slate-900 p-1 pt-1.5 dark:border-slate-700">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="mt-1 space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded bg-slate-600 dark:bg-slate-600"
                style={{ opacity: i === 1 ? 1 : 0.4 }}
              />
            ))}
          </div>
        </div>
        {/* Secondary rail: panel sidebar */}
        <div className="w-[22%] space-y-0.5 border-e border-slate-200 bg-slate-800 p-1 pt-1.5 dark:border-slate-700">
          {[65, 50, 55, 45, 60].map((w, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full"
              style={{
                width: `${w}%`,
                background:
                  i === 0 ? "oklch(0.65 0.18 var(--workspace-hue, 250))" : "rgba(148,163,184,0.3)",
              }}
            />
          ))}
        </div>
        {/* Content area */}
        <div className="flex-1 p-1.5">
          <div className="mb-1 h-1 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-0.5 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
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
  // Scripe (EDGE) leads: the design system made literal, and the accent follows
  // the active workspace hue rather than a fixed palette.
  { value: "scripe", icon: Layers, preview: <WorkspacePreview variant="scripe" /> },
  { value: "nexus", icon: Columns2, preview: <WorkspacePreview variant="nexus" /> },
  { value: "hub", icon: LayoutDashboard, preview: <WorkspacePreview variant="hub" /> },
  { value: "wizard", icon: Footprints, preview: <WorkspacePreview variant="wizard" /> },
  { value: "shelf", icon: BookDown, preview: <WorkspacePreview variant="shelf" /> },
  {
    value: "collapseheader",
    icon: PanelTop,
    preview: <WorkspacePreview variant="collapseheader" />,
  },
  {
    value: "splitpane",
    icon: SplitSquareHorizontal,
    preview: <WorkspacePreview variant="splitpane" />,
  },
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
