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
import GenericSelect from "@core/crud/components/generic-select";
import {
      Settings2,
      Globe,
      Palette,
      Shield,
      FileJson,
      Fingerprint,
} from "lucide-react";

// ─── Props ──────────────────────────────────────────────────────
interface FormSectionProps {
      form: IdentityProviderFormState;
      updateField: <K extends keyof IdentityProviderFormState>(
            field: K,
            value: IdentityProviderFormState[K],
      ) => void;
      protocolOptions: { value: string; label: string }[];
      isCreateMode: boolean;
}

// ─── General Section ────────────────────────────────────────────
export function GeneralSection({ form, updateField, protocolOptions, isCreateMode }: FormSectionProps) {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Name */}
                              <div className="space-y-2">
                                    <Label htmlFor="idp-name">
                                          {t("identityProviders.name") || "Provider Name"} <span className="text-red-500">*</span>
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
                                    <Label>{t("identityProviders.protocol") || "Protocol"} <span className="text-red-500">*</span></Label>
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
                                          {t("identityProviders.displayOrderHelp") || "Lower numbers appear first on the login page"}
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
                                          {t("identityProviders.activeStatusHelp") || "Inactive providers won't appear on the login page"}
                                    </p>
                              </div>
                              <Switch
                                    checked={form.isActive}
                                    onCheckedChange={(v) => updateField("isActive", v)}
                              />
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
                                    {t("identityProviders.authorityHelp") || "The OIDC issuer URL (e.g. https://accounts.google.com for Google)"}
                              </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Client ID */}
                              <div className="space-y-2">
                                    <Label htmlFor="idp-clientId">
                                          {t("identityProviders.clientId") || "Client ID"}
                                    </Label>
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
                                          placeholder={t("identityProviders.clientSecretPlaceholder") || "Leave blank to keep existing"}
                                    />
                              </div>
                        </div>

                        {/* Scopes */}
                        <div className="space-y-2">
                              <Label htmlFor="idp-scopes">
                                    {t("identityProviders.scopes") || "Scopes"}
                              </Label>
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
                                    {t("identityProviders.redirectUriHelp") || "Leave empty to use the default NEXORA callback URL"}
                              </p>
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
                              {t("identityProviders.appearanceSectionDesc") || "Customize how this provider appears on the login page"}
                        </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Icon */}
                              <div className="space-y-2">
                                    <ImageUploadField
                                          label={t("identityProviders.iconUrl") || "Provider Icon"}
                                          description={t("identityProviders.iconUrlHelp") || "Upload a logo or paste a URL for the login button icon"}
                                          value={form.iconUrl}
                                          onChange={(url) => updateField("iconUrl", url)}
                                    />
                              </div>

                              {/* Button Color */}
                              <div className="space-y-2">
                                    <Label htmlFor="idp-color">{t("identityProviders.buttonColor") || "Button Color"}</Label>
                                    <div className="flex items-center gap-2">
                                          <input
                                                type="color"
                                                id="idp-color"
                                                value={form.buttonColor || "#4285F4"}
                                                onChange={(e) => updateField("buttonColor", e.target.value)}
                                                className="h-9 w-12 rounded border cursor-pointer"
                                          />
                                          <Input
                                                value={form.buttonColor}
                                                onChange={(e) => updateField("buttonColor", e.target.value)}
                                                placeholder="#4285F4"
                                                className="font-mono text-sm flex-1"
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
                                    placeholder={t("identityProviders.buttonLabelPlaceholder") || `Sign in with ${form.name || '...'}`}
                              />
                        </div>

                        {/* Live Button Preview */}
                        <div className="space-y-2">
                              <Label className="text-sm">{t("identityProviders.buttonPreview") || "Login Button Preview"}</Label>
                              <div className="p-4 rounded-lg bg-muted/30 border border-dashed flex items-center justify-center">
                                    <button
                                          type="button"
                                          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-white font-medium text-sm shadow-sm transition-all hover:opacity-90 hover:shadow-md cursor-default"
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
                                          {form.buttonLabel || `Sign in with ${form.name || "Provider"}`}
                                    </button>
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
                              {t("identityProviders.accessSectionDesc") || "Control who can use this provider to sign in"}
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
                                          {t("identityProviders.enabledForAdminsHelp") || "Allow administrators to sign in using this provider"}
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
                                          {t("identityProviders.enabledForUsersHelp") || "Allow regular users (app users) to sign in using this provider"}
                                    </p>
                              </div>
                              <Switch
                                    checked={form.enabledForUsers}
                                    onCheckedChange={(v) => updateField("enabledForUsers", v)}
                              />
                        </div>

                        {/* Scope Summary */}
                        <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-muted-foreground">{t("identityProviders.currentScope") || "Current scope"}:</span>
                              {form.enabledForAdmins && (
                                    <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400">
                                          Admin
                                    </Badge>
                              )}
                              {form.enabledForUsers && (
                                    <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400">
                                          User
                                    </Badge>
                              )}
                              {!form.enabledForAdmins && !form.enabledForUsers && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">None</Badge>
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
      try { JSON.parse(form.claimMappingJson); } catch { isValidJson = false; }

      return (
            <Card>
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                              <FileJson className="h-5 w-5 text-cyan-500" />
                              {t("identityProviders.claimMappingsSection") || "Claim Mappings"}
                        </CardTitle>
                        <CardDescription>
                              {t("identityProviders.claimMappingsSectionDesc") || "Map external claims to NEXORA user attributes (JSON key → value pairs)"}
                        </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                        <Textarea
                              value={form.claimMappingJson}
                              onChange={(e) => updateField("claimMappingJson", e.target.value)}
                              placeholder={'{\n  "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",\n  "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"\n}'}
                              className="font-mono text-sm min-h-[160px] resize-y"
                        />
                        {!isValidJson && form.claimMappingJson.trim() !== "" && (
                              <p className="text-xs text-red-500">
                                    {t("identityProviders.invalidJson") || "Invalid JSON format"}
                              </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                              {t("identityProviders.claimMappingsHelp") || "Maps external IdP claims to internal NEXORA attributes. Keys are NEXORA fields, values are the IdP claim URIs."}
                        </p>
                  </CardContent>
            </Card>
      );
}
