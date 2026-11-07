"use client";

/**
 * ProfileTelemetryHud
 *
 * Top operational executive banner for SCRIPE Academy & Club Executives.
 * Features: Club affiliation, Edition badge, Operational availability toggle,
 * Security Posture score, and live workstation session count.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import { ShieldCheck, ShieldAlert, Monitor, Building2, Sparkles } from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

interface ProfileTelemetryHudProps {
  profile?: AdminProfile | null;
  activeSessionCount?: number;
  onToggleAvailability?: (available: boolean) => void;
}

export function ProfileTelemetryHud({
  profile,
  activeSessionCount = 1,
  onToggleAvailability,
}: ProfileTelemetryHudProps) {
  const { t } = useI18n();

  const isAvailable = profile?.isAvailableForOperations ?? true;
  const securityScore = profile?.securityScore ?? (profile?.isTwoFactorEnabled ? 80 : 50);

  return (
    <Card className="w-full rounded-xl border border-nx-line bg-nx-surface p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Organization & Edition context */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-nx-line bg-nx-accent-wash text-nx-accent">
            <Building2 className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold tracking-tight text-nx-ink">
                {profile?.clubAffiliation || t("profile.hud.defaultClub")}
              </h2>
              <Badge variant="outline" className="border-nx-accent/30 text-nx-accent text-[10px] font-medium py-0 px-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                <span>{profile?.editionName || t("profile.hud.defaultEdition")}</span>
              </Badge>
            </div>
            <p className="text-xs text-nx-ink-3 mt-0.5">
              {profile?.activeBranchName || t("profile.hud.defaultBranch")} • {profile?.staffCode || "#SCR-ADM"}
            </p>
          </div>
        </div>

        {/* Right: Operational Controls & Telemetry Gauges */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Operational Availability Toggle */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised">
            <Switch
              checked={isAvailable}
              onCheckedChange={onToggleAvailability}
              aria-label={t("profile.hud.toggleAvailability")}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                {isAvailable ? t("profile.hud.activeStatus") : t("profile.hud.standbyStatus")}
              </span>
              <span className="text-[9px] text-nx-ink-3">
                {isAvailable ? t("profile.hud.inSession") : t("profile.hud.offDuty")}
              </span>
            </div>
          </div>

          {/* Security Posture Gauge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised">
            {securityScore >= 70 ? (
              <ShieldCheck className="h-4 w-4 text-success shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
            ) : (
              <ShieldAlert className="h-4 w-4 text-warning shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
            )}
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                {t("profile.hud.securityPosture")}: {securityScore}%
              </span>
              <span className="text-[9px] text-nx-ink-3">
                {securityScore >= 70 ? t("profile.hud.hardened") : t("profile.hud.needsAttention")}
              </span>
            </div>
          </div>

          {/* Active Workstation Fleet Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised">
            <Monitor className="h-4 w-4 text-nx-accent shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                  {activeSessionCount} {activeSessionCount === 1 ? t("profile.hud.sessionSingular") : t("profile.hud.sessionPlural")}
                </span>
              </div>
              <span className="text-[9px] text-nx-ink-3">{t("profile.hud.fleetActive")}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
