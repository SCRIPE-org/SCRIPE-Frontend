"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";

const CONTROL_MOTION =
  "transition-[color,background-color,border-color,box-shadow] ease-nx-enter motion-reduce:transition-none";

/** Props for {@link TopbarContextPill}. */
export interface TopbarContextPillProps {
  /** Whether the user is currently inside an operational module workspace. */
  isModuleMode: boolean;
  /** Human-readable active tenant or platform context label. */
  tenantName: string;
  /** Whether the user holds permissions to switch tenant/platform context. */
  canSwitchContext?: boolean;
  /** Accessible aria-label used when the pill acts as a context-switcher button. */
  switchAriaLabel?: string;
  /** Callback invoked when a permitted administrator opens the context switcher dialog. */
  onOpenSwitcher?: () => void;
}

/**
 * Shared topbar tenant/platform context pill consumed by both `NexusTopbar` and `HubTopbar`.
 */
export function TopbarContextPill({
  isModuleMode,
  tenantName,
  canSwitchContext = false,
  switchAriaLabel,
  onOpenSwitcher,
}: TopbarContextPillProps) {
  const toneClasses = isModuleMode
    ? "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent"
    : "border-nx-line bg-transparent text-nx-ink-2";

  const pillClasses = cn(
    "inline-flex max-w-[100px] items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0 sm:max-w-[160px] sm:px-3",
    CONTROL_MOTION,
    toneClasses
  );

  const dot = <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-info" />;

  if (canSwitchContext && onOpenSwitcher) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onOpenSwitcher}
        aria-label={switchAriaLabel ?? tenantName}
        data-testid="topbar-tenant-switcher-trigger"
        className={cn(
          "inline-flex h-8 max-w-[100px] shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap !rounded-full border px-2 py-1 text-[11px] font-semibold tracking-wide hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink sm:h-7 sm:max-w-[160px] sm:gap-1.5 sm:px-2.5",
          CONTROL_MOTION,
          toneClasses
        )}
      >
        {dot}
        <span className="truncate">{tenantName}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-75" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <div className={pillClasses} data-testid="topbar-context-pill">
      {dot}
      <span className="truncate">{tenantName}</span>
    </div>
  );
}
