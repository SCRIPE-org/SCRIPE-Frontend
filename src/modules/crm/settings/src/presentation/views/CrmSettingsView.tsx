"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { AlertTriangle, CheckCircle2, RotateCcw, Save, GitBranch, ShieldAlert } from "lucide-react";
import {
  CRM_TAB_ROUTES,
  CrmSectionHeader,
  CrmShell,
  type CrmTabId,
} from "@modules/crm/shared";
import { CrmSettingsSkeleton } from "../components/CrmSettingsSkeleton";
import { CrmCurrencySettingsCard } from "../components/settings/CrmCurrencySettingsCard";
import { CrmGovernanceSettingsCard } from "../components/settings/CrmGovernanceSettingsCard";
import { CrmCustomFieldsStudioCard } from "../components/settings/CrmCustomFieldsStudioCard";
import { CrmRolesAndPrincipalsSettingsCard } from "../components/settings/CrmRolesAndPrincipalsSettingsCard";
import { CrmSettingsSidebarNav } from "../components/settings/CrmSettingsSidebarNav";
import {
  useCrmSettingsViewModel,
  type CrmSettingsTabKey,
} from "../viewmodels/useCrmSettingsViewModel";

/** Re-exported active tab key union for the CRM Settings workspace. */
export type { CrmSettingsTabKey };

/**
 * PBAC-protected CRM Settings administration workspace providing currency/FX management,
 * custom fields studio, SLA escalation rules, and decoupled pipeline role definitions.
 */
export function CrmSettingsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const vm = useCrmSettingsViewModel();

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  if (!vm.canManageSettings) {
    return (
      <CrmShell activeTab="settings" onTabChange={handleTabChange}>
        <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-settings-unauthorized">
          <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
            <ShieldAlert className="size-4" />
            <AlertTitle className="text-sm font-bold">{t("crm.settings.unauthorizedTitle")}</AlertTitle>
            <AlertDescription className="text-xs mt-1">{t("crm.settings.unauthorizedMessage")}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const showRolesCard =
    vm.selectedSection === "all" || vm.selectedSection === "pipeline-roles" || vm.selectedSection === "dictionaries" || vm.selectedSection === "quotes-approvals";
  const showCurrencyCard =
    vm.selectedSection === "all" || vm.selectedSection === "currency-fx" || vm.selectedSection === "quotes-approvals";
  const showGovernanceCard =
    vm.selectedSection === "all" || vm.selectedSection === "sla-escalation" || vm.selectedSection === "field-locking" || vm.selectedSection === "numbering-handoffs";
  const showCustomFieldsCard =
    vm.selectedSection === "all" || vm.selectedSection === "custom-fields" || vm.selectedSection === "field-locking" || vm.selectedSection === "numbering-handoffs";

  return (
    <CrmShell activeTab="settings" onTabChange={handleTabChange}>
      <div className="space-y-5" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-settings-view">
        <CrmSectionHeader
          title={t("crm.settings.title")}
          subtitle={t("crm.settings.subtitle")}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" data-testid="crm-settings-open-workflow-btn" onClick={() => router.push("/crm/pipelines")} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <GitBranch className="size-3.5 text-nx-accent" />
                <span>{t("crm.settings.openWorkflowStudio")}</span>
              </Button>
              <Button type="button" variant="outline" size="sm" data-testid="crm-settings-reset-btn" onClick={vm.resetAndPersistDefaults} disabled={vm.isSaving} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink">
                <RotateCcw className="size-3.5" />
                <span>{t("crm.settings.resetDefaults")}</span>
              </Button>
              <Button type="button" variant="default" size="sm" disabled={vm.isSaving} data-testid="crm-settings-save-btn" onClick={() => vm.persistTenantAndUserSettings(t("crm.settings.savedToast"))} className="h-8 text-xs font-bold gap-1.5">
                <Save className="size-3.5" />
                <span>{vm.isSaving ? t("crm.settings.saving") : t("crm.settings.saveConfiguration")}</span>
              </Button>
            </div>
          }
        />

        {vm.errorBanner && (
          <Alert variant="destructive" className="border-destructive/40 bg-destructive/10 py-2.5" data-testid="crm-settings-error-banner">
            <AlertTriangle className="size-4" />
            <AlertDescription className="text-xs font-medium flex items-center justify-between">
              <span>{vm.errorBanner}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => vm.setErrorBanner(null)} className="h-6 text-[11px]">{t("crm.settings.dismiss")}</Button>
            </AlertDescription>
          </Alert>
        )}

        {vm.saveBanner && (
          <Alert className="border-success/30 bg-success/10 text-success py-2.5" data-testid="crm-settings-save-banner">
            <CheckCircle2 className="size-4" />
            <AlertDescription className="text-xs font-medium flex items-center justify-between">
              <span>{vm.saveBanner}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => vm.setSaveBanner(null)} className="h-6 text-[11px] text-nx-ink-2">{t("crm.settings.dismiss")}</Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" data-testid="crm-settings-2pane-workspace">
          <CrmSettingsSidebarNav isRtl={isRtl} selectedSection={vm.selectedSection} onSelectSection={vm.handleSelectSection} navSearch={vm.navSearch} onNavSearchChange={vm.setNavSearch} />
          <div className="lg:col-span-9 space-y-5" data-testid="crm-settings-right-pane">
            {vm.settings.isHydrating ? (
              <CrmSettingsSkeleton />
            ) : (
              <>
                {showRolesCard && <CrmRolesAndPrincipalsSettingsCard settings={vm.settings} recordPrincipals={vm.recordPrincipals} onNotifySaved={vm.setSaveBanner} />}
                {showCurrencyCard && <CrmCurrencySettingsCard settings={vm.settings} baseCurrency={vm.currencyHook.baseCurrency} rates={vm.currencyHook.rates} onRefreshLiveRates={vm.currencyHook.refreshLiveRates} onNotifySaved={vm.setSaveBanner} />}
                {showGovernanceCard && <CrmGovernanceSettingsCard settings={vm.settings} />}
                {showCustomFieldsCard && <CrmCustomFieldsStudioCard settings={vm.settings} workflows={vm.workflows} onCreateCustomField={vm.createCustomField} onNotifySaved={vm.setSaveBanner} />}
              </>
            )}
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
