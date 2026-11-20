"use client";

/**
 * EmergencyLockdownShieldCard
 *
 * Destructive action card triggering immediate account-wide emergency lockdown.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ShieldAlert, ShieldX } from "lucide-react";

/** Props for {@link EmergencyLockdownShieldCard}. */
export interface EmergencyLockdownShieldCardProps {
  /** Opens the emergency lockdown confirmation modal. */
  onOpenLockdown: () => void;
}

/** Renders the emergency account lockdown trigger card inside the security shield section. */
export function EmergencyLockdownShieldCard({ onOpenLockdown }: EmergencyLockdownShieldCardProps) {
  const { t } = useI18n();

  return (
    <Card className="border border-destructive/40 bg-destructive/5 hover:border-destructive/60 transition-colors">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldX className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold">{t("profile.lockdown.sectionTitle")}</CardTitle>
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
  );
}
