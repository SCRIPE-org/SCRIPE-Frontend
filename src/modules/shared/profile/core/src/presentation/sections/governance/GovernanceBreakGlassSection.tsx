"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Textarea } from "@core/ui/textarea";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import { AlertTriangle, Shield } from "lucide-react";

/**
 * Props for GovernanceBreakGlassSection.
 */
export interface GovernanceBreakGlassSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  hasStandingRoot: boolean;
  breakGlassReason: string;
  breakGlassSubmitted: boolean;
  onReasonChange: (value: string) => void;
  onSubmitBreakGlass: () => void;
}

/**
 * Role-aware Emergency Break-Glass card showing standing root notice for root admins
 * or justification submission for eligible tenant operators.
 */
export function GovernanceBreakGlassSection({
  t,
  hasStandingRoot,
  breakGlassReason,
  breakGlassSubmitted,
  onReasonChange,
  onSubmitBreakGlass,
}: GovernanceBreakGlassSectionProps) {
  return (
    <Card
      data-testid="governance-break-glass-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {hasStandingRoot ? (
            <Shield className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" style={{ minWidth: 16, minHeight: 16 }} />
          )}
          <CardTitle className="text-base font-bold text-nx-ink">
            {hasStandingRoot
              ? t("profile.governance.standingRootTitle")
              : t("profile.governance.breakGlassTitle")}
          </CardTitle>
          <SectionInfoPopover i18nPrefix="profile.infoPopover.emergencyBreakGlass" />
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {hasStandingRoot
            ? t("profile.governance.standingRootSubtitle")
            : t("profile.governance.breakGlassSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {hasStandingRoot ? (
          <div className="p-4 rounded-xl border border-nx-accent/30 bg-nx-accent-wash space-y-1.5">
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.governance.standingRootActiveBadge")}
            </p>
            <p className="text-xs text-nx-ink-2">
              {t("profile.governance.standingRootPolicyDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning">
              {t("profile.governance.breakGlassPolicyNote")}
            </div>
            <Textarea
              data-testid="break-glass-reason-input"
              value={breakGlassReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t("profile.governance.breakGlassReasonPlaceholder")}
              className="text-xs min-h-[84px]"
            />
            {breakGlassSubmitted && (
              <p className="text-xs text-success font-medium">
                {t("profile.governance.breakGlassLoggedNotice")}
              </p>
            )}
            <Button
              type="button"
              size="sm"
              data-testid="submit-break-glass-btn"
              disabled={!breakGlassReason.trim()}
              onClick={onSubmitBreakGlass}
              className="w-full sm:w-auto text-xs bg-warning text-nx-on-fill hover:bg-warning/90 font-semibold"
            >
              {t("profile.governance.requestBreakGlassBtn")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
