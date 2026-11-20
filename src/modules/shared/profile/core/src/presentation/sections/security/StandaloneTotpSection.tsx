"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { TwoFactorStatus } from "../../components/TwoFactorStatus";
import { ShieldCheck } from "lucide-react";

/**
 * Props for StandaloneTotpSection.
 */
export interface StandaloneTotpSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isTwoFactorEnabled: boolean;
  backupCodesRemaining: number;
  isEnabling: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onRegenerateBackupCodes: () => void;
}

/**
 * Standalone Two-Factor Authentication (TOTP) card for setup, disablement, and backup code management.
 */
export function StandaloneTotpSection({
  t,
  isTwoFactorEnabled,
  backupCodesRemaining,
  isEnabling,
  onEnable,
  onDisable,
  onRegenerateBackupCodes,
}: StandaloneTotpSectionProps) {
  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.security.twoFactor.sectionTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-3 mt-1">
          {t("profile.security.totp.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorStatus
          isEnabled={isTwoFactorEnabled}
          backupCodesRemaining={backupCodesRemaining}
          onRegenerateBackupCodes={onRegenerateBackupCodes}
          onEnable={onEnable}
          onDisable={onDisable}
          isEnabling={isEnabling}
        />
      </CardContent>
    </Card>
  );
}
