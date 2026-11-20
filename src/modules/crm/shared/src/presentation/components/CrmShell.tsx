"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  GitFork,
  Contact,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";
import { CRM_PERMISSIONS } from "../../constants/permission-constants";
import type { CrmTabId } from "../../types/crmSharedTypes";
import { useCrmClientPrefsStore } from "../stores/useCrmClientPrefsStore";
import { useCrmTenantScope } from "../utils/useSafeQueryClient";
import { useCrmCurrency } from "../viewmodels/useCrmCurrency";
import { CrmSmartGuideModal } from "./CrmSmartGuideModal";
import { CrmShellTopToolbar } from "./CrmShellTopToolbar";
import { CrmSmartTipRibbon } from "./CrmSmartTipRibbon";

/** Re-exported CRM shell navigation tab identifier type. */
export type { CrmTabId };

/** Props for `CrmShell`. */
export interface CrmShellProps {
  activeTab: CrmTabId;
  onTabChange: (tab: CrmTabId) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateDeal?: () => void;
  onCreateLead?: () => void;
  children: ReactNode;
  className?: string;
}

const TAB_ROUTES: Record<CrmTabId, string> = {
  overview: "/crm",
  leads: "/crm/leads",
  deals: "/crm/opportunities",
  accounts: "/crm/accounts",
  contacts: "/crm/contacts",
  activities: "/crm/activities",
  pipelines: "/crm/pipelines",
  reports: "/crm/reports",
  settings: "/crm/settings",
};

/**
 * Shared operational shell for all CRM module routes providing module navigation,
 * global reporting currency selector, smart guide launcher, and tenant-scoped smart tip ribbon.
 */
export function CrmShell({
  activeTab,
  onTabChange,
  searchQuery = "",
  onSearchChange,
  onCreateDeal,
  onCreateLead,
  children,
  className,
}: CrmShellProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { scopeKey } = useCrmTenantScope();
  const { baseCurrency, setBaseCurrency } = useCrmCurrency();
  const [smartGuideOpen, setSmartGuideOpen] = useState(false);

  const tipDismissed = useCrmClientPrefsStore((s) => s.tipDismissed);
  const setTipDismissed = useCrmClientPrefsStore((s) => s.setTipDismissed);
  const syncScopeContext = useCrmClientPrefsStore((s) => s.syncScopeContext);

  useEffect(() => {
    syncScopeContext(scopeKey);
  }, [scopeKey, syncScopeContext]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const nexusMain = document.getElementById("nexus-content");
      if (nexusMain?.parentElement) {
        nexusMain.parentElement.scrollTop = 0;
      }
    }
  }, [activeTab]);

  const canReadPipelines = usePermission(CRM_PERMISSIONS.PIPELINES_READ);
  const canReadLeads = usePermission(CRM_PERMISSIONS.LEADS_READ);
  const canReadOpportunities = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_READ);
  const canReadAccounts = usePermission(CRM_PERMISSIONS.ACCOUNTS_READ);
  const canReadContacts = usePermission(CRM_PERMISSIONS.CONTACTS_READ);
  const canReadActivities = usePermission(CRM_PERMISSIONS.ACTIVITIES_READ);
  const canReadReports = usePermission(CRM_PERMISSIONS.REPORTS_READ);
  const canManageSettings = usePermission(CRM_PERMISSIONS.SETTINGS_MANAGE);
  const canCreateOpportunities = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canCreateLeads = usePermission(CRM_PERMISSIONS.LEADS_CREATE);

  const tabs: Array<{
    id: CrmTabId;
    label: string;
    icon: typeof LayoutDashboard;
    visible: boolean;
  }> = [
    { id: "overview", label: t("crm.tabs.overview"), icon: LayoutDashboard, visible: true },
    { id: "leads", label: t("crm.tabs.leads"), icon: Users, visible: canReadLeads },
    { id: "deals", label: t("crm.tabs.deals"), icon: Briefcase, visible: canReadOpportunities },
    { id: "accounts", label: t("crm.tabs.accounts"), icon: Building2, visible: canReadAccounts },
    { id: "contacts", label: t("crm.tabs.contacts"), icon: Contact, visible: canReadContacts },
    { id: "activities", label: t("crm.tabs.activities"), icon: Clock, visible: canReadActivities },
    { id: "pipelines", label: t("crm.tabs.pipelines"), icon: GitFork, visible: canReadPipelines },
    { id: "reports", label: t("crm.tabs.reports"), icon: BarChart3, visible: canReadReports },
    { id: "settings", label: t("crm.tabs.settings"), icon: Settings, visible: canManageSettings },
  ];

  return (
    <div
      data-testid="crm-shell"
      className={cn("flex flex-col space-y-3.5 p-4 sm:px-6 sm:py-4 w-full max-w-none", className)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1.5 border-b border-nx-line pb-2">
        <nav
          aria-label={t("crm.navigation")}
          className="flex flex-wrap items-center gap-0.5 min-w-0"
        >
          {tabs
            .filter((tab) => tab.visible)
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant="ghost"
                  data-testid={`crm-tab-${tab.id}`}
                  onClick={() => {
                    onTabChange(tab.id);
                    router.push(TAB_ROUTES[tab.id]);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex shrink-0 select-none items-center gap-1 rounded-nx-md px-1.5 py-1 text-[11px] font-semibold transition-all duration-nx-micro h-auto",
                    isActive
                      ? "border-nx-line/80 border bg-nx-surface font-bold text-nx-ink"
                      : "hover:bg-nx-surface/60 text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  <Icon
                    className={cn("size-3 shrink-0", isActive ? "text-nx-accent" : "text-nx-ink-3")}
                    aria-hidden="true"
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-nx-accent"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              );
            })}
        </nav>

        <CrmShellTopToolbar
          t={t}
          isRtl={isRtl}
          baseCurrency={baseCurrency}
          onBaseCurrencyChange={setBaseCurrency}
          onOpenSmartGuide={() => setSmartGuideOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          canCreateOpportunities={canCreateOpportunities}
          onCreateDeal={onCreateDeal}
          canCreateLeads={canCreateLeads}
          onCreateLead={onCreateLead}
          canManageSettings={canManageSettings}
        />
      </div>

      {!tipDismissed && (
        <CrmSmartTipRibbon
          t={t}
          activeTab={activeTab}
          onOpenGuide={() => setSmartGuideOpen(true)}
          onDismiss={() => setTipDismissed(true)}
        />
      )}

      <main className="space-y-6">{children}</main>

      <CrmSmartGuideModal open={smartGuideOpen} onOpenChange={setSmartGuideOpen} isRtl={isRtl} />
    </div>
  );
}
