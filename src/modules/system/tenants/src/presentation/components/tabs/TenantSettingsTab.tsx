/**
 * Tenant Settings Tab Component
 *
 * Displays and manages tenant's OWN settings: Security, Branding, Audit.
 * Quotas and subscription plan are managed in the Entitlements tab.
 *
 * @module tenants
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Shield, Settings, Pencil } from "lucide-react";
import { useTenantSettingsViewModel } from "@modules/system/tenants/src/presentation/viewmodels/useTenantSettingsViewModel";
import { TenantSettingsEditDialog } from "../TenantSettingsEditDialog";
import { Skeleton } from "@core/ui/skeleton";

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
  const vm = useTenantSettingsViewModel(tenantId);

  if (vm.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (vm.error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Error loading settings: {vm.error.message}
      </div>
    );
  }

  const settings = vm.settings;
  if (!settings) return null;

  return (
    <div className="space-y-6" dir={direction}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("tenant.settings") || "Settings"}</h3>
          <p className="text-sm text-muted-foreground">
            {t("tenant.settingsDescription") || `Configuration options for ${tenantName}`}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                {t("tenant.settingsSecurity") || "Security Settings"}
              </CardTitle>
              <CardDescription>
                {t("tenant.settingsSecurityDesc") || "Password policies and login security"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("security")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("tenant.passwordMinLength") || "Min Password Length"}
                </label>
                <div className="text-lg font-bold">{settings.passwordMinLength} {t("tenant.characters") || "characters"}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("tenant.lockoutThreshold") || "Lockout Threshold"}
                </label>
                <div className="text-lg font-bold">
                  {settings.loginLockoutThreshold} {t("tenant.attempts") || "attempts"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("tenant.passwordExpiryDays") || "Password Expiry"}
                </label>
                <div className="text-lg font-bold">
                  {settings.passwordExpiryDays
                    ? `${settings.passwordExpiryDays} ${t("tenant.days") || "days"}`
                    : t("tenant.never") || "Never"}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("tenant.lockoutDuration") || "Lockout Duration"}
                </label>
                <div className="text-lg font-bold">
                  {settings.loginLockoutMinutes} {t("tenant.minutes") || "min"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
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
          </CardContent>
        </Card>

        {/* Branding Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                {t("tenant.settingsBranding") || "Branding"}
              </CardTitle>
              <CardDescription>
                {t("tenant.settingsBrandingDesc") || "Customize tenant appearance and branding"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("branding")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-6">
              {settings.logoUrl ? (
                <img
                  src={
                    settings.logoUrl.startsWith("http")
                      ? settings.logoUrl
                      : `${process.env.NEXT_PUBLIC_File_URL || ""}${settings.logoUrl}`
                  }
                  alt={t("tenant.logo")}
                  className="h-16 w-16 rounded border object-contain p-1"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  {t("tenant.noLogo") || "No Logo"}
                </div>
              )}
              <div>
                <div className="text-lg font-medium">
                  {settings.companyName || t("tenant.noCompanyName") || "No Company Name"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: settings.primaryColor || "#000000" }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {settings.primaryColor || t("tenant.defaultColor") || "Default Color"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                {t("tenant.settingsAudit") || "Audit & Logs"}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => vm.setEditSection("audit")}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{t("tenant.auditEnabled") || "Audit Logging"}</div>
                <div className="text-sm text-muted-foreground">
                  {t("tenant.retentionLabel", { days: settings.auditRetentionDays }) ||
                    `Retention: ${settings.auditRetentionDays} days`}
                </div>
              </div>
              <Badge variant={settings.auditEnabled ? "default" : "secondary"}>
                {settings.auditEnabled
                  ? t("tenant.enabled") || "Enabled"
                  : t("tenant.disabled") || "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

      </div>

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

function RequirementBadge({ satisfied, label }: { satisfied: boolean; label: string }) {
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${!satisfied && "opacity-50"}`}>
      <span className={satisfied ? "text-green-500" : "text-muted-foreground"}>
        {satisfied ? "✓" : "○"}
      </span>
      {label}
    </Badge>
  );
}
