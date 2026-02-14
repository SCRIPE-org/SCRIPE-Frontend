"use client";

import { MessageSquare, MapPin, Rss, CalendarDays, Users, TerminalSquare } from "lucide-react";
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
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[20%] space-y-0.5 border-e border-slate-200 bg-slate-100 p-1 pt-2 dark:border-slate-700 dark:bg-slate-800">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-0.5 rounded p-0.5",
                i === 1 ? "bg-primary/10" : ""
              )}
            >
              <div className="h-1 w-1 rounded bg-slate-300 dark:bg-slate-600" />
              <div className="h-0.5 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-[12%] items-center border-b border-slate-200 bg-slate-50 px-1.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-1 w-1 rounded bg-primary/40" />
            <div className="ms-1 h-0.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="flex-1 space-y-1 p-1.5">
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="max-w-[60%] rounded bg-slate-100 p-0.5 dark:bg-slate-800">
                <div className="h-0.5 w-full rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
            </div>
            <div className="flex justify-end gap-0.5">
              <div className="max-w-[50%] rounded bg-primary/20 p-0.5">
                <div className="h-0.5 w-full rounded-full bg-primary/60" />
              </div>
            </div>
          </div>
          <div className="flex h-[14%] items-center border-t border-slate-200 bg-slate-50 px-1.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-2 flex-1 rounded border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "map") {
    return (
      <div className="relative flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-gradient-to-br from-emerald-100 to-teal-50 dark:border-slate-700/50 dark:from-emerald-900/30 dark:to-teal-900/20">
        <div className="absolute left-1 right-1 top-1 flex items-center justify-between">
          <div className="flex h-2 w-5 items-center justify-center rounded bg-white/80 shadow-sm dark:bg-slate-800/80">
            <div className="h-0.5 w-3 rounded-full bg-slate-400" />
          </div>
          <div className="flex gap-0.5">
            <div className="h-2 w-2 rounded bg-white/80 shadow-sm dark:bg-slate-800/80" />
            <div className="h-2 w-2 rounded bg-white/80 shadow-sm dark:bg-slate-800/80" />
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-md" />
        </div>
        <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
          <div className="flex h-2 w-2 items-center justify-center rounded bg-white/80 text-[4px] shadow-sm dark:bg-slate-800/80">
            +
          </div>
          <div className="flex h-2 w-2 items-center justify-center rounded bg-white/80 text-[4px] shadow-sm dark:bg-slate-800/80">
            −
          </div>
        </div>
      </div>
    );
  }

  if (variant === "feed") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[15%] space-y-1 border-e border-slate-200 bg-white p-1 pt-2 dark:border-slate-700 dark:bg-slate-800">
          {[false, true, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "mx-auto h-2 w-2 rounded",
                a ? "bg-primary/40" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col items-center space-y-1 p-1 pt-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-[80%] rounded border border-slate-200/50 bg-white p-1 dark:border-slate-700/50 dark:bg-slate-800"
            >
              <div className="mb-0.5 flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <div className="h-0.5 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
              </div>
              <div className="h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        <div className="w-[20%] border-s border-slate-200 bg-white p-1 pt-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-1 h-0.5 w-2/3 rounded-full bg-slate-400 dark:bg-slate-500" />
          <div className="space-y-0.5">
            <div className="h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-0.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="w-[22%] border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-1 grid grid-cols-7 gap-px">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-1 rounded-sm",
                  i === 5 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            ))}
          </div>
          <div className="mt-1 space-y-0.5">
            {[55, 65].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-[14%] items-center justify-between border-b border-slate-200 bg-slate-50 px-1.5 dark:border-slate-700 dark:bg-slate-800">
            <div className="h-1 w-1 rounded bg-slate-300 dark:bg-slate-600" />
            <div className="h-0.5 w-6 rounded-full bg-slate-400 dark:bg-slate-500" />
            <div className="h-1 w-1 rounded bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="flex-1 p-1">
            <div className="grid h-full grid-cols-7 gap-px">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-sm bg-slate-50 p-px dark:bg-slate-800/50">
                  {i === 2 && <div className="mt-0.5 h-0.5 w-full rounded-full bg-primary/30" />}
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
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[14%] items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="h-2 max-w-[40%] flex-1 rounded border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-700" />
          <div className="h-1 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex h-[16%] items-center gap-2 border-b border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="mb-0.5 h-1 w-4 rounded bg-primary/20" />
              <div className="h-0.5 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
          ))}
        </div>
        <div className="flex flex-1">
          <div className="w-[18%] space-y-0.5 border-e border-slate-200 bg-slate-50 p-1 pt-1.5 dark:border-slate-700 dark:bg-slate-800">
            {[55, 65, 50].map((w, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="flex-1 p-1.5">
            <div className="mb-1 h-1 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-1 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "terminal") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-700/50 bg-slate-950">
        <div className="flex h-[12%] items-center gap-0.5 bg-slate-900 px-1.5">
          <div className="h-1 w-1 rounded-full bg-red-500" />
          <div className="h-1 w-1 rounded-full bg-yellow-500" />
          <div className="h-1 w-1 rounded-full bg-green-500" />
          <div className="flex-1" />
          <div className="h-0.5 w-5 rounded-full bg-slate-600" />
        </div>
        <div className="flex flex-1">
          <div className="w-[20%] space-y-0.5 border-e border-slate-700/50 bg-slate-900/50 p-1 pt-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="h-0.5 w-1 rounded-full bg-green-500/60" />
                <div className="h-0.5 w-4 rounded-full bg-slate-500" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-1.5">
            <div className="mb-1 flex items-center gap-0.5">
              <div className="h-0.5 w-1 rounded-full bg-green-400" />
              <div className="h-0.5 w-6 rounded-full bg-slate-500" />
            </div>
            <div className="mb-0.5 h-0.5 w-1/2 rounded-full bg-slate-600" />
            <div className="h-0.5 w-1/3 rounded-full bg-slate-700" />
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
