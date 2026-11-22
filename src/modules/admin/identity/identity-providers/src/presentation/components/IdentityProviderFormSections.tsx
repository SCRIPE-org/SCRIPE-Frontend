// FILE-EXCEPTION: file length
/**
 * Identity Provider Form Sections
 *
 * Reusable form sections for create/edit Identity Provider detail page.
 * Organized into General, OIDC Config, Appearance, Access Control, and Claim Mappings.
 */
"use client";

import type { IdentityProviderFormState } from "../viewmodels/useIdentityProviderDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Input } from "@core/ui/input";
import { PasswordInput } from "@core/ui/password-input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { Button } from "@core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import GenericSelect from "@core/crud/components/generic-select";
import { Settings2, Globe, Palette, Shield, FileJson, Link2 } from "lucide-react";

// ─── Props ──────────────────────────────────────────────────────
interface FormSectionProps {
  form: IdentityProviderFormState;
  updateField: <K extends keyof IdentityProviderFormState>(
    field: K,
    value: IdentityProviderFormState[K]
  ) => void;
  protocolOptions: { value: string; label: string }[];
  isCreateMode: boolean;
}

// ─── General Section ────────────────────────────────────────────
/**
 * Presentation UI component rendering the general section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function GeneralSection({
  form,
  updateField,
  protocolOptions,
  isCreateMode,
}: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-info" aria-hidden="true" />
          {t("identityProviders.generalSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.generalSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="idp-name">
              {t("identityProviders.name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="idp-name"
              value={form.name}
              onChange={(e) => {
                updateField("name", e.target.value);
                // Auto-slug on create
                if (isCreateMode) {
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .trim();
                  updateField("slug", slug);
                }
              }}
              placeholder={t("identityProviders.namePlaceholder")}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="idp-slug">
              {t("identityProviders.slug")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="idp-slug"
              dir="ltr"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder={t("identityProviders.slugPlaceholder")}
              className="font-mono text-sm"
            />
            <p className="text-xs text-nx-ink-3">{t("identityProviders.slugHelp")}</p>
          </div>

          {/* Protocol */}
          <div className="space-y-2">
            <Label>
              {t("identityProviders.protocol")} <span className="text-destructive">*</span>
            </Label>
            <GenericSelect
              value={form.protocol}
              onValueChange={(v: string | string[]) => updateField("protocol", v as string)}
              options={protocolOptions}
              placeholder={t("identityProviders.selectProtocol")}
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="idp-order">{t("identityProviders.displayOrder")}</Label>
            <Input
              id="idp-order"
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) => updateField("displayOrder", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-nx-ink-3">{t("identityProviders.displayOrderHelp")}</p>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-nx-control border border-nx-line p-3">
          <div>
            <Label htmlFor="idp-active" className="text-sm font-medium">
              {t("identityProviders.activeStatus")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("identityProviders.activeStatusHelp")}</p>
          </div>
          <Switch
            id="idp-active"
            aria-label={t("identityProviders.activeStatus")}
            checked={form.isActive}
            onCheckedChange={(v) => updateField("isActive", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OIDC Configuration Section ─────────────────────────────────
/**
 * Presentation UI component rendering the oidc config section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OidcConfigSection({ form, updateField, isCreateMode }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-success" aria-hidden="true" />
          {t("identityProviders.oidcSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.oidcSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authority URL */}
        <div className="space-y-2">
          <Label htmlFor="idp-authority">{t("identityProviders.authority")}</Label>
          <Input
            id="idp-authority"
            dir="ltr"
            value={form.authority}
            onChange={(e) => updateField("authority", e.target.value)}
            placeholder="https://accounts.google.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.authorityHelp")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="idp-clientId">{t("identityProviders.clientId")}</Label>
            <Input
              id="idp-clientId"
              dir="ltr"
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              placeholder={t("identityProviders.clientIdPlaceholder")}
              className="font-mono text-sm"
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="idp-clientSecret">{t("identityProviders.clientSecret")}</Label>
            <PasswordInput
              id="idp-clientSecret"
              dir="ltr"
              value={form.clientSecret}
              onChange={(e) => updateField("clientSecret", e.target.value)}
              autoComplete="new-password"
              placeholder={
                isCreateMode
                  ? t("identityProviders.clientSecretCreatePlaceholder")
                  : t("identityProviders.clientSecretPlaceholder")
              }
            />
          </div>
        </div>

        {/* Scopes */}
        <div className="space-y-2">
          <Label htmlFor="idp-scopes">{t("identityProviders.scopes")}</Label>
          <Input
            id="idp-scopes"
            dir="ltr"
            value={form.scopes}
            onChange={(e) => updateField("scopes", e.target.value)}
            placeholder="openid profile email"
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.scopesHelp")}</p>
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="idp-redirect">{t("identityProviders.redirectUri")}</Label>
          <Input
            id="idp-redirect"
            dir="ltr"
            value={form.redirectUri}
            onChange={(e) => updateField("redirectUri", e.target.value)}
            placeholder={t("identityProviders.redirectUriPlaceholder")}
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.redirectUriHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OAuth 2.0 Configuration Section ────────────────────────────
/**
 * Presentation UI component rendering the oauth2 config section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function Oauth2ConfigSection({ form, updateField, isCreateMode }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-info" aria-hidden="true" />
          {t("identityProviders.oauth2Section")}
        </CardTitle>
        <CardDescription>{t("identityProviders.oauth2SectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authority URL */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-authority">{t("identityProviders.authority")}</Label>
          <Input
            id="oauth2-authority"
            dir="ltr"
            value={form.authority}
            onChange={(e) => updateField("authority", e.target.value)}
            placeholder="https://accounts.google.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.authorityHelp")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="oauth2-clientId">{t("identityProviders.clientId")}</Label>
            <Input
              id="oauth2-clientId"
              dir="ltr"
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              placeholder={t("identityProviders.clientIdPlaceholder")}
              className="font-mono text-sm"
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="oauth2-clientSecret">{t("identityProviders.clientSecret")}</Label>
            <PasswordInput
              id="oauth2-clientSecret"
              dir="ltr"
              value={form.clientSecret}
              onChange={(e) => updateField("clientSecret", e.target.value)}
              autoComplete="new-password"
              placeholder={
                isCreateMode
                  ? t("identityProviders.clientSecretCreatePlaceholder")
                  : t("identityProviders.clientSecretPlaceholder")
              }
            />
          </div>
        </div>

        {/* Scopes */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-scopes">{t("identityProviders.scopes")}</Label>
          <Input
            id="oauth2-scopes"
            dir="ltr"
            value={form.scopes}
            onChange={(e) => updateField("scopes", e.target.value)}
            placeholder="email profile"
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.scopesHelp")}</p>
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-redirect">{t("identityProviders.redirectUri")}</Label>
          <Input
            id="oauth2-redirect"
            dir="ltr"
            value={form.redirectUri}
            onChange={(e) => updateField("redirectUri", e.target.value)}
            placeholder={t("identityProviders.redirectUriPlaceholder")}
            className="font-mono text-sm"
          />
          <p className="text-xs text-nx-ink-3">{t("identityProviders.redirectUriHelp")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Explicit Endpoints Section (Optional) ──────────────────────
/**
 * Presentation UI component rendering the explicit endpoints section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ExplicitEndpointsSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-info" aria-hidden="true" />
          {t("identityProviders.endpointsSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.endpointsSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idp-auth-end">{t("identityProviders.authorizationEndpoint")}</Label>
          <Input
            id="idp-auth-end"
            dir="ltr"
            value={form.authorizationEndpoint ?? ""}
            onChange={(e) => updateField("authorizationEndpoint", e.target.value)}
            placeholder="https://idp.example.com/authorize"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-token-end">{t("identityProviders.tokenEndpoint")}</Label>
          <Input
            id="idp-token-end"
            dir="ltr"
            value={form.tokenEndpoint ?? ""}
            onChange={(e) => updateField("tokenEndpoint", e.target.value)}
            placeholder="https://idp.example.com/token"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-user-end">{t("identityProviders.userInformationEndpoint")}</Label>
          <Input
            id="idp-user-end"
            dir="ltr"
            value={form.userInformationEndpoint ?? ""}
            onChange={(e) => updateField("userInformationEndpoint", e.target.value)}
            placeholder="https://idp.example.com/userinfo"
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SAML Configuration Section ─────────────────────────────────
/**
 * Presentation UI component rendering the saml config section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SamlConfigSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-warning" aria-hidden="true" />
          {t("identityProviders.samlSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.samlSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="saml-entity-id">{t("identityProviders.samlIdpEntityId")}</Label>
          <Input
            id="saml-entity-id"
            dir="ltr"
            value={form.samlIdpEntityId ?? ""}
            onChange={(e) => updateField("samlIdpEntityId", e.target.value)}
            placeholder="https://idp.example.com/metadata"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saml-sso-url">{t("identityProviders.samlSsoUrl")}</Label>
          <Input
            id="saml-sso-url"
            dir="ltr"
            value={form.samlSsoUrl ?? ""}
            onChange={(e) => updateField("samlSsoUrl", e.target.value)}
            placeholder="https://idp.example.com/sso"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saml-cert">{t("identityProviders.samlCertificate")}</Label>
          <Textarea
            id="saml-cert"
            dir="ltr"
            value={form.samlCertificate ?? ""}
            onChange={(e) => updateField("samlCertificate", e.target.value)}
            placeholder={t("identityProviders.samlCertificatePlaceholder")}
            className="min-h-[120px] font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Appearance Section ─────────────────────────────────────────

/** Colour swatches for the button-colour picker — third-party brand colours the
 * admin may want to reuse verbatim, plus a neutral accent. The product's own
 * accent is workspace-owned (`--nx-accent`) and never appears as a fixed hex
 * here, so no Scripe-branded swatch belongs in this list. */
const BUTTON_COLOR_SWATCHES = [
  "#4285F4", // Google
  "#0078D4", // Microsoft
  "#24292E", // GitHub
  "#007DC1", // Okta
  "#EB5424", // Auth0
  "#4D4D4D", // Keycloak
  "#E91E63", // Ping
  "#FF9900", // Cognito
  "#E41F35", // OneLogin
  "#009DDC", // Salesforce
  "#10B981", // Emerald
];

/**
 * Presentation UI component rendering the appearance section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AppearanceSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-nx-accent" aria-hidden="true" />
          {t("identityProviders.appearanceSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.appearanceSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Icon */}
          <div className="space-y-2">
            <ImageUploadField
              label={t("identityProviders.iconUrl")}
              description={t("identityProviders.iconUrlHelp")}
              value={form.iconUrl}
              onChange={(url) => updateField("iconUrl", url)}
            />
          </div>

          {/* Button Color */}
          <div className="space-y-2">
            <Label htmlFor="idp-color">{t("identityProviders.buttonColor")}</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={t("identityProviders.chooseColor")}
                    className="h-9 w-12 shrink-0 cursor-pointer overflow-hidden rounded-nx-control border p-0 shadow-none active:shadow-[inset_0_0_0_1px_var(--nx-accent)]"
                    style={{ backgroundColor: form.buttonColor || "#4285F4" }}
                  >
                    <span className="sr-only">{t("identityProviders.chooseColor")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 space-y-3 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                    {t("identityProviders.presetColors")}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {BUTTON_COLOR_SWATCHES.map((c) => {
                      const isSelected = form.buttonColor?.toLowerCase() === c.toLowerCase();
                      return (
                        <Button
                          key={c}
                          type="button"
                          variant="ghost"
                          aria-label={`${t("identityProviders.chooseColor")}: ${c}`}
                          aria-pressed={isSelected}
                          onClick={() => updateField("buttonColor", c)}
                          className={cn(
                            "h-8 w-8 rounded-nx-sm border border-nx-line p-0 shadow-none active:shadow-[inset_0_0_0_1px_var(--nx-accent)]",
                            isSelected && "ring-2 ring-nx-accent ring-offset-2 ring-offset-nx-surface"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                    {t("identityProviders.customColorHex")}
                  </div>
                  <Input
                    dir="ltr"
                    aria-label={t("identityProviders.customColorHex")}
                    value={form.buttonColor}
                    onChange={(e) => updateField("buttonColor", e.target.value)}
                    placeholder="#4285F4"
                    className="h-8 font-mono text-xs"
                  />
                </PopoverContent>
              </Popover>
              <Input
                id="idp-color"
                dir="ltr"
                value={form.buttonColor}
                onChange={(e) => updateField("buttonColor", e.target.value)}
                placeholder="#4285F4"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Button Label */}
        <div className="space-y-2">
          <Label htmlFor="idp-label">{t("identityProviders.buttonLabel")}</Label>
          <Input
            id="idp-label"
            value={form.buttonLabel}
            onChange={(e) => updateField("buttonLabel", e.target.value)}
            placeholder={t("identityProviders.buttonLabelPlaceholder")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Access Control Section ─────────────────────────────────────
/**
 * Presentation UI component rendering the access control section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function AccessControlSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-warning" aria-hidden="true" />
          {t("identityProviders.accessSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.accessSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Admins Toggle */}
        <div className="flex items-center justify-between rounded-nx-control border border-nx-line p-3">
          <div>
            <Label htmlFor="idp-enabled-admins" className="text-sm font-medium">
              {t("identityProviders.enabledForAdmins")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("identityProviders.enabledForAdminsHelp")}</p>
          </div>
          <Switch
            id="idp-enabled-admins"
            aria-label={t("identityProviders.enabledForAdmins")}
            checked={form.enabledForAdmins}
            onCheckedChange={(v) => updateField("enabledForAdmins", v)}
          />
        </div>

        {/* Users Toggle */}
        <div className="flex items-center justify-between rounded-nx-control border border-nx-line p-3">
          <div>
            <Label htmlFor="idp-enabled-users" className="text-sm font-medium">
              {t("identityProviders.enabledForUsers")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("identityProviders.enabledForUsersHelp")}</p>
          </div>
          <Switch
            id="idp-enabled-users"
            aria-label={t("identityProviders.enabledForUsers")}
            checked={form.enabledForUsers}
            onCheckedChange={(v) => updateField("enabledForUsers", v)}
          />
        </div>

        {/* Trust IdP MFA Assertion Toggle */}
        <div className="flex items-center justify-between rounded-nx-control border border-nx-line p-3">
          <div>
            <Label htmlFor="idp-trust-mfa" className="text-sm font-medium">
              {t("identityProviders.trustIdpMfa")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("identityProviders.trustIdpMfaHelp")}</p>
          </div>
          <Switch
            id="idp-trust-mfa"
            data-testid="trust-idp-mfa-switch"
            aria-label={t("identityProviders.trustIdpMfa")}
            checked={form.trustIdpMfa}
            onCheckedChange={(v) => updateField("trustIdpMfa", v)}
          />
        </div>

        {/* Scope Summary */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-nx-ink-3">{t("identityProviders.currentScope")}:</span>
          {form.enabledForAdmins && (
            <Badge variant="outline" className="bg-nx-accent-wash text-xs text-nx-accent">
              {t("identityProviders.badgeAdmin")}
            </Badge>
          )}
          {form.enabledForUsers && (
            <Badge variant="outline" className="bg-info/10 text-xs text-info">
              {t("identityProviders.badgeUser")}
            </Badge>
          )}
          {form.trustIdpMfa && (
            <Badge variant="outline" className="border-success/30 bg-success/10 text-xs text-success">
              {t("identityProviders.badgeTrustMfa")}
            </Badge>
          )}
          {!form.enabledForAdmins && !form.enabledForUsers && (
            <Badge variant="outline" className="text-xs text-nx-ink-3">
              {t("identityProviders.scopeNone")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Claim Mappings Section ─────────────────────────────────────
/**
 * Presentation UI component rendering the claim mappings section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ClaimMappingsSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  let isValidJson = true;
  try {
    JSON.parse(form.claimMappingJson);
  } catch {
    isValidJson = false;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileJson className="h-5 w-5 text-info" aria-hidden="true" />
          {t("identityProviders.claimMappingsSection")}
        </CardTitle>
        <CardDescription>{t("identityProviders.claimMappingsSectionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          dir="ltr"
          value={form.claimMappingJson}
          onChange={(e) => updateField("claimMappingJson", e.target.value)}
          placeholder={
            '{\n  "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",\n  "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"\n}'
          }
          className="min-h-[160px] resize-y font-mono text-sm"
        />
        {!isValidJson && form.claimMappingJson.trim() !== "" && (
          <p className="text-xs text-destructive">{t("identityProviders.invalidJson")}</p>
        )}
        <p className="text-xs text-nx-ink-3">{t("identityProviders.claimMappingsHelp")}</p>
      </CardContent>
    </Card>
  );
}
