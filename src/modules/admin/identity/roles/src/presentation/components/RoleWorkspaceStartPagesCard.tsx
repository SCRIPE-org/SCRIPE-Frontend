"use client";

import { AlertTriangle, Compass, Lock, Plus, Trash2 } from "lucide-react";
import {
  buildWorkspaceScopedMenuOptions,
  LandingTargetPicker,
  type LandingTargetCatalog,
  type LandingTargetScopeMode,
  type LandingTargetWorkspace,
} from "@core/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import {
  getRulePermissionWarning,
  type DraftRoleWorkspaceEntryRule,
} from "../../domain/utils/role-workspace-eligibility";

/** Props for the sparse Role Workspace Start Pages editor rendered on `/roles/[id]`. */
export interface RoleWorkspaceStartPagesCardProps {
  rules: DraftRoleWorkspaceEntryRule[];
  eligibleWorkspaces: LandingTargetWorkspace[];
  availableWorkspacesForNewRule: LandingTargetWorkspace[];
  catalog: LandingTargetCatalog | null | undefined;
  scopeMode: LandingTargetScopeMode;
  selectedPermissionCodes: Set<string>;
  isSystemRole: boolean;
  isLoading: boolean;
  onAddRule: () => void;
  onUpdateRuleWorkspace: (index: number, workspaceKey: string) => void;
  onUpdateRuleTarget: (index: number, target: string) => void;
  onToggleRuleEnforced: (index: number, isEnforced: boolean) => void;
  onRemoveRule: (index: number) => void;
}

/**
 * Sparse per-workspace start-page policy editor rendered beside `PermissionTreeCard`
 * on `/roles/[id]`. Starts empty with zero rows by default and displays live
 * permission-mismatch warnings whenever required page permissions are unchecked.
 */
export function RoleWorkspaceStartPagesCard({
  rules,
  eligibleWorkspaces,
  availableWorkspacesForNewRule,
  catalog,
  scopeMode,
  selectedPermissionCodes,
  isSystemRole,
  isLoading,
  onAddRule,
  onUpdateRuleWorkspace,
  onUpdateRuleTarget,
  onToggleRuleEnforced,
  onRemoveRule,
}: RoleWorkspaceStartPagesCardProps) {
  const { t, language } = useI18n();
  const workspaceGroups = useNavigationStore((s) => s.workspaceGroups);
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);

  const canAddRule = !isSystemRole && !isLoading && availableWorkspacesForNewRule.length > 0;
  const labels = {
    defaultLabel: t("roles.landingTargetDefault"),
    overviewLabel: t("roles.landingTargetOverview"),
    hubLabel: t("roles.landingTargetHub"),
    workspacePrefix: t("roles.landingTargetWorkspacePrefix"),
    menuPrefix: t("roles.landingTargetMenuPrefix"),
    unavailablePageLabel: t("roles.landingTargetUnavailablePage"),
    systemGroupLabel: t("roles.landingTargetSystemGroup"),
  };

  return (
    <Card
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      data-testid="role-workspace-start-pages-card"
    >
      <CardHeader className="space-y-1.5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base leading-snug">
            <Compass className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <span>{t("roleDetail.workspaceEntriesTitle")}</span>
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddRule}
            disabled={!canAddRule}
            data-testid="role-workspace-add-rule-btn"
            className="h-7 shrink-0 gap-1 px-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("roleDetail.workspaceEntriesAddRule")}</span>
          </Button>
        </div>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("roleDetail.workspaceEntriesDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isSystemRole && (
          <Alert
            variant="info"
            data-testid="role-workspace-system-lock-alert"
            className="!animate-none"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed text-nx-ink">
              {t("roleDetail.workspaceEntriesSystemLocked")}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && rules.length === 0 ? (
          <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-10 w-full rounded-nx-md" />
          </div>
        ) : rules.length === 0 ? (
          <div className="rounded-nx-md border border-dashed border-nx-line bg-nx-raised/50 p-3 text-xs text-nx-ink-3 space-y-1.5">
            <p>{t("roleDetail.workspaceEntriesEmpty")}</p>
            {!isSystemRole && eligibleWorkspaces.length === 0 && (
              <p className="text-nx-ink-2">{t("roleDetail.workspaceEntriesNoEligibleWorkspaces")}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, index) => {
              const ruleWsKey = rule.workspaceKey.trim().toLowerCase();
              const otherUsedKeys = new Set(
                rules
                  .filter((_, idx) => idx !== index)
                  .map((r) => r.workspaceKey.trim().toLowerCase())
              );

              const rowWorkspaceOptions = eligibleWorkspaces.filter(
                (ws) =>
                  ws.workspaceKey.trim().toLowerCase() === ruleWsKey ||
                  !otherUsedKeys.has(ws.workspaceKey.trim().toLowerCase())
              );

              const matchedCatalogWs = catalog?.workspaces.find(
                (ws) => ws.workspaceKey.trim().toLowerCase() === ruleWsKey
              );
              const currentWorkspaceDisplayName =
                matchedCatalogWs?.getLocalizedName(language) ?? rule.workspaceKey;

              const rowTargetOptions = buildWorkspaceScopedMenuOptions({
                workspaceKey: ruleWsKey,
                language,
                workspaceGroups,
                cachedWorkspaces,
                catalog,
                scopeMode,
                currentTarget: rule.target,
                labels,
              });

              const warning = getRulePermissionWarning(rule, catalog, selectedPermissionCodes);
              const workspaceSelectId = `role-ws-select-${index}`;
              const pagePickerId = `role-ws-target-${index}`;
              const enforceSwitchId = `role-ws-enforce-${index}`;

              return (
                <div
                  key={`${ruleWsKey || "draft"}-${index}`}
                  data-testid={`role-workspace-rule-row-${ruleWsKey || index}`}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Badge variant="secondary" className="text-[11px] font-medium truncate">
                        <bdi>{currentWorkspaceDisplayName}</bdi>
                      </Badge>
                      {rule.isEnforced && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {t("roles.landingEnforcedBadge")}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveRule(index)}
                      disabled={isSystemRole}
                      aria-label={t("roleDetail.workspaceEntriesRemoveRuleAria", {
                        workspace: currentWorkspaceDisplayName,
                      })}
                      data-testid={`role-workspace-remove-btn-${ruleWsKey || index}`}
                      className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={workspaceSelectId} className="text-[11px] text-nx-ink-2">
                      {t("roleDetail.workspaceEntriesWorkspaceLabel")}
                    </Label>
                    <Select
                      value={ruleWsKey}
                      onValueChange={(nextWs) => onUpdateRuleWorkspace(index, nextWs)}
                      disabled={isSystemRole}
                    >
                      <SelectTrigger
                        id={workspaceSelectId}
                        data-testid={`role-workspace-select-${index}`}
                        className="h-9 text-xs bg-nx-surface border-nx-line"
                      >
                        <SelectValue
                          placeholder={t("roleDetail.workspaceEntriesWorkspacePlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {!rowWorkspaceOptions.some(
                          (ws) => ws.workspaceKey.trim().toLowerCase() === ruleWsKey
                        ) &&
                          ruleWsKey && (
                            <SelectItem value={ruleWsKey}>
                              <bdi>{currentWorkspaceDisplayName}</bdi>
                            </SelectItem>
                          )}
                        {rowWorkspaceOptions.map((ws) => (
                          <SelectItem key={ws.workspaceKey} value={ws.workspaceKey}>
                            <bdi>{ws.getLocalizedName(language)}</bdi>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={pagePickerId} className="text-[11px] text-nx-ink-2">
                      {t("roleDetail.workspaceEntriesStartPageLabel")}
                    </Label>
                    <LandingTargetPicker
                      id={pagePickerId}
                      data-testid={`role-workspace-target-${ruleWsKey || index}`}
                      aria-label={t("roleDetail.workspaceEntriesStartPageLabel")}
                      value={rule.target}
                      onValueChange={(nextTarget) => onUpdateRuleTarget(index, nextTarget)}
                      options={rowTargetOptions}
                      loading={isLoading}
                      disabled={isSystemRole}
                      placeholder={t("roleDetail.workspaceEntriesStartPagePlaceholder")}
                      searchPlaceholder={t("roleDetail.workspaceEntriesSearchPlaceholder")}
                      emptyText={t("roleDetail.workspaceEntriesNoResults")}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <Label
                      htmlFor={enforceSwitchId}
                      className="text-xs font-medium text-nx-ink-2 cursor-pointer"
                    >
                      {t("roleDetail.workspaceEntriesEnforceLabel")}
                    </Label>
                    <Switch
                      id={enforceSwitchId}
                      checked={rule.isEnforced}
                      onCheckedChange={(checked) => onToggleRuleEnforced(index, Boolean(checked))}
                      readOnly={isSystemRole}
                      data-testid={`role-workspace-enforce-${ruleWsKey || index}`}
                      aria-label={t("roleDetail.workspaceEntriesEnforceLabel")}
                    />
                  </div>

                  {warning.hasWarning && (
                    <Alert
                      variant="warning"
                      data-testid={`role-workspace-warning-${ruleWsKey || index}`}
                      className="border-warning-strong/60 bg-warning/20 py-2.5 !animate-none [&>svg]:text-warning"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      <AlertDescription className="text-xs leading-snug text-nx-ink">
                        {warning.missingPermissions.length > 0
                          ? t("roleDetail.workspaceEntriesPermissionWarning", {
                              permissions: warning.missingPermissions.join(", "),
                            })
                          : t("roleDetail.workspaceEntriesStaleWarning")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
