"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "@modules/customization/tenant-settings/src/domain/types/SettingsTypes";
import { TenantSettingsSecurityFields } from "./TenantSettingsSecurityFields";
import { TenantSettingsBrandingFields } from "./TenantSettingsBrandingFields";

type EditSection = "security" | "audit" | "branding";

interface TenantSettingsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection: EditSection | null;
  settings: TenantSettingsModel;
  onSave: (data: UpdateTenantSettingsRequest) => void;
  isSaving: boolean;
  /** SEC-07: Platform / ancestor admins can edit audit/quota controls; self-tenant admins cannot. */
  canEditPlatformManagedFields?: boolean;
}

/**
 * Presentation UI component rendering the tenant settings edit dialog.
 * Supports Security (including BAM-03 `identityProviderMode`), Audit (gated by SEC-07), and Branding.
 */
export function TenantSettingsEditDialog({
  open,
  onOpenChange,
  initialSection,
  settings,
  onSave,
  isSaving,
  canEditPlatformManagedFields = true,
}: TenantSettingsEditDialogProps) {
  const { t, direction } = useI18n();
  const [activeTab, setActiveTab] = useState<EditSection>(
    initialSection === "audit" && !canEditPlatformManagedFields
      ? "security"
      : initialSection || "security"
  );
  const [formData, setFormData] = useState<TenantSettingsModel>({
    ...settings,
    identityProviderMode: settings.identityProviderMode === "custom" ? "custom" : "inherit",
  });

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevSettings, setPrevSettings] = useState(settings);
  const [prevInitialSection, setPrevInitialSection] = useState(initialSection);

  if (open !== prevOpen || settings !== prevSettings || initialSection !== prevInitialSection) {
    setPrevOpen(open);
    setPrevSettings(settings);
    setPrevInitialSection(initialSection);

    if (open) {
      setFormData({
        ...settings,
        identityProviderMode: settings.identityProviderMode === "custom" ? "custom" : "inherit",
      });
      if (initialSection) {
        setActiveTab(
          initialSection === "audit" && !canEditPlatformManagedFields ? "security" : initialSection
        );
      }
    }
  }

  const handlePatch = (patch: Partial<TenantSettingsModel>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    const request: UpdateTenantSettingsRequest = {};

    if (activeTab === "security") {
      request.passwordMinLength = formData.passwordMinLength;
      request.passwordRequireUppercase = formData.passwordRequireUppercase;
      request.passwordRequireNumber = formData.passwordRequireNumber;
      request.passwordRequireSpecial = formData.passwordRequireSpecial;
      request.loginLockoutThreshold = formData.loginLockoutThreshold;
      request.loginLockoutMinutes = formData.loginLockoutMinutes;
      request.passwordExpiryDays = formData.passwordExpiryDays;
      request.require2FA = formData.require2FA;
      request.identityProviderMode =
        formData.identityProviderMode === "custom" ? "custom" : "inherit";
    } else if (activeTab === "audit" && canEditPlatformManagedFields) {
      request.auditRetentionDays = formData.auditRetentionDays;
      request.auditEnabled = formData.auditEnabled;
    } else if (activeTab === "branding") {
      request.companyName = formData.companyName;
      request.primaryColor = formData.primaryColor;
      request.secondaryColor = formData.secondaryColor;
      request.faviconUrl = formData.faviconUrl;
      request.loginHeadline = formData.loginHeadline;
      request.loginSubtitle = formData.loginSubtitle;
      request.logoUrl = formData.logoUrl;
    }

    onSave(request);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle>{t("tenant.editSettings")}</DialogTitle>
          <DialogDescription>{t("tenant.editSettingsDesc")}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as EditSection)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="security">{t("tenant.security")}</TabsTrigger>
            <TabsTrigger value="audit" disabled={!canEditPlatformManagedFields}>
              {t("tenant.audit")}
            </TabsTrigger>
            <TabsTrigger value="branding">{t("tenant.branding")}</TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <TenantSettingsSecurityFields formData={formData} onPatch={handlePatch} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4 py-4">
            {!canEditPlatformManagedFields && (
              <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised px-3 py-2 text-xs text-nx-ink-2">
                <span>{t("tenant.auditReadOnlyNotice")}</span>
                <Badge variant="secondary">{t("tenant.platformManaged")}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="dialog-audit-enabled"
                disabled={!canEditPlatformManagedFields}
                checked={formData.auditEnabled}
                onCheckedChange={(c) => handlePatch({ auditEnabled: c })}
              />
              <Label htmlFor="dialog-audit-enabled">{t("tenant.auditEnabled")}</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dialog-audit-retention">{t("tenant.auditRetention")}</Label>
              <Input
                id="dialog-audit-retention"
                type="number"
                min={30}
                disabled={!canEditPlatformManagedFields}
                value={formData.auditRetentionDays}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  if (!Number.isNaN(parsed)) handlePatch({ auditRetentionDays: parsed });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="branding">
            <TenantSettingsBrandingFields formData={formData} onPatch={handlePatch} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={activeTab === "audit" && !canEditPlatformManagedFields}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
