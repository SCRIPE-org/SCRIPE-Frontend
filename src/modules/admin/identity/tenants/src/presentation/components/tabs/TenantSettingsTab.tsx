/* eslint-disable unused-imports/no-unused-vars */
// FILE-EXCEPTION: file length
/**
 * Tenant Settings Tab — Redesigned
 *
 * Premium category cards with colored top border accents:
 * - Security (amber) — password policies, lockout, 2FA
 * - Branding (purple) — logo, color, company name
 * - Audit (emerald) — logging and retention
 *
 * Full RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import {
  Shield,
  Palette,
  ClipboardList,
  Pencil,
  Lock,
  Check,
  X,
  Timer,
  KeyRound,
} from "lucide-react";
import { useTenantSettingsViewModel } from "@modules/identity/tenants/src/presentation/viewmodels/useTenantSettingsViewModel";
import { TenantSettingsEditDialog } from "../TenantSettingsEditDialog";
import { Skeleton } from "@core/ui/skeleton";
import { cn } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import Image from "next/image";

interface TenantSettingsTabProps {
  tenantId: string;
  tenantName: string;
  parentTenantId?: string;
}

/**
 * Presentation UI component rendering the tenant settings tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantSettingsTab({
  tenantId,
  tenantName,
  parentTenantId,
}: TenantSettingsTabProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const vm = useTenantSettingsViewModel(tenantId);
  const queryClient = useQueryClient();
  // Hooks must run unconditionally — called here, before the loading/error/
  // empty early returns below.
  const resolvedLogoUrl = useResolvedFileUrl(vm.settings?.logoUrl);
  const resolvedFaviconUrl = useResolvedFileUrl(vm.settings?.faviconUrl);

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

  return (
    <div className="space-y-4" dir={direction}>
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold">{t("tenant.settings")}</h3>
        <p className="text-sm text-nx-ink-2">{t("tenant.settingsDescription")}</p>
      </div>

      {/* ── Security Card ── */}
      <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
        <div className="h-1 bg-gradient-to-r from-warning via-warning/80 to-warning" />
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-warning/10">
                <Shield className="h-4 w-4 text-warning" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{t("tenant.settingsSecurity")}</h4>
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

          {/* Security grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {t("tenant.passwordMinLength")}
              </div>
              <p className="text-lg font-bold tabular-nums">{settings.passwordMinLength}</p>
              <p className="text-xs text-nx-ink-2">{t("tenant.characters")}</p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
                <KeyRound className="h-3 w-3" aria-hidden="true" />
                {t("tenant.lockoutThreshold")}
              </div>
              <p className="text-lg font-bold tabular-nums">{settings.loginLockoutThreshold}</p>
              <p className="text-xs text-nx-ink-2">{t("tenant.attempts")}</p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
                <Timer className="h-3 w-3" aria-hidden="true" />
                {t("tenant.lockoutDuration")}
              </div>
              <p className="text-lg font-bold tabular-nums">{settings.loginLockoutMinutes}</p>
              <p className="text-xs text-nx-ink-2">{t("tenant.minutes")}</p>
            </div>
            <div className="rounded-nx-md border border-nx-line bg-nx-raised p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-nx-ink-2">
                <Timer className="h-3 w-3" aria-hidden="true" />
                {t("tenant.passwordExpiryDays")}
              </div>
              <p className="text-lg font-bold tabular-nums">{settings.passwordExpiryDays || "∞"}</p>
              <p className="text-xs text-nx-ink-2">
                {settings.passwordExpiryDays ? t("tenant.days") : t("tenant.never")}
              </p>
            </div>
          </div>

          {/* Requirement badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <RequirementBadge
              satisfied={settings.passwordRequireUppercase}
              label={t("tenant.requireUppercase")}
            />
            <RequirementBadge
              satisfied={settings.passwordRequireNumber}
              label={t("tenant.requireNumber")}
            />
            <RequirementBadge
              satisfied={settings.passwordRequireSpecial}
              label={t("tenant.requireSpecial")}
            />
            <RequirementBadge satisfied={settings.require2FA} label={t("tenant.require2FA")} />
          </div>
        </div>
      </div>

      {/* ── Branding Card ── */}
      <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
        <div className="h-1 bg-nx-accent" />
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash">
                <Palette className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{t("tenant.settingsBranding")}</h4>
                <p className="text-xs text-nx-ink-2">{t("tenant.settingsBrandingDesc")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => vm.setEditSection("branding")}
              aria-label={t("common.edit")}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            {/* Logo */}
            {settings.logoUrl && resolvedLogoUrl ? (
              <Image
                src={resolvedLogoUrl}
                alt={t("tenant.logoPreview")}
                width={64}
                height={64}
                unoptimized
                className="h-16 w-16 rounded-nx-lg border border-nx-line bg-nx-raised object-contain p-1.5"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-nx-lg border border-dashed border-nx-line bg-nx-raised text-xs text-nx-ink-2">
                {t("tenant.noLogo")}
              </div>
            )}
            <div className="space-y-1.5">
              <p className="font-semibold">
                {settings.companyName || (
                  <span className="italic text-nx-ink-2">{t("tenant.noCompanyName")}</span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border border-nx-line"
                    style={{ backgroundColor: settings.primaryColor || "#000000" }}
                  />
                  <span className="font-mono text-xs text-nx-ink-2">
                    {settings.primaryColor || "#000000"}
                  </span>
                </div>
                {settings.secondaryColor && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-5 w-5 rounded-full border border-nx-line"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                    <span className="font-mono text-xs text-nx-ink-2">
                      {settings.secondaryColor}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional branding details */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {settings.faviconUrl && resolvedFaviconUrl && (
              <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
                <p className="text-xs text-nx-ink-2">{t("tenant.favicon")}</p>
                <div className="mt-1">
                  <Image
                    src={resolvedFaviconUrl}
                    alt={t("tenant.favicon")}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
            {settings.loginHeadline && (
              <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
                <p className="text-xs text-nx-ink-2">{t("tenant.loginHeadline")}</p>
                <p className="truncate text-sm font-medium">{settings.loginHeadline}</p>
              </div>
            )}
            {settings.loginSubtitle && (
              <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2">
                <p className="text-xs text-nx-ink-2">{t("tenant.loginSubtitle")}</p>
                <p className="truncate text-sm font-medium">{settings.loginSubtitle}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Audit Card ── */}
      <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
        <div className="h-1 bg-gradient-to-r from-success via-success/80 to-success" />
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-success/10">
                <ClipboardList className="h-4 w-4 text-success" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">{t("tenant.settingsAudit")}</h4>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => vm.setEditSection("audit")}
              aria-label={t("common.edit")}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <div>
              <p className="text-sm font-medium">{t("tenant.auditEnabled")}</p>
              <p className="text-xs text-nx-ink-2">
                {t("tenant.retentionLabel", { days: settings.auditRetentionDays })}
              </p>
            </div>
            <Badge
              variant={settings.auditEnabled ? "default" : "secondary"}
              className={cn(
                "gap-1",
                settings.auditEnabled ? "border-success/30 bg-success/10 text-success" : ""
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
        </div>
      </div>

      {/* Settings Edit Dialog (unchanged) */}
      <TenantSettingsEditDialog
        open={!!vm.editSection}
        onOpenChange={(open) => !open && vm.setEditSection(null)}
        initialSection={vm.editSection}
        settings={settings}
        onSave={vm.updateSettings}
        isSaving={vm.isUpdating}
      />
    </div>
  );
}

// ── Requirement Badge helper ──
function RequirementBadge({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 text-xs",
        satisfied ? "border-success/30 bg-success/5 text-success" : "opacity-50"
      )}
    >
      {satisfied ? (
        <Check className="h-3 w-3 text-success" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3 text-nx-ink-2" aria-hidden="true" />
      )}
      {label}
    </Badge>
  );
}
