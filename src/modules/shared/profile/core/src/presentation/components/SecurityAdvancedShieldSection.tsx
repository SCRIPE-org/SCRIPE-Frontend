"use client";

/**
 * SecurityAdvancedShieldSection
 *
 * Renders Enterprise Trusted IP CIDR Allowlist Policy and
 * Emergency Account Lockdown trigger for B2B Administrators.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Globe,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
} from "lucide-react";

interface SecurityAdvancedShieldSectionProps {
  trustedCidrs: string[];
  onUpdatePolicy: (payload: {
    trustedCidrs?: string[];
  }) => Promise<unknown>;
  isUpdatingPolicy: boolean;
  onOpenLockdown: () => void;
}

export function SecurityAdvancedShieldSection({
  trustedCidrs,
  onUpdatePolicy,
  isUpdatingPolicy,
  onOpenLockdown,
}: SecurityAdvancedShieldSectionProps) {
  const { t } = useI18n();
  const [cidrInput, setCidrInput] = useState(
    trustedCidrs.length > 0 ? trustedCidrs.join(", ") : ""
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSavePolicy = async () => {
    const cidrs = cidrInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    await onUpdatePolicy({
      trustedCidrs: cidrs,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Enterprise Trusted IP CIDR Allowlist */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.security.trustedCidrsLabel")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
            {t("profile.security.cidrAllowlistDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
            <Input
              value={cidrInput}
              onChange={(e) => setCidrInput(e.target.value)}
              placeholder="197.55.12.0/24, 10.24.0.0/16"
              className="h-9 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedNotice ? (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("profile.common.saved")}
              </span>
            ) : (
              <span className="text-[11px] text-nx-ink-3">
                {t("profile.security.cidrAllowlistNotice")}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSavePolicy}
              disabled={isUpdatingPolicy}
              data-testid="save-security-shield-btn"
              className="h-8 text-xs font-semibold"
            >
              {t("profile.common.saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Account Lockdown (Nuclear Shield) */}
      <Card className="border border-destructive/40 bg-destructive/5 hover:border-destructive/60 transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold">
                {t("profile.lockdown.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-destructive/80 mt-1">
              {t("profile.lockdown.sectionDesc")}
            </CardDescription>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={onOpenLockdown}
            data-testid="trigger-lockdown-btn"
            className="text-xs font-semibold gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{t("profile.lockdown.triggerBtn")}</span>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}

