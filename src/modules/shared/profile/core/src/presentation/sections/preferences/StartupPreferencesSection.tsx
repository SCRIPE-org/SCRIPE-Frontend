"use client";

import { AlertTriangle, Compass, Lock, RotateCcw, ShieldAlert } from "lucide-react";
import {
  buildStructuredLandingTargetOptions,
  type NavigationData,
  type WorkspaceGroup,
} from "@core/navigation";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";

export interface StartupPreferencesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  startupTarget: string;
  activeContextKey: string;
  isImpersonating: boolean;
  isEnforcedByRole: boolean;
  enforcingRoleName?: string | null;
  fallbackActive: boolean;
  fallbackReason?: string | null;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  onStartupTargetChange: (target: string) => void;
  onResetStartupTarget: () => void;
}

/**
 * Startup & Post-Login Destination section on `/account/preferences`.
 * Persists context-scoped startup preference, displays role enforcement locks,
 * surfaces fallback diagnostics, and stays read-only under admin impersonation.
 */
export function StartupPreferencesSection({
  t,
  language,
  startupTarget,
  activeContextKey,
  isImpersonating,
  isEnforcedByRole,
  enforcingRoleName,
  fallbackActive,
  fallbackReason,
  workspaceGroups,
  cachedWorkspaces,
  onStartupTargetChange,
  onResetStartupTarget,
}: StartupPreferencesSectionProps) {
  const currentTarget = startupTarget || "default";
  const isReadOnly = isImpersonating || isEnforcedByRole;
  const canReset = !isReadOnly && currentTarget !== "default";

  const options = buildStructuredLandingTargetOptions({
    language,
    workspaceGroups,
    cachedWorkspaces,
    scopeMode: "current_context",
    currentTarget,
    labels: {
      defaultLabel: t("profile.preferences.startupDefaultOption"),
      overviewLabel: t("profile.preferences.startupOverviewOption"),
      hubLabel: t("profile.preferences.startupHubOption"),
      workspacePrefix: t("profile.preferences.startupWorkspacePrefix"),
      menuPrefix: t("profile.preferences.startupMenuPrefix"),
    },
  });

  const displayContext =
    activeContextKey || t("profile.preferences.startupContextPlatform");

  return (
    <Card
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0"
      data-testid="startup-preferences-section"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.preferences.startupTitle")}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-nx-ink-3">
              {t("profile.preferences.startupContextLabel")}:
            </span>
            <Badge
              variant="secondary"
              className="font-mono text-[11px]"
              data-testid="startup-active-context-badge"
            >
              <bdi dir="ltr">{displayContext}</bdi>
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-nx-ink-2">
          {t("profile.preferences.startupDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 min-w-0">
        {isImpersonating && (
          <Alert variant="warning" data-testid="startup-impersonation-alert">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed">
              {t("profile.preferences.startupImpersonationNotice")}
            </AlertDescription>
          </Alert>
        )}

        {!isImpersonating && isEnforcedByRole && (
          <Alert variant="info" data-testid="startup-enforced-alert">
            <Lock className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed">
              {t("profile.preferences.startupEnforcedByRoleNotice", {
                role: enforcingRoleName || "Role",
              })}
            </AlertDescription>
          </Alert>
        )}

        {fallbackActive && (
          <Alert variant="warning" data-testid="startup-fallback-alert">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed">
              {t("profile.preferences.startupFallbackNotice", {
                reason:
                  fallbackReason || t("profile.preferences.startupUnknownFallbackReason"),
              })}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5 min-w-0">
            <Label htmlFor="startup-target-select" className="text-xs font-semibold text-nx-ink">
              {t("profile.preferences.startupTargetLabel")}
            </Label>
            <Select
              value={currentTarget}
              onValueChange={onStartupTargetChange}
              disabled={isReadOnly}
            >
              <SelectTrigger
                id="startup-target-select"
                aria-label={t("profile.preferences.startupTargetLabel")}
                data-testid="startup-target-select"
              >
                <SelectValue placeholder={t("profile.preferences.startupTargetPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <bdi>{opt.label}</bdi>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetStartupTarget}
            disabled={!canReset}
            data-testid="startup-reset-btn"
            className="h-10 shrink-0 gap-1.5 px-3 text-xs font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("profile.preferences.startupResetButton")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
