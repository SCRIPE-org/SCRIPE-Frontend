/**
 * Tenant Tabs Component — Redesigned
 *
 * Pill-style tab navigation with icons.
 * Orchestrates 6 tab panels following SOLID principles.
 * Full RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Users, Shield, Building2, Settings, Crown, UsersRound } from "lucide-react";
import { cn } from "@core/common/utils";

// Tab components
import { TenantAdminsTab } from "./tabs/TenantAdminsTab";
import { TenantRolesTab } from "./tabs/TenantRolesTab";
import { TenantUserGroupsTab } from "./tabs/TenantUserGroupsTab";
import { SubTenantsTab } from "./tabs/SubTenantsTab";
import { TenantSettingsTab } from "./tabs/TenantSettingsTab";
import { TenantEntitlementsTab } from "./tabs/TenantEntitlementsTab";

interface TenantTabsProps {
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  parentTenantId?: string;
}

export function TenantTabs({ tenantId, tenantName, tenantCode, parentTenantId }: TenantTabsProps) {
  const { t, direction } = useI18n();
  const [activeTab, setActiveTab] = useState("entitlements");

  const tabs = [
    {
      value: "entitlements",
      label: t("tenant.tabEntitlements") || "Entitlements",
      icon: Crown,
    },
    {
      value: "admins",
      label: t("tenant.tabAdmins") || "Admins",
      icon: Users,
    },
    {
      value: "roles",
      label: t("tenant.tabRoles") || "Roles",
      icon: Shield,
    },
    {
      value: "userGroups",
      label: t("tenant.tabUserGroups") || "User Groups",
      icon: UsersRound,
    },
    {
      value: "subtenants",
      label: t("tenant.tabSubTenants") || "Sub-Tenants",
      icon: Building2,
    },
    {
      value: "settings",
      label: t("tenant.tabSettings") || "Settings",
      icon: Settings,
    },
  ];

  return (
    <div
      dir={direction}
      className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-primary/5 overflow-hidden"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab Navigation */}
        <div className="border-b border-border/50 bg-muted/20 px-2 pt-2 overflow-x-auto">
          <TabsList className="flex h-auto w-max min-w-full bg-transparent gap-1 p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-lg",
                  "text-sm font-medium",
                  "transition-all duration-200",
                  // Inactive style
                  "text-muted-foreground",
                  "hover:text-foreground hover:bg-muted/50",
                  // Active style — pill effect
                  "data-[state=active]:bg-background",
                  "data-[state=active]:text-primary",
                  "data-[state=active]:shadow-sm",
                  "data-[state=active]:border",
                  "data-[state=active]:border-border/50",
                  "data-[state=active]:border-b-transparent",
                  "data-[state=active]:-mb-px"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <TabsContent value="entitlements" className="m-0">
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
        </div>
      </Tabs>
    </div>
  );
}
