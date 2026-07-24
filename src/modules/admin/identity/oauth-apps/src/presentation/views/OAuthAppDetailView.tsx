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
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { ArrowLeft, Save, AppWindow } from "lucide-react";
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
        <LoadingSpinner />
      </div>
    );
  }

  // ─── Error state ────────────────────────────
  if (vm.fetchError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <ErrorMessage
          message={`${t("common.error")}: ${(vm.fetchError as Error).message}`}
        />
        <Button variant="outline" size="sm" onClick={vm.goBack}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 duration-nx-standard animate-in fade-in">
      {/* ─── Header ────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-nx-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={vm.goBack}
            aria-label={t("common.goBack")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-md border border-nx-line bg-nx-accent-wash p-1.5">
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
                <AppWindow className="h-6 w-6 text-nx-accent" aria-hidden="true" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nx-ink">
                {vm.isCreateMode
                  ? t("oauthApps.createTitle")
                  : vm.form.displayName || t("oauthApps.editTitle")}
              </h1>
              {!vm.isCreateMode && vm.app && (
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px] uppercase">
                    {vm.form.protocol}
                  </Badge>
                  <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
                    {vm.form.clientType === "confidential"
                      ? t("oauthApps.clientTypeConfidential")
                      : t("oauthApps.clientTypePublic")}
                  </Badge>
                  {!vm.form.isActive && (
                    <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                      {t("common.inactive")}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!vm.isCreateMode && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button onClick={vm.save} disabled={!vm.isDirty} loading={vm.isSaving} size="sm">
              {!vm.isSaving && <Save className="me-1.5 h-4 w-4" aria-hidden="true" />}
              {t("common.saveChanges")}
            </Button>
          </div>
        )}
      </div>

      {/* Dirty indicator */}
      {vm.isDirty && !vm.isCreateMode && (
        <div className="flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning duration-nx-standard animate-in fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
          {t("common.unsavedChanges")}
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
