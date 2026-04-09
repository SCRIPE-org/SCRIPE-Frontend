/**
 * Quotas Section Component
 *
 * Section for tenant quota settings (maxAdmins, maxRoles, maxSubTenants).
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Settings } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface QuotasSectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
}

export function QuotasSection({ settings, updateField }: QuotasSectionProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t("tenantSettings.quotas")}
        </CardTitle>
        <CardDescription>{t("tenantSettings.quotasDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="maxAdmins">{t("tenantSettings.maxAdmins")}</Label>
          <Input
            id="maxAdmins"
            type="number"
            value={settings.maxAdmins}
            onChange={(e) => updateField("maxAdmins", parseInt(e.target.value) || -1)}
          />
          <p className="text-xs text-muted-foreground">{t("tenantSettings.maxAdminsHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRoles">{t("tenantSettings.maxRoles")}</Label>
          <Input
            id="maxRoles"
            type="number"
            value={settings.maxRoles}
            onChange={(e) => updateField("maxRoles", parseInt(e.target.value) || -1)}
          />
          <p className="text-xs text-muted-foreground">{t("tenantSettings.maxRolesHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSubTenants">{t("tenantSettings.maxSubTenants")}</Label>
          <Input
            id="maxSubTenants"
            type="number"
            value={settings.maxSubTenants}
            onChange={(e) => updateField("maxSubTenants", parseInt(e.target.value) || -1)}
          />
          <p className="text-xs text-muted-foreground">{t("tenantSettings.maxSubTenantsHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
