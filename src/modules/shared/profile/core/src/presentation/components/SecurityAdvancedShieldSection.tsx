"use client";

/**
 * SecurityAdvancedShieldSection
 *
 * Renders Zero-Trust Away-Match Travel Shield, Trusted Geo-Fence CIDR Policy,
 * Duress / Panic PIN & Silent Security Canary, and Emergency Account Lockdown trigger.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Switch } from "@core/ui/switch";
import {
  Globe,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  BellRing,
  Plane,
} from "lucide-react";

interface SecurityAdvancedShieldSectionProps {
  awayMatchTravelShieldEnabled: boolean;
  trustedCidrs: string[];
  hasDuressPinConfigured: boolean;
  onUpdatePolicy: (payload: {
    awayMatchTravelShieldEnabled?: boolean;
    trustedCidrs?: string[];
    duressPin?: string;
  }) => Promise<unknown>;
  isUpdatingPolicy: boolean;
  onOpenLockdown: () => void;
}

export function SecurityAdvancedShieldSection({
  awayMatchTravelShieldEnabled,
  trustedCidrs,
  hasDuressPinConfigured,
  onUpdatePolicy,
  isUpdatingPolicy,
  onOpenLockdown,
}: SecurityAdvancedShieldSectionProps) {
  const { t } = useI18n();
  const [cidrInput, setCidrInput] = useState(
    trustedCidrs.length > 0 ? trustedCidrs.join(", ") : "197.55.12.0/24, 10.24.0.0/16"
  );
  const [duressPin, setDuressPin] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggleTravelShield = async (checked: boolean) => {
    await onUpdatePolicy({ awayMatchTravelShieldEnabled: checked });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSavePolicy = async () => {
    const cidrs = cidrInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    await onUpdatePolicy({
      trustedCidrs: cidrs,
      duressPin: duressPin.length >= 4 ? duressPin : undefined,
    });
    setDuressPin("");
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Zero-Trust Away-Match Travel Shield & CIDR Geo-Fence */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.security.travelShieldTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-0.5">
              {t("profile.security.travelShieldDesc")}
            </CardDescription>
          </div>

          <Switch
            checked={awayMatchTravelShieldEnabled}
            onCheckedChange={handleToggleTravelShield}
            disabled={isUpdatingPolicy}
            aria-label={t("profile.security.travelShieldTitle")}
          />
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-nx-ink">
                <Globe className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("profile.security.trustedCidrsLabel")}</span>
              </div>
              <Input
                value={cidrInput}
                onChange={(e) => setCidrInput(e.target.value)}
                placeholder="197.55.12.0/24, 10.24.0.0/16"
                className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
              />
            </div>

            <div className="p-3 rounded-xl border border-nx-line bg-nx-raised space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-nx-ink">
                  <BellRing className="h-3.5 w-3.5 text-nx-accent" />
                  <span>{t("profile.security.duressPinLabel")}</span>
                </div>
                {hasDuressPinConfigured && (
                  <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10">
                    {t("profile.security.canaryArmed")}
                  </Badge>
                )}
              </div>
              <Input
                type="password"
                maxLength={6}
                value={duressPin}
                onChange={(e) => setDuressPin(e.target.value)}
                placeholder={t("profile.security.duressPinPlaceholder")}
                className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedNotice ? (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("profile.common.saved")}
              </span>
            ) : (
              <span className="text-[11px] text-nx-ink-3">
                {t("profile.security.canaryNotice")}
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
