// FILE-EXCEPTION: file length
/**
 * Identity Provider Detail View
 *
 * Detailed edit / creation workspace for a single Identity Provider.
 * Dual layout modes:
 * 1. Create Mode: A 3-step configuration Wizard (Templates -> Settings -> Appearance/Claims).
 * 2. Edit Mode: A 4-tab settings dashboard (Config, Claims, Branding, Security & Access).
 */
"use client";

import { Fragment, useState } from "react";
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
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  ArrowLeft,
  Save,
  Zap,
  Trash2,
  Fingerprint,
  Clock,
  Compass,
  Palette,
  ShieldAlert,
  FileJson,
} from "lucide-react";
import { formatUtc } from "@core/common/utils";
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

const WIZARD_STEPS = [
  { step: 1, labelKey: "identityProviders.stepSelectTemplate" },
  { step: 2, labelKey: "identityProviders.stepConnectionSettings" },
  { step: 3, labelKey: "identityProviders.stepAppearanceClaims" },
] as const;

/**
 * Presentation UI component rendering the identity provider detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function IdentityProviderDetailView({ providerId }: Props) {
  const vm = useIdentityProviderDetailViewModel(providerId);
  const { t } = useI18n();

  // Wizard step state for Create Mode
  const [createStep, setCreateStep] = useState(1);

  // ─── Loading state ──────────────────────────
  if (!vm.isCreateMode && vm.isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ─── Error state ────────────────────────────
  if (vm.fetchError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <ErrorMessage
          size="md"
          message={`${t("common.error")}: ${(vm.fetchError as Error).message}`}
        />
        <Button variant="outline" size="sm" onClick={vm.goBack}>
          <ArrowLeft className="me-2 h-4 w-4" aria-hidden="true" />
          {t("common.goBack")}
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
      <div className="space-y-6 pb-12 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={vm.goBack}
            className="shrink-0"
            aria-label={t("common.goBack")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-nx-ink">
              {t("identityProviders.createTitle")}
            </h1>
            <p className="text-xs text-nx-ink-3">{t("identityProviders.createSubtitle")}</p>
          </div>
        </div>

        {/* Step Indicator Bar */}
        <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-4">
          <div className="mx-auto flex max-w-xl items-center justify-between">
            {WIZARD_STEPS.map(({ step, labelKey }, idx) => (
              <Fragment key={step}>
                <div className="z-raised flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-[background-color,color] duration-nx-standard motion-reduce:transition-none",
                      createStep >= step
                        ? "bg-nx-accent-fill text-nx-on-fill"
                        : "border border-nx-line bg-nx-raised text-nx-ink-3"
                    )}
                  >
                    {step}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      createStep === step ? "text-nx-accent" : "text-nx-ink-3"
                    )}
                  >
                    {t(labelKey)}
                  </span>
                </div>

                {idx < WIZARD_STEPS.length - 1 && (
                  <div className="relative mx-4 h-0.5 flex-1 bg-nx-line">
                    <div
                      className="absolute start-0 top-0 h-full bg-nx-accent-fill transition-[width] duration-nx-panel motion-reduce:transition-none"
                      style={{ width: createStep > step ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="space-y-6">
          {/* Step 1: Select Template */}
          {createStep === 1 && (
            <div className="space-y-6 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none">
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
                <Button onClick={() => setCreateStep(2)} disabled={!vm.selectedTemplateId}>
                  {t("identityProviders.btnConfigureConnection")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Connection settings */}
          {createStep === 2 && (
            <div className="grid grid-cols-1 gap-6 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none lg:grid-cols-3">
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
              <div className="flex justify-between gap-3 border-t border-nx-line pt-4 lg:col-span-3">
                <Button variant="outline" onClick={() => setCreateStep(1)}>
                  {t("identityProviders.btnBackToTemplates")}
                </Button>
                <Button onClick={() => setCreateStep(3)} disabled={!vm.form.name || !vm.form.slug}>
                  {t("identityProviders.btnNextCustomize")}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Appearance & Claims */}
          {createStep === 3 && (
            <div className="grid grid-cols-1 gap-6 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none lg:grid-cols-2">
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
              <div className="flex justify-between gap-3 border-t border-nx-line pt-4 lg:col-span-2">
                <Button variant="outline" onClick={() => setCreateStep(2)}>
                  {t("identityProviders.btnBackToConfig")}
                </Button>
                <Button
                  onClick={vm.save}
                  loading={vm.isSaving}
                  disabled={!vm.form.name || !vm.form.slug}
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
    <div className="space-y-6 pb-12 duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none">
      {/* Header Row */}
      <div className="flex flex-col gap-4 border-b border-nx-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={vm.goBack}
            className="shrink-0"
            aria-label={t("common.goBack")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-md p-1.5",
                !vm.form.buttonColor &&
                  "border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash"
              )}
              style={
                vm.form.buttonColor
                  ? {
                      backgroundColor: `${vm.form.buttonColor}12`,
                      border: `1px solid ${vm.form.buttonColor}25`,
                    }
                  : undefined
              }
            >
              {vm.form.iconUrl ? (
                <img
                  src={vm.form.iconUrl}
                  alt={vm.form.name}
                  className="h-6 w-6 rounded object-contain"
                />
              ) : (
                <Fingerprint
                  className={cn("h-6 w-6", !vm.form.buttonColor && "text-nx-accent")}
                  style={vm.form.buttonColor ? { color: vm.form.buttonColor } : undefined}
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {vm.form.name || t("identityProviders.editTitle")}
              </h1>
              <p className="mt-0.5 font-mono text-xs text-nx-ink-3">{vm.form.slug}</p>
            </div>
          </div>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Test Connection */}
          <Button variant="outline" size="sm" onClick={vm.testConnection} loading={vm.isTesting}>
            {!vm.isTesting && <Zap className="me-1.5 h-4 w-4 text-warning" aria-hidden="true" />}
            {t("identityProviders.testConnection")}
          </Button>

          {/* Save */}
          <Button onClick={vm.save} disabled={!vm.isDirty} loading={vm.isSaving} size="sm">
            {!vm.isSaving && <Save className="me-1.5 h-4 w-4" aria-hidden="true" />}
            {t("common.save")}
          </Button>
        </div>
      </div>

      {/* Dirty indicator warning */}
      {vm.isDirty && (
        <div className="flex items-center gap-2 rounded-nx-control border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning duration-nx-standard ease-nx-enter animate-in fade-in motion-reduce:transition-none">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
          {t("common.unsavedChanges")}
        </div>
      )}

      {/* ─── Tabbed Workspace Layout ───────────────────────────── */}
      <Tabs defaultValue="connection" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 border border-nx-line bg-nx-raised p-1 md:inline-flex md:w-auto md:grid-cols-none">
          <TabsTrigger value="connection" className="gap-1.5 text-xs font-semibold">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            {t("identityProviders.tabConnection")}
          </TabsTrigger>
          <TabsTrigger value="claims" className="gap-1.5 text-xs font-semibold">
            <FileJson className="h-3.5 w-3.5" aria-hidden="true" />
            {t("identityProviders.tabClaims")}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5 text-xs font-semibold">
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            {t("identityProviders.tabBranding")}
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-1.5 text-xs font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
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
              <Card className="space-y-3 bg-nx-raised p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nx-ink-3">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {t("identityProviders.auditMetadata")}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-nx-line pb-1">
                    <span className="text-nx-ink-3">{t("common.created")}:</span>
                    <span className="font-medium text-nx-ink">
                      {vm.provider?.createdAt
                        ? formatUtc(vm.provider.createdAt, "MMM d, yyyy HH:mm")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-nx-line pb-1">
                    <span className="text-nx-ink-3">{t("identityProviders.lastModified")}</span>
                    <span className="font-medium text-nx-ink">
                      {vm.provider?.modifiedAt
                        ? formatUtc(vm.provider.modifiedAt, "MMM d, yyyy HH:mm")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-nx-line pb-1">
                    <span className="text-nx-ink-3">{t("identityProviders.scopeAudience")}</span>
                    <span className="font-medium text-nx-ink">{vm.provider?.scopeLabel}</span>
                  </div>
                  {vm.provider?.tenantId && (
                    <div className="flex justify-between">
                      <span className="text-nx-ink-3">
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
            <Card className="border border-destructive/30 bg-destructive/5 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-destructive">
                    {t("common.dangerZone")}
                  </h3>
                  <p className="mt-1 text-xs text-nx-ink-2">
                    {t("identityProviders.deleteWarning")}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" loading={vm.isDeleting}>
                      {!vm.isDeleting && <Trash2 className="me-1.5 h-4 w-4" aria-hidden="true" />}
                      {t("identityProviders.deleteButton")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("identityProviders.deleteConfirmTitle")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("identityProviders.deleteConfirmDesc")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={vm.deleteProvider}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("common.delete")}
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
