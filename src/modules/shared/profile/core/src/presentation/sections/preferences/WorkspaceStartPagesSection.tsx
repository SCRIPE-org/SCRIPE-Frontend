"use client";

import { Layers, Lock, RotateCcw } from "lucide-react";
import { normalizeRoutePath } from "@core/config/app-route-manifest";
import {
  buildWorkspaceScopedMenuOptions,
  LandingTargetPicker,
  type LandingTargetCatalog,
  type NavigationData,
  type WorkspaceGroup,
} from "@core/navigation";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";

/**
 * Props for the per-workspace start-pages overrides card on `/account/preferences`.
 */
export interface WorkspaceStartPagesSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  workspaceGroups: WorkspaceGroup[];
  cachedWorkspaces?: Map<string, NavigationData>;
  landingTargetCatalog?: LandingTargetCatalog | null;
  isCatalogLoading?: boolean;
  isImpersonating: boolean;
  isSuperAdmin: boolean;
  mutatingWorkspaceKey: string | null;
  onSetWorkspaceStartPage: (workspaceKey: string, workspaceLabel: string, target: string) => void;
  onResetWorkspaceStartPage: (workspaceKey: string, workspaceLabel: string) => void;
}

function resolveCurrentWorkspaceMenuToken(
  ws: WorkspaceGroup,
  catalog?: LandingTargetCatalog | null
): string {
  const slug = ws.effectiveHomeMenuSlug?.trim().toLowerCase();
  if (slug) return `menu:${slug}`;

  const route = ws.effectiveHomeRoute ? normalizeRoutePath(ws.effectiveHomeRoute) : "";
  if (route && catalog) {
    const wsKey = ws.workspaceKey.trim().toLowerCase();
    const matched = catalog.items.find(
      (item) =>
        item.workspaceKey.trim().toLowerCase() === wsKey &&
        normalizeRoutePath(item.route) === route
    );
    if (matched) return `menu:${matched.slug.trim().toLowerCase()}`;
  }

  return "";
}

function renderOriginBadge(
  ws: WorkspaceGroup,
  isSuperAdmin: boolean,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  const isEnforced = (Boolean(ws.isEffectiveHomeEnforced) || ws.effectiveHomeSource === "RoleEnforced") && !isSuperAdmin;
  if (isEnforced) {
    return (
      <Badge
        variant="warning"
        className="text-[11px] font-medium"
        data-testid={`workspace-origin-badge-${ws.workspaceKey}`}
      >
        <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
        <bdi>
          {t("profile.preferences.workspaceOriginEnforced", {
            role: ws.enforcingRoleName || t("profile.preferences.workspaceOriginRoleFallback"),
          })}
        </bdi>
      </Badge>
    );
  }

  if (ws.effectiveHomeSource === "PersonalOverride") {
    return (
      <Badge
        variant="secondary"
        className="text-[11px] font-medium"
        data-testid={`workspace-origin-badge-${ws.workspaceKey}`}
      >
        {t("profile.preferences.workspaceOriginCustom")}
      </Badge>
    );
  }

  if (
    ws.effectiveHomeSource === "FirstAuthorizedLeaf" ||
    ws.effectiveHomeSource === "HubFallback"
  ) {
    return (
      <Badge
        variant="outline"
        className="text-[11px] font-medium"
        data-testid={`workspace-origin-badge-${ws.workspaceKey}`}
      >
        {t("profile.preferences.workspaceOriginAutoFallback")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[11px] font-medium"
      data-testid={`workspace-origin-badge-${ws.workspaceKey}`}
    >
      {t("profile.preferences.workspaceOriginDefault")}
    </Badge>
  );
}

/**
 * Per-workspace start page preferences card on `/account/preferences`.
 * Automatically hides when `<= 1` unlocked operational workspaces exist, surfaces
 * resolution origin badges, respects role enforcement locks (except Super Admins),
 * and stays read-only under admin impersonation.
 */
export function WorkspaceStartPagesSection({
  t,
  language,
  workspaceGroups,
  cachedWorkspaces,
  landingTargetCatalog,
  isCatalogLoading = false,
  isImpersonating,
  isSuperAdmin,
  mutatingWorkspaceKey,
  onSetWorkspaceStartPage,
  onResetWorkspaceStartPage,
}: WorkspaceStartPagesSectionProps) {
  const unlockedWorkspaces = workspaceGroups
    .filter((ws) => !ws.isLocked && ws.workspaceKey !== "organization-core")
    .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);

  if (unlockedWorkspaces.length <= 1) {
    return null;
  }

  const labels = {
    defaultLabel: t("profile.preferences.startupDefaultOption"),
    overviewLabel: t("profile.preferences.startupOverviewOption"),
    hubLabel: t("profile.preferences.startupHubOption"),
    workspacePrefix: t("profile.preferences.startupWorkspacePrefix"),
    menuPrefix: t("profile.preferences.startupMenuPrefix"),
    unavailablePageLabel: t("profile.preferences.startupUnavailablePage"),
    systemGroupLabel: t("profile.preferences.startupSystemGroupLabel"),
  };

  return (
    <Card
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors min-w-0"
      data-testid="workspace-start-pages-section"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
          <CardTitle className="text-sm font-bold text-nx-ink">
            {t("profile.preferences.workspaceEntriesTitle")}
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-nx-ink-2">
          {t("profile.preferences.workspaceEntriesDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 min-w-0">
        {isImpersonating && (
          <Alert
            variant="warning"
            data-testid="workspace-start-impersonation-alert"
            className="border-warning-strong/60 bg-warning/20 !animate-none [&>svg]:text-warning"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed text-nx-ink">
              {t("profile.preferences.startupImpersonationNotice")}
            </AlertDescription>
          </Alert>
        )}

        <div className="divide-y divide-nx-line rounded-nx-md border border-nx-line bg-nx-raised/40">
          {unlockedWorkspaces.map((ws) => {
            const wsKey = ws.workspaceKey.trim().toLowerCase();
            const wsLabel = ws.getLocalizedName(language);
            const currentToken = resolveCurrentWorkspaceMenuToken(ws, landingTargetCatalog);
            const scopedOptions = buildWorkspaceScopedMenuOptions({
              workspaceKey: wsKey,
              language,
              workspaceGroups,
              cachedWorkspaces,
              catalog: landingTargetCatalog,
              scopeMode: "current_context",
              currentTarget: currentToken || undefined,
              labels,
            });
            const resolvedPageLabel = ws.getEffectiveHomeLabel(language);
            const isEnforcedLocked =
              (Boolean(ws.isEffectiveHomeEnforced) || ws.effectiveHomeSource === "RoleEnforced") &&
              !isSuperAdmin;
            const isMutatingRow = mutatingWorkspaceKey === wsKey;
            const isRowLocked = isImpersonating || isEnforcedLocked;
            const isCustomOverride = ws.effectiveHomeSource === "PersonalOverride";

            return (
              <div
                key={wsKey}
                data-testid={`workspace-start-row-${wsKey}`}
                className="flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-nx-ink">
                      <bdi>{wsLabel}</bdi>
                    </span>
                    {renderOriginBadge(ws, isSuperAdmin, t)}
                  </div>
                  {(resolvedPageLabel || ws.effectiveHomeRoute) && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-nx-ink-3">
                      {resolvedPageLabel && (
                        <span>
                          <bdi>{resolvedPageLabel}</bdi>
                        </span>
                      )}
                      {resolvedPageLabel && ws.effectiveHomeRoute && (
                        <span aria-hidden="true">&bull;</span>
                      )}
                      {ws.effectiveHomeRoute && (
                        <span className="font-mono">
                          <bdi dir="ltr">{ws.effectiveHomeRoute}</bdi>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:w-[440px] lg:shrink-0">
                  <div className="min-w-0 flex-1">
                    <LandingTargetPicker
                      id={`workspace-start-picker-${wsKey}`}
                      data-testid={`workspace-start-picker-${wsKey}`}
                      aria-label={t("profile.preferences.workspaceEntryPickerLabel", {
                        workspace: wsLabel,
                      })}
                      value={currentToken}
                      onValueChange={(nextTarget) => {
                        if (!nextTarget || nextTarget === currentToken) return;
                        onSetWorkspaceStartPage(wsKey, wsLabel, nextTarget);
                      }}
                      options={scopedOptions}
                      loading={isCatalogLoading || isMutatingRow}
                      disabled={isRowLocked || isMutatingRow}
                      placeholder={
                        resolvedPageLabel || t("profile.preferences.workspaceEntryPickerPlaceholder")
                      }
                      searchPlaceholder={t("profile.preferences.workspaceEntrySearchPlaceholder")}
                      emptyText={t("profile.preferences.workspaceEntryNoResults")}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onResetWorkspaceStartPage(wsKey, wsLabel)}
                    disabled={isRowLocked || isMutatingRow || !isCustomOverride}
                    aria-label={t("profile.preferences.workspaceEntryResetAria", {
                      workspace: wsLabel,
                    })}
                    data-testid={`workspace-start-reset-${wsKey}`}
                    className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t("profile.preferences.workspaceEntryResetButton")}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
