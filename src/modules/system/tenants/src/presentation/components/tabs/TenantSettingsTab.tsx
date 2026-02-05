/**
 * Tenant Settings Tab Component
 *
 * Displays and manages tenant settings including quotas, security, and permissions.
 *
 * @module tenants
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Users, Shield, Settings, Pencil, Loader2 } from "lucide-react";
import { useTenantSettingsViewModel } from "@modules/system/tenants/src/presentation/viewmodels/useTenantSettingsViewModel";
import { TenantSettingsEditDialog } from "../TenantSettingsEditDialog";
import { TenantPermissionsDialog } from "../TenantPermissionsDialog";
import { Skeleton } from "@core/ui/skeleton";

interface TenantSettingsTabProps {
      tenantId: string;
      tenantName: string;
      parentTenantId?: string;
}

export function TenantSettingsTab({ tenantId, tenantName, parentTenantId }: TenantSettingsTabProps) {
      const { t, direction } = useI18n();
      const vm = useTenantSettingsViewModel(tenantId);

      if (vm.isLoading) {
            return (
                  <div className="space-y-6">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid gap-4">
                              <Skeleton className="h-64 w-full" />
                              <Skeleton className="h-64 w-full" />
                        </div>
                  </div>
            );
      }

      if (vm.error) {
            return (
                  <div className="p-4 rounded-md bg-destructive/10 text-destructive">
                        Error loading settings: {vm.error.message}
                  </div>
            );
      }

      const settings = vm.settings;
      if (!settings) return null;

      return (
            <div className="space-y-6" dir={direction}>
                  <div className="flex justify-between items-center">
                        <div>
                              <h3 className="text-lg font-semibold">{t("tenant.settings") || "Settings"}</h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.settingsDescription") || `Configuration options for ${tenantName}`}
                              </p>
                        </div>
                  </div>

                  <div className="grid gap-4">
                        {/* Quota Settings */}
                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {t("tenant.settingsQuotas") || "Resource Quotas"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("tenant.settingsQuotasDesc") || "Set limits for admins, roles, and sub-tenants"}
                                          </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => vm.setEditSection('quotas')}>
                                          <Pencil className="h-4 w-4" />
                                    </Button>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <QuotaItem label={t("tenant.maxAdmins") || "Max Admins"} value={settings.maxAdmins} />
                                          <QuotaItem label={t("tenant.maxRoles") || "Max Roles"} value={settings.maxRoles} />
                                          <QuotaItem label={t("tenant.maxSubTenants") || "Max Sub-Tenants"} value={settings.maxSubTenants} />
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {t("tenant.settingsSecurity") || "Security Settings"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("tenant.settingsSecurityDesc") || "Password policies and login security"}
                                          </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => vm.setEditSection('security')}>
                                          <Pencil className="h-4 w-4" />
                                    </Button>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.passwordMinLength") || "Min Password Length"}
                                                </label>
                                                <div className="text-lg font-bold">{settings.passwordMinLength} characters</div>
                                          </div>
                                          <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                      {t("tenant.lockoutThreshold") || "Lockout Threshold"}
                                                </label>
                                                <div className="text-lg font-bold">
                                                      {settings.loginLockoutThreshold} {t("tenant.attempts") || "attempts"}
                                                </div>
                                          </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                          <RequirementBadge satisfied={settings.passwordRequireUppercase} label={t("tenant.requireUppercase") || "Uppercase"} />
                                          <RequirementBadge satisfied={settings.passwordRequireNumber} label={t("tenant.requireNumber") || "Number"} />
                                          <RequirementBadge satisfied={settings.passwordRequireSpecial} label={t("tenant.requireSpecial") || "Special Char"} />
                                          <RequirementBadge satisfied={settings.require2FA} label={t("tenant.require2FA") || "2FA Required"} />
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Branding Settings */}
                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                                <Settings className="h-4 w-4" />
                                                {t("tenant.settingsBranding") || "Branding"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("tenant.settingsBrandingDesc") || "Customize tenant appearance and branding"}
                                          </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => vm.setEditSection('branding')}>
                                          <Pencil className="h-4 w-4" />
                                    </Button>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                    <div className="flex items-center gap-6">
                                          {settings.logoUrl ? (
                                                <img
                                                      src={settings.logoUrl.startsWith('http') ? settings.logoUrl : `${process.env.NEXT_PUBLIC_File_URL || ''}${settings.logoUrl}`}
                                                      alt={t("tenant.logo")}
                                                      className="h-16 w-16 object-contain border rounded p-1"
                                                />
                                          ) : (
                                                <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                                      {t("tenant.noLogo") || "No Logo"}
                                                </div>
                                          )}
                                          <div>
                                                <div className="font-medium text-lg">{settings.companyName || t("tenant.noCompanyName") || "No Company Name"}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                      <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: settings.primaryColor || '#000000' }}
                                                      />
                                                      <span className="text-sm text-muted-foreground">
                                                            {settings.primaryColor || t("tenant.defaultColor") || "Default Color"}
                                                      </span>
                                                </div>
                                          </div>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Audit Settings */}
                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {t("tenant.settingsAudit") || "Audit & Logs"}
                                          </CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => vm.setEditSection('audit')}>
                                          <Pencil className="h-4 w-4" />
                                    </Button>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                          <div className="space-y-0.5">
                                                <div className="font-medium">{t("tenant.auditEnabled") || "Audit Logging"}</div>
                                                <div className="text-sm text-muted-foreground">
                                                      {t("tenant.retentionLabel", { days: settings.auditRetentionDays }) || `Retention: ${settings.auditRetentionDays} days`}
                                                </div>
                                          </div>
                                          <Badge variant={settings.auditEnabled ? "default" : "secondary"}>
                                                {settings.auditEnabled ? (t("tenant.enabled") || "Enabled") : (t("tenant.disabled") || "Disabled")}
                                          </Badge>
                                    </div>
                              </CardContent>
                        </Card>

                        {/* Permissions Settings */}
                        <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                {t("tenant.settingsPermissions") || "Permissions"}
                                          </CardTitle>
                                          <CardDescription>
                                                {t("tenant.settingsPermissionsDesc") || "Manage which permissions are available to this tenant"}
                                          </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => vm.setPermissionsOpen(true)}>
                                          <Pencil className="h-4 w-4" />
                                    </Button>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                          <div className="space-y-0.5">
                                                <div className="font-medium">{t("tenant.managePermissions") || "Manage Permissions"}</div>
                                                <div className="text-sm text-muted-foreground">
                                                      {parentTenantId ? (
                                                            t("tenant.permissionsLimitedByParent") || "Permissions limited by parent tenant"
                                                      ) : (
                                                            t("tenant.selectPermissionsDesc") || "Choose which permissions this tenant can use"
                                                      )}
                                                </div>
                                          </div>
                                          <Button variant="outline" size="sm" onClick={() => vm.setPermissionsOpen(true)}>
                                                {t("tenant.managePermissions") || "Manage Permissions"}
                                          </Button>
                                    </div>
                              </CardContent>
                        </Card>
                  </div>

                  <TenantSettingsEditDialog
                        open={!!vm.editSection}
                        onOpenChange={(open) => !open && vm.setEditSection(null)}
                        initialSection={vm.editSection}
                        settings={settings}
                        onSave={vm.updateSettings}
                        isSaving={vm.isUpdating}
                        onUploadLogo={vm.uploadLogo}
                  />

                  <TenantPermissionsDialog
                        open={vm.permissionsOpen}
                        onOpenChange={vm.setPermissionsOpen}
                        tenantId={tenantId}
                        tenantName={tenantName}
                        parentTenantId={parentTenantId}
                  />
            </div>
      );
}

function QuotaItem({ label, value }: { label: string, value: number }) {
      const { t } = useI18n();
      return (
            <div className="space-y-2">
                  <label className="text-sm font-medium">{label}</label>
                  <div className="text-2xl font-bold text-primary">
                        {value === -1 ? "∞" : value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                        {value === -1 ? (t("tenant.unlimited") || "Unlimited") : (t("tenant.maximumLimit") || "Maximum limit")}
                  </p>
            </div>
      );
}

function RequirementBadge({ satisfied, label }: { satisfied: boolean, label: string }) {
      return (
            <Badge variant="outline" className={`flex items-center gap-1 ${!satisfied && "opacity-50"}`}>
                  <span className={satisfied ? "text-green-500" : "text-muted-foreground"}>
                        {satisfied ? "✓" : "○"}
                  </span>
                  {label}
            </Badge>
      );
}
