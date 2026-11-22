"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { LayoutDashboard } from "lucide-react";

/** Props for {@link DynamicIcon}. */
export interface DynamicIconProps {
  /** Lucide icon name in PascalCase, camelCase, or kebab-case. */
  name: string;
  /** Width and height in pixels (default 18). */
  size?: number;
  /** Stroke width (default 1.8). */
  strokeWidth?: number;
  /** Optional extra CSS class names. */
  className?: string;
}

/**
 * Resolves a dynamic Lucide icon name string to its SVG icon component with a
 * `LayoutDashboard` fallback when the icon name is unknown or missing.
 */
export function DynamicIcon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className,
}: DynamicIconProps) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const registry = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{
      width?: number;
      height?: number;
      strokeWidth?: number;
      className?: string;
      "aria-hidden"?: boolean;
    }>
  >;
  const Icon = registry[PascalName ?? ""];
  if (Icon) {
    return (
      <Icon
        width={size}
        height={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden={true}
      />
    );
  }
  return (
    <LayoutDashboard
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={true}
    />
  );
}
