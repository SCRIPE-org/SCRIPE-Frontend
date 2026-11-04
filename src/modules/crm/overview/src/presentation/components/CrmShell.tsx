"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { CRM_PERMISSIONS } from "../../domain/constants/permission-constants";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  GitFork,
  Search,
  Plus,
  Contact,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";

export type CrmTabId =
  | "overview"
  | "leads"
  | "deals"
  | "accounts"
  | "contacts"
  | "activities"
  | "pipelines"
  | "reports";

interface CrmShellProps {
  activeTab: CrmTabId;
  onTabChange: (tab: CrmTabId) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateDeal?: () => void;
  onCreateLead?: () => void;
  children: ReactNode;
  className?: string;
}

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

  const canReadPipelines = usePermission(CRM_PERMISSIONS.PIPELINES_READ);
  const canReadLeads = usePermission(CRM_PERMISSIONS.LEADS_READ);
  const canReadOpportunities = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_READ);
  const canReadAccounts = usePermission(CRM_PERMISSIONS.ACCOUNTS_READ);
  const canReadContacts = usePermission(CRM_PERMISSIONS.CONTACTS_READ);
  const canReadActivities = usePermission(CRM_PERMISSIONS.ACTIVITIES_READ);
  const canReadReports = usePermission(CRM_PERMISSIONS.REPORTS_READ);
  const canCreateOpportunities = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canCreateLeads = usePermission(CRM_PERMISSIONS.LEADS_CREATE);

  const tabs: Array<{
    id: CrmTabId;
    label: string;
    icon: typeof LayoutDashboard;
    visible: boolean;
  }> = [
    {
      id: "overview",
      label: t("crm.tabs.overview"),
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "leads",
      label: t("crm.tabs.leads"),
      icon: Users,
      visible: canReadLeads,
    },
    {
      id: "deals",
      label: t("crm.tabs.deals"),
      icon: Briefcase,
      visible: canReadOpportunities,
    },
    {
      id: "accounts",
      label: t("crm.tabs.accounts"),
      icon: Building2,
      visible: canReadAccounts,
    },
    {
      id: "contacts",
      label: t("crm.tabs.contacts") || "Contacts",
      icon: Contact,
      visible: canReadContacts,
    },
    {
      id: "activities",
      label: t("crm.tabs.activities") || "Activities",
      icon: Clock,
      visible: canReadActivities,
    },
    {
      id: "pipelines",
      label: t("crm.tabs.pipelines"),
      icon: GitFork,
      visible: canReadPipelines,
    },
    {
      id: "reports",
      label: t("crm.tabs.reports") || "Reports",
      icon: BarChart3,
      visible: canReadReports,
    },
  ];

  return (
    <div
      className={cn("flex flex-col space-y-5 p-4 sm:p-6 w-full max-w-none", className)}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nx-line pb-3">
        {/* Navigation Tabs (Figma CRMTab component) */}
        <nav
          aria-label={t("crm.navigation")}
          className="flex flex-wrap items-center gap-1"
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
                    if (tab.id === "overview") router.push("/crm");
                    else if (tab.id === "leads") router.push("/crm/leads");
                    else if (tab.id === "deals") router.push("/crm/opportunities");
                    else if (tab.id === "accounts") router.push("/crm/accounts");
                    else if (tab.id === "contacts") router.push("/crm/contacts");
                    else if (tab.id === "activities") router.push("/crm/activities");
                    else if (tab.id === "pipelines") router.push("/crm/pipelines");
                    else if (tab.id === "reports") router.push("/crm/reports");
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex shrink-0 select-none items-center gap-1.5 rounded-nx-md px-3 py-1.5 text-xs font-semibold transition-all duration-nx-micro h-auto",
                    isActive
                      ? "border-nx-line/80 border bg-nx-surface font-bold text-nx-ink"
                      : "hover:bg-nx-surface/60 text-nx-ink-2 hover:text-nx-ink"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5",
                      isActive ? "text-nx-accent" : "text-nx-ink-3"
                    )}
                    aria-hidden="true"
                  />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute inset-x-2.5 bottom-[-5px] h-0.5 rounded-full bg-nx-accent"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              );
            })}
        </nav>

        {/* Global Filter & Quick Actions */}
        {(onSearchChange || (canCreateOpportunities && onCreateDeal) || (canCreateLeads && onCreateLead)) && (
          <div className="flex flex-wrap items-center gap-2 ms-auto">
            {onSearchChange && (
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3" />
                <Input
                  type="text"
                  placeholder={t("crm.actions.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs bg-nx-surface border-nx-line focus-visible:ring-nx-accent text-nx-ink placeholder:text-nx-ink-3"
                />
              </div>
            )}

            {canCreateOpportunities && onCreateDeal && (
              <Button
                type="button"
                size="sm"
                onClick={onCreateDeal}
                className="h-8 gap-1.5 font-bold transition-all text-xs shrink-0"
              >
                <Plus className="size-3.5" />
                <span>{t("crm.actions.createDeal")}</span>
              </Button>
            )}

            {canCreateLeads && onCreateLead && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCreateLead}
                className="h-8 gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised text-xs shrink-0"
              >
                <Plus className="size-3.5" />
                <span>{t("crm.actions.createLead")}</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <main className="space-y-6">{children}</main>
    </div>
  );
}
