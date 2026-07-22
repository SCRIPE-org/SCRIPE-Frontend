"use client";

import { Anchor, Briefcase, BookOpen, Search, AlignVerticalJustifyStart } from "lucide-react";
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
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-border bg-muted">
        <div className="flex h-[10%] items-center border-b border-border bg-card px-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-muted-foreground/30" />
          <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex h-[16%] items-end justify-center gap-1 border-t border-border px-3 pb-1">
          {[2, 2.5, 3, 3.5, 3, 2.5, 2].map((h, i) => (
            <div
              key={i}
              className={cn(
                "rounded bg-muted-foreground/30 transition-all",
                i === 3 && "bg-primary/40"
              )}
              style={{ width: `${h * 2.5}px`, height: `${h * 2.5}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "executive") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-border bg-muted">
        <div className="flex h-[16%] items-center gap-1 border-b border-border bg-card px-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-3 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex h-[8%] items-center gap-0.5 border-b border-border bg-muted/50 px-2">
          <div className="h-0.5 w-3 rounded-full bg-muted-foreground/50" />
          <div className="h-0.5 w-1 rounded-full bg-muted-foreground/30" />
          <div className="h-0.5 w-4 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex h-[10%] items-end gap-1 border-b border-border bg-card px-2">
          <div className="h-[70%] w-5 border-b-2 border-primary" />
          <div className="h-[60%] w-5" />
          <div className="h-[60%] w-5" />
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-muted-foreground/30" />
          <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  if (variant === "magazine") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-muted">
        <div className="flex w-[6%] flex-col items-center gap-1 bg-muted-foreground/20 pt-2">
          {[false, true, false, false].map((a, i) => (
            <div
              key={i}
              className={cn("h-1.5 w-1.5 rounded", a ? "bg-primary/60" : "bg-muted-foreground/30")}
            />
          ))}
        </div>
        <div className="flex flex-1 justify-center">
          <div className="w-[60%] p-2">
            <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-muted-foreground/30" />
            <div className="mb-1 h-1.5 w-1/2 rounded-full bg-muted-foreground/20" />
            <div className="h-1 w-2/3 rounded-full bg-muted-foreground/10" />
          </div>
        </div>
        <div className="w-[18%] space-y-1 border-l border-border bg-muted/50 p-1 pt-2">
          <div className="h-4 rounded bg-muted-foreground/20" />
          <div className="h-3 rounded bg-muted-foreground/10" />
        </div>
      </div>
    );
  }

  if (variant === "spotlight") {
    return (
      <div className="flex aspect-[16/10] w-full flex-col overflow-hidden rounded-md border border-border bg-muted">
        <div className="flex h-[8%] items-center border-b border-border bg-card px-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1" />
          <div className="h-1 w-2 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-center py-2.5">
          <div className="flex h-3 w-[65%] items-center rounded-full border border-muted-foreground/30 bg-card px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 pb-1.5">
          {[true, false, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full",
                a ? "w-4 bg-primary/30" : "w-3 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <div className="flex-1 p-2">
          <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-1/2 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  if (variant === "rail") {
    return (
      <div className="flex aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-muted">
        <div className="flex w-[8%] flex-col items-center gap-1.5 border-r border-muted-foreground/30 bg-muted-foreground/20 pt-2">
          {[false, true, false, false, false].map((a, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded",
                a ? "bg-primary/60 ring-1 ring-primary/30" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <div className="relative flex-1">
          <div className="absolute left-1 top-3 w-[30%] space-y-0.5 rounded border border-border bg-card p-1 shadow-lg">
            <div className="h-1 w-4/5 rounded-full bg-muted-foreground/30" />
            <div className="h-1 w-3/5 rounded-full bg-muted-foreground/20" />
            <div className="h-1 w-2/3 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="h-[14%] border-b border-border bg-card" />
            <div className="flex-1 p-2 pt-10">
              <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-muted-foreground/30" />
              <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/20" />
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
