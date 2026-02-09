"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantSettingsModel, UpdateTenantSettingsRequest } from "@modules/system/tenant-settings/src/data/models/TenantSettingsModel";
import { Loader2 } from "lucide-react";
import { appLogger } from "@/core/common/logger";

interface TenantSettingsEditDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      initialSection: 'quotas' | 'security' | 'audit' | 'branding' | null;
      settings: TenantSettingsModel;
      onSave: (data: UpdateTenantSettingsRequest) => void;
      isSaving: boolean;
      onUploadLogo?: (file: File) => Promise<string>;
}

export function TenantSettingsEditDialog({
      open,
      onOpenChange,
      initialSection,
      settings,
      onSave,
      isSaving,
      onUploadLogo
}: TenantSettingsEditDialogProps) {
      const { t, direction } = useI18n();
      const [activeTab, setActiveTab] = useState(initialSection || 'quotas');
      const [formData, setFormData] = useState<TenantSettingsModel>({ ...settings });

      // Update local state when settings change or dialog opens
      useEffect(() => {
            if (open) {
                  setFormData({ ...settings });
                  if (initialSection) setActiveTab(initialSection);
            }
      }, [open, settings, initialSection]);

      const handleChange = (field: keyof TenantSettingsModel, value: any) => {
            setFormData(prev => ({ ...prev, [field]: value }));
      };

      const handleSave = () => {
            // Construct request payload based on active tab ONLY (Granular updates)
            const request: UpdateTenantSettingsRequest = {};

            if (activeTab === 'quotas') {
                  request.maxAdmins = formData.maxAdmins;
                  request.maxRoles = formData.maxRoles;
                  request.maxSubTenants = formData.maxSubTenants;
            } else if (activeTab === 'security') {
                  request.passwordMinLength = formData.passwordMinLength;
                  request.passwordRequireUppercase = formData.passwordRequireUppercase;
                  request.passwordRequireNumber = formData.passwordRequireNumber;
                  request.passwordRequireSpecial = formData.passwordRequireSpecial;
                  request.loginLockoutThreshold = formData.loginLockoutThreshold;
                  request.loginLockoutMinutes = formData.loginLockoutMinutes;
                  request.require2FA = formData.require2FA;
            } else if (activeTab === 'audit') {
                  request.auditRetentionDays = formData.auditRetentionDays;
                  request.auditEnabled = formData.auditEnabled;
            } else if (activeTab === 'branding') {
                  request.companyName = formData.companyName;
                  request.primaryColor = formData.primaryColor;
                  request.logoUrl = formData.logoUrl;
            }

            onSave(request);
      };

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl" dir={direction}>
                        <DialogHeader>
                              <DialogTitle>{t("tenant.editSettings") || "Edit Tenant Settings"}</DialogTitle>
                              <DialogDescription>
                                    {t("tenant.editSettingsDesc") || "Update configuration for this tenant."}
                              </DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="quotas">{t("tenant.quotas") || "Quotas"}</TabsTrigger>
                                    <TabsTrigger value="security">{t("tenant.security") || "Security"}</TabsTrigger>
                                    <TabsTrigger value="audit">{t("tenant.audit") || "Audit"}</TabsTrigger>
                                    <TabsTrigger value="branding">{t("tenant.branding") || "Branding"}</TabsTrigger>
                              </TabsList>

                              {/* QUOTAS TAB */}
                              <TabsContent value="quotas" className="space-y-4 py-4">
                                    <div className="grid grid-cols-3 gap-4">
                                          <div className="space-y-2">
                                                <Label>{t("tenant.maxAdmins") || "Max Admins"}</Label>
                                                <Input
                                                      type="number"
                                                      value={formData.maxAdmins}
                                                      onChange={e => handleChange('maxAdmins', parseInt(e.target.value))}
                                                />
                                                <p className="text-xs text-muted-foreground">{t("tenant.unlimitedHelp") || "-1 for unlimited"}</p>
                                          </div>
                                          <div className="space-y-2">
                                                <Label>{t("tenant.maxRoles") || "Max Roles"}</Label>
                                                <Input
                                                      type="number"
                                                      value={formData.maxRoles}
                                                      onChange={e => handleChange('maxRoles', parseInt(e.target.value))}
                                                />
                                                <p className="text-xs text-muted-foreground">{t("tenant.unlimitedHelp") || "-1 for unlimited"}</p>
                                          </div>
                                          <div className="space-y-2">
                                                <Label>{t("tenant.maxSubTenants") || "Max Sub-Tenants"}</Label>
                                                <Input
                                                      type="number"
                                                      value={formData.maxSubTenants}
                                                      onChange={e => handleChange('maxSubTenants', parseInt(e.target.value))}
                                                />
                                                <p className="text-xs text-muted-foreground">{t("tenant.unlimitedHelp") || "-1 for unlimited"}</p>
                                          </div>
                                    </div>
                              </TabsContent>

                              {/* SECURITY TAB */}
                              <TabsContent value="security" className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <Label>{t("tenant.passwordMinLength") || "Min Password Length"}</Label>
                                                <Input
                                                      type="number"
                                                      value={formData.passwordMinLength}
                                                      onChange={e => handleChange('passwordMinLength', parseInt(e.target.value))}
                                                />
                                          </div>
                                          <div className="space-y-2">
                                                <Label>{t("tenant.lockoutThreshold") || "Lockout Threshold"}</Label>
                                                <Input
                                                      type="number"
                                                      value={formData.loginLockoutThreshold}
                                                      onChange={e => handleChange('loginLockoutThreshold', parseInt(e.target.value))}
                                                />
                                          </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                          <div className="flex items-center space-x-2">
                                                <Switch
                                                      checked={formData.passwordRequireUppercase}
                                                      onCheckedChange={c => handleChange('passwordRequireUppercase', c)}
                                                />
                                                <Label>{t("tenant.requireUppercase") || "Require Uppercase"}</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <Switch
                                                      checked={formData.passwordRequireNumber}
                                                      onCheckedChange={c => handleChange('passwordRequireNumber', c)}
                                                />
                                                <Label>{t("tenant.requireNumber") || "Require Number"}</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <Switch
                                                      checked={formData.passwordRequireSpecial}
                                                      onCheckedChange={c => handleChange('passwordRequireSpecial', c)}
                                                />
                                                <Label>{t("tenant.requireSpecial") || "Require Special Char"}</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <Switch
                                                      checked={formData.require2FA}
                                                      onCheckedChange={c => handleChange('require2FA', c)}
                                                />
                                                <Label>{t("tenant.require2FA") || "Require 2FA"}</Label>
                                          </div>
                                    </div>
                              </TabsContent>

                              {/* AUDIT TAB */}
                              <TabsContent value="audit" className="space-y-4 py-4">
                                    <div className="flex items-center space-x-2">
                                          <Switch
                                                checked={formData.auditEnabled}
                                                onCheckedChange={c => handleChange('auditEnabled', c)}
                                          />
                                          <Label>{t("tenant.auditEnabled") || "Enable Audit Logging"}</Label>
                                    </div>
                                    <div className="space-y-2">
                                          <Label>{t("tenant.auditRetention") || "Retention (Days)"}</Label>
                                          <Input
                                                type="number"
                                                value={formData.auditRetentionDays}
                                                onChange={e => handleChange('auditRetentionDays', parseInt(e.target.value))}
                                          />
                                    </div>
                              </TabsContent>

                              {/* BRANDING TAB */}
                              <TabsContent value="branding" className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label>{t("tenant.companyName") || "Company Name"}</Label>
                                          <Input
                                                value={formData.companyName || ''}
                                                onChange={e => handleChange('companyName', e.target.value)}
                                                placeholder="My Company"
                                          />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <Label>{t("tenant.primaryColor") || "Primary Color"}</Label>
                                                <div className="flex gap-2">
                                                      <Input
                                                            type="color"
                                                            value={formData.primaryColor || '#000000'}
                                                            onChange={e => handleChange('primaryColor', e.target.value)}
                                                            className="w-12 h-10 p-1"
                                                      />
                                                      <Input
                                                            value={formData.primaryColor || ''}
                                                            onChange={e => handleChange('primaryColor', e.target.value)}
                                                            placeholder="#000000"
                                                      />
                                                </div>
                                          </div>
                                          <div className="space-y-2">
                                                <Label>{t("tenant.logoUrl") || "Logo"}</Label>
                                                <div className="flex flex-col gap-4">
                                                      <div className="flex items-center gap-4">
                                                            <Input
                                                                  type="file"
                                                                  accept="image/*"
                                                                  onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file && onUploadLogo) {
                                                                              try {
                                                                                    const url = await onUploadLogo(file);
                                                                                    handleChange('logoUrl', url);
                                                                              } catch (error) {
                                                                                    appLogger.error("Upload failed", error);
                                                                              }
                                                                        }
                                                                  }}
                                                                  disabled={!onUploadLogo}
                                                            />
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    {formData.logoUrl && (
                                          <div className="mt-4 p-4 border rounded bg-muted/20 flex justify-center">
                                                <img
                                                      src={formData.logoUrl.startsWith('http') ? formData.logoUrl : `${process.env.NEXT_PUBLIC_File_URL || ''}${formData.logoUrl}`}
                                                      alt={t("tenant.logoPreview") || "Logo Preview"}
                                                      className="max-h-24 object-contain"
                                                />
                                          </div>
                                    )}
                              </TabsContent>
                        </Tabs>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("common.save")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
