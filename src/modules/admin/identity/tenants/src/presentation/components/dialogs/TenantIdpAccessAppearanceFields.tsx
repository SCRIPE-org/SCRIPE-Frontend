/**
 * TenantIdpAccessAppearanceFields — Access switches, MFA trust, and button appearance inputs.
 *
 * @module tenants/presentation/components/dialogs
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { TenantIdpFormState } from "../../utils/tenantIdentityProvider.helpers";

interface TenantIdpAccessAppearanceFieldsProps {
  form: TenantIdpFormState;
  onUpdateField: <K extends keyof TenantIdpFormState>(field: K, value: TenantIdpFormState[K]) => void;
}

/**
 * Renders lifecycle/MFA switches (`isActive`, `trustIdpMfa`, `enabledForAdmins`, `enabledForUsers`)
 * and visual button settings (`iconUrl`, `buttonColor`, `displayOrder`).
 */
export function TenantIdpAccessAppearanceFields({
  form,
  onUpdateField,
}: TenantIdpAccessAppearanceFieldsProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div>
            <Label htmlFor="tenant-idp-active" className="text-sm font-medium">
              {t("tenant.idpIsActive")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("tenant.idpIsActiveHelp")}</p>
          </div>
          <Switch
            id="tenant-idp-active"
            checked={form.isActive}
            onCheckedChange={(checked) => onUpdateField("isActive", checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div>
            <Label htmlFor="tenant-idp-trust-mfa" className="text-sm font-medium">
              {t("tenant.idpTrustIdpMfa")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("tenant.idpTrustIdpMfaHelp")}</p>
          </div>
          <Switch
            id="tenant-idp-trust-mfa"
            checked={form.trustIdpMfa}
            onCheckedChange={(checked) => onUpdateField("trustIdpMfa", checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div>
            <Label htmlFor="tenant-idp-admins" className="text-sm font-medium">
              {t("tenant.idpEnabledForAdmins")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("tenant.idpEnabledForAdminsHelp")}</p>
          </div>
          <Switch
            id="tenant-idp-admins"
            checked={form.enabledForAdmins}
            onCheckedChange={(checked) => onUpdateField("enabledForAdmins", checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div>
            <Label htmlFor="tenant-idp-users" className="text-sm font-medium">
              {t("tenant.idpEnabledForUsers")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("tenant.idpEnabledForUsersHelp")}</p>
          </div>
          <Switch
            id="tenant-idp-users"
            checked={form.enabledForUsers}
            onCheckedChange={(checked) => onUpdateField("enabledForUsers", checked)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-icon">{t("tenant.idpIconUrl")}</Label>
          <Input
            id="tenant-idp-icon"
            value={form.iconUrl}
            onChange={(e) => onUpdateField("iconUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-color">{t("tenant.idpButtonColor")}</Label>
          <Input
            id="tenant-idp-color"
            value={form.buttonColor}
            onChange={(e) => onUpdateField("buttonColor", e.target.value)}
            placeholder="#1a73e8"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-order">{t("tenant.idpDisplayOrder")}</Label>
          <Input
            id="tenant-idp-order"
            type="number"
            value={form.displayOrder}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onUpdateField("displayOrder", Number.isNaN(parsed) ? 0 : parsed);
            }}
          />
        </div>
      </div>
    </>
  );
}
