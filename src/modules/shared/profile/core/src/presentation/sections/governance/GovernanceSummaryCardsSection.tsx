"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";

/**
 * Props for GovernanceSummaryCardsSection.
 */
export interface GovernanceSummaryCardsSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  assignedRoleNames: string[];
  isPlatformAdmin: boolean;
  allowedBranches: string[];
  activeBranchName: string | null | undefined;
  activeTenantName: string | null | undefined;
  controlPlaneLabel: string | null | undefined;
  effectivePermissionsCount: number;
}

/**
 * Top 3 governance telemetry summary cards: roles, branch coverage, and capability count.
 */
export function GovernanceSummaryCardsSection({
  t,
  assignedRoleNames,
  isPlatformAdmin,
  allowedBranches,
  activeBranchName,
  activeTenantName,
  controlPlaneLabel,
  effectivePermissionsCount,
}: GovernanceSummaryCardsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-2">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("profile.governance.summaryRolesLabel")}
          </CardDescription>
          <CardTitle className="text-2xl font-bold font-mono text-nx-ink">
            {assignedRoleNames.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {assignedRoleNames.length > 0 ? (
              assignedRoleNames.slice(0, 4).map((role) => (
                <Badge
                  key={role}
                  className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px]"
                >
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-nx-ink-3">
                {t("profile.governance.noRolesAssigned")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-2">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("profile.governance.summaryBranchesLabel")}
          </CardDescription>
          <CardTitle className="text-2xl font-bold font-mono text-nx-ink">
            {isPlatformAdmin ? "1" : allowedBranches.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-nx-ink-2">
          {isPlatformAdmin
            ? controlPlaneLabel || t("profile.rail.globalControlPlane")
            : allowedBranches.length > 0
              ? allowedBranches.join(" · ")
              : activeBranchName || "—"}
        </CardContent>
      </Card>

      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-2">
          <CardDescription className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("profile.governance.summaryCapabilitiesLabel")}
          </CardDescription>
          <CardTitle className="text-2xl font-bold font-mono text-nx-accent">
            {effectivePermissionsCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-nx-ink-2">
          {isPlatformAdmin
            ? t("profile.governance.platformControlPlaneScope")
            : activeTenantName || t("profile.governance.tenantAuthorityScope")}
        </CardContent>
      </Card>
    </div>
  );
}
