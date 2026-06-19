/**
 * Identity Provider Detail View
 *
 * Premium detailed edit / creation workspace for a single Identity Provider.
 * Dual layout modes:
 * 1. Create Mode: A gorgeous 3-step configuration Wizard (Templates -> Settings -> Appearance/Claims).
 * 2. Edit Mode: A professional 4-tab settings dashboard (Config, Claims, Branding, Security & Access).
 */
"use client";

import { useState } from "react";
import { useIdentityProviderDetailViewModel } from "../viewmodels/useIdentityProviderDetailViewModel";
import {
  GeneralSection,
  OidcConfigSection,
  Oauth2ConfigSection,
  SamlConfigSection,
  ExplicitEndpointsSection,
  AppearanceSection,
  AccessControlSection,
} from "../components/IdentityProviderFormSections";
import { WellKnownProviderGallery } from "../components/WellKnownProviderGallery";
import { ClaimMappingEditor } from "../components/ClaimMappingEditor";
import { SSOButtonPreview } from "../components/SSOButtonPreview";
import { CallbackUrlCard } from "../components/CallbackUrlCard";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  ArrowLeft,
  Save,
  Loader2,
  Zap,
  Trash2,
  Fingerprint,
  Clock,
  Compass,
  Palette,
  ShieldAlert,
  FileJson,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/ui/alert-dialog";
import { Card, CardContent } from "@core/ui/card";

interface Props {
  providerId?: string;
}

export function IdentityProviderDetailView({ providerId }: Props) {
  const vm = useIdentityProviderDetailViewModel(providerId);
  const { t } = useI18n();

  // Wizard step state for Create Mode
  const [createStep, setCreateStep] = useState(1);



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
    protocolOptions: vm.protocolOptions,
    isCreateMode: vm.isCreateMode,
  };



  // ─── CREATE MODE: 3-Step Wizard ───────────────────────────────────
  if (vm.isCreateMode) {
    return (
      <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={vm.goBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("identityProviders.createTitle") || "Create Identity Provider"}
            </h1>
            <p className="text-xs text-muted-foreground">{t("identityProviders.createSubtitle")}</p>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card/45 p-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            {/* Step 1 */}
            <div className="z-10 flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  createStep >= 1
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border border-border bg-muted text-muted-foreground"
                }`}
              >
                1
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${createStep === 1 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                {t("identityProviders.stepSelectTemplate")}
              </span>
            </div>

            {/* Line 1 */}
            <div className="relative mx-4 h-0.5 flex-1 bg-border">
              <div
                className="absolute left-0 top-0 h-full bg-purple-500 transition-all duration-500"
                style={{ width: createStep > 1 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 2 */}
            <div className="z-10 flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  createStep >= 2
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border border-border bg-muted text-muted-foreground"
                }`}
              >
                2
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${createStep === 2 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                {t("identityProviders.stepConnectionSettings")}
              </span>
            </div>

            {/* Line 2 */}
            <div className="relative mx-4 h-0.5 flex-1 bg-border">
              <div
                className="absolute left-0 top-0 h-full bg-purple-500 transition-all duration-500"
                style={{ width: createStep > 2 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 3 */}
            <div className="z-10 flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  createStep >= 3
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border border-border bg-muted text-muted-foreground"
                }`}
              >
                3
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${createStep === 3 ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}
              >
                {t("identityProviders.stepAppearanceClaims")}
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="space-y-6">
          {/* Step 1: Select Template */}
          {createStep === 1 && (
            <div className="space-y-6 duration-300 animate-in fade-in">
              <Card>
                <CardContent className="p-6">
                  <WellKnownProviderGallery
                    selectedId={vm.selectedTemplateId}
                    onSelect={(preset) => {
                      const id = (preset as Record<string, unknown>)["slug"] as string | undefined;
                      vm.applyTemplate(id ?? "custom", preset);
                    }}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setCreateStep(2)}
                  disabled={!vm.selectedTemplateId}
                  className="bg-gradient-to-r from-[#A855F7] to-[#7C3AED] font-semibold text-white shadow hover:opacity-95"
                >
                  {t("identityProviders.btnConfigureConnection")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Connection settings */}
          {createStep === 2 && (
            <div className="grid grid-cols-1 gap-6 duration-300 animate-in fade-in lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <GeneralSection {...sectionProps} />

                {vm.form.protocol === "oidc" && <OidcConfigSection {...sectionProps} />}
                {vm.form.protocol === "oauth2" && <Oauth2ConfigSection {...sectionProps} />}
                {vm.form.protocol === "saml" && <SamlConfigSection {...sectionProps} />}

                {vm.form.protocol !== "saml" && <ExplicitEndpointsSection {...sectionProps} />}
              </div>

              <div className="space-y-6 lg:col-span-1">
                <CallbackUrlCard protocol={vm.form.protocol} providerId={providerId} />
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between gap-3 border-t pt-4 lg:col-span-3">
                <Button variant="outline" onClick={() => setCreateStep(1)}>
                  {t("identityProviders.btnBackToTemplates")}
                </Button>
                <Button
                  onClick={() => setCreateStep(3)}
                  disabled={!vm.form.name || !vm.form.slug}
                  className="bg-gradient-to-r from-[#A855F7] to-[#7C3AED] font-semibold text-white shadow hover:opacity-95"
                >
                  {t("identityProviders.btnNextCustomize")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Appearance & Claims */}
          {createStep === 3 && (
            <div className="grid grid-cols-1 gap-6 duration-300 animate-in fade-in lg:grid-cols-2">
              <div className="space-y-6">
                <AppearanceSection {...sectionProps} />
                <AccessControlSection {...sectionProps} />
              </div>

              <div className="space-y-6">
                <Card className="p-5">
                  <ClaimMappingEditor
                    value={vm.form.claimMappingJson}
                    onChange={(val) => vm.updateField("claimMappingJson", val)}
                  />
                </Card>

                <Card className="p-5">
                  <SSOButtonPreview
                    name={vm.form.name}
                    iconUrl={vm.form.iconUrl}
                    buttonColor={vm.form.buttonColor}
                    buttonLabel={vm.form.buttonLabel}
                  />
                </Card>
              </div>

              {/* Step Navigation controls */}
              <div className="flex justify-between gap-3 border-t pt-4 lg:col-span-2">
                <Button variant="outline" onClick={() => setCreateStep(2)}>
                  {t("identityProviders.btnBackToConfig")}
                </Button>
                <Button
                  onClick={vm.save}
                  loading={vm.isSaving}
                  disabled={!vm.form.name || !vm.form.slug}
                  className="bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#4F46E5] font-semibold text-white shadow-lg hover:scale-[1.01] hover:opacity-95"
                >
                  {t("identityProviders.btnCreateAndEnable")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── EDIT MODE: Tabbed Configuration Workspace ────────────────────
  return (
    <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
      {/* Header Row */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={vm.goBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-1.5"
              style={{
                backgroundColor: `${vm.form.buttonColor || "#4F46E5"}12`,
                border: `1px solid ${vm.form.buttonColor || "#4F46E5"}25`,
              }}
            >
              {vm.form.iconUrl ? (
                <img
                  src={vm.form.iconUrl}
                  alt={vm.form.name}
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <Fingerprint
                  className="h-6 w-6"
                  style={{ color: vm.form.buttonColor || "#4F46E5" }}
                />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {vm.form.name || t("identityProviders.editTitle")}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{vm.form.slug}</p>
            </div>
          </div>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Test Connection */}
          <Button
            variant="outline"
            size="sm"
            onClick={vm.testConnection}
            loading={vm.isTesting}
          >
            {!vm.isTesting && <Zap className="me-1.5 h-4 w-4 text-amber-500" />}
            {t("identityProviders.testConnection") || "Test Connection"}
          </Button>

          {/* Save */}
          <Button
            onClick={vm.save}
            disabled={!vm.isDirty}
            loading={vm.isSaving}
            size="sm"
            className="bg-gradient-to-r from-[#A855F7] to-[#7C3AED] font-semibold text-white shadow hover:opacity-95"
          >
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" />}
            {t("common.save") || "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Dirty indicator warning */}
      {vm.isDirty && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600 duration-200 animate-in fade-in dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          {t("common.unsavedChanges") ||
            "You have unsaved changes in your workspace. Remember to save."}
        </div>
      )}

      {/* ─── Tabbed Workspace Layout ───────────────────────────── */}
      <Tabs defaultValue="connection" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 border bg-muted/40 p-1 md:inline-flex md:w-auto md:grid-cols-none">
          <TabsTrigger value="connection" className="gap-1.5 text-xs font-semibold">
            <Compass className="h-3.5 w-3.5" />
            {t("identityProviders.tabConnection")}
          </TabsTrigger>
          <TabsTrigger value="claims" className="gap-1.5 text-xs font-semibold">
            <FileJson className="h-3.5 w-3.5" />
            {t("identityProviders.tabClaims")}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
            <Palette className="h-3.5 w-3.5" />
            {t("identityProviders.tabBranding")}
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-1.5 text-xs font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" />
            {t("identityProviders.tabSecurity")}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Connection configurations */}
        <TabsContent value="connection" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <GeneralSection {...sectionProps} />

              {vm.form.protocol === "oidc" && <OidcConfigSection {...sectionProps} />}
              {vm.form.protocol === "oauth2" && <Oauth2ConfigSection {...sectionProps} />}
              {vm.form.protocol === "saml" && <SamlConfigSection {...sectionProps} />}

              {vm.form.protocol !== "saml" && <ExplicitEndpointsSection {...sectionProps} />}
            </div>

            <div className="space-y-6 lg:col-span-1">
              <CallbackUrlCard protocol={vm.form.protocol} providerId={providerId} />

              {/* Status information card */}
              <Card className="space-y-3 bg-muted/20 p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t("identityProviders.auditMetadata")}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">
                      {t("common.created") || "Created"}:
                    </span>
                    <span className="font-medium">
                      {vm.provider?.createdAt
                        ? format(new Date(vm.provider.createdAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">
                      {t("identityProviders.lastModified")}
                    </span>
                    <span className="font-medium">
                      {vm.provider?.modifiedAt
                        ? format(new Date(vm.provider.modifiedAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">
                      {t("identityProviders.scopeAudience")}
                    </span>
                    <span className="font-medium">{vm.provider?.scopeLabel}</span>
                  </div>
                  {vm.provider?.tenantId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("identityProviders.tenantContextId")}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {vm.provider.tenantId}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Claim mappings */}
        <TabsContent value="claims" className="outline-none">
          <Card className="max-w-3xl p-6">
            <ClaimMappingEditor
              value={vm.form.claimMappingJson}
              onChange={(val) => vm.updateField("claimMappingJson", val)}
            />
          </Card>
        </TabsContent>

        {/* Tab 3: Branding / Appearance & Previews */}
        <TabsContent value="branding" className="outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AppearanceSection {...sectionProps} />

            <Card className="p-6">
              <SSOButtonPreview
                name={vm.form.name}
                iconUrl={vm.form.iconUrl}
                buttonColor={vm.form.buttonColor}
                buttonLabel={vm.form.buttonLabel}
              />
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Security & Access Control + Danger Zone */}
        <TabsContent value="access" className="outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AccessControlSection {...sectionProps} />

            {/* Danger Zone */}
            <Card className="border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/10">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                    {t("common.dangerZone") || "Danger Zone"}
                  </h3>
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                    {t("identityProviders.deleteWarning") ||
                      "Deleting this provider will permanently remove it. Users who signed in via this provider will lose SSO access and authentication credentials."}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" loading={vm.isDeleting}>
                      {!vm.isDeleting && <Trash2 className="me-1.5 h-4 w-4" />}
                      {t("identityProviders.deleteButton") || "Delete Provider"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("identityProviders.deleteConfirmTitle") || "Delete Identity Provider"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("identityProviders.deleteConfirmDesc") ||
                          "This will permanently remove this identity provider. Users linked via this provider will lose SSO access. This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={vm.deleteProvider}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        {t("common.delete") || "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
