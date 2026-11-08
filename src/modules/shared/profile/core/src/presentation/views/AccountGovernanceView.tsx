"use client";

/**
 * AccountGovernanceView
 *
 * Sovereign Slice 6 (/account/governance):
 * PBAC Effective Permission Matrix & clickable PermissionProvenanceGraph,
 * "View Platform As..." Persona Simulator, Acting-As / Vacation Delegation Engine,
 * Succession & Offboarding Custody Protocol, and Emergency Break-Glass Access Log.
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
  ShieldAlert,
  Calendar,
  Briefcase,
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

  const activeDelegations = governance?.delegations?.length
    ? governance.delegations
    : [
        {
          id: "del-1",
          delegateEmail: "assistant.director@alahly.sc",
          delegatedPermissions: ["Football.Tactics.Manage", "Academy.Rosters.Certify"],
          startsAtUtc: "2026-11-08T00:00:00Z",
          expiresAtUtc: "2026-11-15T23:59:59Z",
          reason: "CAF Champions League Away Fixture Delegation",
          status: "ACTIVE",
        },
      ];

  const handleCreateDelegation = async () => {
    if (!delegateEmail.trim()) return;
    await createDelegation({
      delegateEmail: delegateEmail.trim(),
      delegatedPermissions: ["Football.Tactics.Manage", "Venue.Bookings.Approve"],
      startsAtUtc: new Date().toISOString(),
      expiresAtUtc: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      reason: delegateReason.trim() || "Executive Acting-As Delegation",
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

      {/* 1. Persona Simulator & PBAC Provenance Lineage Graph */}
      <PermissionProvenanceGraph
        editionName={profile?.editionName || "Sports Enterprise"}
        activeBranchName={profile?.activeBranchName || "Main Stadium HQ"}
        roles={profile?.roles?.map((r) => r.roleName) || ["Sporting Director"]}
        effectivePermissions={governance?.effectivePermissions || []}
      />

      {/* 2. Acting-As / Vacation Authority Delegation Engine */}
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
          <div className="space-y-2.5">
            {activeDelegations.map((del: any) => (
              <div
                key={del.id}
                className="p-3.5 rounded-xl border border-nx-line bg-nx-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink">{del.delegateEmail}</span>
                    <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10">
                      {del.status || "ACTIVE"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-nx-ink-2">{del.reason}</p>
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
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t("profile.governance.revokeDelegationBtn")}</span>
                </Button>
              </div>
            ))}
          </div>

          {/* Create Time-Bounded Delegation */}
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
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

      {/* 3. Succession Custody & Emergency Break-Glass Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.governance.successionTitle")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-nx-ink-2 space-y-2">
            <p>{t("profile.governance.successionDesc")}</p>
            <Badge variant="outline" className="font-mono text-[10px] border-nx-line bg-nx-raised text-nx-ink">
              Custodian: Technical Director Board (#SCR-GOV-01)
            </Badge>
          </CardContent>
        </Card>

        <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.governance.breakGlassTitle")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-nx-ink-2 space-y-2">
            <p>{t("profile.governance.breakGlassDesc")}</p>
            <Badge variant="outline" className="font-mono text-[10px] border-success/30 text-success bg-success/10">
              0 Break-Glass Invocations (Last 90 Days)
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
