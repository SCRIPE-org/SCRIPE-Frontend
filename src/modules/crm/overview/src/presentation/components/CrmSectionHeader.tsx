"use client";

import type { ReactNode } from "react";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";

interface CrmSectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

export function CrmSectionHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}: CrmSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-nx-line",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-nx-ink font-heading">
            {title}
          </h1>
          {badge && (
            <Badge
              variant="outline"
              className="border-nx-line bg-nx-surface text-[11px] font-semibold text-nx-ink-2"
            >
              {badge}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-nx-ink-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
