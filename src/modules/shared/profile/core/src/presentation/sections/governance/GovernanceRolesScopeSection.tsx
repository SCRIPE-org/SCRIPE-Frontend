"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { GitBranch, ShieldCheck } from "lucide-react";

/**
 * Props for GovernanceRolesScopeSection.
 */
export interface GovernanceRolesScopeSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  assignedRoleNames: string[];
  isPlatformAdmin: boolean;
  allowedBranches: string[];
  controlPlaneLabel: string | null | undefined;
}

/**
 * Assigned roles and branch-scope coverage card on /account/governance.
 */
export function GovernanceRolesScopeSection({
  t,
  assignedRoleNames,
  isPlatformAdmin,
  allowedBranches,
  controlPlaneLabel,
}: GovernanceRolesScopeSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          <CardTitle className="text-base font-bold text-nx-ink">
            {t("profile.governance.assignedRolesTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.governance.assignedRolesDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {assignedRoleNames.length > 0 ? (
            assignedRoleNames.map((role) => (
              <Badge
                key={role}
                className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-xs"
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

        <div className="p-3.5 rounded-xl border border-nx-line bg-nx-ground flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-nx-ink-2">
            <GitBranch className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <span>{t("profile.governance.branchesScopeLabel")}:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {isPlatformAdmin ? (
              <Badge variant="outline" className="text-[11px] border-nx-accent/30 text-nx-accent">
                {controlPlaneLabel || t("profile.rail.globalControlPlane")}
              </Badge>
            ) : allowedBranches.length > 0 ? (
              allowedBranches.map((branch) => (
                <Badge key={branch} variant="outline" className="text-[11px] border-nx-line text-nx-ink-2">
                  {branch}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-nx-ink-3">—</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
