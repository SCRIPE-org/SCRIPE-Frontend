/**
 * Identity Provider Form Sections
 *
 * Reusable form sections for create/edit Identity Provider detail page.
 * Organized into General, OIDC Config, Appearance, Access Control, and Claim Mappings.
 */
"use client";

import type { IdentityProviderFormState } from "../viewmodels/useIdentityProviderDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { Button } from "@core/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import GenericSelect from "@core/crud/components/generic-select";
import { Settings2, Globe, Palette, Shield, FileJson, Fingerprint, Link2 } from "lucide-react";

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
          <Settings2 className="h-5 w-5 text-blue-500" />
          {t("identityProviders.generalSection") || "General"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.generalSectionDesc") || "Basic identity provider configuration"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="idp-name">
              {t("identityProviders.name") || "Provider Name"}{" "}
              <span className="text-red-500">*</span>
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
              placeholder={t("identityProviders.namePlaceholder") || "e.g. Google Workspace"}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="idp-slug">
              {t("identityProviders.slug") || "Slug"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="idp-slug"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder={t("identityProviders.slugPlaceholder") || "e.g. google-workspace"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {t("identityProviders.slugHelp") || "URL-safe unique identifier"}
            </p>
          </div>

          {/* Protocol */}
          <div className="space-y-2">
            <Label>
              {t("identityProviders.protocol") || "Protocol"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <GenericSelect
              value={form.protocol}
              onValueChange={(v: string | string[]) => updateField("protocol", v as string)}
              options={protocolOptions}
              placeholder={t("identityProviders.selectProtocol") || "Select protocol..."}
            />
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="idp-order">
              {t("identityProviders.displayOrder") || "Display Order"}
            </Label>
            <Input
              id="idp-order"
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) => updateField("displayOrder", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              {t("identityProviders.displayOrderHelp") ||
                "Lower numbers appear first on the login page"}
            </p>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("identityProviders.activeStatus") || "Active"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("identityProviders.activeStatusHelp") ||
                "Inactive providers won't appear on the login page"}
            </p>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(v) => updateField("isActive", v)} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OIDC Configuration Section ─────────────────────────────────
export function OidcConfigSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-emerald-500" />
          {t("identityProviders.oidcSection") || "OIDC Configuration"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.oidcSectionDesc") || "OpenID Connect / OAuth2 connection settings"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authority URL */}
        <div className="space-y-2">
          <Label htmlFor="idp-authority">
            {t("identityProviders.authority") || "Authority URL"}
          </Label>
          <Input
            id="idp-authority"
            value={form.authority}
            onChange={(e) => updateField("authority", e.target.value)}
            placeholder="https://accounts.google.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.authorityHelp") ||
              "The OIDC issuer URL (e.g. https://accounts.google.com for Google)"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="idp-clientId">{t("identityProviders.clientId") || "Client ID"}</Label>
            <Input
              id="idp-clientId"
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              placeholder={t("identityProviders.clientIdPlaceholder") || "OAuth2 client_id"}
              className="font-mono text-sm"
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="idp-clientSecret">
              {t("identityProviders.clientSecret") || "Client Secret"}
            </Label>
            <Input
              id="idp-clientSecret"
              type="password"
              value={form.clientSecret}
              onChange={(e) => updateField("clientSecret", e.target.value)}
              placeholder={
                t("identityProviders.clientSecretPlaceholder") || "Leave blank to keep existing"
              }
            />
          </div>
        </div>

        {/* Scopes */}
        <div className="space-y-2">
          <Label htmlFor="idp-scopes">{t("identityProviders.scopes") || "Scopes"}</Label>
          <Input
            id="idp-scopes"
            value={form.scopes}
            onChange={(e) => updateField("scopes", e.target.value)}
            placeholder="openid profile email"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.scopesHelp") || "Space-separated list of OIDC scopes to request"}
          </p>
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="idp-redirect">
            {t("identityProviders.redirectUri") || "Redirect URI"}
          </Label>
          <Input
            id="idp-redirect"
            value={form.redirectUri}
            onChange={(e) => updateField("redirectUri", e.target.value)}
            placeholder={t("identityProviders.redirectUriPlaceholder") || "Auto-generated if blank"}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.redirectUriHelp") ||
              "Leave empty to use the default SCRIPE callback URL"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OAuth 2.0 Configuration Section ────────────────────────────
export function Oauth2ConfigSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-indigo-500" />
          {t("identityProviders.oauth2Section") || "OAuth 2.0 Configuration"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.oauth2SectionDesc") || "OAuth 2.0 connection settings"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authority URL */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-authority">
            {t("identityProviders.authority") || "Authority URL"}
          </Label>
          <Input
            id="oauth2-authority"
            value={form.authority}
            onChange={(e) => updateField("authority", e.target.value)}
            placeholder="https://accounts.google.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.authorityHelp") ||
              "The OAuth 2.0 issuer or authorization endpoint base URL"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="oauth2-clientId">
              {t("identityProviders.clientId") || "Client ID"}
            </Label>
            <Input
              id="oauth2-clientId"
              value={form.clientId}
              onChange={(e) => updateField("clientId", e.target.value)}
              placeholder={t("identityProviders.clientIdPlaceholder") || "OAuth2 client_id"}
              className="font-mono text-sm"
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="oauth2-clientSecret">
              {t("identityProviders.clientSecret") || "Client Secret"}
            </Label>
            <Input
              id="oauth2-clientSecret"
              type="password"
              value={form.clientSecret}
              onChange={(e) => updateField("clientSecret", e.target.value)}
              placeholder={
                t("identityProviders.clientSecretPlaceholder") || "Leave blank to keep existing"
              }
            />
          </div>
        </div>

        {/* Scopes */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-scopes">{t("identityProviders.scopes") || "Scopes"}</Label>
          <Input
            id="oauth2-scopes"
            value={form.scopes}
            onChange={(e) => updateField("scopes", e.target.value)}
            placeholder="email profile"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.scopesHelp") || "Space-separated list of scopes to request"}
          </p>
        </div>

        {/* Redirect URI */}
        <div className="space-y-2">
          <Label htmlFor="oauth2-redirect">
            {t("identityProviders.redirectUri") || "Redirect URI"}
          </Label>
          <Input
            id="oauth2-redirect"
            value={form.redirectUri}
            onChange={(e) => updateField("redirectUri", e.target.value)}
            placeholder={t("identityProviders.redirectUriPlaceholder") || "Auto-generated if blank"}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("identityProviders.redirectUriHelp") ||
              "Leave empty to use the default SCRIPE callback URL"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Explicit Endpoints Section (Optional) ──────────────────────
export function ExplicitEndpointsSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-teal-500" />
          {t("identityProviders.endpointsSection") || "Explicit Endpoints"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.endpointsSectionDesc") ||
            "Optional endpoints (overrides discovery)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idp-auth-end">
            {t("identityProviders.authorizationEndpoint") || "Authorization Endpoint"}
          </Label>
          <Input
            id="idp-auth-end"
            value={form.authorizationEndpoint ?? ""}
            onChange={(e) => updateField("authorizationEndpoint", e.target.value)}
            placeholder="https://idp.example.com/authorize"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-token-end">
            {t("identityProviders.tokenEndpoint") || "Token Endpoint"}
          </Label>
          <Input
            id="idp-token-end"
            value={form.tokenEndpoint ?? ""}
            onChange={(e) => updateField("tokenEndpoint", e.target.value)}
            placeholder="https://idp.example.com/token"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="idp-user-end">
            {t("identityProviders.userInformationEndpoint") || "User Info Endpoint"}
          </Label>
          <Input
            id="idp-user-end"
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
export function SamlConfigSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-orange-500" />
          {t("identityProviders.samlSection") || "SAML Configuration"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.samlSectionDesc") || "Configure SAML IdP details"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="saml-entity-id">
            {t("identityProviders.samlIdpEntityId") || "IdP Entity ID"}
          </Label>
          <Input
            id="saml-entity-id"
            value={form.samlIdpEntityId ?? ""}
            onChange={(e) => updateField("samlIdpEntityId", e.target.value)}
            placeholder="https://idp.example.com/metadata"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saml-sso-url">
            {t("identityProviders.samlSsoUrl") || "Single Sign-On Service URL"}
          </Label>
          <Input
            id="saml-sso-url"
            value={form.samlSsoUrl ?? ""}
            onChange={(e) => updateField("samlSsoUrl", e.target.value)}
            placeholder="https://idp.example.com/sso"
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saml-cert">
            {t("identityProviders.samlCertificate") || "IdP Public Certificate (Base64/PEM)"}
          </Label>
          <Textarea
            id="saml-cert"
            value={form.samlCertificate ?? ""}
            onChange={(e) => updateField("samlCertificate", e.target.value)}
            placeholder={
              t("identityProviders.samlCertificatePlaceholder") ||
              "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"
            }
            className="min-h-[120px] font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Appearance Section ─────────────────────────────────────────
export function AppearanceSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5 text-purple-500" />
          {t("identityProviders.appearanceSection") || "Appearance"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.appearanceSectionDesc") ||
            "Customize how this provider appears on the login page"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Icon */}
          <div className="space-y-2">
            <ImageUploadField
              label={t("identityProviders.iconUrl") || "Provider Icon"}
              description={
                t("identityProviders.iconUrlHelp") ||
                "Upload a logo or paste a URL for the login button icon"
              }
              value={form.iconUrl}
              onChange={(url) => updateField("iconUrl", url)}
            />
          </div>

          {/* Button Color */}
          <div className="space-y-2">
            <Label htmlFor="idp-color">
              {t("identityProviders.buttonColor") || "Button Color"}
            </Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-12 p-0 border rounded-lg overflow-hidden shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: form.buttonColor || "#4285F4" }}
                  >
                    <span className="sr-only">{t("identityProviders.chooseColor")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-3 space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("identityProviders.presetColors")}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
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
                      "#A855F7", // Scripe Purple
                      "#7C3AED", // Scripe Dark Purple
                      "#4F46E5", // Scripe Indigo
                      "#3B82F6", // Scripe Blue
                      "#10B981", // Emerald
                    ].map((c) => (
                      <Button
                        key={c}
                        type="button"
                        variant="ghost"
                        onClick={() => updateField("buttonColor", c)}
                        className="h-8 w-8 p-0 rounded-md border border-border/40 hover:scale-110 active:scale-95 transition-all"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("identityProviders.customColorHex")}
                  </div>
                  <Input
                    value={form.buttonColor}
                    onChange={(e) => updateField("buttonColor", e.target.value)}
                    placeholder="#4285F4"
                    className="h-8 font-mono text-xs"
                  />
                </PopoverContent>
              </Popover>
              <Input
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
          <Label htmlFor="idp-label">{t("identityProviders.buttonLabel") || "Button Label"}</Label>
          <Input
            id="idp-label"
            value={form.buttonLabel}
            onChange={(e) => updateField("buttonLabel", e.target.value)}
            placeholder={
              t("identityProviders.buttonLabelPlaceholder") || `Sign in with ${form.name || "..."}`
            }
          />
        </div>

        {/* Live Button Preview */}
        <div className="space-y-2">
          <Label className="text-sm">
            {t("identityProviders.buttonPreview") || "Login Button Preview"}
          </Label>
          <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
            <Button
              type="button"
              disabled
              className="inline-flex cursor-default items-center gap-2.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm border-0"
              style={{ backgroundColor: form.buttonColor || "#4285F4" }}
            >
              {form.iconUrl ? (
                <img
                  src={form.iconUrl}
                  alt=""
                  className="h-5 w-5 rounded object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              {form.buttonLabel || t("identityProviders.signInWith", { name: form.name || "Provider" })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Access Control Section ─────────────────────────────────────
export function AccessControlSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-amber-500" />
          {t("identityProviders.accessSection") || "Access Control"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.accessSectionDesc") ||
            "Control who can use this provider to sign in"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Admins Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("identityProviders.enabledForAdmins") || "Enable for Admins"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("identityProviders.enabledForAdminsHelp") ||
                "Allow administrators to sign in using this provider"}
            </p>
          </div>
          <Switch
            checked={form.enabledForAdmins}
            onCheckedChange={(v) => updateField("enabledForAdmins", v)}
          />
        </div>

        {/* Users Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("identityProviders.enabledForUsers") || "Enable for Users"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("identityProviders.enabledForUsersHelp") ||
                "Allow regular users (app users) to sign in using this provider"}
            </p>
          </div>
          <Switch
            checked={form.enabledForUsers}
            onCheckedChange={(v) => updateField("enabledForUsers", v)}
          />
        </div>

        {/* Scope Summary */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            {t("identityProviders.currentScope") || "Current scope"}:
          </span>
          {form.enabledForAdmins && (
            <Badge
              variant="outline"
              className="bg-violet-50 text-xs text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"
            >
              {t("identityProviders.badgeAdmin")}
            </Badge>
          )}
          {form.enabledForUsers && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-xs text-sky-700 dark:bg-sky-900/20 dark:text-sky-400"
            >
              {t("identityProviders.badgeUser")}
            </Badge>
          )}
          {!form.enabledForAdmins && !form.enabledForUsers && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {t("identityProviders.scopeNone")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Claim Mappings Section ─────────────────────────────────────
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
          <FileJson className="h-5 w-5 text-cyan-500" />
          {t("identityProviders.claimMappingsSection") || "Claim Mappings"}
        </CardTitle>
        <CardDescription>
          {t("identityProviders.claimMappingsSectionDesc") ||
            "Map external claims to SCRIPE user attributes (JSON key → value pairs)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={form.claimMappingJson}
          onChange={(e) => updateField("claimMappingJson", e.target.value)}
          placeholder={
            '{\n  "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",\n  "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"\n}'
          }
          className="min-h-[160px] resize-y font-mono text-sm"
        />
        {!isValidJson && form.claimMappingJson.trim() !== "" && (
          <p className="text-xs text-red-500">
            {t("identityProviders.invalidJson") || "Invalid JSON format"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t("identityProviders.claimMappingsHelp") ||
            "Maps external IdP claims to internal SCRIPE attributes. Keys are SCRIPE fields, values are the IdP claim URIs."}
        </p>
      </CardContent>
    </Card>
  );
}
