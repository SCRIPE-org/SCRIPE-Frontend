/**
 * Security Section Component
 *
 * Section for tenant security settings (password policies, lockout, 2FA).
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Shield } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";

interface SecuritySectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
  t: (key: string) => string;
}

export function SecuritySection({ settings, updateField, t }: SecuritySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("tenantSettings.security")}
        </CardTitle>
        <CardDescription>{t("tenantSettings.securityDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Settings */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">{t("tenantSettings.passwordMinLength")}</Label>
            <Input
              id="passwordMinLength"
              type="number"
              min={6}
              max={32}
              value={settings.passwordMinLength}
              onChange={(e) => updateField("passwordMinLength", parseInt(e.target.value) || 8)}
            />
            <p className="text-xs text-muted-foreground">
              {t("tenantSettings.passwordMinLengthHelp")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordExpiryDays">{t("tenantSettings.passwordExpiryDays")}</Label>
            <Input
              id="passwordExpiryDays"
              type="number"
              min={0}
              value={settings.passwordExpiryDays ?? 0}
              onChange={(e) => updateField("passwordExpiryDays", parseInt(e.target.value) || null)}
            />
            <p className="text-xs text-muted-foreground">
              {t("tenantSettings.passwordExpiryDaysHelp")}
            </p>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="requireUppercase">
                {t("tenantSettings.passwordRequireUppercase")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("tenantSettings.passwordRequireUppercaseHelp")}
              </p>
            </div>
            <Switch
              id="requireUppercase"
              checked={settings.passwordRequireUppercase}
              onCheckedChange={(checked) => updateField("passwordRequireUppercase", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="requireNumber">{t("tenantSettings.passwordRequireNumber")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("tenantSettings.passwordRequireNumberHelp")}
              </p>
            </div>
            <Switch
              id="requireNumber"
              checked={settings.passwordRequireNumber}
              onCheckedChange={(checked) => updateField("passwordRequireNumber", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="requireSpecial">{t("tenantSettings.passwordRequireSpecial")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("tenantSettings.passwordRequireSpecialHelp")}
              </p>
            </div>
            <Switch
              id="requireSpecial"
              checked={settings.passwordRequireSpecial}
              onCheckedChange={(checked) => updateField("passwordRequireSpecial", checked)}
            />
          </div>
        </div>

        {/* Login Security */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="lockoutThreshold">{t("tenantSettings.loginLockoutThreshold")}</Label>
            <Input
              id="lockoutThreshold"
              type="number"
              min={1}
              value={settings.loginLockoutThreshold}
              onChange={(e) => updateField("loginLockoutThreshold", parseInt(e.target.value) || 5)}
            />
            <p className="text-xs text-muted-foreground">
              {t("tenantSettings.loginLockoutThresholdHelp")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lockoutMinutes">{t("tenantSettings.loginLockoutMinutes")}</Label>
            <Input
              id="lockoutMinutes"
              type="number"
              min={1}
              value={settings.loginLockoutMinutes}
              onChange={(e) => updateField("loginLockoutMinutes", parseInt(e.target.value) || 15)}
            />
            <p className="text-xs text-muted-foreground">
              {t("tenantSettings.loginLockoutMinutesHelp")}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="require2FA">{t("tenantSettings.require2FA")}</Label>
              <p className="text-xs text-muted-foreground">{t("tenantSettings.require2FAHelp")}</p>
            </div>
            <Switch
              id="require2FA"
              checked={settings.require2FA}
              onCheckedChange={(checked) => updateField("require2FA", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
