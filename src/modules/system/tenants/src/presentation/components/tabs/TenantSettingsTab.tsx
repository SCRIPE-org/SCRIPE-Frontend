/**
 * Tenant Settings Tab Component
 *
 * Displays and manages tenant settings including quotas, security, and permissions.
 *
 * @module tenants
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Users, Shield, Settings } from "lucide-react";

// Tenant imports
import { TenantPermissionsDialog } from "../TenantPermissionsDialog";

interface TenantSettingsTabProps {
      tenantId: string;
      tenantName: string;
}

export function TenantSettingsTab({ tenantId, tenantName }: TenantSettingsTabProps) {
      const { t, direction } = useI18n();
      const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

      return (
            <div className="space-y-6" dir={direction}>
                  <div>
                        <h3 className="text-lg font-semibold">{t("tenant.settings") || "Settings"}</h3>
                        <p className="text-sm text-muted-foreground">
                              {t("tenant.settingsDescription") ||
                                    `Configuration options for ${tenantName}`}
                        </p>
                  </div>

                  <div className="grid gap-4">
                        {/* Quota Settings */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          {t("tenant.settingsQuotas") || "Resource Quotas"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsQuotasDesc") ||
                                                "Set limits for admins, roles, and sub-tenants"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.maxAdmins") || "Max Admins"}
                                                </label>
                                                <div className="text-2xl font-bold text-primary">∞</div>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("tenant.unlimited") || "Unlimited"}
                                                </p>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.maxRoles") || "Max Roles"}
                                                </label>
                                                <div className="text-2xl font-bold text-primary">∞</div>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("tenant.unlimited") || "Unlimited"}
                                                </p>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.maxSubTenants") || "Max Sub-Tenants"}
                                                </label>
                                                <div className="text-2xl font-bold text-primary">∞</div>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("tenant.unlimited") || "Unlimited"}
                                                </p>
                                          </div>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                          <Shield className="h-4 w-4" />
                                          {t("tenant.settingsSecurity") || "Security Settings"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsSecurityDesc") ||
                                                "Password policies and login security"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.passwordMinLength") || "Min Password Length"}
                                                </label>
                                                <Badge variant="secondary" className="text-lg px-3 py-1">8</Badge>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.lockoutThreshold") || "Lockout Threshold"}
                                                </label>
                                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                                      5 {t("tenant.attempts") || "attempts"}
                                                </Badge>
                                          </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                          <Badge variant="outline" className="flex items-center gap-1">
                                                <span className="text-green-500">✓</span>
                                                {t("tenant.requireUppercase") || "Uppercase"}
                                          </Badge>
                                          <Badge variant="outline" className="flex items-center gap-1">
                                                <span className="text-green-500">✓</span>
                                                {t("tenant.requireNumber") || "Number"}
                                          </Badge>
                                          <Badge variant="outline" className="flex items-center gap-1">
                                                <span className="text-muted-foreground">○</span>
                                                {t("tenant.requireSpecial") || "Special Character"}
                                          </Badge>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Permissions Management */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                          <Shield className="h-4 w-4" />
                                          {t("tenant.settingsPermissions") || "Permissions"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsPermissionsDesc") ||
                                                "Manage which permissions are available to this tenant"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent>
                                    <Button
                                          variant="outline"
                                          onClick={() => setPermissionsDialogOpen(true)}
                                          className="flex items-center gap-2"
                                    >
                                          <Shield className="h-4 w-4" />
                                          {t("tenant.managePermissions") || "Manage Permissions"}
                                    </Button>
                              </CardContent>
                        </Card>

                        {/* Branding Settings */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                          <Settings className="h-4 w-4" />
                                          {t("tenant.settingsBranding") || "Branding"}
                                    </CardTitle>
                                    <CardDescription>
                                          {t("tenant.settingsBrandingDesc") ||
                                                "Customize tenant appearance and branding"}
                                    </CardDescription>
                              </CardHeader>
                              <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                          {t("tenant.settingsComingSoon") || "Branding customization coming soon..."}
                                    </p>
                              </CardContent>
                        </Card>
                  </div>

                  {/* Tenant Permissions Dialog */}
                  <TenantPermissionsDialog
                        open={permissionsDialogOpen}
                        onOpenChange={setPermissionsDialogOpen}
                        tenantId={tenantId}
                        tenantName={tenantName}
                  />
            </div>
      );
}
