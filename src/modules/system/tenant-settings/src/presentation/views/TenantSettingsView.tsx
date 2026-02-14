"use client";

import { useTenantSettingsViewModel } from "../viewmodels/useTenantSettingsViewModel";
import { QuotasSection } from "../components/QuotasSection";
import { SecuritySection } from "../components/SecuritySection";
import { BrandingSection } from "../components/BrandingSection";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { AlertCircle, Save, Loader2 } from "lucide-react";

/**
 * TenantSettingsView - Pure UI component for My Tenant Settings page
 *
 * Follows SOLID View/ViewModel pattern:
 * - View is ~60 lines max (pure composition)
 * - All logic lives in viewmodel
 * - Section components handle specific concerns
 */
export function TenantSettingsView() {
  const vm = useTenantSettingsViewModel();

  // System admin message
  if (vm.isSystemAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader t={vm.t} />
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{vm.t("tenantSettings.title")}</AlertTitle>
          <AlertDescription>{vm.t("tenantSettings.systemAdminMessage")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (vm.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader t={vm.t} />
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
        <PageHeader t={vm.t} />
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
      <PageHeader t={vm.t} />
      <QuotasSection settings={vm.settings} updateField={vm.updateField} t={vm.t} />
      <SecuritySection settings={vm.settings} updateField={vm.updateField} t={vm.t} />
      <BrandingSection settings={vm.settings} updateField={vm.updateField} t={vm.t} />
      <SaveActions vm={vm} />
    </div>
  );
}

// Small helper components to keep main view clean

function PageHeader({ t }: { t: (key: string) => string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t("tenantSettings.title")}</h1>
      <p className="text-muted-foreground">{t("tenantSettings.description")}</p>
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
      <Button onClick={vm.saveSettings} disabled={!vm.hasChanges || vm.isSaving}>
        {vm.isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {vm.t("tenantSettings.saving")}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {vm.t("tenantSettings.saveSettings")}
          </>
        )}
      </Button>
    </div>
  );
}
