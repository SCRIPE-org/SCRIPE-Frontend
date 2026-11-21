import { Suspense } from "react";
import { AuthenticatedShellFrame } from "@core/ui/layout/shared";
import { HubLaunchpadFallback } from "./hub-launchpad-fallback";

/**
 * Standalone layout for `/hub` Launchpad outside the dual-rail `(modules)` shell.
 */
export default function HubLaunchpadLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedShellFrame>
      <Suspense fallback={<HubLaunchpadFallback />}>{children}</Suspense>
    </AuthenticatedShellFrame>
  );
}
