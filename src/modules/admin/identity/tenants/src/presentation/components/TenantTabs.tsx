// UI-EXCEPTION: compact studio layout
/**
 * Tenant Tabs Component
 *
 * Pill-style tab navigation composed on the shared Tabs/TabsList/TabsTrigger
 * primitives (variant="pill"), wrapped in the same quiet horizontal-scroll
 * strip PageHeader uses for its own tab row. Each tab's icon takes its accent
 * only while active, via a literal `group-data-[state=active]:` class per
 * tab — Tailwind only emits classes it can see as complete source text, so
 * the accent is never assembled at runtime.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@core/ui/tabs";
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

type TabValue =
  | "entitlements"
  | "admins"
  | "roles"
  | "userGroups"
  | "subtenants"
  | "settings"
  | "domains";

// One literal class per tab — never assembled from a template string, so
// Tailwind's static scanner can see every combination in source text.
const TAB_ACTIVE_ACCENT: Record<TabValue, string> = {
  entitlements: "group-data-[state=active]:text-warning",
  admins: "group-data-[state=active]:text-info",
  roles: "group-data-[state=active]:text-nx-accent",
  userGroups: "group-data-[state=active]:text-info",
  subtenants: "group-data-[state=active]:text-success",
  settings: "group-data-[state=active]:text-nx-ink-2",
  domains: "group-data-[state=active]:text-info",
};

/**
 * Presentation UI component rendering the tenant tabs.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantTabs({ tenantId, tenantName, tenantCode, parentTenantId }: TenantTabsProps) {
  const { t, direction } = useI18n();
  const [activeTab, setActiveTab] = useState<TabValue>("entitlements");

  const tabs: { value: TabValue; label: string; icon: typeof Crown }[] = [
    { value: "entitlements", label: t("tenant.tabEntitlements"), icon: Crown },
    { value: "admins", label: t("tenant.tabAdmins"), icon: Users },
    { value: "roles", label: t("tenant.tabRoles"), icon: Shield },
    { value: "userGroups", label: t("tenant.tabUserGroups"), icon: UsersRound },
    { value: "subtenants", label: t("tenant.tabSubTenants"), icon: Building2 },
    { value: "settings", label: t("tenant.tabSettings"), icon: Settings },
    { value: "domains", label: t("tenant.tabDomains"), icon: Globe },
  ];

  return (
    <div dir={direction}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        {/* Tab Navigation — the shell's own quiet scrollbar, not a hidden one */}
        <div className="nexus-custom-scrollbar -mx-1 overflow-x-auto px-1 pb-3">
          <TabsList variant="pill">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} variant="pill" className="group gap-2">
                <tab.icon
                  className={cn("h-4 w-4 text-nx-ink-3", TAB_ACTIVE_ACCENT[tab.value])}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <TabsContent value="entitlements">
              <TenantEntitlementsTab tenantId={tenantId} />
            </TabsContent>

            <TabsContent value="admins">
              <TenantAdminsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="roles">
              <TenantRolesTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="userGroups">
              <TenantUserGroupsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>

            <TabsContent value="subtenants">
              <SubTenantsTab parentId={tenantId} parentName={tenantName} parentCode={tenantCode} />
            </TabsContent>

            <TabsContent value="settings">
              <TenantSettingsTab
                tenantId={tenantId}
                tenantName={tenantName}
                parentTenantId={parentTenantId}
              />
            </TabsContent>

            <TabsContent value="domains">
              <TenantDomainsTab tenantId={tenantId} tenantName={tenantName} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
