"use client";

/**
 * PermissionProvenanceGraph
 *
 * Interactive PBAC Effective Permission Matrix & Provenance Graph ("Why do I have access?")
 * plus "View Platform As..." Persona Simulator driven by /api/v1/account/governance.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Scale,
  ArrowRight,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface PersonaOption {
  personaId: string;
  roleTitle: string;
  scopeSummary: string;
  grantedPermissions: string[];
}

interface PermissionProvenanceGraphProps {
  editionName: string;
  activeBranchName: string;
  roles: string[];
  effectivePermissions: string[];
  personas?: PersonaOption[];
}

export function PermissionProvenanceGraph({
  editionName,
  activeBranchName,
  roles,
  effectivePermissions,
  personas = [],
}: PermissionProvenanceGraphProps) {
  const { t } = useI18n();
  const [selectedPermission, setSelectedPermission] = useState<string>(
    effectivePermissions[0] || ""
  );
  const [simulatedPersona, setSimulatedPersona] = useState<string>(
    personas[0]?.personaId || roles[0] || ""
  );

  const activePermission = selectedPermission || effectivePermissions[0] || "";
  const primaryRole = roles[0] || personas[0]?.roleTitle || "";

  return (
    <div className="space-y-4">
      {/* 1. "View Platform As..." Persona Simulator */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.governance.personaSimulatorTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
              {t("profile.governance.personaSimulatorDesc")}
            </CardDescription>
          </div>
          {simulatedPersona && (
            <Badge variant="outline" className="font-mono text-[10px] border-nx-accent/40 text-nx-accent bg-nx-accent-wash">
              {simulatedPersona}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {personas.map((p) => (
              <Button
                key={p.personaId}
                type="button"
                size="sm"
                variant={simulatedPersona === p.personaId ? "default" : "outline"}
                onClick={() => setSimulatedPersona(p.personaId)}
                data-testid={`persona-sim-${p.personaId}`}
                className={
                  simulatedPersona === p.personaId
                    ? "h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill"
                    : "h-8 text-xs border-nx-line bg-nx-raised text-nx-ink-2"
                }
              >
                <UserCheck className="h-3.5 w-3.5 me-1.5" />
                {p.roleTitle}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. PBAC Effective Permission Matrix & Provenance Lineage */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.governance.provenanceTitle")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.governance.provenanceDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {effectivePermissions.slice(0, 16).map((perm) => {
              const active = activePermission === perm;
              return (
                <Button
                  key={perm}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPermission(perm)}
                  className={
                    active
                      ? "h-7 text-[11px] font-mono border-nx-accent text-nx-accent bg-nx-accent-wash font-bold"
                      : "h-7 text-[11px] font-mono border-nx-line bg-nx-raised text-nx-ink-2"
                  }
                >
                  <CheckCircle2 className="h-3 w-3 me-1 text-success" />
                  {perm}
                </Button>
              );
            })}
          </div>

          <div
            data-testid="permission-provenance-chain"
            className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-2.5"
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-nx-ink-3">
              {t("profile.governance.whyDoIHaveAccess")}:{" "}
              <span className="text-nx-accent font-bold">{activePermission}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center text-xs">
              <div className="p-3 rounded-lg border border-nx-line bg-nx-surface flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-nx-ink-3 block">1. {t("profile.dossier.platformTier")}</span>
                  <span className="font-bold text-nx-ink flex items-center gap-1 mt-0.5">
                    <Sparkles className="h-3 w-3 text-nx-accent" />
                    {editionName}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-nx-ink-3 hidden sm:block" />
              </div>

              <div className="p-3 rounded-lg border border-nx-line bg-nx-surface flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-nx-ink-3 block">2. {t("profile.dossier.activeBranch")}</span>
                  <span className="font-bold text-nx-ink flex items-center gap-1 mt-0.5">
                    <Building2 className="h-3 w-3 text-nx-accent" />
                    {activeBranchName}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-nx-ink-3 hidden sm:block" />
              </div>

              <div className="p-3 rounded-lg border border-nx-line bg-nx-surface flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-nx-ink-3 block">3. {t("profile.dossier.assignedRoles")}</span>
                  <span className="font-bold text-nx-ink flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-nx-accent" />
                    {primaryRole}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-nx-ink-3 hidden sm:block" />
              </div>

              <div className="p-3 rounded-lg border border-success/40 bg-success/10">
                <span className="text-[10px] text-success font-semibold block">
                  4. {t("profile.governance.effectiveGrant")}
                </span>
                <span className="font-mono font-bold text-nx-ink text-[11px] truncate block mt-0.5">
                  {activePermission}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
