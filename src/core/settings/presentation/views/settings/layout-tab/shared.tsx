"use client";

import { Check } from "lucide-react";
import { cn } from "@core/common/utils";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
export interface LayoutOption {
  value: string;
  icon: React.ElementType;
  preview: React.ReactNode;
}

export type LayoutCategory =
  | "sidebar"
  | "alternative"
  | "structural"
  | "visual"
  | "specialized"
  | "navigation"
  | "workspace"
  | "advanced"
  | "industry";

// ────────────────────────────────────────────
// Layout Card
// ────────────────────────────────────────────
export function LayoutCard({
  layout,
  isSelected,
  onSelect,
  name,
  description,
}: {
  layout: LayoutOption;
  isSelected: boolean;
  onSelect: () => void;
  name: string;
  description: string;
}) {
  const Icon = layout.icon;

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        isSelected
          ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/10 ring-2 ring-primary/20"
          : "border-border hover:border-primary/40 hover:bg-muted/30"
      )}
      onClick={onSelect}
    >
      {/* Preview */}
      <div
        className={cn(
          "mb-3 overflow-hidden rounded-lg transition-all duration-300",
          "ring-1 ring-border",
          isSelected && "ring-primary/30"
        )}
      >
        {layout.preview}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
            isSelected
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/70"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4
            className={cn(
              "truncate text-sm font-semibold transition-colors",
              isSelected && "text-primary"
            )}
          >
            {name}
          </h4>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 duration-200 animate-in zoom-in-50">
          <Check className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
// Layout Category Section
// ────────────────────────────────────────────
export function LayoutCategorySection({
  layouts,
  category,
  selectedLayout,
  onSelectLayout,
  t,
}: {
  layouts: LayoutOption[];
  category: LayoutCategory;
  selectedLayout: string;
  onSelectLayout: (value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        category === "sidebar"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {layouts.map((layout) => (
        <LayoutCard
          key={layout.value}
          layout={layout}
          isSelected={selectedLayout === layout.value}
          onSelect={() => onSelectLayout(layout.value)}
          name={t(`settings.layoutTemplate.options.${layout.value}.name`)}
          description={t(`settings.layoutTemplate.options.${layout.value}.description`)}
        />
      ))}
    </div>
  );
}
