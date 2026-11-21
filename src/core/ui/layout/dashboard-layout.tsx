"use client";

import React from "react";
import { AuthenticatedShellFrame } from "@core/ui/layout/shared";
import { NexusLayout } from "@core/ui/layout/nexus/nexus-layout";

/** Props for {@link DashboardLayout}. */
export interface DashboardLayoutProps {
  /** Operational page content rendered inside the Nexus dual-rail shell. */
  children: React.ReactNode;
}

/**
 * Operational workspace layout wrapping `NexusLayout` inside the shared
 * `AuthenticatedShellFrame` bootstrap/banner frame.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthenticatedShellFrame>
      <NexusLayout>{children}</NexusLayout>
    </AuthenticatedShellFrame>
  );
}
