/**
 * OAuth App Detail View
 *
 * Full-page detail/edit/create view for a single OAuth Application.
 * Uses a premium 4-tab settings dashboard (Credentials, Redirects & Security, Scopes & Grants, Branding & SAML).
 */
"use client";

import { useState } from "react";
import { useOAuthAppDetailViewModel } from "../viewmodels/useOAuthAppDetailViewModel";
import {
  GeneralSection,
  EndpointsSection,
  ScopesGrantsSection,
  SecuritySection,
  TokenConfigSection,
  BrandingSection,
  SamlSection,
} from "../components/OAuthAppFormSections";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  ArrowLeft,
  Save,
  Loader2,
  KeyRound,
  Link2,
  Tag,
  Palette,
  AppWindow,
  AlertCircle,
} from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import Image from "next/image";
import { ClientCredentialsCard } from "../components/ClientCredentialsCard";
import { OAuthAppMetadataCard } from "../components/OAuthAppMetadataCard";
import { DangerZoneCard } from "../components/DangerZoneCard";
import { GeneratedSecretAlert } from "../components/GeneratedSecretAlert";

interface Props {
  appId?: string;
}

export function OAuthAppDetailView({ appId }: Props) {
  useModuleLocales(() => import("../../../locales"), "oauth-apps");
  const vm = useOAuthAppDetailViewModel(appId);
  const { t } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ─── Loading state ──────────────────────────
  if (!vm.isCreateMode && vm.isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("common.loading") || "Loading details..."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────
  if (vm.fetchError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="rounded-full border border-red-500/20 bg-red-500/10 p-3 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium text-red-600">
          {t("common.error") || "Error"}: {(vm.fetchError as Error).message}
        </p>
        <Button variant="outline" size="sm" onClick={vm.goBack}>
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("common.goBack") || "Go Back"}
        </Button>
      </div>
    );
  }

  const sectionProps = {
    form: vm.form,
    updateField: vm.updateField,
    clientTypeOptions: vm.clientTypeOptions,
    isCreateMode: vm.isCreateMode,
    standardScopes: vm.standardScopes,
    standardGrantTypes: vm.standardGrantTypes,
    addRedirectUri: vm.addRedirectUri,
    removeRedirectUri: vm.removeRedirectUri,
    updateRedirectUri: vm.updateRedirectUri,
    addPostLogoutUri: vm.addPostLogoutUri,
    removePostLogoutUri: vm.removePostLogoutUri,
    updatePostLogoutUri: vm.updatePostLogoutUri,
  };

  return (
    <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
      {/* ─── Header ────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={vm.goBack} className="shrink-0 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/5 p-1.5 shadow-[0_0_15px_rgba(168,85,247,0.03)]">
              {vm.form.logoUri ? (
                <Image
                  src={vm.form.logoUri}
                  alt={vm.form.displayName}
                  width={44}
                  height={44}
                  className="h-full w-full rounded object-contain"
                  unoptimized
                />
              ) : (
                <AppWindow className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {vm.isCreateMode
                  ? t("oauthApps.createTitle") || "New OAuth Application"
                  : vm.form.displayName || t("oauthApps.editTitle") || "Edit Application"}
              </h1>
              {!vm.isCreateMode && vm.app && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 border-border/80">
                    {vm.form.clientType === "confidential" ? "Confidential" : "Public"}
                  </Badge>
                  {!vm.form.isActive && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
                      Inactive
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            onClick={vm.save}
            disabled={!vm.isCreateMode && !vm.isDirty}
            loading={vm.isSaving}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow hover:opacity-95"
          >
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" />}
            {vm.isCreateMode
              ? t("oauthApps.createButton") || "Create Application"
              : t("common.save") || "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Dirty indicator */}
      {vm.isDirty && !vm.isCreateMode && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600 dark:border-amber-800/80 dark:bg-amber-950/20 dark:text-amber-400 duration-200 animate-in fade-in">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          {t("common.unsavedChanges") || "You have unsaved changes in your workspace. Remember to save."}
        </div>
      )}

      {/* ─── Generated Secret Alert ──────────────────── */}
      {vm.generatedSecret && (
        <GeneratedSecretAlert
          generatedSecret={vm.generatedSecret}
          copiedField={copiedField}
          copyToClipboard={copyToClipboard}
          isCreateMode={vm.isCreateMode}
          onClear={vm.clearGeneratedSecret}
        />
      )}

      {/* ─── Tabbed Workspace Layout ───────────────────────────── */}
      <Tabs defaultValue="credentials" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 border bg-muted/40 p-1 md:inline-flex md:w-auto md:grid-cols-none">
          <TabsTrigger value="credentials" className="gap-1.5 text-xs font-semibold">
            <KeyRound className="h-3.5 w-3.5" />
            {t("oauthApps.credentialsSection") || "Credentials"}
          </TabsTrigger>
          <TabsTrigger value="redirects" className="gap-1.5 text-xs font-semibold">
            <Link2 className="h-3.5 w-3.5" />
            {t("oauthApps.endpointsSection") || "Redirects & Security"}
          </TabsTrigger>
          <TabsTrigger value="scopes" className="gap-1.5 text-xs font-semibold">
            <Tag className="h-3.5 w-3.5" />
            {t("oauthApps.scopesGrantsSection") || "Scopes & Grants"}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
            <Palette className="h-3.5 w-3.5" />
            {t("oauthApps.brandingSection") || "Branding & SAML"}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Connection & Credentials */}
        <TabsContent value="credentials" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <GeneralSection {...sectionProps} />
              <TokenConfigSection {...sectionProps} />
            </div>

            <div className="space-y-6 lg:col-span-1">
              {!vm.isCreateMode && vm.app && (
                <>
                  <ClientCredentialsCard
                    clientId={vm.app.clientId}
                    clientType={vm.app.clientType}
                    copiedField={copiedField}
                    copyToClipboard={copyToClipboard}
                    isRegenerating={vm.isRegenerating}
                    onRegenerate={vm.regenerateSecret}
                  />

                  <OAuthAppMetadataCard
                    createdAt={vm.app.createdAt}
                    modifiedAt={vm.app.modifiedAt}
                    tenantId={vm.app.tenantId}
                  />
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Redirects & Security */}
        <TabsContent value="redirects" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <EndpointsSection {...sectionProps} />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <SecuritySection {...sectionProps} />

              {!vm.isCreateMode && (
                <DangerZoneCard
                  isDeleting={vm.isDeleting}
                  onDelete={vm.deleteApp}
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Scopes & Grant Types */}
        <TabsContent value="scopes" className="outline-none max-w-3xl">
          <ScopesGrantsSection {...sectionProps} />
        </TabsContent>

        {/* Tab 4: Branding & SAML */}
        <TabsContent value="branding" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <SamlSection {...sectionProps} />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <BrandingSection {...sectionProps} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
