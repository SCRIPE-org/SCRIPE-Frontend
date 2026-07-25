"use client";

/**
 * HubSectionHeader — Reusable section header for Hub page sections.
 * Pattern: [icon] TITLE subtitle        [action]
 */

import React from "react";

interface HubSectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function HubSectionHeader({ icon, title, subtitle, action }: HubSectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-baseline gap-2.5">
        {icon}
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-nx-ink-2">{title}</h2>
        {subtitle && <span className="text-xs text-nx-ink-3">{subtitle}</span>}
      </div>
      {action}
    </div>
  );
}
