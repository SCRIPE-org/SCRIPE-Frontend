"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Building2, ShieldCheck, Briefcase, Shield } from "lucide-react";
/**
 * Membership item accepted by DossierAuthoritySection (supports both domain roleTitle and VM roleName).
 */
export interface DossierMembershipItem {
  tenantId: string;
  clubName: string;
  branchName: string;
  roleTitle?: string;
  roleName?: string;
  status: string;
  isPrimary: boolean;
}

/**
 * Props for DossierAuthoritySection.
 */
export interface DossierAuthoritySectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isPlatformAdmin: boolean;
  isSolePrimaryOwner: boolean;
  controlPlaneLabel: string | null | undefined;
  adminTypeName: string | null | undefined;
  editionName: string | null | undefined;
  memberships: DossierMembershipItem[];
}

/**
 * Principal authority vs. tenant club/branch memberships card on /account/dossier.
 */
export function DossierAuthoritySection({
  t,
  isPlatformAdmin,
  isSolePrimaryOwner,
  controlPlaneLabel,
  adminTypeName,
  editionName,
  memberships,
}: DossierAuthoritySectionProps) {
  if (isPlatformAdmin) {
    return (
      <Card
        data-testid="dossier-platform-authority-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.dossier.platformAuthorityTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.dossier.platformAuthorityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-ground flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-bold text-nx-ink">
                {controlPlaneLabel || t("profile.rail.globalControlPlane")}
              </p>
              <p className="text-xs text-nx-ink-3">
                {t("profile.dossier.platformAuthorityScope")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isSolePrimaryOwner && (
                <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px] py-0 px-2">
                  {t("profile.rail.soleRootGuard")}
                </Badge>
              )}
              {adminTypeName && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-nx-line text-nx-ink-2"
                >
                  {adminTypeName}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      data-testid="dossier-club-memberships-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          <CardTitle className="text-base font-bold text-nx-ink">
            {t("profile.dossier.membershipsTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.dossier.membershipsSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {memberships.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-w-0">
            {memberships.map((m) => (
              <div
                key={`${m.tenantId}-${m.branchName}`}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-ground flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 min-w-0"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-nx-ink">{m.clubName}</span>
                    {editionName && (
                      <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/30 text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <ShieldCheck
                          className="h-2.5 w-2.5"
                          style={{ minWidth: 10, minHeight: 10 }}
                        />
                        <span>{editionName}</span>
                      </Badge>
                    )}
                  </div>
                  {m.branchName && (
                    <p className="text-xs text-nx-ink-2 flex items-center gap-1.5 min-w-0">
                      <Briefcase
                        className="h-3 w-3 text-nx-ink-3 shrink-0"
                        style={{ minWidth: 12, minHeight: 12 }}
                      />
                      <span className="truncate">{m.branchName}</span>
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-nx-line text-nx-ink-2 shrink-0"
                >
                  {m.roleTitle ?? m.roleName ?? ""}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-nx-ink-3 p-3.5 rounded-xl border border-nx-line bg-nx-ground">
            {t("profile.dossier.noMembershipsNotice")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
