/**
 * TenantIdpProtocolFields — Protocol-specific configuration inputs (OIDC, OAuth 2.0, SAML 2.0).
 *
 * @module tenants/presentation/components/dialogs
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { PasswordInput } from "@core/ui/password-input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { TenantIdpFormState } from "../../utils/tenantIdentityProvider.helpers";

interface TenantIdpProtocolFieldsProps {
  form: TenantIdpFormState;
  isEdit: boolean;
  hasClientSecret: boolean;
  onUpdateField: <K extends keyof TenantIdpFormState>(field: K, value: TenantIdpFormState[K]) => void;
}

/**
 * Renders OIDC, OAuth 2.0, or SAML 2.0 protocol inputs for {@link TenantIdentityProviderDialog}.
 */
export function TenantIdpProtocolFields({
  form,
  isEdit,
  hasClientSecret,
  onUpdateField,
}: TenantIdpProtocolFieldsProps) {
  const { t } = useI18n();
  const secretPlaceholder =
    isEdit && hasClientSecret
      ? t("tenant.idpClientSecretKeepHint")
      : t("tenant.idpClientSecretPlaceholder");

  if (form.protocol === "oidc") {
    return (
      <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised p-4">
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-authority">{t("tenant.idpAuthority")}</Label>
          <Input
            id="tenant-idp-authority"
            dir="ltr"
            value={form.authority}
            onChange={(e) => onUpdateField("authority", e.target.value)}
            placeholder="https://accounts.google.com"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-client-id">{t("tenant.idpClientId")}</Label>
            <Input
              id="tenant-idp-client-id"
              dir="ltr"
              value={form.clientId}
              onChange={(e) => onUpdateField("clientId", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-client-secret">{t("tenant.idpClientSecret")}</Label>
            <PasswordInput
              id="tenant-idp-client-secret"
              dir="ltr"
              value={form.clientSecret}
              onChange={(e) => onUpdateField("clientSecret", e.target.value)}
              placeholder={secretPlaceholder}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-scopes">{t("tenant.idpScopes")}</Label>
          <Input
            id="tenant-idp-scopes"
            dir="ltr"
            value={form.scopes}
            onChange={(e) => onUpdateField("scopes", e.target.value)}
            placeholder="openid email profile"
          />
        </div>
      </div>
    );
  }

  if (form.protocol === "oauth2") {
    return (
      <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-auth-ep">{t("tenant.idpAuthEndpoint")}</Label>
            <Input
              id="tenant-idp-auth-ep"
              dir="ltr"
              value={form.authorizationEndpoint}
              onChange={(e) => onUpdateField("authorizationEndpoint", e.target.value)}
              placeholder="https://github.com/login/oauth/authorize"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-token-ep">{t("tenant.idpTokenEndpoint")}</Label>
            <Input
              id="tenant-idp-token-ep"
              dir="ltr"
              value={form.tokenEndpoint}
              onChange={(e) => onUpdateField("tokenEndpoint", e.target.value)}
              placeholder="https://github.com/login/oauth/access_token"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-userinfo-ep">{t("tenant.idpUserInfoEndpoint")}</Label>
          <Input
            id="tenant-idp-userinfo-ep"
            dir="ltr"
            value={form.userInformationEndpoint}
            onChange={(e) => onUpdateField("userInformationEndpoint", e.target.value)}
            placeholder="https://api.github.com/user"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-oauth-client-id">{t("tenant.idpClientId")}</Label>
            <Input
              id="tenant-idp-oauth-client-id"
              dir="ltr"
              value={form.clientId}
              onChange={(e) => onUpdateField("clientId", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tenant-idp-oauth-client-secret">{t("tenant.idpClientSecret")}</Label>
            <PasswordInput
              id="tenant-idp-oauth-client-secret"
              dir="ltr"
              value={form.clientSecret}
              onChange={(e) => onUpdateField("clientSecret", e.target.value)}
              placeholder={secretPlaceholder}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenant-idp-oauth-scopes">{t("tenant.idpScopes")}</Label>
          <Input
            id="tenant-idp-oauth-scopes"
            dir="ltr"
            value={form.scopes}
            onChange={(e) => onUpdateField("scopes", e.target.value)}
            placeholder="read:user user:email"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised p-4">
      <div className="space-y-1.5">
        <Label htmlFor="tenant-idp-saml-entity">{t("tenant.idpSamlEntityId")}</Label>
        <Input
          id="tenant-idp-saml-entity"
          dir="ltr"
          value={form.samlIdpEntityId}
          onChange={(e) => onUpdateField("samlIdpEntityId", e.target.value)}
          placeholder="https://idp.example.com/saml/metadata"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tenant-idp-saml-sso">{t("tenant.idpSamlSsoUrl")}</Label>
        <Input
          id="tenant-idp-saml-sso"
          dir="ltr"
          value={form.samlSsoUrl}
          onChange={(e) => onUpdateField("samlSsoUrl", e.target.value)}
          placeholder="https://idp.example.com/saml/sso"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tenant-idp-saml-cert">{t("tenant.idpSamlCertificate")}</Label>
        <Textarea
          id="tenant-idp-saml-cert"
          dir="ltr"
          rows={4}
          value={form.samlCertificate}
          onChange={(e) => onUpdateField("samlCertificate", e.target.value)}
          placeholder={t("tenant.idpSamlCertificatePlaceholder")}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
