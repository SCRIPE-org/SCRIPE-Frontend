/**
 * Tenant Tabs Component
 *
 * Orchestrator for tabbed navigation managing tenant resources.
 * Each tab is a separate component following SOLID principles.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Card, CardContent, CardHeader } from "@core/ui/card";
import { Users, Shield, Building2, Settings } from "lucide-react";
import { cn } from "@core/common/utils";

// Tab components (SOLID - each in separate file)
import { TenantAdminsTab } from "./tabs/TenantAdminsTab";
import { TenantRolesTab } from "./tabs/TenantRolesTab";
import { SubTenantsTab } from "./tabs/SubTenantsTab";
import { TenantSettingsTab } from "./tabs/TenantSettingsTab";

interface TenantTabsProps {
      tenantId: string;
      tenantName: string;
      tenantCode: string;
      parentTenantId?: string;
}

export function TenantTabs({ tenantId, tenantName, tenantCode, parentTenantId }: TenantTabsProps) {
      const { t, direction } = useI18n();
      const [activeTab, setActiveTab] = useState("admins");

      const tabs = [
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
            <Card className="border-border/50 shadow-lg" dir={direction}>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                        {/* Tab Navigation */}
                        <CardHeader className="pb-0 border-b">
                              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/30">
                                    {tabs.map((tab) => (
                                          <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className={cn(
                                                      "flex items-center gap-2 py-3",
                                                      "data-[state=active]:bg-background",
                                                      "data-[state=active]:shadow-sm",
                                                      "data-[state=active]:border-b-2",
                                                      "data-[state=active]:border-b-primary",
                                                      "transition-all duration-200"
                                                )}
                                          >
                                                <tab.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                          </TabsTrigger>
                                    ))}
                              </TabsList>
                        </CardHeader>

                        <CardContent className="p-0">
                              {/* Admins Tab */}
                              <TabsContent value="admins" className="m-0 p-6">
                                    <TenantAdminsTab tenantId={tenantId} tenantName={tenantName} />
                              </TabsContent>

                              {/* Roles Tab */}
                              <TabsContent value="roles" className="m-0 p-6">
                                    <TenantRolesTab tenantId={tenantId} tenantName={tenantName} />
                              </TabsContent>

                              {/* Sub-Tenants Tab */}
                              <TabsContent value="subtenants" className="m-0 p-6">
                                    <SubTenantsTab parentId={tenantId} parentName={tenantName} parentCode={tenantCode} />
                              </TabsContent>

                              {/* Settings Tab */}
                              <TabsContent value="settings" className="m-0 p-6">
                                    <TenantSettingsTab tenantId={tenantId} tenantName={tenantName} parentTenantId={parentTenantId} />
                              </TabsContent>
                        </CardContent>
                  </Tabs>
            </Card>
      );
}
