"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  CheckCircle2,
  RotateCcw,
  Save,
  GitBranch,
} from "lucide-react";
import { CrmShell } from "../components/CrmShell";
import { CrmSectionHeader } from "../components/CrmSectionHeader";
import { CrmSettingsSkeleton } from "../components/CrmSettingsSkeleton";
import { useCrmSettingsViewModel } from "../viewmodels/useCrmSettingsViewModel";
import { useCrmWorkflowsStore } from "../viewmodels/useCrmWorkflowsStore";
import { CrmCurrencySettingsCard } from "../components/settings/CrmCurrencySettingsCard";
import { CrmGovernanceSettingsCard } from "../components/settings/CrmGovernanceSettingsCard";
import { CrmCustomFieldsStudioCard } from "../components/settings/CrmCustomFieldsStudioCard";
import { CrmRolesAndPrincipalsSettingsCard } from "../components/settings/CrmRolesAndPrincipalsSettingsCard";
import {
  CrmSettingsSidebarNav,
  type CrmSettingsTabKey,
} from "../components/settings/CrmSettingsSidebarNav";

export type { CrmSettingsTabKey };

export function CrmSettingsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const [selectedSection, setSelectedSection] = useState<CrmSettingsTabKey>("all");
  const [navSearch, setNavSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as CrmSettingsTabKey | null;
      if (tab) setSelectedSection(tab);
    }
  }, []);

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

  const showRolesCard =
    selectedSection === "all" ||
    selectedSection === "pipeline-roles" ||
    selectedSection === "dictionaries" ||
    selectedSection === "quotes-approvals";
  const showCurrencyCard =
    selectedSection === "all" || selectedSection === "currency-fx" || selectedSection === "quotes-approvals";
  const showGovernanceCard =
    selectedSection === "all" ||
    selectedSection === "sla-escalation" ||
    selectedSection === "field-locking" ||
    selectedSection === "numbering-handoffs";
  const showCustomFieldsCard =
    selectedSection === "all" ||
    selectedSection === "custom-fields" ||
    selectedSection === "field-locking" ||
    selectedSection === "numbering-handoffs";

  return (
    <CrmShell activeTab="settings" onTabChange={() => {}}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-settings-view">
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
                <span>{isSaving ? t("crm.settings.saving") : t("crm.settings.saveConfiguration")}</span>
              </Button>
            </div>
          }
        />

        {saveBanner && (
          <Alert className="border-success/30 bg-success/10 text-success py-2.5" data-testid="crm-settings-save-banner">
            <CheckCircle2 className="size-4" />
            <AlertDescription className="text-xs font-medium flex items-center justify-between">
              <span>{saveBanner}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSaveBanner(null)} className="h-6 text-[11px] text-nx-ink-2">
                {t("crm.settings.dismiss")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" data-testid="crm-settings-2pane-workspace">
          <CrmSettingsSidebarNav
            isRtl={isRtl}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            navSearch={navSearch}
            onNavSearchChange={setNavSearch}
          />

          <div className="lg:col-span-9 space-y-5" data-testid="crm-settings-right-pane">
            {settings.isHydrating ? (
              <CrmSettingsSkeleton />
            ) : (
              <>
                {showRolesCard && (
                  <CrmRolesAndPrincipalsSettingsCard
                    settings={settings}
                    onNotifySaved={(msg) => setSaveBanner(msg)}
                  />
                )}

                {showCurrencyCard && (
                  <CrmCurrencySettingsCard
                    settings={settings}
                    baseCurrency={currencyHook.baseCurrency}
                    rates={currencyHook.rates}
                    onRefreshLiveRates={currencyHook.refreshLiveRates}
                    onNotifySaved={(msg) => setSaveBanner(msg)}
                  />
                )}

                {showGovernanceCard && <CrmGovernanceSettingsCard settings={settings} />}

                {showCustomFieldsCard && (
                  <CrmCustomFieldsStudioCard
                    settings={settings}
                    onCreateCustomField={createCustomField}
                    onNotifySaved={(msg) => setSaveBanner(msg)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
