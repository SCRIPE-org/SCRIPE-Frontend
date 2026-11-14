"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@core/common/utils";

/**
 * LightStreak — Subtle diagonal lime ambient light streak
 * Used in hero headers or featured cards. Clipped, non-interactive, reduced-motion safe.
 */
export function LightStreak({ className }: { className?: string }) {
  return <div className={cn("light-streak", className)} aria-hidden="true" />;
}

/**
 * IconTile — Canonical 44x44px rounded tile with Signal Lime border & subtle gradient
 */
export function IconTile({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("icon-tile", className)} aria-hidden="true">
      <Icon className="size-5" />
    </div>
  );
}

/**
 * AcademyPill — Canonical semantic status pill
 */
export type PillVariant = "success" | "warning" | "danger" | "info" | "neutral" | "lime";

export function AcademyPill({
  children,
  variant = "lime",
  className,
}: {
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
}) {
  return (
    <span className={cn("pill", `pill-${variant}`, className)}>
      {children}
    </span>
  );
}

/**
 * AcademyPageHeader — Unified Academy workspace header with icon tile, title, and actions
 */
export interface AcademyPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export function AcademyPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  className,
}: AcademyPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-3.5">
        {Icon && <IconTile icon={Icon} />}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-nx-ink">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-nx-ink-2 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
