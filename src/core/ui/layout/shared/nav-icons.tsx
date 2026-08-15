"use client";

import { cn } from "@core/common/utils";

/**
 * ============================================================================
 * CUSTOM NAV ICONS — Panel toggle icons
 * ============================================================================
 *
 * SVG panel-toggle glyphs that survived the one-shell collapse as shared
 * infrastructure: the nexus topbar consumes them to render its panel
 * open/collapse affordances (LTR + RTL). Kept as standalone components for
 * reusability and testability rather than inlined at each call site.
 * ============================================================================
 */

interface NavIconProps {
  className?: string;
}

/**
 * Staggered horizontal lines icon — indicates a panel menu can be opened.
 * Three lines of decreasing width suggest a collapsed/truncated sidebar.
 */
export function PanelMenuIcon({ className }: NavIconProps) {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
      <rect x="3" y="11" width="12" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
      <rect x="3" y="16" width="15" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
    </svg>
  );
}

/**
 * Mirrored staggered lines icon for RTL layouts.
 */
export function PanelMenuIconRTL({ className }: NavIconProps) {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: "scaleX(-1)" }}
    >
      <rect x="3" y="6" width="18" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
      <rect x="3" y="11" width="12" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
      <rect x="3" y="16" width="15" height="2" rx="1" fill="var(--nx-accent, hsl(var(--primary)))" />
    </svg>
  );
}

/**
 * Left-pointing chevron — indicates the panel can be collapsed (LTR).
 */
export function PanelCollapseIcon({ className }: NavIconProps) {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="var(--nx-accent, hsl(var(--primary)))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Right-pointing chevron — indicates the panel can be collapsed (RTL).
 */
export function PanelCollapseIconRTL({ className }: NavIconProps) {
  return (
    <svg
      className={cn("h-8 w-8", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="var(--nx-accent, hsl(var(--primary)))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
