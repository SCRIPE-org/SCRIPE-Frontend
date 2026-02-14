"use client";

import { Newspaper, Clapperboard, Vault } from "lucide-react";
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
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[8%] items-center bg-slate-50 px-2 dark:bg-slate-800">
          <div className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-500" />
          <div className="flex-1" />
          <div className="h-0.5 w-6 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex h-[14%] items-center gap-1 border-b-2 border-foreground/10 px-2">
          <div className="h-3 w-3 rounded-full bg-primary/30" />
          <div className="h-1 w-6 rounded-full bg-slate-400 dark:bg-slate-500" />
        </div>
        <div className="flex h-[10%] items-end gap-1 border-b border-slate-200 px-2 dark:border-slate-700">
          {[true, false, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "h-[60%] w-5 border-b-2",
                a ? "border-foreground" : "border-transparent"
              )}
            />
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (variant === "cinema") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="relative h-[45%] bg-gradient-to-br from-primary/70 via-primary/50 to-primary/30">
          <div className="absolute left-0 right-0 top-0 flex h-[30%] items-center gap-1 px-2">
            <div className="h-2 w-2 rounded bg-white/40" />
            <div className="flex-1" />
            <div className="h-1 w-3 rounded-full bg-white/30" />
            <div className="h-1 w-2 rounded-full bg-white/30" />
          </div>
          <div className="absolute bottom-2 left-2">
            <div className="mb-1 h-1.5 w-12 rounded-full bg-white/60" />
            <div className="h-1 w-8 rounded-full bg-white/30" />
          </div>
        </div>
        <div className="h-3 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="flex-1 bg-slate-100 p-2 dark:bg-slate-900">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (variant === "vault") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex h-[14%] items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-2 w-3 rounded-sm bg-primary/30" />
          <div className="h-0.5 w-5 rounded-full bg-slate-400 dark:bg-slate-500" />
          <div className="flex-1" />
          <div className="h-1 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="flex-1 bg-white/95 p-1.5 dark:bg-slate-800/95">
          <div className="mb-1.5 h-1.5 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-0.5">
                <div className="mb-0.5 h-0.5 w-3/4 rounded-full bg-slate-400/40" />
                <div className="space-y-px">
                  <div className="h-1 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-1 rounded bg-slate-200/60 dark:bg-slate-700/60" />
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
