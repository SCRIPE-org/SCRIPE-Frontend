/**
 * OAuth App Detail View
 *
 * Full-page detail/edit/create view for a single OAuth Application.
 * Uses sectioned form layout with client credentials, endpoint management, and token config.
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
} from "../components/OAuthAppFormSections";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
      ArrowLeft,
      Save,
      Loader2,
      KeyRound,
      Trash2,
      Copy,
      Check,
      RefreshCw,
      Clock,
      Shield,
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

interface Props {
      appId?: string;
}

export function OAuthAppDetailView({ appId }: Props) {
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
                  <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-3">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-sm text-muted-foreground">{t("common.loading") || "Loading..."}</p>
                        </div>
                  </div>
            );
      }

      // ─── Error state ────────────────────────────
      if (vm.fetchError) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <p className="text-sm text-red-500">{t("common.error") || "Error"}: {(vm.fetchError as Error).message}</p>
                        <Button variant="outline" onClick={vm.goBack}>
                              <ArrowLeft className="h-4 w-4 me-2" />
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
            <div className="space-y-6 pb-10">
                  {/* ─── Header ────────────────────────────────── */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                              <Button variant="ghost" size="icon" onClick={vm.goBack} className="shrink-0">
                                    <ArrowLeft className="h-5 w-5" />
                              </Button>
                              <div className="flex items-center gap-3">
                                    {vm.form.logoUri ? (
                                          <img
                                                src={vm.form.logoUri}
                                                alt={vm.form.displayName}
                                                className="h-9 w-9 rounded-lg object-contain border p-1"
                                          />
                                    ) : (
                                          <div className="h-9 w-9 rounded-lg border flex items-center justify-center bg-muted/50">
                                                <Shield className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                    )}
                                    <div>
                                          <h1 className="text-xl font-semibold tracking-tight">
                                                {vm.isCreateMode
                                                      ? (t("oauthApps.createTitle") || "New OAuth Application")
                                                      : vm.form.displayName || (t("oauthApps.editTitle") || "Edit Application")}
                                          </h1>
                                          {!vm.isCreateMode && vm.app && (
                                                <p className="text-sm text-muted-foreground font-mono">
                                                      {vm.app.clientType === "confidential" ? "Confidential" : "Public"}
                                                </p>
                                          )}
                                    </div>
                              </div>
                        </div>

                        <div className="flex items-center gap-2 ms-12 sm:ms-0">
                              <Button
                                    onClick={vm.save}
                                    disabled={vm.isSaving || (!vm.isCreateMode && !vm.isDirty)}
                                    size="sm"
                              >
                                    {vm.isSaving ? (
                                          <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                                    ) : (
                                          <Save className="h-4 w-4 me-1.5" />
                                    )}
                                    {vm.isCreateMode
                                          ? (t("oauthApps.createButton") || "Create Application")
                                          : (t("common.save") || "Save Changes")}
                              </Button>
                        </div>
                  </div>

                  {/* Dirty indicator */}
                  {vm.isDirty && !vm.isCreateMode && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              {t("common.unsavedChanges") || "You have unsaved changes"}
                        </div>
                  )}

                  {/* ─── Generated Secret Alert ──────────────────── */}
                  {vm.generatedSecret && (
                        <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50/80 dark:bg-green-950/20 p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                                          <KeyRound className="h-4 w-4" />
                                          {t("oauthApps.newSecretGenerated") || "New Secret Generated"}
                                    </h3>
                                    <Button variant="ghost" size="sm" onClick={vm.clearGeneratedSecret}>
                                          {t("common.dismiss") || "Dismiss"}
                                    </Button>
                              </div>
                              <p className="text-xs text-green-700 dark:text-green-400/80">
                                    {t("oauthApps.secretCopyWarning") || "Copy this secret now — it will not be shown again!"}
                              </p>
                              <div className="flex items-center gap-2 bg-white dark:bg-black/30 rounded-md border p-2">
                                    <code className="text-sm font-mono flex-1 break-all">{vm.generatedSecret.secret}</code>
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 shrink-0"
                                          onClick={() => copyToClipboard(vm.generatedSecret!.secret, "secret")}
                                    >
                                          {copiedField === "secret" ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                          ) : (
                                                <Copy className="h-4 w-4" />
                                          )}
                                    </Button>
                              </div>
                        </div>
                  )}

                  {/* ─── Form Sections ─────────────────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                              <GeneralSection {...sectionProps} />
                              <EndpointsSection {...sectionProps} />
                              <ScopesGrantsSection {...sectionProps} />
                        </div>
                        <div className="space-y-6">
                              {/* Client Credentials (edit mode only) */}
                              {!vm.isCreateMode && vm.app && (
                                    <Card>
                                          <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                      <KeyRound className="h-5 w-5 text-rose-500" />
                                                      {t("oauthApps.credentialsSection") || "Client Credentials"}
                                                </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                                {/* Client ID */}
                                                <div className="space-y-2">
                                                      <Label>{t("oauthApps.clientIdLabel") || "Client ID"}</Label>
                                                      <div className="flex items-center gap-2">
                                                            <Input
                                                                  value={vm.app.clientId}
                                                                  readOnly
                                                                  className="font-mono text-sm bg-muted/50"
                                                            />
                                                            <Button
                                                                  variant="ghost"
                                                                  size="icon"
                                                                  className="h-9 w-9 shrink-0"
                                                                  onClick={() => copyToClipboard(vm.app!.clientId, "clientId")}
                                                            >
                                                                  {copiedField === "clientId" ? (
                                                                        <Check className="h-4 w-4 text-green-500" />
                                                                  ) : (
                                                                        <Copy className="h-4 w-4" />
                                                                  )}
                                                            </Button>
                                                      </div>
                                                </div>

                                                {/* Regenerate Secret */}
                                                {vm.app.clientType === "confidential" && (
                                                      <div className="space-y-2">
                                                            <Label>{t("oauthApps.clientSecret") || "Client Secret"}</Label>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("oauthApps.clientSecretHidden") || "The secret is never displayed for security. Regenerate to get a new one."}
                                                            </p>
                                                            <AlertDialog>
                                                                  <AlertDialogTrigger asChild>
                                                                        <Button
                                                                              variant="outline"
                                                                              size="sm"
                                                                              disabled={vm.isRegenerating}
                                                                              className="gap-1.5"
                                                                        >
                                                                              {vm.isRegenerating ? (
                                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                              ) : (
                                                                                    <RefreshCw className="h-4 w-4" />
                                                                              )}
                                                                              {t("oauthApps.regenerateSecret") || "Regenerate Secret"}
                                                                        </Button>
                                                                  </AlertDialogTrigger>
                                                                  <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                              <AlertDialogTitle>
                                                                                    {t("oauthApps.regenerateConfirmTitle") || "Regenerate Client Secret?"}
                                                                              </AlertDialogTitle>
                                                                              <AlertDialogDescription>
                                                                                    {t("oauthApps.regenerateConfirmDesc") || "This will invalidate the current secret. All existing integrations using the old secret will stop working immediately. The new secret will be displayed once."}
                                                                              </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                              <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                                                                              <AlertDialogAction onClick={vm.regenerateSecret}>
                                                                                    {t("oauthApps.regenerate") || "Regenerate"}
                                                                              </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                  </AlertDialogContent>
                                                            </AlertDialog>
                                                      </div>
                                                )}
                                          </CardContent>
                                    </Card>
                              )}

                              <SecuritySection {...sectionProps} />
                              <TokenConfigSection {...sectionProps} />
                              <BrandingSection {...sectionProps} />

                              {/* ─── Metadata Card ─────────────────── */}
                              {!vm.isCreateMode && vm.app && (
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {t("oauthApps.metadata") || "Information"}
                                          </h3>
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                      <span className="text-muted-foreground">{t("common.createdAt") || "Created"}:</span>
                                                      <p className="font-medium">
                                                            {vm.app.createdAt
                                                                  ? format(new Date(vm.app.createdAt), "MMM d, yyyy HH:mm")
                                                                  : "—"}
                                                      </p>
                                                </div>
                                                <div>
                                                      <span className="text-muted-foreground">{t("common.modifiedAt") || "Last modified"}:</span>
                                                      <p className="font-medium">
                                                            {vm.app.modifiedAt
                                                                  ? format(new Date(vm.app.modifiedAt), "MMM d, yyyy HH:mm")
                                                                  : "—"}
                                                      </p>
                                                </div>
                                          </div>
                                          {vm.app.tenantId && (
                                                <div>
                                                      <span className="text-xs text-muted-foreground">{t("oauthApps.tenantScoped") || "Tenant"}:</span>
                                                      <Badge variant="outline" className="ms-2 text-xs">{vm.app.tenantId}</Badge>
                                                </div>
                                          )}
                                    </div>
                              )}

                              {/* ─── Danger Zone ─────────────────── */}
                              {!vm.isCreateMode && (
                                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-4 space-y-3">
                                          <h3 className="text-sm font-medium text-red-700 dark:text-red-400">
                                                {t("common.dangerZone") || "Danger Zone"}
                                          </h3>
                                          <p className="text-xs text-red-600/80 dark:text-red-400/70">
                                                {t("oauthApps.deleteWarning") || "Deleting this application will revoke all tokens and break existing integrations. This cannot be undone."}
                                          </p>
                                          <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                      <Button variant="destructive" size="sm" disabled={vm.isDeleting}>
                                                            {vm.isDeleting ? (
                                                                  <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                                                            ) : (
                                                                  <Trash2 className="h-4 w-4 me-1.5" />
                                                            )}
                                                            {t("oauthApps.deleteButton") || "Delete Application"}
                                                      </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                      <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                  {t("oauthApps.deleteConfirmTitle") || "Delete OAuth Application"}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                  {t("oauthApps.deleteConfirmDesc") || "This will permanently delete this OAuth application, revoke all active tokens, and break all existing integrations. This action cannot be undone."}
                                                            </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                            <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                  onClick={vm.deleteApp}
                                                                  className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                  {t("common.delete") || "Delete"}
                                                            </AlertDialogAction>
                                                      </AlertDialogFooter>
                                                </AlertDialogContent>
                                          </AlertDialog>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
