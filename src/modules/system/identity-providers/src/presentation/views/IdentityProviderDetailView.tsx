/**
 * Identity Provider Detail View
 *
 * Full-page detail/edit/create view for a single Identity Provider.
 * Uses sectioned form layout with all configuration options.
 */
"use client";

import { useIdentityProviderDetailViewModel } from "../viewmodels/useIdentityProviderDetailViewModel";
import {
      GeneralSection,
      OidcConfigSection,
      Oauth2ConfigSection,
      SamlConfigSection,
      ExplicitEndpointsSection,
      AppearanceSection,
      AccessControlSection,
      ClaimMappingsSection,
} from "../components/IdentityProviderFormSections";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import {
      ArrowLeft,
      Save,
      Loader2,
      Zap,
      Trash2,
      Fingerprint,
      Clock,
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
      providerId?: string;
}

export function IdentityProviderDetailView({ providerId }: Props) {
      const vm = useIdentityProviderDetailViewModel(providerId);
      const { t } = useI18n();

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
            protocolOptions: vm.protocolOptions,
            isCreateMode: vm.isCreateMode,
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
                                    {vm.form.iconUrl ? (
                                          <img
                                                src={vm.form.iconUrl}
                                                alt={vm.form.name}
                                                className="h-9 w-9 rounded-lg object-contain border p-1"
                                          />
                                    ) : (
                                          <div className="h-9 w-9 rounded-lg border flex items-center justify-center bg-muted/50">
                                                <Fingerprint className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                    )}
                                    <div>
                                          <h1 className="text-xl font-semibold tracking-tight">
                                                {vm.isCreateMode
                                                      ? (t("identityProviders.createTitle") || "New Identity Provider")
                                                      : vm.form.name || (t("identityProviders.editTitle") || "Edit Provider")}
                                          </h1>
                                          {!vm.isCreateMode && vm.form.slug && (
                                                <p className="text-sm text-muted-foreground font-mono">{vm.form.slug}</p>
                                          )}
                                    </div>
                              </div>
                        </div>

                        <div className="flex items-center gap-2 ms-12 sm:ms-0">
                              {/* Test Connection */}
                              {!vm.isCreateMode && (
                                    <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={vm.testConnection}
                                          disabled={vm.isTesting}
                                    >
                                          {vm.isTesting ? (
                                                <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                                          ) : (
                                                <Zap className="h-4 w-4 me-1.5" />
                                          )}
                                          {t("identityProviders.testConnection") || "Test Connection"}
                                    </Button>
                              )}

                              {/* Save */}
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
                                          ? (t("identityProviders.createButton") || "Create Provider")
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

                  {/* ─── Form Sections ─────────────────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                              <GeneralSection {...sectionProps} />

                              {vm.form.protocol === "oidc" && <OidcConfigSection {...sectionProps} />}
                              {vm.form.protocol === "oauth2" && <Oauth2ConfigSection {...sectionProps} />}
                              {vm.form.protocol === "saml" && <SamlConfigSection {...sectionProps} />}

                              {vm.form.protocol !== "saml" && <ExplicitEndpointsSection {...sectionProps} />}
                              {vm.form.protocol !== "saml" && <ClaimMappingsSection {...sectionProps} />}
                        </div>
                        <div className="space-y-6">
                              <AppearanceSection {...sectionProps} />
                              <AccessControlSection {...sectionProps} />

                              {/* ─── Metadata Card ─────────────────── */}
                              {!vm.isCreateMode && vm.provider && (
                                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {t("identityProviders.metadata") || "Information"}
                                          </h3>
                                          <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                      <span className="text-muted-foreground">{t("common.createdAt") || "Created"}:</span>
                                                      <p className="font-medium">
                                                            {vm.provider.createdAt
                                                                  ? format(new Date(vm.provider.createdAt), "MMM d, yyyy HH:mm")
                                                                  : "—"}
                                                      </p>
                                                </div>
                                                <div>
                                                      <span className="text-muted-foreground">{t("common.modifiedAt") || "Last modified"}:</span>
                                                      <p className="font-medium">
                                                            {vm.provider.modifiedAt
                                                                  ? format(new Date(vm.provider.modifiedAt), "MMM d, yyyy HH:mm")
                                                                  : "—"}
                                                      </p>
                                                </div>
                                                <div>
                                                      <span className="text-muted-foreground">{t("identityProviders.protocol") || "Protocol"}:</span>
                                                      <p className="font-medium">{vm.provider.protocolLabel}</p>
                                                </div>
                                                <div>
                                                      <span className="text-muted-foreground">{t("identityProviders.scope") || "Scope"}:</span>
                                                      <p className="font-medium">{vm.provider.scopeLabel}</p>
                                                </div>
                                          </div>
                                          {vm.provider.tenantId && (
                                                <div>
                                                      <span className="text-xs text-muted-foreground">{t("identityProviders.tenantScoped") || "Tenant-scoped"}:</span>
                                                      <Badge variant="outline" className="ms-2 text-xs">{vm.provider.tenantId}</Badge>
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
                                                {t("identityProviders.deleteWarning") || "Deleting this provider will permanently remove it. Users who signed in via this provider will lose SSO access."}
                                          </p>
                                          <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                      <Button variant="destructive" size="sm" disabled={vm.isDeleting}>
                                                            {vm.isDeleting ? (
                                                                  <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
                                                            ) : (
                                                                  <Trash2 className="h-4 w-4 me-1.5" />
                                                            )}
                                                            {t("identityProviders.deleteButton") || "Delete Provider"}
                                                      </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                      <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                  {t("identityProviders.deleteConfirmTitle") || "Delete Identity Provider"}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                  {t("identityProviders.deleteConfirmDesc") || "This will permanently remove this identity provider. Users linked via this provider will lose SSO access. This action cannot be undone."}
                                                            </AlertDialogDescription>
                                                      </AlertDialogHeader>
                                                      <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                  {t("common.cancel") || "Cancel"}
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                  onClick={vm.deleteProvider}
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
