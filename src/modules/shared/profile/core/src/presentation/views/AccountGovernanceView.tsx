"use client";

/**
 * AccountGovernanceView
 *
 * Clean B2B Enterprise Page 5 (/account/governance):
 * - Assigned RBAC Roles & Allowed OrgCore Branches
 * - Interactive 4-Node PBAC Permission Provenance Graph (Edition -> Branch -> Role -> Permission)
 * - Feature-Flagged Vacation / Authority Delegation Engine (hidden unless feature flag enabled)
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { useAccountGovernanceSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { PermissionProvenanceGraph } from "../components/PermissionProvenanceGraph";
import {
  UserCheck,
  Plus,
  Trash2,
  Calendar,
  ShieldCheck,
  Building2,
} from "lucide-react";

export function AccountGovernanceView() {
  const { t } = useI18n();
  const { profile } = useProfileDossierViewModel();
  const {
    governance,
    createDelegation,
    isCreatingDelegation,
    revokeDelegation,
    isRevokingDelegation,
  } = useAccountGovernanceSliceViewModel();

  const [delegateEmail, setDelegateEmail] = useState("");
  const [delegateReason, setDelegateReason] = useState("");

  const assignedRoles = governance?.assignedRoles ?? [];
  const allowedBranches = governance?.allowedBranches ?? [];
  const activeDelegations = governance?.delegations ?? [];
  const effectivePermissions = (governance?.effectivePermissions ?? []).map((p: any) =>
    typeof p === "string" ? p : String(p?.permission ?? p?.code ?? "")
  );

  const roleNames =
    assignedRoles.length > 0
      ? assignedRoles.map((r) => r.name)
      : profile?.roles?.map((r) => r.roleName) || [];

  const handleCreateDelegation = async () => {
    if (!delegateEmail.trim()) return;
    await createDelegation({
      delegateAdminId: "",
      delegateDisplayName: delegateEmail.trim(),
      delegationType: "ACTING_AS",
      grantedScopes: effectivePermissions.slice(0, 2),
      justification: delegateReason.trim() || "Operational Delegation",
      startsAtUtc: new Date().toISOString(),
      expiresAtUtc: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
    setDelegateEmail("");
    setDelegateReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.governance.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.governance.description")}
        </p>
      </div>

      {/* 1. Assigned RBAC Roles & Allowed Organizational Branches */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.governance.assignedRolesTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.governance.assignedRolesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignedRoles.map((role) => (
              <div
                key={role.id || role.name}
                className="p-3 rounded-xl border border-nx-line bg-nx-raised flex items-start justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-nx-ink">{role.name}</p>
                  {role.description && (
                    <p className="text-[11px] text-nx-ink-3 mt-0.5">{role.description}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono border-nx-accent/30 text-nx-accent bg-nx-accent-wash"
                >
                  {t("profile.governance.effectiveGrant")}
                </Badge>
              </div>
            ))}
          </div>

          {allowedBranches.length > 0 && (
            <div className="pt-2 border-t border-nx-line">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3 mb-2">
                {t("profile.governance.branchesScopeLabel")}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {allowedBranches.map((branch) => (
                  <Badge
                    key={branch}
                    variant="outline"
                    className="text-xs border-nx-line bg-nx-raised text-nx-ink-2 gap-1.5"
                  >
                    <Building2 className="h-3 w-3 text-nx-accent" />
                    <span>{branch}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Interactive 4-Node PBAC Permission Provenance Graph */}
      <PermissionProvenanceGraph
        editionName={governance?.activeTenantName || profile?.editionName || ""}
        activeBranchName={governance?.activeBranchName || profile?.activeBranchName || ""}
        roles={roleNames}
        effectivePermissions={effectivePermissions}
        personas={assignedRoles.map((r) => ({
          personaId: r.id || r.name,
          roleTitle: r.name,
          scopeSummary: r.description || "",
          grantedPermissions: effectivePermissions,
        }))}
      />

      {/* 3. Feature-Flagged Vacation / Authority Delegation Engine */}
      {governance?.isDelegationFeatureEnabled && (
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.governance.delegationTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">
              {t("profile.governance.delegationDesc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {activeDelegations.length === 0 ? (
              <p className="text-xs text-nx-ink-3">{t("profile.governance.noDelegations")}</p>
            ) : (
              <div className="space-y-2.5">
                {activeDelegations.map((del) => (
                  <div
                    key={del.id}
                    className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-nx-ink">
                          {del.delegateDisplayName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-success/30 text-success bg-success/10"
                        >
                          {del.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-nx-ink-2">{del.justification}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-nx-ink-3">
                        <Calendar className="h-3 w-3 text-nx-accent" />
                        <span>
                          {new Date(del.startsAtUtc).toLocaleDateString()} &rarr;{" "}
                          {new Date(del.expiresAtUtc).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isRevokingDelegation}
                      onClick={() => revokeDelegation(del.id)}
                      className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t("profile.governance.revokeDelegationBtn")}</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-nx-line grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                value={delegateEmail}
                onChange={(e) => setDelegateEmail(e.target.value)}
                placeholder={t("profile.governance.delegateEmailPlaceholder")}
                className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
              />
              <Input
                value={delegateReason}
                onChange={(e) => setDelegateReason(e.target.value)}
                placeholder={t("profile.governance.delegateReasonPlaceholder")}
                className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
              />
              <Button
                type="button"
                size="sm"
                disabled={isCreatingDelegation}
                onClick={handleCreateDelegation}
                data-testid="create-delegation-btn"
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("profile.governance.grantDelegationBtn")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
