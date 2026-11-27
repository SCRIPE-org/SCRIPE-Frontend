/**
 * Tenant Settings Tab — Nexus Flat-Card Governance Display
 *
 * Displays tenant Security (including SSO Identity Provider Mode), Branding, and Audit cards.
 * Respects SEC-07: self-tenant admins see Audit settings as Platform Managed (read-only).
 *
 * @module tenants
 */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { cn } from "@core/common/utils";
import { Shield, ClipboardList, Pencil, Lock, Check, X, Timer, KeyRound } from "lucide-react";
import { useTenantSettingsViewModel } from "@modules/identity/tenants/src/presentation/viewmodels/useTenantSettingsViewModel";
import { normalizeTenantAuthenticationMode } from "../../../domain/entities/TenantSettings";
import { TenantSettingsEditDialog } from "../TenantSettingsEditDialog";
import { TenantSettingsBrandingCard } from "./TenantSettingsBrandingCard";

interface TenantSettingsTabProps {
  tenantId: string;
  tenantName: string;
  parentTenantId?: string;
}

/**
 * Presentation UI component rendering the tenant settings tab.
 */
export function TenantSettingsTab({ tenantId }: TenantSettingsTabProps) {
  const { t, direction } = useI18n();
  const user = useAppStore((state) => state.user);
  const isSelfTenantAdmin = Boolean(user?.tenantId && user.tenantId === tenantId);
  const canEditPlatformManagedFields = !isSelfTenantAdmin;

  const vm = useTenantSettingsViewModel(tenantId);
  const queryClient = useQueryClient();

  if (vm.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-nx-lg" />
        ))}
      </div>
    );
  }

  if (vm.error) {
    return (
      <ErrorMessage
        message={t("tenant.settingsLoadError")}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ["tenant-settings", tenantId] })}
      />
    );
  }

  const settings = vm.settings;
  if (!settings) return null;

  const isCustomIdpMode = settings.identityProviderMode === "custom";
  const isSsoOnlyMode = normalizeTenantAuthenticationMode(settings.authenticationMode) === "SsoOnly";
  const allowBreakGlass = settings.allowOwnerBreakGlassLocalLogin !== false;

  return (
    <div className="space-y-4" dir={direction}>
      <div>
        <h3 className="text-lg font-semibold text-nx-ink">{t("tenant.settings")}</h3>
        <p className="text-sm text-nx-ink-2">{t("tenant.settingsDescription")}</p>
      </div>

      {/* Security Card (flat Nexus slab) */}
      <Card className="border-nx-line bg-nx-surface p-5 transition-colors hover:border-nx-line-hi">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-warning/10">
              <Shield className="h-4 w-4 text-warning" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-nx-ink">{t("tenant.settingsSecurity")}</h4>
              <p className="text-xs text-nx-ink-2">{t("tenant.settingsSecurityDesc")}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.setEditSection("security")}
            aria-label={t("common.edit")}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <Lock className="h-3 w-3" aria-hidden="true" />
              {t("tenant.passwordMinLength")}
            </div>
            <p className="text-lg font-bold tabular-nums text-nx-ink">
              {settings.passwordMinLength}
            </p>
            <p className="text-xs text-nx-ink-2">{t("tenant.characters")}</p>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <KeyRound className="h-3 w-3" aria-hidden="true" />
              {t("tenant.lockoutThreshold")}
            </div>
            <p className="text-lg font-bold tabular-nums text-nx-ink">
              {settings.loginLockoutThreshold}
            </p>
            <p className="text-xs text-nx-ink-2">{t("tenant.attempts")}</p>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <Timer className="h-3 w-3" aria-hidden="true" />
              {t("tenant.lockoutDuration")}
            </div>
            <p className="text-lg font-bold tabular-nums text-nx-ink">
              {settings.loginLockoutMinutes}
            </p>
            <p className="text-xs text-nx-ink-2">{t("tenant.minutes")}</p>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
              <Timer className="h-3 w-3" aria-hidden="true" />
              {t("tenant.passwordExpiryDays")}
            </div>
            <p className="text-lg font-bold tabular-nums text-nx-ink">
              {settings.passwordExpiryDays || "∞"}
            </p>
            <p className="text-xs text-nx-ink-2">
              {settings.passwordExpiryDays ? t("tenant.days") : t("tenant.never")}
            </p>
          </div>
        </div>

        {/* SSO Identity Provider Mode Row (BAM-03) */}
        <div className="mt-3 flex flex-col gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-nx-ink">{t("tenant.identityProviderMode")}</p>
            <p className="text-xs text-nx-ink-2">
              {isCustomIdpMode
                ? t("tenant.identityProviderModeCustomDesc")
                : t("tenant.identityProviderModeInheritDesc")}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0",
              isCustomIdpMode
                ? "border-info/30 bg-info/10 text-info"
                : "border-nx-accent/40 bg-nx-accent-wash text-nx-accent"
            )}
          >
            {isCustomIdpMode
              ? t("tenant.identityProviderModeCustom")
              : t("tenant.identityProviderModeInherit")}
          </Badge>
        </div>

        {/* Authentication Mode Row (Hybrid vs SsoOnly + Owner Break-Glass) */}
        <div className="mt-3 flex flex-col gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-nx-ink">{t("tenant.authenticationMode")}</p>
            <p className="text-xs text-nx-ink-2">
              {isSsoOnlyMode
                ? t("tenant.authenticationModeSsoOnlyDesc")
                : t("tenant.authenticationModeHybridDesc")}
            </p>
            {isSsoOnlyMode && (
              <p className="mt-1 text-xs font-medium text-nx-ink-2">
                {allowBreakGlass
                  ? t("tenant.breakGlassEnabled")
                  : t("tenant.breakGlassDisabled")}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0",
              isSsoOnlyMode
                ? "border-warning-strong/40 bg-warning/15 text-nx-warning-strong"
                : "border-nx-accent/40 bg-nx-accent-wash text-nx-accent"
            )}
          >
            {isSsoOnlyMode
              ? t("tenant.authenticationModeSsoOnly")
              : t("tenant.authenticationModeHybrid")}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <RequirementBadge
            satisfied={settings.passwordRequireUppercase}
            label={t("tenant.requireUppercase")}
          />
          <RequirementBadge
            satisfied={Boolean(settings.passwordRequireLowercase)}
            label={t("tenant.requireLowercase")}
          />
          <RequirementBadge
            satisfied={settings.passwordRequireNumber}
            label={t("tenant.requireNumber")}
          />
          <RequirementBadge
            satisfied={settings.passwordRequireSpecial}
            label={t("tenant.requireSpecial")}
          />
          <RequirementBadge
            satisfied={settings.checkBreachedPasswords !== false}
            label={t("tenant.checkBreachedPasswords")}
          />
          <RequirementBadge satisfied={settings.require2FA} label={t("tenant.require2FA")} />
        </div>
      </Card>

      <TenantSettingsBrandingCard
        settings={settings}
        onEdit={() => vm.setEditSection("branding")}
      />

      {/* Audit Card (flat Nexus slab) */}
      <Card className="border-nx-line bg-nx-surface p-5 transition-colors hover:border-nx-line-hi">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-success/10">
              <ClipboardList className="h-4 w-4 text-success" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-nx-ink">{t("tenant.settingsAudit")}</h4>
              {!canEditPlatformManagedFields && (
                <Badge variant="secondary">{t("tenant.platformManaged")}</Badge>
              )}
            </div>
          </div>
          {canEditPlatformManagedFields && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => vm.setEditSection("audit")}
              aria-label={t("common.edit")}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <div>
            <p className="text-sm font-medium text-nx-ink">{t("tenant.auditEnabled")}</p>
            <p className="text-xs text-nx-ink-2">
              {t("tenant.retentionLabel", { days: settings.auditRetentionDays })}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              settings.auditEnabled
                ? "border-success/30 bg-success/10 text-success"
                : "border-nx-line bg-nx-surface text-nx-ink-3"
            )}
          >
            {settings.auditEnabled ? (
              <>
                <Check className="h-3 w-3" aria-hidden="true" />
                {t("tenant.enabled")}
              </>
            ) : (
              <>
                <X className="h-3 w-3" aria-hidden="true" />
                {t("tenant.disabled")}
              </>
            )}
          </Badge>
        </div>
      </Card>

      <TenantSettingsEditDialog
        open={!!vm.editSection}
        onOpenChange={(open) => !open && vm.setEditSection(null)}
        initialSection={vm.editSection}
        settings={settings}
        onSave={vm.updateSettings}
        isSaving={vm.isUpdating}
        canEditPlatformManagedFields={canEditPlatformManagedFields}
      />
    </div>
  );
}

function RequirementBadge({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-xs",
        satisfied ? "border-success/30 bg-success/10 text-success" : "text-nx-ink-3"
      )}
    >
      {satisfied ? (
        <Check className="h-3 w-3 text-success" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
      )}
      {label}
    </Badge>
  );
}
