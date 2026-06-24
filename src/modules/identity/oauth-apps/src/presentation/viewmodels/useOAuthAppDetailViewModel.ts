// FILE-EXCEPTION: file length
/**
 * OAuth App Detail ViewModel
 *
 * Manages form state for creating/editing a single OAuth Application.
 * Handles fetch-by-ID, save (create/update), regenerate secret, and delete.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { identityContainer } from "@modules/identity/di";
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
  protocol: string; // Add protocol choice

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
  samlSpCertificate?: string;
}

const DEFAULT_STATE: OAuthAppFormState = {
  displayName: "",
  description: "",
  clientType: "confidential",
  isActive: true,
  protocol: "oidc",
  redirectUris: [""],
  postLogoutRedirectUris: [],
  allowedScopes: "openid profile email roles",
  allowedGrantTypes: "authorization_code",
  requirePkce: true,
  requireConsent: true,
  accessTokenLifetimeMinutes: 60,
  refreshTokenLifetimeDays: 14,
  logoUri: "",
  samlAcsUrl: "",
  samlSpEntityId: "",
  samlSpCertificate: "",
};

// ─── Hook ─────────────────────────────────────────────────────────
export function useOAuthAppDetailViewModel(appId?: string) {
  const { oauthAppRepository } = identityContainer;
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  const isCreateMode = !appId;

  const [form, setForm] = useState<OAuthAppFormState>(DEFAULT_STATE);
  const [isDirty, setIsDirty] = useState(false);

  // Track generated secret (one-time display)
  interface GeneratedSecret {
    id?: string;
    clientId: string;
    secret: string;
  }
  const [generatedSecret, setGeneratedSecret] = useState<GeneratedSecret | null>(null);

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

  // Populate form when app data arrives (render-time state-sync)
  const [prevApp, setPrevApp] = useState(app);
  if (app && app !== prevApp) {
    setPrevApp(app);
    setForm({
      displayName: app.displayName,
      description: app.description ?? "",
      clientType: app.clientType,
      isActive: app.isActive,
      protocol: app.protocol || "oidc",
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
      samlSpCertificate: app.samlSpCertificate ?? "",
    });
    setIsDirty(false);
  }

  // ─── Field updater ────────────────────────────
  const updateField = useCallback(
    <K extends keyof OAuthAppFormState>(field: K, value: OAuthAppFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    []
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
        i === index ? value : uri
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
          protocol: form.protocol,
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
          samlSpCertificate: form.samlSpCertificate || undefined,
        });
        return result;
      } else {
        await oauthAppRepository.update(appId!, {
          displayName: form.displayName,
          protocol: form.protocol,
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
          samlSpCertificate: form.samlSpCertificate || undefined,
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

        // If a secret was generated (confidential client), show the dialog instead of navigating away immediately
        if (result.clientSecret) {
          setGeneratedSecret({
            id: result.id,
            clientId: result.clientId,
            secret: result.clientSecret,
          });
          // Navigation happens in the clearGeneratedSecret callback in the view
        } else {
          router.push(`/settings/oauth-apps/${result.id}`);
        }
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
        description:
          t("oauthApps.secretRegeneratedDesc") ||
          "Copy the new secret now — it won't be shown again.",
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
    [t]
  );

  // ─── Standard scope/grant chip options ────────
  const standardScopes = useMemo(
    () => ["openid", "profile", "email", "address", "phone", "offline_access"],
    []
  );

  const standardGrantTypes = useMemo(
    () => ["authorization_code", "refresh_token", "client_credentials"],
    []
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
    clearGeneratedSecret: (redirectId?: string) => {
      setGeneratedSecret(null);
      if (redirectId) {
        router.push(`/settings/oauth-apps/${redirectId}`);
      }
    },
    deleteApp: () => deleteMutation.mutate(),
    isDeleting: deleteMutation.isPending,

    // Navigation
    goBack: () => router.push("/settings/oauth-apps"),

    t,
  };
}
