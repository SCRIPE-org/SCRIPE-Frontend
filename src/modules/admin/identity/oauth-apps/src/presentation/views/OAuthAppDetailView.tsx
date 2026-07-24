/**
 * OAuth App Detail View
 *
 * Full-page detail/edit/create view for a single OAuth Application.
 * Uses a premium 4-tab settings dashboard (Credentials, Redirects & Security, Scopes & Grants, Branding & SAML).
 */
"use client";

import { useState } from "react";
import { useOAuthAppDetailViewModel } from "../viewmodels/useOAuthAppDetailViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { ArrowLeft, Save, Loader2, AppWindow, AlertCircle } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import Image from "next/image";
import { GeneratedSecretAlert } from "../components/GeneratedSecretAlert";
import { OAuthAppWizard } from "../components/OAuthAppWizard";
import { SamlEditTabs } from "../components/SamlEditTabs";
import { OidcEditTabs } from "../components/OidcEditTabs";

interface Props {
  appId?: string;
}

/**
 * Presentation UI component rendering the o auth app detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.1)]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
        <div className="rounded-full border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium text-destructive">
          {t("common.error") || "Error"}: {(vm.fetchError as Error).message}
        </p>
        <Button variant="outline" size="sm" onClick={vm.goBack}>
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("common.goBack") || "Go Back"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 duration-300 animate-in fade-in">
      {/* ─── Header ────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={vm.goBack}
            className="shrink-0 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-1.5 shadow-[0_0_15px_hsl(var(--primary)/0.03)]">
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
                <AppWindow className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {vm.isCreateMode
                  ? t("oauthApps.createTitle") || "New Application Integration"
                  : vm.form.displayName || t("oauthApps.editTitle") || "Edit Application"}
              </h1>
              {!vm.isCreateMode && vm.app && (
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-border/80 px-1.5 py-0 font-mono text-[10px] uppercase"
                  >
                    {vm.form.protocol}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border/80 px-1.5 py-0 font-mono text-[10px]"
                  >
                    {vm.form.clientType === "confidential" ? "Confidential" : "Public"}
                  </Badge>
                  {!vm.form.isActive && (
                    <Badge
                      variant="secondary"
                      className="bg-destructive/10 px-1.5 py-0 text-[10px] text-destructive"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!vm.isCreateMode && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              onClick={vm.save}
              disabled={!vm.isDirty}
              loading={vm.isSaving}
              size="sm"
              className="bg-gradient-to-r from-primary to-info font-semibold text-primary-foreground shadow hover:opacity-95"
            >
              {!vm.isSaving && <Save className="me-1.5 h-4 w-4" />}
              {t("common.save") || "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Dirty indicator */}
      {vm.isDirty && !vm.isCreateMode && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning duration-200 animate-in fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          {t("common.unsavedChanges") ||
            "You have unsaved changes in your workspace. Remember to save."}
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

      {/* ─── Guided Wizard / Edit Layouts ──────────────────── */}
      {vm.isCreateMode ? (
        <OAuthAppWizard vm={vm} />
      ) : vm.form.protocol === "saml" ? (
        <SamlEditTabs vm={vm} />
      ) : (
        <OidcEditTabs vm={vm} copiedField={copiedField} copyToClipboard={copyToClipboard} />
      )}
    </div>
  );
}
