/**
 * UserFeatureGate — Declarative component for user-level feature gating.
 *
 * Usage:
 *   <UserFeatureGate feature="api_access">
 *     <ApiSettingsPanel />
 *   </UserFeatureGate>
 *
 *   <UserFeatureGate feature="api_access" fallback={<UpgradeBanner />}>
 *     <ApiSettingsPanel />
 *   </UserFeatureGate>
 */
"use client";

import type { ReactNode } from "react";
import { useUserFeature } from "@core/hooks/use-user-feature";

interface UserFeatureGateProps {
  /** The feature key to check (must match a TenantFeatureDefinition key) */
  feature: string;
  /** Content shown when the user HAS the feature */
  children: ReactNode;
  /** Optional fallback content when the user does NOT have the feature */
  fallback?: ReactNode;
}

export function UserFeatureGate({ feature, children, fallback = null }: UserFeatureGateProps) {
  const hasAccess = useUserFeature(feature);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
