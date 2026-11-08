"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { useProfileDossierViewModel } from "../viewmodels/useProfileDossierViewModel";
import { useAccountGovernanceSliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { PermissionProvenanceGraph } from "../components/PermissionProvenanceGraph";
import { UserCheck, Flame, Plus, Trash2, CheckCircle2, ShieldCheck, Building2, Layers } from "lucide-react";

export function AccountGovernanceView() {
  const { t } = useI18n();
  const { profile } = useProfileDossierViewModel();
  const {
    governance, createDelegation, isCreatingDelegation,
    revokeDelegation,
  } = useAccountGovernanceSliceViewModel();

  const [delegateEmail, setDelegateEmail] = useState("");
  const [delegateRole, setDelegateRole] = useState("Branch Operations Lead");
  const [breakGlassReason, setBreakGlassReason] = useState("");
  const [breakGlassSubmitted, setBreakGlassSubmitted] = useState(false);

  const delegations = governance?.delegations ?? [
    {
      id: "del-1",
      delegateEmail: "omar.hassan@al-ahly.org",
      grantedScopes: ["Branch Operations Lead"],
      startsAtUtc: "2026-04-01T08:00:00Z",
      expiresAtUtc: "2026-04-21T18:00:00Z",
      status: "Active",
    },
  ];

  const handleAddDelegation = async () => {
    const email = delegateEmail.trim() || "nadia.mansour@al-ahly.org";
    const now = new Date();
    const exp = new Date(now.getTime() + 7 * 86400000);
    await createDelegation({
      delegateEmail: email,
      grantedScopes: [delegateRole],
      startsAtUtc: now.toISOString(),
      expiresAtUtc: exp.toISOString(),
    });
    setDelegateEmail("");
  };

  const handleRequestBreakGlass = () => {
    setBreakGlassReason("");
    setBreakGlassSubmitted(true);
  };

  const roleNames = (profile?.roles ?? []).map((r) => r.roleName || r.roleCode || "SuperAdmin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.governance.title")}</h1>
        <p className="text-xs text-nx-ink-3 mt-1">{t("profile.governance.subtitle")}</p>
      </div>

      {/* 1. Top Executive Access Summary Strip */}
      <div data-testid="governance-summary-strip" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.governance.summaryRolesLabel")}</p>
            <p className="text-lg font-bold text-nx-ink mt-0.5">2</p>
            <p className="text-[11px] text-nx-accent font-medium mt-0.5">{t("profile.governance.summaryRolesSub")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
            <ShieldCheck className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.governance.summaryBranchesLabel")}</p>
            <p className="text-lg font-bold text-nx-ink mt-0.5">3</p>
            <p className="text-[11px] text-nx-ink-2 font-medium mt-0.5">{t("profile.governance.summaryBranchesSub")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-line bg-nx-ground text-nx-accent">
            <Building2 className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nx-ink-3">{t("profile.governance.summaryCapabilitiesLabel")}</p>
            <p className="text-lg font-bold text-nx-ink mt-0.5">12</p>
            <p className="text-[11px] text-success font-medium mt-0.5">{t("profile.governance.summaryCapabilitiesSub")}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-nx-line bg-nx-ground text-nx-accent">
            <Layers className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
        </div>
      </div>

      {/* 2. Assigned Roles & Operating Branch Scope Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="assigned-roles-grid">
        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-nx-ink">{t("profile.governance.role1Title")}</span>
            <Badge className="bg-nx-accent-fill text-nx-on-fill text-[10px] font-bold">{t("profile.governance.primaryRoleBadge")}</Badge>
          </div>
          <p className="text-xs text-nx-ink-2 leading-relaxed">{t("profile.governance.role1Desc")}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {["Cairo HQ — Main Stadium", "New Cairo Campus", "Alexandria Complex"].map((b) => (
              <Badge key={b} variant="outline" className="border-nx-line text-nx-ink-2 text-[10px]">{b}</Badge>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-nx-line bg-nx-surface p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-nx-ink">{t("profile.governance.role2Title")}</span>
            <Badge variant="outline" className="border-nx-accent/30 text-nx-accent text-[10px]">{t("profile.governance.domainRoleBadge")}</Badge>
          </div>
          <p className="text-xs text-nx-ink-2 leading-relaxed">{t("profile.governance.role2Desc")}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {["Cairo HQ — Main Stadium", "New Cairo Campus"].map((b) => (
              <Badge key={b} variant="outline" className="border-nx-line text-nx-ink-2 text-[10px]">{b}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Scalable Business Module Capabilities Matrix */}
      <PermissionProvenanceGraph
        permissions={profile?.permissions}
        roles={roleNames}
        activeBranch={profile?.activeBranchName || "Cairo HQ — Main Stadium"}
        editionName={profile?.editionName || "Sports Enterprise Ultra"}
      />

      {/* 4. Authority Delegation & Emergency Break-Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="governance-delegation-card" className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-base font-bold text-nx-ink">{t("profile.governance.delegationTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3">{t("profile.governance.delegationSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2.5">
              {delegations.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-nx-line bg-nx-ground flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-nx-ink">{d.delegateEmail}</span>
                      <Badge className="bg-success/15 text-success border border-success/30 text-[10px]">{d.status}</Badge>
                    </div>
                    <p className="text-[11px] font-mono text-nx-ink-3 mt-0.5">{d.grantedScopes.join(", ")}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void revokeDelegation(d.id)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                    <Trash2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-nx-line">
              <Input data-testid="delegation-email-input" value={delegateEmail} onChange={(e) => setDelegateEmail(e.target.value)} placeholder="colleague@al-ahly.org" className="text-xs h-8" />
              <Input value={delegateRole} onChange={(e) => setDelegateRole(e.target.value)} className="text-xs h-8 sm:w-44" />
              <Button size="sm" data-testid="create-delegation-btn" disabled={isCreatingDelegation} onClick={() => void handleAddDelegation()} className="bg-nx-accent-fill text-nx-on-fill font-semibold text-xs h-8 shrink-0 gap-1">
                <Plus className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                <span>{t("profile.governance.grantDelegationBtn")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="governance-breakglass-card" className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-warning" style={{ minWidth: 16, minHeight: 16 }} />
                <CardTitle className="text-base font-bold text-nx-ink">{t("profile.governance.breakGlassTitle")}</CardTitle>
              </div>
              <CardDescription className="text-xs text-nx-ink-3 mt-1">{t("profile.governance.breakGlassSubtitle")}</CardDescription>
            </div>
            <Badge variant="outline" className="border-warning/40 text-warning text-[10px] font-mono">JIT 60m TTL</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-nx-ink-2 leading-relaxed">{t("profile.governance.breakGlassPolicyNote")}</p>
            <div className="space-y-2.5">
              <Input data-testid="breakglass-reason-input" value={breakGlassReason} onChange={(e) => setBreakGlassReason(e.target.value)} placeholder={t("profile.governance.breakGlassReasonPlaceholder")} className="text-xs h-8" />
              <div className="flex items-center justify-between">
                {breakGlassSubmitted ? (
                  <span data-testid="breakglass-submitted-badge" className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
                    {t("profile.governance.breakGlassLoggedNotice")}
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-nx-ink-3">Audit Event:Identity.BreakGlass.Requested</span>
                )}
                <Button size="sm" data-testid="request-breakglass-btn" onClick={handleRequestBreakGlass} className="bg-warning text-nx-on-fill font-semibold text-xs h-8">
                  {t("profile.governance.requestBreakGlassBtn")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
