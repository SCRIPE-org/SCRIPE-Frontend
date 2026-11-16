"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Fingerprint, Lock, Monitor } from "lucide-react";
import { formatSudoRemainingTime } from "./ProfilePostureChecklistDialog";

/** Props for {@link TelemetryHudBadges}. */
export interface TelemetryHudBadgesProps {
  /** Computed account security posture score (0–100). */
  securityScore: number;
  /** Whether sudo mode is currently elevated. */
  effectiveSudoActive: boolean;
  /** Seconds remaining in the active sudo elevation window. */
  remainingSeconds: number;
  /** Number of active sessions across the workstation fleet. */
  resolvedSessionCount: number;
  /** Opens the security posture checklist dialog. */
  onOpenChecklist: () => void;
  /** Triggers the sudo step-up elevation dialog. */
  onTriggerSudo: () => void;
  /** Optional handler to lock sudo elevation immediately. */
  onLockSudo?: () => void | Promise<void>;
}

/**
 * Compact cluster of interactive telemetry badges: SVG posture ring,
 * Sudo countdown/lock controls, and active session fleet count indicator.
 */
export function TelemetryHudBadges({
  securityScore,
  effectiveSudoActive,
  remainingSeconds,
  resolvedSessionCount,
  onOpenChecklist,
  onTriggerSudo,
  onLockSudo,
}: TelemetryHudBadgesProps) {
  const { t } = useI18n();
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, securityScore)) / 100) * circumference;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenChecklist}
        className="h-auto py-1.5 px-3 rounded-lg border-nx-line bg-nx-raised hover:border-nx-line-hi flex items-center gap-2.5"
        data-testid="security-posture-ring-trigger"
      >
        <div className="relative h-9 w-9 flex items-center justify-center shrink-0">
          <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--nx-line)" strokeWidth="3" />
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
          <span className={securityScore >= 75 ? "text-[10px] text-success" : "text-[10px] text-warning"}>
            {securityScore >= 75 ? t("profile.hud.hardened") : t("profile.hud.needsAttention")}
          </span>
        </div>
      </Button>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onTriggerSudo}
          className={`h-auto py-2 px-3 rounded-lg border bg-nx-raised hover:border-nx-line-hi flex items-center gap-2 ${
            effectiveSudoActive ? "border-nx-accent/50" : "border-nx-line"
          }`}
          data-testid="sudo-mode-badge"
        >
          <Fingerprint
            className={`h-4 w-4 shrink-0 ${effectiveSudoActive ? "text-nx-accent" : "text-nx-ink-3"}`}
          />
          <div className="flex flex-col text-start">
            <span className="text-[11px] font-semibold text-nx-ink leading-tight">
              {effectiveSudoActive ? t("profile.hud.sudoActive") : t("profile.hud.sudoElevate")}
            </span>
            <span className="text-[10px] text-nx-ink-3 font-mono">
              {effectiveSudoActive && remainingSeconds > 0
                ? t("profile.hud.sudoCountdown", { time: formatSudoRemainingTime(remainingSeconds) })
                : t("profile.sudo.idleStatus")}
            </span>
          </div>
        </Button>
        {effectiveSudoActive && onLockSudo && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLockSudo}
            className="h-9 px-2.5 rounded-lg border-nx-line bg-nx-raised hover:border-nx-line-hi text-nx-ink-2 hover:text-nx-ink gap-1.5"
            aria-label={t("profile.hud.sudoLockBtn")}
            data-testid="hud-lock-sudo-btn"
          >
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">{t("profile.hud.sudoLockBtn")}</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-nx-line bg-nx-raised">
        <Monitor className="h-4 w-4 text-nx-accent shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-semibold text-nx-ink leading-tight">
              {resolvedSessionCount}{" "}
              {resolvedSessionCount === 1
                ? t("profile.hud.sessionSingular")
                : t("profile.hud.sessionPlural")}
            </span>
          </div>
          <span className="text-[10px] text-nx-ink-3">{t("profile.hud.fleetActive")}</span>
        </div>
      </div>
    </>
  );
}
