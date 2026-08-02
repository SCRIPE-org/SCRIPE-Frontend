"use client";

import { HelpCircle } from "lucide-react";
import { LUCIDE_MAP } from "./discoveryConstants";

interface DynamicIconProps {
  name: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Resolves a Lucide icon name (e.g. "building-2") from the backend
 * and renders the matching Lucide icon. Falls back to HelpCircle.
 */
export function DynamicIcon({ name, className, style }: DynamicIconProps) {
  const Icon = (name ? LUCIDE_MAP[name] : null) ?? HelpCircle;
  return <Icon className={className} style={style} />;
}
