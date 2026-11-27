/**
 * TenantSettingsSecurityFields — Security & Identity Provider Mode fields for {@link TenantSettingsEditDialog}.
 *
 * @module tenants/presentation/components
 */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import {
  normalizeTenantAuthenticationMode,
  type TenantAuthenticationMode,
} from "@modules/customization/tenant-settings/src/domain/types/SettingsTypes";
import { AlertTriangle } from "lucide-react";

/** Security & SSO governance subset edited in the Security tab. */
export interface TenantSecurityFormValues {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumber: boolean;
  passwordRequireSpecial: boolean;
  passwordHistoryCount?: number;
  checkBreachedPasswords?: boolean;
  passwordExpiryDays: number | null;
  loginLockoutThreshold: number;
  loginLockoutMinutes: number;
  require2FA: boolean;
  identityProviderMode?: "inherit" | "custom";
  authenticationMode?: TenantAuthenticationMode;
  allowOwnerBreakGlassLocalLogin?: boolean;
}

interface TenantSettingsSecurityFieldsProps {
  formData: TenantSecurityFormValues;
  onPatch: (patch: Partial<TenantSecurityFormValues>) => void;
}

/**
 * Pure presentation fields for tenant password policy, lockout bounds (SEC-07),
 * 2FA requirement, and SSO identityProviderMode governance (BAM-03).
 */
export function TenantSettingsSecurityFields({
  formData,
  onPatch,
}: TenantSettingsSecurityFieldsProps) {
  const { t } = useI18n();
  const currentIdpMode: "inherit" | "custom" =
    formData.identityProviderMode === "custom" ? "custom" : "inherit";
  const currentAuthMode: TenantAuthenticationMode = normalizeTenantAuthenticationMode(
    formData.authenticationMode
  );
  const allowBreakGlass = formData.allowOwnerBreakGlassLocalLogin !== false;

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dialog-password-min-length">{t("tenant.passwordMinLength")}</Label>
          <Input
            id="dialog-password-min-length"
            type="number"
            min={8}
            max={128}
            value={formData.passwordMinLength}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed)) onPatch({ passwordMinLength: parsed });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dialog-lockout-threshold">{t("tenant.lockoutThreshold")}</Label>
          <Input
            id="dialog-lockout-threshold"
            type="number"
            min={3}
            max={20}
            value={formData.loginLockoutThreshold}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed)) onPatch({ loginLockoutThreshold: parsed });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dialog-password-expiry">{t("tenant.passwordExpiryDays")}</Label>
          <Input
            id="dialog-password-expiry"
            type="number"
            min={0}
            value={formData.passwordExpiryDays ?? ""}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onPatch({ passwordExpiryDays: Number.isNaN(parsed) ? null : parsed });
            }}
            placeholder={t("tenant.neverExpires")}
          />
          <p className="text-xs text-nx-ink-2">{t("tenant.passwordExpiryHelp")}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dialog-lockout-duration">{t("tenant.lockoutDuration")}</Label>
          <Input
            id="dialog-lockout-duration"
            type="number"
            min={1}
            max={1440}
            value={formData.loginLockoutMinutes}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed)) onPatch({ loginLockoutMinutes: parsed });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dialog-password-history-count">{t("tenant.passwordHistoryCount")}</Label>
          <Input
            id="dialog-password-history-count"
            type="number"
            min={0}
            max={24}
            value={formData.passwordHistoryCount ?? 5}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed)) {
                onPatch({ passwordHistoryCount: Math.min(24, Math.max(0, parsed)) });
              }
            }}
          />
          <p className="text-xs text-nx-ink-2">{t("tenant.passwordHistoryHelp")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-require-uppercase"
            checked={formData.passwordRequireUppercase}
            onCheckedChange={(c) => onPatch({ passwordRequireUppercase: c })}
          />
          <Label htmlFor="dialog-require-uppercase">{t("tenant.requireUppercase")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-require-lowercase"
            checked={Boolean(formData.passwordRequireLowercase)}
            onCheckedChange={(c) => onPatch({ passwordRequireLowercase: c })}
          />
          <Label htmlFor="dialog-require-lowercase">{t("tenant.requireLowercase")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-require-number"
            checked={formData.passwordRequireNumber}
            onCheckedChange={(c) => onPatch({ passwordRequireNumber: c })}
          />
          <Label htmlFor="dialog-require-number">{t("tenant.requireNumber")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-require-special"
            checked={formData.passwordRequireSpecial}
            onCheckedChange={(c) => onPatch({ passwordRequireSpecial: c })}
          />
          <Label htmlFor="dialog-require-special">{t("tenant.requireSpecial")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-check-breached"
            checked={formData.checkBreachedPasswords !== false}
            onCheckedChange={(c) => onPatch({ checkBreachedPasswords: c })}
          />
          <Label htmlFor="dialog-check-breached">{t("tenant.checkBreachedPasswords")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="dialog-require-2fa"
            checked={formData.require2FA}
            onCheckedChange={(c) => onPatch({ require2FA: c })}
          />
          <Label htmlFor="dialog-require-2fa">{t("tenant.require2FA")}</Label>
        </div>
      </div>

      <div className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-raised p-4">
        <Label htmlFor="dialog-idp-mode" className="text-sm font-semibold text-nx-ink">
          {t("tenant.identityProviderMode")}
        </Label>
        <Select
          value={currentIdpMode}
          onValueChange={(value) =>
            onPatch({ identityProviderMode: value as "inherit" | "custom" })
          }
        >
          <SelectTrigger id="dialog-idp-mode" className="bg-nx-surface">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inherit">{t("tenant.identityProviderModeInherit")}</SelectItem>
            <SelectItem value="custom">{t("tenant.identityProviderModeCustom")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-nx-ink-2">
          {currentIdpMode === "custom"
            ? t("tenant.identityProviderModeCustomDesc")
            : t("tenant.identityProviderModeInheritDesc")}
        </p>
      </div>

      <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-4">
        <div className="space-y-1.5">
          <Label htmlFor="dialog-auth-mode" className="text-sm font-semibold text-nx-ink">
            {t("tenant.authenticationMode")}
          </Label>
          <Select
            value={currentAuthMode}
            onValueChange={(value) =>
              onPatch({ authenticationMode: normalizeTenantAuthenticationMode(value) })
            }
          >
            <SelectTrigger id="dialog-auth-mode" className="bg-nx-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hybrid">{t("tenant.authenticationModeHybrid")}</SelectItem>
              <SelectItem value="SsoOnly">{t("tenant.authenticationModeSsoOnly")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-nx-ink-2">
            {currentAuthMode === "SsoOnly"
              ? t("tenant.authenticationModeSsoOnlyDesc")
              : t("tenant.authenticationModeHybridDesc")}
          </p>
        </div>

        {currentAuthMode === "SsoOnly" && (
          <>
            <Alert variant="warning">
              <AlertTriangle aria-hidden="true" />
              <AlertTitle>{t("tenant.authenticationModeSsoOnly")}</AlertTitle>
              <AlertDescription>{t("tenant.authenticationModeSsoOnlyWarning")}</AlertDescription>
            </Alert>

            <div className="flex items-center justify-between gap-4 rounded-nx-md border border-nx-line bg-nx-surface p-3">
              <div className="space-y-0.5">
                <Label
                  htmlFor="dialog-allow-owner-break-glass"
                  className="cursor-pointer text-sm font-medium text-nx-ink"
                >
                  {t("tenant.allowOwnerBreakGlassLocalLogin")}
                </Label>
                <p className="text-xs text-nx-ink-2">
                  {t("tenant.allowOwnerBreakGlassLocalLoginDesc")}
                </p>
              </div>
              <Switch
                id="dialog-allow-owner-break-glass"
                checked={allowBreakGlass}
                onCheckedChange={(checked) =>
                  onPatch({ allowOwnerBreakGlassLocalLogin: checked })
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
