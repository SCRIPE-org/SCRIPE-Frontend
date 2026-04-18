/**
 * VersionsTab — Immutable version history with timeline-style layout.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { GitBranch, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import type { TenantPlan, TenantPlanVersionData } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";

interface VersionsTabProps {
  plan: TenantPlan;
  t: TFn;
}

export function VersionsTab({ plan, t }: VersionsTabProps) {
  const versions: TenantPlanVersionData[] = plan.versions || [];

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">{t("entitlements.tenantPlans.noVersions")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("entitlements.tenantPlans.noVersionsHint")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">{t("entitlements.tenantPlans.versionHistory")}</CardTitle>
          <Badge variant="secondary" className="text-xs">{versions.length}</Badge>
        </div>
        <CardDescription>{t("entitlements.tenantPlans.versionHistoryDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...versions].sort((a, b) => b.versionNumber - a.versionNumber).map((version) => (
            <div
              key={version.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                v{version.versionNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {t("entitlements.tenantPlans.tabVersions")} {version.versionNumber}
                  </span>
                  <Badge
                    variant={version.status === "Active" ? "success" : version.status === "Draft" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {version.status}
                  </Badge>
                </div>
                {version.changeNotes && (
                  <p className="text-xs text-muted-foreground mt-0.5">{version.changeNotes}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {version.publishedAt ? format(new Date(version.publishedAt), "PPp") : "—"}
                  </span>
                  {version.publishedBy && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {version.publishedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
