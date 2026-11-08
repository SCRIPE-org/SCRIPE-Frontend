"use client";

/**
 * EnhancedToaster — Powered by Sileo Toast System
 *
 * Provides buttery-smooth physics-based morphing toasts with full Nexus design tokens,
 * direction-aware RTL positioning, and automatic light/dark theme adaptation.
 */

import { SileoToaster } from "@core/ui/sileo-toast";
import type { SileoToasterProps } from "@core/ui/sileo-toast";

export function EnhancedToaster(props: SileoToasterProps) {
  return <SileoToaster {...props} />;
}

export { SileoToaster };
