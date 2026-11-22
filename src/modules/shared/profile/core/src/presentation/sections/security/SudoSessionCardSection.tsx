"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import { CheckCircle2, Fingerprint, Lock } from "lucide-react";

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Props for SudoSessionCardSection.
 */
export interface SudoSessionCardSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isSudoActive: boolean;
  sudoRemainingSeconds: number;
  sudoMethodUsed: string | null | undefined;
  onOpenSudoModal: () => void;
  onLockSudoSession: () => void;
}

/**
 * Unified elevated Sudo mode card displaying active session countdown and step-up/lock controls.
 */
export function SudoSessionCardSection({
  t,
  isSudoActive,
  sudoRemainingSeconds,
  sudoMethodUsed,
  onOpenSudoModal,
  onLockSudoSession,
}: SudoSessionCardSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.sudo.sectionTitle")}
            </CardTitle>
            <SectionInfoPopover i18nPrefix="profile.infoPopover.biometricSudo" />
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.sudo.sectionDesc")}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {isSudoActive ? (
            <>
              <Badge
                variant="outline"
                className="border-success/30 text-success bg-success/10 text-xs py-1 px-2.5 gap-1.5 font-mono"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{t("profile.sudo.activeSession")}</span>
                {sudoRemainingSeconds > 0 && <span>({formatCountdown(sudoRemainingSeconds)})</span>}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onLockSudoSession}
                data-testid="lock-sudo-security-btn"
                className="text-xs font-semibold gap-1.5 border-nx-line bg-nx-raised text-nx-ink"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{t("profile.sudo.lockSudoBtn")}</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSudoModal}
              data-testid="step-up-sudo-btn"
              className="text-xs font-semibold gap-1.5 border-nx-line bg-nx-raised text-nx-ink"
            >
              <Fingerprint className="h-3.5 w-3.5 text-nx-accent" />
              <span>{t("profile.sudo.stepUpBtn")}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-nx-ink-2">
          {t("profile.sudo.infoNotice")}
          {isSudoActive && sudoMethodUsed ? ` • ${sudoMethodUsed.toUpperCase()}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
