"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Shield } from "lucide-react";

/**
 * Props for GovernanceBreakGlassSection.
 */
export interface GovernanceBreakGlassSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  hasStandingRoot: boolean;
  incidentTicketId?: string;
  breakGlassReason: string;
  durationHours?: number;
  availableScopeCodes?: string[];
  selectedScopes?: string[];
  customScopeInput?: string;
  isSubmittingBreakGlass?: boolean;
  breakGlassError?: string | null;
  breakGlassSubmitted: boolean;
  onTicketChange?: (value: string) => void;
  onReasonChange: (value: string) => void;
  onDurationChange?: (hours: number) => void;
  onToggleScope?: (scope: string) => void;
  onCustomScopeChange?: (value: string) => void;
  onSubmitBreakGlass: () => void;
}

/**
 * Role-aware Emergency Break-Glass card showing standing root notice for root admins
 * or policy-validated incident ticket, scope, and justification submission for eligible tenant operators.
 */
export function GovernanceBreakGlassSection({
  t,
  hasStandingRoot,
  incidentTicketId = "",
  breakGlassReason,
  durationHours = 2,
  availableScopeCodes = [],
  selectedScopes = [],
  customScopeInput = "",
  isSubmittingBreakGlass = false,
  breakGlassError = null,
  breakGlassSubmitted,
  onTicketChange,
  onReasonChange,
  onDurationChange,
  onToggleScope,
  onCustomScopeChange,
  onSubmitBreakGlass,
}: GovernanceBreakGlassSectionProps) {
  const nonWildcardScopes = availableScopeCodes
    .filter((code) => Boolean(code) && code !== "*" && !code.endsWith(".*"))
    .slice(0, 15);

  const canSubmit = !isSubmittingBreakGlass && Boolean(breakGlassReason.trim());

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
          <div className="space-y-3.5">
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-xs text-warning">
              {t("profile.governance.breakGlassPolicyNote")}
            </div>

            {onTicketChange && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="break-glass-ticket-input" className="text-xs font-semibold text-nx-ink">
                    {t("profile.governance.breakGlassTicketLabel")}
                  </Label>
                  <Input
                    id="break-glass-ticket-input"
                    data-testid="break-glass-ticket-input"
                    value={incidentTicketId}
                    disabled={isSubmittingBreakGlass}
                    onChange={(e) => onTicketChange(e.target.value)}
                    placeholder={t("profile.governance.breakGlassTicketPlaceholder")}
                    maxLength={64}
                    className="font-mono text-xs"
                  />
                </div>

                {onDurationChange && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-nx-ink">
                      {t("profile.governance.breakGlassDurationLabel")}
                    </Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([1, 2, 4] as const).map((hrs) => (
                        <Button
                          key={hrs}
                          type="button"
                          size="sm"
                          disabled={isSubmittingBreakGlass}
                          variant={durationHours === hrs ? "default" : "outline"}
                          onClick={() => onDurationChange(hrs)}
                          className={
                            durationHours === hrs
                              ? "h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill"
                              : "h-8 text-xs"
                          }
                        >
                          {t("profile.governance.breakGlassDurationHours", { hours: hrs })}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onToggleScope && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-semibold text-nx-ink">
                    {t("profile.governance.breakGlassScopesLabel")}
                  </Label>
                  {selectedScopes.length > 0 && (
                    <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-2">
                      {selectedScopes.length} / 15
                    </Badge>
                  )}
                </div>

                {nonWildcardScopes.length > 0 ? (
                  <div
                    data-testid="break-glass-scopes-list"
                    className="flex flex-wrap gap-1.5 rounded-lg border border-nx-line bg-nx-ground p-2.5"
                  >
                    {nonWildcardScopes.map((code) => {
                      const active = selectedScopes.includes(code);
                      return (
                        <Button
                          key={code}
                          type="button"
                          size="sm"
                          disabled={isSubmittingBreakGlass}
                          variant={active ? "default" : "outline"}
                          data-testid={`break-glass-scope-chip-${code}`}
                          onClick={() => onToggleScope(code)}
                          className={
                            active
                              ? "h-7 px-2.5 text-[11px] font-mono font-semibold bg-nx-accent-fill text-nx-on-fill"
                              : "h-7 px-2.5 text-[11px] font-mono text-nx-ink-2"
                          }
                        >
                          <bdi dir="ltr">{code}</bdi>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  onCustomScopeChange && (
                    <Input
                      data-testid="break-glass-custom-scope-input"
                      value={customScopeInput}
                      disabled={isSubmittingBreakGlass}
                      onChange={(e) => onCustomScopeChange(e.target.value)}
                      placeholder={t("profile.governance.breakGlassCustomScopePlaceholder")}
                      className="font-mono text-xs"
                    />
                  )
                )}
              </div>
            )}

            <Textarea
              data-testid="break-glass-reason-input"
              value={breakGlassReason}
              disabled={isSubmittingBreakGlass}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t("profile.governance.breakGlassReasonPlaceholder")}
              className="text-xs min-h-[84px]"
            />

            {breakGlassError && (
              <Alert variant="destructive" data-testid="break-glass-error-alert">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertDescription className="text-xs">{breakGlassError}</AlertDescription>
              </Alert>
            )}

            {breakGlassSubmitted && (
              <p
                data-testid="break-glass-success-notice"
                className="text-xs text-success font-medium inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{t("profile.governance.breakGlassLoggedNotice")}</span>
              </p>
            )}

            <Button
              type="button"
              size="sm"
              data-testid="submit-break-glass-btn"
              disabled={!canSubmit}
              onClick={onSubmitBreakGlass}
              className="w-full sm:w-auto text-xs bg-warning text-nx-on-fill hover:bg-warning/90 font-semibold gap-1.5"
            >
              {isSubmittingBreakGlass && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              <span>{t("profile.governance.requestBreakGlassBtn")}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
