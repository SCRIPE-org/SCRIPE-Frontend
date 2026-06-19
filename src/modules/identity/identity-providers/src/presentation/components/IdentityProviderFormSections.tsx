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
                    className="h-9 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border p-0 shadow-sm transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: form.buttonColor || "#4285F4" }}
                  >
                    <span className="sr-only">{t("identityProviders.chooseColor")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 space-y-3 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        className="h-8 w-8 rounded-md border border-border/40 p-0 transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
          <div
            className="flex min-h-[120px] items-center justify-center rounded-2xl border p-6"
            style={{
              background: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
              borderColor: "rgba(168,85,247,.22)",
              boxShadow: "0 10px 30px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.07)",
            }}
          >
            <Button
              type="button"
              disabled
              className="pointer-events-none inline-flex w-full max-w-[280px] cursor-default select-none items-center justify-center gap-2.5 rounded-[10px] border text-[13px] font-medium shadow-none"
              style={{
                height: 44,
                padding: "11px 14px",
                background: "rgba(255,255,255,.03)",
                borderColor: "rgba(255,255,255,.08)",
                color: "#F5F2FF",
              }}
            >
              {(() => {
                if (form.iconUrl) {
                  return (
                    <img
                      src={form.iconUrl}
                      alt=""
                      className="h-[18px] w-[18px] shrink-0 rounded object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  );
                }

                const lowerName = form.name?.toLowerCase() || "";
                if (lowerName.includes("google")) {
                  return (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-[18px] w-[18px] shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  );
                }
                if (
                  lowerName.includes("microsoft") ||
                  lowerName.includes("entra") ||
                  lowerName.includes("azure")
                ) {
                  return (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px] shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path fill="#F25022" d="M1 1h10v10H1z" />
                      <path fill="#7FBA00" d="M13 1h10v10H13z" />
                      <path fill="#00A4EF" d="M1 13h10v10H1z" />
                      <path fill="#FFB900" d="M13 13h10v10H13z" />
                    </svg>
                  );
                }
                if (lowerName.includes("apple")) {
                  return (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-[18px] w-[18px] shrink-0 text-[#F5F2FF]"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z" />
                    </svg>
                  );
                }

                return (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                );
              })()}
              <span className="truncate">
                {form.buttonLabel ||
                  t("identityProviders.signInWith", { name: form.name || "Provider" })}
              </span>
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
