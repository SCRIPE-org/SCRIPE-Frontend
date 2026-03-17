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

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
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
import { useTenantSettingsViewModel } from "@modules/system/tenants/src/presentation/viewmodels/useTenantSettingsViewModel";
import { TenantSettingsEditDialog } from "../TenantSettingsEditDialog";
import { Skeleton } from "@core/ui/skeleton";
import { cn } from "@core/common/utils";

interface TenantSettingsTabProps {
  tenantId: string;
  tenantName: string;
  parentTenantId?: string;
}

export function TenantSettingsTab({
  tenantId,
  tenantName,
  parentTenantId,
}: TenantSettingsTabProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const vm = useTenantSettingsViewModel(tenantId);

  if (vm.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="rounded-xl bg-destructive/10 p-4 text-destructive border border-destructive/30">
        Error loading settings: {vm.error.message}
      </div>
    );
  }

  const settings = vm.settings;
  if (!settings) return null;

  return (
    <div className="space-y-4" dir={direction}>
      {/* Section header */}
      <div>
        <h3 className="text-lg font-semibold">{t("tenant.settings") || "Settings"}</h3>
        <p className="text-sm text-muted-foreground">
          {t("tenant.settingsDescription") || `Configuration for ${tenantName}`}
        </p>
      </div>

      {/* ── Security Card ── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Shield className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  {t("tenant.settingsSecurity") || "Security Settings"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("tenant.settingsSecurityDesc") || "Password policies and login security"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("security")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* Security grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Lock className="h-3 w-3" />
                {t("tenant.passwordMinLength") || "Min Length"}
              </div>
              <p className="text-lg font-bold">{settings.passwordMinLength}</p>
              <p className="text-xs text-muted-foreground">{t("tenant.characters") || "chars"}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <KeyRound className="h-3 w-3" />
                {t("tenant.lockoutThreshold") || "Lockout"}
              </div>
              <p className="text-lg font-bold">{settings.loginLockoutThreshold}</p>
              <p className="text-xs text-muted-foreground">{t("tenant.attempts") || "attempts"}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Timer className="h-3 w-3" />
                {t("tenant.lockoutDuration") || "Duration"}
              </div>
              <p className="text-lg font-bold">{settings.loginLockoutMinutes}</p>
              <p className="text-xs text-muted-foreground">{t("tenant.minutes") || "min"}</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Timer className="h-3 w-3" />
                {t("tenant.passwordExpiryDays") || "Expiry"}
              </div>
              <p className="text-lg font-bold">
                {settings.passwordExpiryDays || "∞"}
              </p>
              <p className="text-xs text-muted-foreground">
                {settings.passwordExpiryDays
                  ? t("tenant.days") || "days"
                  : t("tenant.never") || "never"}
              </p>
            </div>
          </div>

          {/* Requirement badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <RequirementBadge
              satisfied={settings.passwordRequireUppercase}
              label={t("tenant.requireUppercase") || "Uppercase"}
            />
            <RequirementBadge
              satisfied={settings.passwordRequireNumber}
              label={t("tenant.requireNumber") || "Number"}
            />
            <RequirementBadge
              satisfied={settings.passwordRequireSpecial}
              label={t("tenant.requireSpecial") || "Special Char"}
            />
            <RequirementBadge
              satisfied={settings.require2FA}
              label={t("tenant.require2FA") || "2FA Required"}
            />
          </div>
        </div>
      </div>

      {/* ── Branding Card ── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <Palette className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  {t("tenant.settingsBranding") || "Branding"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("tenant.settingsBrandingDesc") || "Customize appearance and branding"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("branding")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            {/* Logo */}
            {settings.logoUrl ? (
              <img
                src={
                  settings.logoUrl.startsWith("http")
                    ? settings.logoUrl
                    : `${process.env.NEXT_PUBLIC_File_URL || ""}${settings.logoUrl}`
                }
                alt={t("tenant.logoPreview")}
                className="h-16 w-16 rounded-xl border border-border/50 object-contain p-1.5 bg-muted/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/30 border border-dashed border-border/50 text-xs text-muted-foreground">
                {t("tenant.noLogo") || "No Logo"}
              </div>
            )}
            <div className="space-y-1.5">
              <p className="font-semibold">
                {settings.companyName || (
                  <span className="text-muted-foreground italic">
                    {t("tenant.noCompanyName") || "No Company Name"}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-full border border-border/50 shadow-sm"
                    style={{ backgroundColor: settings.primaryColor || "#000000" }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {settings.primaryColor || "#000000"}
                  </span>
                </div>
                {settings.secondaryColor && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-5 w-5 rounded-full border border-border/50 shadow-sm"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {settings.secondaryColor}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional branding details */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {settings.faviconUrl && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-xs text-muted-foreground">{t("tenant.favicon") || "Favicon"}</p>
                <p className="text-sm font-medium truncate">{settings.faviconUrl}</p>
              </div>
            )}
            {settings.loginHeadline && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-xs text-muted-foreground">{t("tenant.loginHeadline") || "Login Headline"}</p>
                <p className="text-sm font-medium truncate">{settings.loginHeadline}</p>
              </div>
            )}
            {settings.loginSubtitle && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2">
                <p className="text-xs text-muted-foreground">{t("tenant.loginSubtitle") || "Login Subtitle"}</p>
                <p className="text-sm font-medium truncate">{settings.loginSubtitle}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Audit Card ── */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <ClipboardList className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">
                  {t("tenant.settingsAudit") || "Audit & Logs"}
                </h4>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("audit")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-3">
            <div>
              <p className="font-medium text-sm">
                {t("tenant.auditEnabled") || "Audit Logging"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("tenant.retentionLabel", { days: settings.auditRetentionDays }) ||
                  `Retention: ${settings.auditRetentionDays} days`}
              </p>
            </div>
            <Badge
              variant={settings.auditEnabled ? "default" : "secondary"}
              className={cn(
                "gap-1",
                settings.auditEnabled
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : ""
              )}
            >
              {settings.auditEnabled ? (
                <>
                  <Check className="h-3 w-3" />
                  {t("tenant.enabled") || "Enabled"}
                </>
              ) : (
                <>
                  <X className="h-3 w-3" />
                  {t("tenant.disabled") || "Disabled"}
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
        onUploadLogo={vm.uploadLogo}
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
        satisfied
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
          : "opacity-50"
      )}
    >
      {satisfied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      {label}
    </Badge>
  );
}
