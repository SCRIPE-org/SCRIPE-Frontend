/**
 * TenantWorldPanel Component
 *
 * A panel/dialog that opens when a system admin "enters" a tenant's context.
 * Shows tabs for managing the tenant's resources (Admins, Roles, Sub-Tenants).
 */
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Badge } from "@core/ui/badge";
import { useTenantContext, TenantInfo } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import {
      X,
      Users,
      Shield,
      Building2,
      ChevronRight,
      Home
} from "lucide-react";

interface TenantWorldPanelProps {
      /** Whether the panel is open */
      open: boolean;
      /** Callback when panel should close */
      onClose: () => void;
      /** Tenant to manage (optional, uses context if not provided) */
      tenant?: TenantInfo;
}

/**
 * TenantWorldPanel
 *
 * Shows a modal panel for managing a tenant's resources.
 * Uses tabs to switch between Admins, Roles, and Sub-Tenants views.
 */
export function TenantWorldPanel({ open, onClose, tenant: propTenant }: TenantWorldPanelProps) {
      const { t } = useI18n();
      const { currentTenant, exitTenantWorld, enterTenantWorld, breadcrumbs } = useTenantContext();
      const { tenantRepository } = systemContainer;

      const [activeTab, setActiveTab] = useState("admins");

      // Use prop tenant or context tenant
      const tenant = propTenant || currentTenant;

      // When opening with a new tenant, enter that tenant's world
      useEffect(() => {
            if (open && propTenant && (!currentTenant || currentTenant.id !== propTenant.id)) {
                  enterTenantWorld(propTenant);
                  // Set tenant context via Repository (Clean Architecture)
                  tenantRepository.setTenantContext(propTenant.id);
            }
      }, [open, propTenant, currentTenant, enterTenantWorld, tenantRepository]);

      // Handle close - exit tenant world
      const handleClose = () => {
            exitTenantWorld();
            tenantRepository.setTenantContext(null);
            onClose();
      };

      if (!tenant) return null;

      return (
            <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
                  <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="flex-shrink-0">
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                          {/* Breadcrumb */}
                                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Home className="h-4 w-4" />
                                                <span>{t("tenant.breadcrumbSystem")}</span>
                                                {breadcrumbs.map((crumb, index) => (
                                                      <React.Fragment key={crumb.id}>
                                                            <ChevronRight className="h-4 w-4" />
                                                            <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                                                                  {crumb.name}
                                                            </span>
                                                      </React.Fragment>
                                                ))}
                                          </div>
                                    </div>
                                    <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={handleClose}
                                          className="text-muted-foreground hover:text-foreground"
                                    >
                                          <X className="h-4 w-4 me-1" />
                                          {t("tenant.exitTenantWorld")}
                                    </Button>
                              </div>
                              <DialogTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    <span>{t("tenant.tenantWorld")}: {tenant.name}</span>
                                    <Badge variant="outline" className="ms-2">
                                          {t("tenant.managingTenant")}
                                    </Badge>
                              </DialogTitle>
                        </DialogHeader>

                        <Tabs
                              value={activeTab}
                              onValueChange={setActiveTab}
                              className="flex-1 flex flex-col min-h-0"
                        >
                              <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                                    <TabsTrigger value="admins" className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          {t("tenant.manageAdmins")}
                                    </TabsTrigger>
                                    <TabsTrigger value="roles" className="flex items-center gap-2">
                                          <Shield className="h-4 w-4" />
                                          {t("tenant.manageRoles")}
                                    </TabsTrigger>
                                    <TabsTrigger value="subtenants" className="flex items-center gap-2">
                                          <Building2 className="h-4 w-4" />
                                          {t("tenant.manageSubTenants")}
                                    </TabsTrigger>
                              </TabsList>

                              <div className="flex-1 overflow-auto mt-4">
                                    <TabsContent value="admins" className="h-full m-0">
                                          <TenantAdminsTab tenantId={tenant.id} tenantName={tenant.name} />
                                    </TabsContent>
                                    <TabsContent value="roles" className="h-full m-0">
                                          <TenantRolesTab tenantId={tenant.id} tenantName={tenant.name} />
                                    </TabsContent>
                                    <TabsContent value="subtenants" className="h-full m-0">
                                          <TenantChildrenTab tenantId={tenant.id} tenantName={tenant.name} />
                                    </TabsContent>
                              </div>
                        </Tabs>
                  </DialogContent>
            </Dialog>
      );
}

// ============================================
// Tab Content Components
// ============================================

interface TabProps {
      tenantId: string;
      tenantName: string;
}

/**
 * Admins tab - shows admins belonging to this tenant
 */
function TenantAdminsTab({ tenantId, tenantName }: TabProps) {
      const { t } = useI18n();

      // TODO: Integrate with AdminsView when API is ready
      // The X-Tenant-Context header is already set by TenantWorldPanel

      return (
            <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                              {t("tenant.manageAdmins")} - {tenantName}
                        </h3>
                        <Button size="sm">
                              <Users className="h-4 w-4 me-2" />
                              {t("admin.createAdmin")}
                        </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                        {/* AdminsView will be embedded here with tenant context */}
                        <p className="text-center py-8">
                              Admin list for tenant <strong>{tenantName}</strong> (ID: {tenantId})
                        </p>
                        <p className="text-center text-xs">
                              API calls will use X-Tenant-Context: {tenantId}
                        </p>
                  </div>
            </div>
      );
}

/**
 * Roles tab - shows roles belonging to this tenant
 */
function TenantRolesTab({ tenantId, tenantName }: TabProps) {
      const { t } = useI18n();

      return (
            <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                              {t("tenant.manageRoles")} - {tenantName}
                        </h3>
                        <Button size="sm">
                              <Shield className="h-4 w-4 me-2" />
                              {t("role.createRole")}
                        </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                        {/* RolesView will be embedded here with tenant context */}
                        <p className="text-center py-8">
                              Roles list for tenant <strong>{tenantName}</strong> (ID: {tenantId})
                        </p>
                  </div>
            </div>
      );
}

/**
 * Sub-tenants tab - shows child tenants
 */
function TenantChildrenTab({ tenantId, tenantName }: TabProps) {
      const { t } = useI18n();

      return (
            <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">
                              {t("tenant.manageSubTenants")} - {tenantName}
                        </h3>
                        <Button size="sm">
                              <Building2 className="h-4 w-4 me-2" />
                              {t("tenant.createChild")}
                        </Button>
                  </div>
                  <div className="text-muted-foreground text-sm">
                        {/* Child tenants tree will be shown here */}
                        <p className="text-center py-8">
                              Sub-tenants under <strong>{tenantName}</strong> (Parent ID: {tenantId})
                        </p>
                  </div>
            </div>
      );
}
