/**
 * OAuth App Form Sections
 *
 * Reusable form sections for create/edit OAuth Application detail page.
 * Organized into General, Endpoints, Scopes & Grants, Security, Token Config, and Branding.
 */
"use client";

import type { OAuthAppFormState } from "../viewmodels/useOAuthAppDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { ImageUploadField } from "@core/ui/image-upload-field";
import GenericSelect from "@core/crud/components/generic-select";
import {
  Settings2,
  Link2,
  ShieldCheck,
  Timer,
  Image as ImageIcon,
  Plus,
  X,
  Tag,
} from "lucide-react";

// ─── Props ──────────────────────────────────────────────────────
interface FormSectionProps {
  form: OAuthAppFormState;
  updateField: <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => void;
  clientTypeOptions: { value: string; label: string }[];
  isCreateMode: boolean;
  standardScopes: string[];
  standardGrantTypes: string[];
  // URI helpers
  addRedirectUri: () => void;
  removeRedirectUri: (index: number) => void;
  updateRedirectUri: (index: number, value: string) => void;
  addPostLogoutUri: () => void;
  removePostLogoutUri: (index: number) => void;
  updatePostLogoutUri: (index: number, value: string) => void;
}

// ─── General Section ────────────────────────────────────────────
export function GeneralSection({
  form,
  updateField,
  clientTypeOptions,
  isCreateMode,
}: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-blue-500" />
          {t("oauthApps.generalSection") || "General"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.generalSectionDesc") || "Basic application configuration"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="oauth-name">
            {t("oauthApps.displayName") || "Application Name"}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="oauth-name"
            value={form.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
            placeholder={t("oauthApps.displayNamePlaceholder") || "e.g. Mobile App, Partner Portal"}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="oauth-desc">{t("oauthApps.descriptionLabel") || "Description"}</Label>
          <Textarea
            id="oauth-desc"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder={t("oauthApps.descriptionPlaceholder") || "What does this application do?"}
            className="min-h-[80px] resize-y"
          />
        </div>

        {/* Client Type */}
        {isCreateMode && (
          <div className="space-y-2">
            <Label>
              {t("oauthApps.clientType") || "Client Type"} <span className="text-red-500">*</span>
            </Label>
            <GenericSelect
              value={form.clientType}
              onValueChange={(v: string | string[]) => updateField("clientType", v as string)}
              options={clientTypeOptions}
              placeholder={t("oauthApps.selectClientType") || "Select type..."}
            />
            <p className="text-xs text-muted-foreground">
              {form.clientType === "confidential"
                ? t("oauthApps.confidentialHelp") ||
                  "Server-side apps that can securely store client secrets"
                : t("oauthApps.publicHelp") ||
                  "SPA or mobile apps that cannot securely store secrets — PKCE required"}
            </p>
          </div>
        )}

        {/* Client Type badge (edit mode — read only) */}
        {!isCreateMode && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">{t("oauthApps.clientType") || "Client Type"}:</Label>
            <Badge variant="outline" className="text-sm">
              {form.clientType === "confidential" ? "Confidential" : "Public"}
            </Badge>
          </div>
        )}

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">{t("common.active") || "Active"}</Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.activeHelp") || "Disabled apps cannot authenticate"}
            </p>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(v) => updateField("isActive", v)} />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Endpoints Section ──────────────────────────────────────────
export function EndpointsSection({
  form,
  addRedirectUri,
  removeRedirectUri,
  updateRedirectUri,
  addPostLogoutUri,
  removePostLogoutUri,
  updatePostLogoutUri,
}: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5 text-emerald-500" />
          {t("oauthApps.endpointsSection") || "Endpoints"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.endpointsSectionDesc") || "Configure redirect and post-logout URIs"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Redirect URIs */}
        <div className="space-y-2">
          <Label>
            {t("oauthApps.redirectUris") || "Redirect URIs"} <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            {form.redirectUris.map((uri, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={uri}
                  onChange={(e) => updateRedirectUri(index, e.target.value)}
                  placeholder="https://app.example.com/callback"
                  className="flex-1 font-mono text-sm"
                />
                {form.redirectUris.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                    onClick={() => removeRedirectUri(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addRedirectUri} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("oauthApps.addRedirectUri") || "Add URI"}
          </Button>
        </div>

        {/* Post-Logout Redirect URIs */}
        <div className="space-y-2">
          <Label>{t("oauthApps.postLogoutRedirectUris") || "Post-Logout Redirect URIs"}</Label>
          <div className="space-y-2">
            {form.postLogoutRedirectUris.map((uri, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={uri}
                  onChange={(e) => updatePostLogoutUri(index, e.target.value)}
                  placeholder="https://app.example.com/logged-out"
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600"
                  onClick={() => removePostLogoutUri(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addPostLogoutUri} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("oauthApps.addPostLogoutUri") || "Add URI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Scopes & Grants Section ────────────────────────────────────
export function ScopesGrantsSection({
  form,
  updateField,
  standardScopes,
  standardGrantTypes,
}: FormSectionProps) {
  const { t } = useI18n();

  const currentScopes = form.allowedScopes.split(" ").filter(Boolean);
  const currentGrants = form.allowedGrantTypes.split(" ").filter(Boolean);

  const toggleScope = (scope: string) => {
    const updated = currentScopes.includes(scope)
      ? currentScopes.filter((s) => s !== scope)
      : [...currentScopes, scope];
    updateField("allowedScopes", updated.join(" "));
  };

  const toggleGrant = (grant: string) => {
    const updated = currentGrants.includes(grant)
      ? currentGrants.filter((g) => g !== grant)
      : [...currentGrants, grant];
    updateField("allowedGrantTypes", updated.join(" "));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="h-5 w-5 text-purple-500" />
          {t("oauthApps.scopesGrantsSection") || "Scopes & Grant Types"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.scopesGrantsSectionDesc") ||
            "Configure allowed OIDC scopes and OAuth grant types"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Scopes */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedScopes") || "Allowed Scopes"}</Label>
          <div className="flex flex-wrap gap-2">
            {standardScopes.map((scope) => (
              <Badge
                key={scope}
                variant={currentScopes.includes(scope) ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-all ${
                  currentScopes.includes(scope)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
                onClick={() => toggleScope(scope)}
              >
                {scope}
              </Badge>
            ))}
          </div>
          <Input
            value={form.allowedScopes}
            onChange={(e) => updateField("allowedScopes", e.target.value)}
            placeholder="openid profile email"
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("oauthApps.scopesHelp") ||
              "Click badges to toggle, or type custom scopes separated by spaces"}
          </p>
        </div>

        {/* Grant Types */}
        <div className="space-y-2">
          <Label>{t("oauthApps.allowedGrantTypes") || "Allowed Grant Types"}</Label>
          <div className="flex flex-wrap gap-2">
            {standardGrantTypes.map((grant) => (
              <Badge
                key={grant}
                variant={currentGrants.includes(grant) ? "default" : "outline"}
                className={`cursor-pointer text-xs transition-all ${
                  currentGrants.includes(grant)
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
                onClick={() => toggleGrant(grant)}
              >
                {grant}
              </Badge>
            ))}
          </div>
          <Input
            value={form.allowedGrantTypes}
            onChange={(e) => updateField("allowedGrantTypes", e.target.value)}
            placeholder="authorization_code refresh_token"
            className="mt-2 font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Security Section ───────────────────────────────────────────
export function SecuritySection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          {t("oauthApps.securitySection") || "Security"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.securitySectionDesc") || "PKCE and consent screen requirements"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("oauthApps.requirePkce") || "Require PKCE"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.requirePkceHelp") ||
                "Proof Key for Code Exchange — recommended for all clients, mandatory for public clients"}
            </p>
          </div>
          <Switch
            checked={form.requirePkce}
            onCheckedChange={(v) => updateField("requirePkce", v)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label className="text-sm font-medium">
              {t("oauthApps.requireConsent") || "Require Consent Screen"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.requireConsentHelp") ||
                "Show a consent dialog to users before granting access to this app"}
            </p>
          </div>
          <Switch
            checked={form.requireConsent}
            onCheckedChange={(v) => updateField("requireConsent", v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Token Configuration Section ────────────────────────────────
export function TokenConfigSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-cyan-500" />
          {t("oauthApps.tokenSection") || "Token Configuration"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.tokenSectionDesc") || "Configure access and refresh token lifetimes"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Access Token Lifetime */}
          <div className="space-y-2">
            <Label htmlFor="oauth-access-ttl">
              {t("oauthApps.accessTokenLifetime") || "Access Token Lifetime"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oauth-access-ttl"
                type="number"
                min={1}
                max={1440}
                value={form.accessTokenLifetimeMinutes}
                onChange={(e) =>
                  updateField("accessTokenLifetimeMinutes", parseInt(e.target.value) || 60)
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                {t("common.minutes") || "minutes"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.accessTokenHelp") || "Typical: 15–60 min. Shorter = more secure."}
            </p>
          </div>

          {/* Refresh Token Lifetime */}
          <div className="space-y-2">
            <Label htmlFor="oauth-refresh-ttl">
              {t("oauthApps.refreshTokenLifetime") || "Refresh Token Lifetime"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="oauth-refresh-ttl"
                type="number"
                min={1}
                max={365}
                value={form.refreshTokenLifetimeDays}
                onChange={(e) =>
                  updateField("refreshTokenLifetimeDays", parseInt(e.target.value) || 14)
                }
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{t("common.days") || "days"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("oauthApps.refreshTokenHelp") ||
                "Typical: 7–30 days. Set based on session requirements."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Branding Section ───────────────────────────────────────────
export function BrandingSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-pink-500" />
          {t("oauthApps.brandingSection") || "Branding"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.brandingSectionDesc") || "Application logo shown on consent screen"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ImageUploadField
          label={t("oauthApps.logoUri") || "Application Logo"}
          description={
            t("oauthApps.brandingSectionDesc") || "Application logo shown on consent screen"
          }
          value={form.logoUri}
          onChange={(url) => updateField("logoUri", url)}
        />
      </CardContent>
    </Card>
  );
}

// ─── SAML Section (Optional SP Config) ──────────────────────────
export function SamlSection({ form, updateField }: FormSectionProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-indigo-500" />
          {t("oauthApps.samlSection") || "SAML Configuration"}
        </CardTitle>
        <CardDescription>
          {t("oauthApps.samlSectionDesc") ||
            "Optional: Configure SAML 2.0 properties if this is a SAML Service Provider."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ACS URL */}
        <div className="space-y-2">
          <Label htmlFor="saml-acs-url">
            {t("oauthApps.samlAcsUrl") || "Assertion Consumer Service (ACS) URL"}
          </Label>
          <Input
            id="saml-acs-url"
            value={form.samlAcsUrl ?? ""}
            onChange={(e) => updateField("samlAcsUrl", e.target.value)}
            placeholder="https://sp.example.com/saml/acs"
            className="font-mono text-sm"
          />
        </div>

        {/* SP Entity ID */}
        <div className="space-y-2">
          <Label htmlFor="saml-sp-entity-id">
            {t("oauthApps.samlSpEntityId") || "SP Entity ID"}
          </Label>
          <Input
            id="saml-sp-entity-id"
            value={form.samlSpEntityId ?? ""}
            onChange={(e) => updateField("samlSpEntityId", e.target.value)}
            placeholder="https://sp.example.com/saml/metadata"
            className="font-mono text-sm"
          />
        </div>

        {/* SP Certificate */}
        <div className="space-y-2">
          <Label htmlFor="saml-sp-cert">
            {t("oauthApps.samlSpCertificate") || "SP Certificate (X.509 PEM)"}
          </Label>
          <Textarea
            id="saml-sp-cert"
            value={form.samlSpCertificate ?? ""}
            onChange={(e) => updateField("samlSpCertificate", e.target.value)}
            placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
            className="min-h-[100px] resize-y font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {t("oauthApps.samlSpCertificateHelp") ||
              "Optional: Public X.509 certificate for validating signed SAML requests from this SP."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
