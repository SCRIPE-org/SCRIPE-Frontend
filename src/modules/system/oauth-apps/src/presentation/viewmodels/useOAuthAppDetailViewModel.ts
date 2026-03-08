/**
 * OAuth App Detail ViewModel
 *
 * Manages form state for creating/editing a single OAuth Application.
 * Handles fetch-by-ID, save (create/update), regenerate secret, and delete.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { oauthAppKeys } from "./useOAuthAppsViewModel";

// ─── Form State ──────────────────────────────────────────────────
export interface OAuthAppFormState {
      // General
      displayName: string;
      description: string;
      clientType: string;
      isActive: boolean;

      // Endpoints
      redirectUris: string[];
      postLogoutRedirectUris: string[];

      // Scopes & Grants
      allowedScopes: string;
      allowedGrantTypes: string;

      // Security
      requirePkce: boolean;
      requireConsent: boolean;

      // Token Configuration
      accessTokenLifetimeMinutes: number;
      refreshTokenLifetimeDays: number;

      // Branding
      logoUri: string;

      // SAML Configuration (Optional)
      samlAcsUrl?: string;
      samlSpEntityId?: string;
}

const DEFAULT_STATE: OAuthAppFormState = {
      displayName: "",
      description: "",
      clientType: "confidential",
      isActive: true,
      redirectUris: [""],
      postLogoutRedirectUris: [],
      allowedScopes: "openid profile email",
      allowedGrantTypes: "authorization_code",
      requirePkce: true,
      requireConsent: true,
      accessTokenLifetimeMinutes: 60,
      refreshTokenLifetimeDays: 14,
      logoUri: "",
      samlAcsUrl: "",
      samlSpEntityId: "",
};

// ─── Hook ─────────────────────────────────────────────────────────
export function useOAuthAppDetailViewModel(appId?: string) {
      const { oauthAppRepository } = systemContainer;
      const { t } = useI18n();
      const router = useRouter();
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      const isCreateMode = !appId;

      const [form, setForm] = useState<OAuthAppFormState>(DEFAULT_STATE);
      const [isDirty, setIsDirty] = useState(false);

      // Track generated secret (one-time display)
      const [generatedSecret, setGeneratedSecret] = useState<{
            clientId: string;
            secret: string;
      } | null>(null);

      // ─── Fetch existing app ───────────────────────
      const {
            data: app,
            isLoading,
            error: fetchError,
      } = useQuery({
            queryKey: oauthAppKeys.detail(appId ?? ""),
            queryFn: () => oauthAppRepository.getById(appId!),
            enabled: !!appId,
      });

      // Populate form when app data arrives
      useEffect(() => {
            if (app) {
                  setForm({
                        displayName: app.displayName,
                        description: app.description ?? "",
                        clientType: app.clientType,
                        isActive: app.isActive,
                        redirectUris: app.redirectUris.length > 0 ? app.redirectUris : [""],
                        postLogoutRedirectUris: app.postLogoutRedirectUris,
                        allowedScopes: app.allowedScopes,
                        allowedGrantTypes: app.allowedGrantTypes,
                        requirePkce: app.requirePkce,
                        requireConsent: app.requireConsent,
                        accessTokenLifetimeMinutes: app.accessTokenLifetimeMinutes,
                        refreshTokenLifetimeDays: app.refreshTokenLifetimeDays,
                        logoUri: app.logoUri ?? "",
                        samlAcsUrl: app.samlAcsUrl ?? "",
                        samlSpEntityId: app.samlSpEntityId ?? "",
                  });
                  setIsDirty(false);
            }
      }, [app]);

      // ─── Field updater ────────────────────────────
      const updateField = useCallback(
            <K extends keyof OAuthAppFormState>(
                  field: K,
                  value: OAuthAppFormState[K],
            ) => {
                  setForm((prev) => ({ ...prev, [field]: value }));
                  setIsDirty(true);
            },
            [],
      );

      // ─── URI helpers ──────────────────────────────
      const addRedirectUri = useCallback(() => {
            setForm((prev) => ({ ...prev, redirectUris: [...prev.redirectUris, ""] }));
            setIsDirty(true);
      }, []);

      const removeRedirectUri = useCallback((index: number) => {
            setForm((prev) => ({
                  ...prev,
                  redirectUris: prev.redirectUris.filter((_, i) => i !== index),
            }));
            setIsDirty(true);
      }, []);

      const updateRedirectUri = useCallback((index: number, value: string) => {
            setForm((prev) => ({
                  ...prev,
                  redirectUris: prev.redirectUris.map((uri, i) => (i === index ? value : uri)),
            }));
            setIsDirty(true);
      }, []);

      const addPostLogoutUri = useCallback(() => {
            setForm((prev) => ({
                  ...prev,
                  postLogoutRedirectUris: [...prev.postLogoutRedirectUris, ""],
            }));
            setIsDirty(true);
      }, []);

      const removePostLogoutUri = useCallback((index: number) => {
            setForm((prev) => ({
                  ...prev,
                  postLogoutRedirectUris: prev.postLogoutRedirectUris.filter((_, i) => i !== index),
            }));
            setIsDirty(true);
      }, []);

      const updatePostLogoutUri = useCallback((index: number, value: string) => {
            setForm((prev) => ({
                  ...prev,
                  postLogoutRedirectUris: prev.postLogoutRedirectUris.map((uri, i) =>
                        i === index ? value : uri,
                  ),
            }));
            setIsDirty(true);
      }, []);

      // ─── Save (Create / Update) ──────────────────
      const saveMutation = useMutation({
            mutationFn: async () => {
                  const cleanUris = form.redirectUris.filter((u) => u.trim() !== "");
                  const cleanPostLogoutUris = form.postLogoutRedirectUris.filter((u) => u.trim() !== "");

                  if (isCreateMode) {
                        const result = await oauthAppRepository.create({
                              displayName: form.displayName,
                              clientType: form.clientType,
                              redirectUris: cleanUris,
                              postLogoutRedirectUris: cleanPostLogoutUris.length > 0 ? cleanPostLogoutUris : undefined,
                              allowedScopes: form.allowedScopes || undefined,
                              allowedGrantTypes: form.allowedGrantTypes || undefined,
                              requireConsent: form.requireConsent,
                              requirePkce: form.requirePkce,
                              logoUri: form.logoUri || undefined,
                              description: form.description || undefined,
                              accessTokenLifetimeMinutes: form.accessTokenLifetimeMinutes,
                              refreshTokenLifetimeDays: form.refreshTokenLifetimeDays,
                              samlAcsUrl: form.samlAcsUrl || undefined,
                              samlSpEntityId: form.samlSpEntityId || undefined,
                        });
                        return result;
                  } else {
                        await oauthAppRepository.update(appId!, {
                              displayName: form.displayName,
                              redirectUris: cleanUris,
                              postLogoutRedirectUris: cleanPostLogoutUris,
                              allowedScopes: form.allowedScopes || undefined,
                              allowedGrantTypes: form.allowedGrantTypes || undefined,
                              requireConsent: form.requireConsent,
                              requirePkce: form.requirePkce,
                              logoUri: form.logoUri || undefined,
                              description: form.description || undefined,
                              accessTokenLifetimeMinutes: form.accessTokenLifetimeMinutes,
                              refreshTokenLifetimeDays: form.refreshTokenLifetimeDays,
                              samlAcsUrl: form.samlAcsUrl || undefined,
                              samlSpEntityId: form.samlSpEntityId || undefined,
                        });
                        return null;
                  }
            },
            onSuccess: (result) => {
                  queryClient.invalidateQueries({ queryKey: oauthAppKeys.all });
                  setIsDirty(false);
                  if (isCreateMode && result) {
                        success({
                              title: t("oauthApps.created") || "Application Created",
                              description: t("oauthApps.createdDesc") || "OAuth application created successfully.",
                        });
                        router.push(`/settings/oauth-apps/${result.id}`);
                  } else {
                        success({
                              title: t("oauthApps.updated") || "Application Updated",
                              description: t("oauthApps.updatedDesc") || "OAuth application updated successfully.",
                        });
                        queryClient.invalidateQueries({ queryKey: oauthAppKeys.detail(appId!) });
                  }
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error") || "Error",
                        description: err.message,
                  });
            },
      });

      // ─── Regenerate Secret ────────────────────────
      const regenerateSecretMutation = useMutation({
            mutationFn: () => oauthAppRepository.regenerateSecret(appId!),
            onSuccess: (result) => {
                  setGeneratedSecret({
                        clientId: result.clientId,
                        secret: result.newClientSecret,
                  });
                  queryClient.invalidateQueries({ queryKey: oauthAppKeys.all });
                  success({
                        title: t("oauthApps.secretRegenerated") || "Secret Regenerated",
                        description: t("oauthApps.secretRegeneratedDesc") || "Copy the new secret now — it won't be shown again.",
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error") || "Error",
                        description: err.message,
                  });
            },
      });

      // ─── Delete ───────────────────────────────────
      const deleteMutation = useMutation({
            mutationFn: () => oauthAppRepository.remove(appId!),
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: oauthAppKeys.all });
                  success({
                        title: t("oauthApps.deleted") || "Application Deleted",
                        description: t("oauthApps.deletedDesc") || "OAuth application deleted.",
                  });
                  router.push("/settings/oauth-apps");
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error") || "Error",
                        description: err.message,
                  });
            },
      });

      // ─── Client Type options ──────────────────────
      const clientTypeOptions = useMemo(
            () => [
                  { value: "confidential", label: t("oauthApps.confidential") || "Confidential (Server-Side)" },
                  { value: "public", label: t("oauthApps.public") || "Public (SPA / Mobile)" },
            ],
            [t],
      );

      // ─── Standard scope/grant chip options ────────
      const standardScopes = useMemo(
            () => ["openid", "profile", "email", "address", "phone", "offline_access"],
            [],
      );

      const standardGrantTypes = useMemo(
            () => ["authorization_code", "refresh_token", "client_credentials", "implicit", "device_code"],
            [],
      );

      return {
            // Mode
            isCreateMode,
            isLoading,
            fetchError,
            app,

            // Form
            form,
            updateField,
            isDirty,
            clientTypeOptions,
            standardScopes,
            standardGrantTypes,

            // URI helpers
            addRedirectUri,
            removeRedirectUri,
            updateRedirectUri,
            addPostLogoutUri,
            removePostLogoutUri,
            updatePostLogoutUri,

            // Actions
            save: () => saveMutation.mutate(),
            isSaving: saveMutation.isPending,
            regenerateSecret: () => regenerateSecretMutation.mutate(),
            isRegenerating: regenerateSecretMutation.isPending,
            generatedSecret,
            clearGeneratedSecret: () => setGeneratedSecret(null),
            deleteApp: () => deleteMutation.mutate(),
            isDeleting: deleteMutation.isPending,

            // Navigation
            goBack: () => router.push("/settings/oauth-apps"),

            t,
      };
}
