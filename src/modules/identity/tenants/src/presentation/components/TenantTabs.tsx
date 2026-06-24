// UI-EXCEPTION: compact studio layout
/**
 * Tenant Tabs Component — Deep Redesign
 *
 * Premium segment-style tab navigation with glow effects.
 * No scrollbar — uses horizontal scroll-snap with hidden scrollbar.
 * Each tab has icon + label with animated active indicator.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent } from "@core/ui/tabs";
import { Users, Shield, Building2, Settings, Crown, UsersRound, Globe } from "lucide-react";
import { cn } from "@core/common/utils";

// Tab components
import { TenantAdminsTab } from "./tabs/TenantAdminsTab";
import { TenantRolesTab } from "./tabs/TenantRolesTab";
import { TenantUserGroupsTab } from "./tabs/TenantUserGroupsTab";
import { SubTenantsTab } from "./tabs/SubTenantsTab";
import { TenantSettingsTab } from "./tabs/TenantSettingsTab";
import { TenantEntitlementsTab } from "./tabs/TenantEntitlementsTab";
import { TenantDomainsTab } from "./tabs/TenantDomainsTab";

interface TenantTabsProps {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  parentTenantId?: string;
}

export function TenantTabs({ tenantId, tenantName, tenantCode, parentTenantId }: TenantTabsProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";
  const [activeTab, setActiveTab] = useState("entitlements");

  const tabs = [
    {
      value: "entitlements",
      label: t("tenant.tabEntitlements") || "Entitlements",
      icon: Crown,
      color: "text-amber-500",
      activeBg: "bg-amber-500/10",
    },
    {
      value: "admins",
      label: t("tenant.tabAdmins") || "Admins",
      icon: Users,
      color: "text-blue-500",
      activeBg: "bg-blue-500/10",
    },
    {
      value: "roles",
      label: t("tenant.tabRoles") || "Roles",
      icon: Shield,
      color: "text-violet-500",
      activeBg: "bg-violet-500/10",
    },
    {
      value: "userGroups",
      label: t("tenant.tabUserGroups") || "User Groups",
      icon: UsersRound,
      color: "text-teal-500",
      activeBg: "bg-teal-500/10",
    },
    {
      value: "subtenants",
      label: t("tenant.tabSubTenants") || "Sub-Tenants",
      icon: Building2,
      color: "text-emerald-500",
      activeBg: "bg-emerald-500/10",
    },
    {
      value: "settings",
      label: t("tenant.tabSettings") || "Settings",
      icon: Settings,
      color: "text-slate-400",
      activeBg: "bg-slate-500/10",
    },
    {
      value: "domains",
      label: t("tenant.tabDomains") || "Domains",
      icon: Globe,
      color: "text-cyan-500",
      activeBg: "bg-cyan-500/10",
    },
  ];

  return (
    <div dir={direction}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ── Tab Navigation ── */}
        <div
          className={cn(
            "scrollbar-none flex overflow-x-auto",
            "gap-1 pb-3",
            // Hide scrollbar cross-browser
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "group flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5",
                  "text-sm font-medium",
                  "transition-all duration-300",
                  "border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? cn("border-border/80 bg-card shadow-md", tab.activeBg, tab.color)
                    : cn(
                        "border-transparent text-muted-foreground",
                        "hover:border-border/30 hover:bg-muted/50 hover:text-foreground"
                      )
                )}
              >
                <tab.icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isActive && "scale-110"
                  )}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div
          className={cn(
            "rounded-2xl border border-border/50 bg-card",
            "shadow-xl shadow-primary/5",
            "overflow-hidden"
          )}
        >
          <div className="p-6">
            <TabsContent
              value="entitlements"
              className="m-0"
              forceMount={activeTab === "entitlements" ? undefined : undefined}
            >
              <TenantEntitlementsTab tenantId={tenantId} />
            </TabsContent>

            <TabsContent value="admins" className="m-0">
              <TenantAdminsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="roles" className="m-0">
              <TenantRolesTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="userGroups" className="m-0">
              <TenantUserGroupsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="subtenants" className="m-0">
              <SubTenantsTab parentId={tenantId} parentName={tenantName} parentCode={tenantCode} />
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <TenantSettingsTab
                tenantId={tenantId}
                tenantName={tenantName}
                parentTenantId={parentTenantId}
              />
            </TabsContent>

            <TabsContent value="domains" className="m-0">
              <TenantDomainsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
