/**
 * Security Section Component
 *
 * Section for tenant security settings (password policies, lockout, 2FA).
 * Pure UI - receives all data and handlers from parent view via props.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Shield, KeyRound } from "lucide-react";
import type { TenantSettings } from "../../domain/entities/TenantSettings";
import type { IdentityProviderMode } from "../../domain/types/SettingsTypes";

interface SecuritySectionProps {
  settings: TenantSettings;
  updateField: <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => void;
}

/**
 * Presentation UI component rendering the security section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SecuritySection({ settings, updateField }: SecuritySectionProps) {
  const { t } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" aria-hidden="true" />
          {t("tenantSettings.security")}
        </CardTitle>
        <CardDescription>{t("tenantSettings.securityDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Settings */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="passwordMinLength">{t("tenantSettings.passwordMinLength")}</Label>
            <Input
              id="passwordMinLength"
              type="number"
              min={8}
              max={128}
              value={settings.passwordMinLength}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) updateField("passwordMinLength", parsed);
              }}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.passwordMinLengthHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordHistoryCount">{t("tenantSettings.passwordHistoryCount")}</Label>
            <Input
              id="passwordHistoryCount"
              type="number"
              min={0}
              max={24}
              value={settings.passwordHistoryCount}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) {
                  updateField("passwordHistoryCount", Math.min(24, Math.max(0, parsed)));
                }
              }}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.passwordHistoryCountHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordExpiryDays">{t("tenantSettings.passwordExpiryDays")}</Label>
            <Input
              id="passwordExpiryDays"
              type="number"
              min={0}
              value={settings.passwordExpiryDays ?? 0}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                updateField("passwordExpiryDays", parsed > 0 ? parsed : null);
              }}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.passwordExpiryDaysHelp")}</p>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="requireUppercase">
                {t("tenantSettings.passwordRequireUppercase")}
              </Label>
              <p className="text-xs text-nx-ink-3">
                {t("tenantSettings.passwordRequireUppercaseHelp")}
              </p>
            </div>
            <Switch
              id="requireUppercase"
              checked={settings.passwordRequireUppercase}
              onCheckedChange={(checked) => updateField("passwordRequireUppercase", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="requireLowercase">
                {t("tenantSettings.passwordRequireLowercase")}
              </Label>
              <p className="text-xs text-nx-ink-3">
                {t("tenantSettings.passwordRequireLowercaseHelp")}
              </p>
            </div>
            <Switch
              id="requireLowercase"
              checked={settings.passwordRequireLowercase}
              onCheckedChange={(checked) => updateField("passwordRequireLowercase", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="requireNumber">{t("tenantSettings.passwordRequireNumber")}</Label>
              <p className="text-xs text-nx-ink-3">
                {t("tenantSettings.passwordRequireNumberHelp")}
              </p>
            </div>
            <Switch
              id="requireNumber"
              checked={settings.passwordRequireNumber}
              onCheckedChange={(checked) => updateField("passwordRequireNumber", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="requireSpecial">{t("tenantSettings.passwordRequireSpecial")}</Label>
              <p className="text-xs text-nx-ink-3">
                {t("tenantSettings.passwordRequireSpecialHelp")}
              </p>
            </div>
            <Switch
              id="requireSpecial"
              checked={settings.passwordRequireSpecial}
              onCheckedChange={(checked) => updateField("passwordRequireSpecial", checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="checkBreachedPasswords">
                {t("tenantSettings.checkBreachedPasswords")}
              </Label>
              <p className="text-xs text-nx-ink-3">
                {t("tenantSettings.checkBreachedPasswordsHelp")}
              </p>
            </div>
            <Switch
              id="checkBreachedPasswords"
              checked={settings.checkBreachedPasswords}
              onCheckedChange={(checked) => updateField("checkBreachedPasswords", checked)}
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
              min={3}
              max={20}
              value={settings.loginLockoutThreshold}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) updateField("loginLockoutThreshold", parsed);
              }}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.loginLockoutThresholdHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lockoutMinutes">{t("tenantSettings.loginLockoutMinutes")}</Label>
            <Input
              id="lockoutMinutes"
              type="number"
              min={1}
              max={1440}
              value={settings.loginLockoutMinutes}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!Number.isNaN(parsed)) updateField("loginLockoutMinutes", parsed);
              }}
            />
            <p className="text-xs text-nx-ink-3">{t("tenantSettings.loginLockoutMinutesHelp")}</p>
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line p-3">
            <div>
              <Label htmlFor="require2FA">{t("tenantSettings.require2FA")}</Label>
              <p className="text-xs text-nx-ink-3">{t("tenantSettings.require2FAHelp")}</p>
            </div>
            <Switch
              id="require2FA"
              checked={settings.require2FA}
              onCheckedChange={(checked) => updateField("require2FA", checked)}
            />
          </div>
        </div>

        {/* Identity Provider Inheritance Mode (BAM-03) */}
        <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            <Label htmlFor="identityProviderMode" className="text-sm font-semibold text-nx-ink">
              {t("tenantSettings.identityProviderMode")}
            </Label>
          </div>
          <p className="text-xs text-nx-ink-2">{t("tenantSettings.identityProviderModeHelp")}</p>
          <Select
            value={settings.identityProviderMode === "custom" ? "custom" : "inherit"}
            onValueChange={(value) =>
              updateField("identityProviderMode", value as IdentityProviderMode)
            }
          >
            <SelectTrigger id="identityProviderMode" className="max-w-md bg-nx-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">
                {t("tenantSettings.identityProviderModeInherit")}
              </SelectItem>
              <SelectItem value="custom">
                {t("tenantSettings.identityProviderModeCustom")}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-nx-ink-3">
            {settings.identityProviderMode === "custom"
              ? t("tenantSettings.identityProviderModeCustomDesc")
              : t("tenantSettings.identityProviderModeInheritDesc")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
