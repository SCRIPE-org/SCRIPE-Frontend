"use client";

import { useI18n } from "@core/providers/i18n-provider";

import { useTenantSettingsViewModel } from "../viewmodels/useTenantSettingsViewModel";
import { QuotasSection } from "../components/QuotasSection";
import { SecuritySection } from "../components/SecuritySection";
import { BrandingSection } from "../components/BrandingSection";
import { CustomizationSection } from "../components/CustomizationSection";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { AlertCircle, Save, Loader2, Building2 } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * TenantSettingsView - Pure UI component for Settings page
 *
 * Follows SOLID View/ViewModel pattern:
 * - View is ~60 lines max (pure composition)
 * - All logic lives in viewmodel
 * - Section components handle specific concerns
 *
 * Modes (backend-driven):
 * - "my"     → Tenant admin editing own settings
 * - "system" → System admin editing platform defaults
 * - "tenant" → System admin drilldown into a tenant
 */
export function TenantSettingsView() {
  useModuleLocales(() => import("../../../locales"), "tenant-settings");

  const vm = useTenantSettingsViewModel();

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader mode={vm.mode} />
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (vm.isError) {
    return (
      <div className="space-y-6">
        <PageHeader mode={vm.mode} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{vm.t("common.error")}</AlertTitle>
          <AlertDescription>
            {vm.t("tenantSettings.loadError")}: {vm.error?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Defaults Banner */}
      {vm.mode === "system" && (
        <div className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-white text-sm font-medium">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>{vm.t("tenantSettings.systemBanner") || "Editing System Defaults — these apply to all tenants without custom settings"}</span>
        </div>
      )}

      <PageHeader mode={vm.mode} />

      {/* Show Quotas & Security only for tenant contexts, not system defaults */}
      {vm.mode !== "system" && (
        <>
          <QuotasSection settings={vm.settings} updateField={vm.updateField} />
          <SecuritySection settings={vm.settings} updateField={vm.updateField} />
        </>
      )}
      <BrandingSection settings={vm.settings} updateField={vm.updateField} />
      <CustomizationSection settings={vm.settings} />
      <SaveActions vm={vm} />
    </div>
  );
}

// Small helper components to keep main view clean

function PageHeader({ mode }: { mode: 'my' | 'system' | 'tenant' }) {
  const { t } = useI18n();
  const title = mode === "system"
    ? (t("tenantSettings.systemTitle") || "System Settings")
    : (t("tenantSettings.title") || "Tenant Settings");
  const description = mode === "system"
    ? (t("tenantSettings.systemDescription") || "Platform-wide defaults inherited by all tenants")
    : (t("tenantSettings.description") || "Manage your tenant settings");

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function SaveActions({ vm }: { vm: ReturnType<typeof useTenantSettingsViewModel> }) {
  return (
    <div className="flex justify-end gap-4">
      {vm.hasChanges && (
        <Button variant="outline" onClick={vm.resetForm}>
          {vm.t("common.cancel")}
        </Button>
      )}
      <Button onClick={vm.saveSettings} disabled={!vm.hasChanges} loading={vm.isSaving}>
        {!vm.isSaving && <Save className="mr-2 h-4 w-4" />}
        {vm.isSaving ? vm.t("tenantSettings.saving") : vm.t("tenantSettings.saveSettings")}
      </Button>
    </div>
  );
}

