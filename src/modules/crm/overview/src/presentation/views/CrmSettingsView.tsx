"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { CheckCircle2, RotateCcw, Save, GitBranch } from "lucide-react";
import { CrmShell } from "../components/CrmShell";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { useCrmSettingsViewModel } from "../viewmodels/useCrmSettingsViewModel";
import { useCrmWorkflowsStore } from "../viewmodels/useCrmWorkflowsStore";
import { CrmCurrencySettingsCard } from "../components/settings/CrmCurrencySettingsCard";
import { CrmGovernanceSettingsCard } from "../components/settings/CrmGovernanceSettingsCard";
import { CrmCustomFieldsStudioCard } from "../components/settings/CrmCustomFieldsStudioCard";

/**
 * CRM Module Settings & Multi-Currency Engine View (/crm/settings).
 * Strictly follows SCRIPE MVVM architecture:
 * CrmSettingsView -> useCrmSettingsViewModel -> CrmOverviewRepository -> CrmOverviewService -> IApiService.
 */
export function CrmSettingsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const {
    settings,
    currencyHook,
    isSaving,
    saveBanner,
    setSaveBanner,
    persistTenantAndUserSettings,
    createCustomField,
  } = useCrmSettingsViewModel();

  const handleSaveAll = async () => {
    await persistTenantAndUserSettings(t("crm.settings.savedToast"));
  };

  const handleResetDefaults = async () => {
    settings.resetDefaults();
    useCrmWorkflowsStore.getState().resetDefaults();
    await persistTenantAndUserSettings(t("crm.settings.resetToast"));
  };

  return (
    <CrmShell activeTab="settings" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-settings-view">
        <CrmSectionHeader
          title={t("crm.settings.title")}
          subtitle={t("crm.settings.subtitle")}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="crm-settings-open-workflow-btn"
                onClick={() => router.push("/crm/pipelines")}
                className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
              >
                <GitBranch className="size-3.5 text-nx-accent" />
                <span>{t("crm.settings.openWorkflowStudio")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="crm-settings-reset-btn"
                onClick={handleResetDefaults}
                className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink"
              >
                <RotateCcw className="size-3.5" />
                <span>{t("crm.settings.resetDefaults")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSaving}
                data-testid="crm-settings-save-btn"
                onClick={handleSaveAll}
                className="h-8 text-xs font-bold gap-1.5"
              >
                <Save className="size-3.5" />
                <span>
                  {isSaving
                    ? t("crm.settings.saving")
                    : t("crm.settings.saveConfiguration")}
                </span>
              </Button>
            </div>
          }
        />

        {saveBanner && (
          <Alert
            className="border-success/30 bg-success/10 text-success py-2.5"
            data-testid="crm-settings-save-banner"
          >
            <CheckCircle2 className="size-4" />
            <AlertDescription className="text-xs font-medium flex items-center justify-between">
              <span>{saveBanner}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSaveBanner(null)}
                className="h-6 text-[11px] text-nx-ink-2"
              >
                {t("crm.settings.dismiss")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 1. Multi-Currency & Triple-Value FX Engine */}
        <CrmCurrencySettingsCard
          settings={settings}
          baseCurrency={currencyHook.baseCurrency}
          rates={currencyHook.rates}
          onRefreshLiveRates={currencyHook.refreshLiveRates}
          onNotifySaved={(msg) => setSaveBanner(msg)}
        />

        {/* 2. Lead & Deal Governance Policies + 4. User Workspace Personalization */}
        <CrmGovernanceSettingsCard settings={settings} />

        {/* 3. Cross-Module SCRIPE Sports OS Integrations Hub & Custom Fields Studio */}
        <CrmCustomFieldsStudioCard
          settings={settings}
          onCreateCustomField={createCustomField}
          onNotifySaved={(msg) => setSaveBanner(msg)}
        />
      </div>
    </CrmShell>
  );
}
