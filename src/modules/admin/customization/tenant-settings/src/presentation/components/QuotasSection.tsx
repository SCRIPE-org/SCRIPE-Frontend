/**
 * Quotas Section Component
 *
 * Section for tenant quota settings (maxAdmins, maxRoles, maxSubTenants).
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Settings } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface QuotasSectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
  /** SEC-07: Quotas are platform/ancestor-owned and read-only for a tenant editing its own settings. */
  readOnly?: boolean;
}

/**
 * Presentation UI component rendering the quotas section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function QuotasSection({ settings, updateField, readOnly = false }: QuotasSectionProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" aria-hidden="true" />
            {t("tenantSettings.quotas")}
          </CardTitle>
          {readOnly && <Badge variant="secondary">{t("tenantSettings.platformManaged")}</Badge>}
        </div>
        <CardDescription>
          {readOnly ? t("tenantSettings.quotasReadOnlyNotice") : t("tenantSettings.quotasDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="maxAdmins">{t("tenantSettings.maxAdmins")}</Label>
          <Input
            id="maxAdmins"
            type="number"
            disabled={readOnly}
            value={settings.maxAdmins}
            onChange={(e) => updateField("maxAdmins", parseInt(e.target.value, 10) || -1)}
          />
          <p className="text-xs text-nx-ink-3">{t("tenantSettings.maxAdminsHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRoles">{t("tenantSettings.maxRoles")}</Label>
          <Input
            id="maxRoles"
            type="number"
            disabled={readOnly}
            value={settings.maxRoles}
            onChange={(e) => updateField("maxRoles", parseInt(e.target.value, 10) || -1)}
          />
          <p className="text-xs text-nx-ink-3">{t("tenantSettings.maxRolesHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSubTenants">{t("tenantSettings.maxSubTenants")}</Label>
          <Input
            id="maxSubTenants"
            type="number"
            disabled={readOnly}
            value={settings.maxSubTenants}
            onChange={(e) => updateField("maxSubTenants", parseInt(e.target.value, 10) || -1)}
          />
          <p className="text-xs text-nx-ink-3">{t("tenantSettings.maxSubTenantsHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
