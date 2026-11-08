"use client";

/**
 * ProfileTelemetryHud
 *
 * Persistent Sovereign Telemetry HUD across all 15 /account/* routes.
 * Features: Club affiliation, Edition badge, Operational availability toggle,
 * Interactive SVG Security Posture Ring (0-100% Sovereign Hardened) + Guided Hardening Checklist,
 * Biometric Sudo status badge, and live workstation session count.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Switch } from "@core/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import {
  ShieldCheck,
  Monitor,
  Building2,
  Sparkles,
  CheckCircle2,
  Circle,
  Fingerprint,
  Plane,
} from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

interface ProfileTelemetryHudProps {
  profile?: AdminProfile | null;
  activeSessionCount?: number;
  onToggleAvailability?: (available: boolean) => void;
  onOpenSudoGate?: () => void;
  sudoActive?: boolean;
  travelShieldActive?: boolean;
}

export function ProfileTelemetryHud({
  profile,
  activeSessionCount = 3,
  onToggleAvailability,
  onOpenSudoGate,
  sudoActive = true,
  travelShieldActive = false,
}: ProfileTelemetryHudProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [checklistOpen, setChecklistOpen] = useState(false);

  const isAvailable = profile?.isAvailableForOperations ?? true;
  const securityScore = profile?.securityScore ?? 92;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, securityScore)) / 100) * circumference;

  const checklistItems = [
    { key: "passkey", label: t("profile.posture.passkey"), weight: "+30%", done: true, href: "/account/security" },
    { key: "totp", label: t("profile.posture.totp"), weight: "+25%", done: true, href: "/account/security" },
    { key: "hardwareKey", label: t("profile.posture.hardwareKey"), weight: "+15%", done: true, href: "/account/security" },
    { key: "duressPin", label: t("profile.posture.duressPin"), weight: "+12%", done: true, href: "/account/security" },
    { key: "trustedCidr", label: t("profile.posture.trustedCidr"), weight: "+10%", done: true, href: "/account/security" },
    { key: "signingSeal", label: t("profile.posture.signingSeal"), weight: "+8%", done: securityScore >= 98, href: "/account/credentials" },
  ];

  return (
    <>
      <Card className="w-full rounded-xl border border-nx-line bg-nx-surface p-4 sm:p-5 mb-6 hover:border-nx-line-hi transition-colors">
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
                <Badge
                  variant="outline"
                  className="border-nx-accent/30 text-nx-accent text-[10px] font-medium py-0 px-1.5 flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" style={{ minWidth: 12, minHeight: 12 }} />
                  <span>{profile?.editionName || t("profile.hud.defaultEdition")}</span>
                </Badge>
                {travelShieldActive && (
                  <Badge variant="outline" className="border-warning/40 text-warning text-[10px] py-0 px-1.5 flex items-center gap-1">
                    <Plane className="h-3 w-3" />
                    <span>{t("profile.hud.travelShieldActive")}</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-nx-ink-3 mt-0.5 font-mono">
                {profile?.activeBranchName || t("profile.hud.defaultBranch")} • {profile?.staffCode || "#SCR-AHLY-001"}
              </p>
            </div>
          </div>

          {/* Right: Operational Controls & Telemetry Gauges */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
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
                <span className="text-[10px] text-nx-ink-3">
                  {isAvailable ? t("profile.hud.inSession") : t("profile.hud.offDuty")}
                </span>
              </div>
            </div>

            {/* Interactive SVG Security Posture Ring */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChecklistOpen(true)}
              className="h-auto py-1.5 px-3 rounded-lg border-nx-line bg-nx-raised hover:border-nx-line-hi flex items-center gap-2.5"
              data-testid="security-posture-ring-trigger"
            >
              <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="var(--nx-line)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="var(--nx-accent)"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold font-mono text-nx-ink">
                  {securityScore}%
                </span>
              </div>
              <div className="flex flex-col text-start">
                <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                  {t("profile.hud.securityPosture")}
                </span>
                <span className="text-[10px] text-success">
                  {securityScore >= 75 ? t("profile.hud.hardened") : t("profile.hud.needsAttention")}
                </span>
              </div>
            </Button>

            {/* Biometric Sudo Mode Trigger */}
            {onOpenSudoGate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSudoGate}
                className="h-auto py-2 px-3 rounded-lg border-nx-line bg-nx-raised hover:border-nx-line-hi flex items-center gap-2"
                data-testid="sudo-mode-badge"
              >
                <Fingerprint className="h-4 w-4 text-nx-accent shrink-0" />
                <div className="flex flex-col text-start">
                  <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                    {sudoActive ? t("profile.hud.sudoActive") : t("profile.hud.sudoElevate")}
                  </span>
                  <span className="text-[10px] text-nx-ink-3 font-mono">15m TTL</span>
                </div>
              </Button>
            )}

            {/* Active Workstation Fleet Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised">
              <Monitor className="h-4 w-4 text-nx-accent shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] font-semibold text-nx-ink leading-tight">
                    {activeSessionCount}{" "}
                    {activeSessionCount === 1
                      ? t("profile.hud.sessionSingular")
                      : t("profile.hud.sessionPlural")}
                  </span>
                </div>
                <span className="text-[10px] text-nx-ink-3">{t("profile.hud.fleetActive")}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Guided Security Posture Hardening Checklist Dialog */}
      <Dialog open={checklistOpen} onOpenChange={setChecklistOpen}>
        <DialogContent className="sm:max-w-lg border-nx-line bg-nx-surface text-nx-ink">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-nx-ink flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nx-accent" />
              <span>{t("profile.posture.dialogTitle")} ({securityScore}%)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("profile.posture.dialogSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {checklistItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-lg border border-nx-line bg-nx-raised"
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-nx-ink-3 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-nx-ink">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-2">
                    {item.weight}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setChecklistOpen(false);
                      router.push(item.href);
                    }}
                    className="h-7 text-xs text-nx-accent"
                  >
                    {t("profile.posture.configure")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
