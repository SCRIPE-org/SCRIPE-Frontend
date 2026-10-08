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
import { PageHeader } from "@core/ui/page-header";
import { Card } from "@core/ui/card";
import { AlertCircle, Save, Building2, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
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
      <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
        <SettingsPageHeader mode={vm.mode} />
        <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
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
      <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
        <SettingsPageHeader mode={vm.mode} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{vm.t("common.error")}</AlertTitle>
          <AlertDescription>
            {vm.t("tenantSettings.loadError")}: {vm.error?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      {/* System Defaults Banner */}
      {vm.mode === "system" && (
        <div className="flex items-center gap-2 rounded-nx-md bg-nx-accent-fill px-4 py-2.5 text-sm font-medium text-nx-on-fill">
          <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{vm.t("tenantSettings.systemBanner")}</span>
        </div>
      )}

      <SettingsPageHeader mode={vm.mode} />

      {/* Show Quotas & Security only for tenant contexts, not system defaults */}
      {vm.mode !== "system" && (
        <>
          <QuotasSection settings={vm.settings} updateField={vm.updateField} />
          <SecuritySection settings={vm.settings} updateField={vm.updateField} />
          <Card className="border-nx-line bg-nx-surface p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-nx-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md text-nx-accent">
                  <Globe className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-nx-ink">{vm.t("tenant.domainsTitle")}</h4>
                  <p className="text-sm text-nx-ink-2">{vm.t("tenant.domainsNoCustomHint")}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/domains">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  {vm.t("tenant.domainsTitle")}
                </Link>
              </Button>
            </div>
          </Card>
        </>
      )}
      <BrandingSection settings={vm.settings} updateField={vm.updateField} />
      <CustomizationSection settings={vm.settings} />
      <SaveActions vm={vm} />
    </div>
  );
}

// Small helper components to keep main view clean

function SettingsPageHeader({ mode }: { mode: "my" | "system" | "tenant" }) {
  const { t } = useI18n();
  const title = mode === "system" ? t("tenantSettings.systemTitle") : t("tenantSettings.title");
  const description =
    mode === "system" ? t("tenantSettings.systemDescription") : t("tenantSettings.description");

  return <PageHeader className="mb-0" title={title} description={description} />;
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
        {!vm.isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
        {vm.isSaving ? vm.t("tenantSettings.saving") : vm.t("tenantSettings.saveSettings")}
      </Button>
    </div>
  );
}
