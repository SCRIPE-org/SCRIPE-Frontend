/**
 * Identity Provider Detail ViewModel
 *
 * Manages form state for creating/editing a single Identity Provider.
 * Handles fetch-by-ID, save (create/update), test connection, and delete.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { systemContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityProviderKeys } from "./useIdentityProvidersViewModel";

// ─── Form State ──────────────────────────────────────────────────
export interface IdentityProviderFormState {
  // General
  name: string;
  slug: string;
  protocol: string;
  displayOrder: number;
  isActive: boolean;

  // OIDC Configuration
  authority: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUri: string;

  // Appearance
  iconUrl: string;
  buttonColor: string;
  buttonLabel: string;

  // Access Control
  enabledForAdmins: boolean;
  enabledForUsers: boolean;

  // Claim Mappings
  claimMappingJson: string;

  // Explicit Endpoints (Optional)
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInformationEndpoint?: string;

  // SAML Configuration (Optional)
  samlIdpEntityId?: string;
  samlSsoUrl?: string;
  samlCertificate?: string;
}

const DEFAULT_STATE: IdentityProviderFormState = {
  name: "",
  slug: "",
  protocol: "oidc",
  displayOrder: 0,
  isActive: true,
  authority: "",
  clientId: "",
  clientSecret: "",
  scopes: "openid profile email",
  redirectUri: "",
  iconUrl: "",
  buttonColor: "#4285F4",
  buttonLabel: "",
  enabledForAdmins: false,
  enabledForUsers: true,
  claimMappingJson: "{}",
  authorizationEndpoint: "",
  tokenEndpoint: "",
  userInformationEndpoint: "",
  samlIdpEntityId: "",
  samlSsoUrl: "",
  samlCertificate: "",
};

// ─── Hook ─────────────────────────────────────────────────────────
export function useIdentityProviderDetailViewModel(providerId?: string) {
  const { identityProviderRepository } = systemContainer;
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  const isCreateMode = !providerId;

  const [form, setForm] = useState<IdentityProviderFormState>(DEFAULT_STATE);
  const [isDirty, setIsDirty] = useState(false);

  // ─── Fetch existing provider ──────────────────
  const {
    data: provider,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: identityProviderKeys.detail(providerId ?? ""),
    queryFn: () => identityProviderRepository.getById(providerId!),
    enabled: !!providerId,
  });

  // Populate form when provider data arrives (render-time state-sync)
  const [prevProvider, setPrevProvider] = useState(provider);
  if (provider && provider !== prevProvider) {
    setPrevProvider(provider);
    setForm({
      name: provider.name,
      slug: provider.slug,
      protocol: provider.protocol,
      displayOrder: provider.displayOrder,
      isActive: provider.isActive,
      authority: provider.authority ?? "",
      clientId: provider.clientId ?? "",
      clientSecret: "", // never pre-fill secret
      scopes: provider.scopes ?? "openid profile email",
      redirectUri: provider.redirectUri ?? "",
      iconUrl: provider.iconUrl ?? "",
      buttonColor: provider.buttonColor ?? "#4285F4",
      buttonLabel: provider.buttonLabel ?? "",
      enabledForAdmins: provider.enabledForAdmins,
      enabledForUsers: provider.enabledForUsers,
      claimMappingJson: provider.claimMappingJson ?? "{}",
      authorizationEndpoint: provider.authorizationEndpoint ?? "",
      tokenEndpoint: provider.tokenEndpoint ?? "",
      userInformationEndpoint: provider.userInformationEndpoint ?? "",
      samlIdpEntityId: provider.samlIdpEntityId ?? "",
      samlSsoUrl: provider.samlSsoUrl ?? "",
      samlCertificate: provider.samlCertificate ?? "",
    });
    setIsDirty(false);
  }

  // ─── Field updater ────────────────────────────
  const updateField = useCallback(
    <K extends keyof IdentityProviderFormState>(field: K, value: IdentityProviderFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    },
    []
  );

  // ─── Save (Create / Update) ──────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        protocol: form.protocol,
        authority: form.authority || undefined,
        clientId: form.clientId || undefined,
        clientSecret: form.clientSecret || undefined,
        scopes: form.scopes || undefined,
        redirectUri: form.redirectUri || undefined,
        claimMappingJson: form.claimMappingJson || undefined,
        enabledForAdmins: form.enabledForAdmins,
        enabledForUsers: form.enabledForUsers,
        iconUrl: form.iconUrl || undefined,
        buttonColor: form.buttonColor || undefined,
        buttonLabel: form.buttonLabel || undefined,
        displayOrder: form.displayOrder,
        authorizationEndpoint: form.authorizationEndpoint || undefined,
        tokenEndpoint: form.tokenEndpoint || undefined,
        userInformationEndpoint: form.userInformationEndpoint || undefined,
        samlIdpEntityId: form.samlIdpEntityId || undefined,
        samlSsoUrl: form.samlSsoUrl || undefined,
        samlCertificate: form.samlCertificate || undefined,
      };

      if (isCreateMode) {
        const result = await identityProviderRepository.create(payload as any);
        return result;
      } else {
        await identityProviderRepository.update(providerId!, payload as any);
        return null;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: identityProviderKeys.all });
      setIsDirty(false);
      if (isCreateMode && result) {
        success({
          title: t("identityProviders.created") || "Provider Created",
          description:
            t("identityProviders.createdDesc") || "Identity provider created successfully.",
        });
        router.push(`/settings/identity-providers/${result.id}`);
      } else {
        success({
          title: t("identityProviders.updated") || "Provider Updated",
          description:
            t("identityProviders.updatedDesc") || "Identity provider updated successfully.",
        });
        // Refetch detail
        queryClient.invalidateQueries({ queryKey: identityProviderKeys.detail(providerId!) });
      }
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ─── Test Connection ──────────────────────────
  const testMutation = useMutation({
    mutationFn: () => identityProviderRepository.testConnection(providerId!),
    onSuccess: (result) => {
      if (result.isSuccess) {
        success({
          title: t("identityProviders.testSuccess") || "Connection Successful",
          description: result.message || "Provider is reachable.",
        });
      } else {
        toastError({
          title: t("identityProviders.testFailed") || "Connection Failed",
          description: result.message || "Could not reach the provider.",
        });
      }
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
    mutationFn: () => identityProviderRepository.remove(providerId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: identityProviderKeys.all });
      success({
        title: t("identityProviders.deleted") || "Provider Deleted",
        description: t("identityProviders.deletedDesc") || "Identity provider deleted.",
      });
      router.push("/settings/identity-providers");
    },
    onError: (err: Error) => {
      toastError({
        title: t("common.error") || "Error",
        description: err.message,
      });
    },
  });

  // ─── Auto-generate slug from name ─────────────
  const autoGenerateSlug = useCallback(() => {
    if (isCreateMode && form.name && !isDirty) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.name, isCreateMode, isDirty]);

  // ─── Protocol options ─────────────────────────
  const protocolOptions = useMemo(
    () => [
      { value: "oidc", label: "OpenID Connect (OIDC)" },
      { value: "oauth2", label: "OAuth 2.0" },
      { value: "saml", label: "SAML" },
    ],
    []
  );

  return {
    // Mode
    isCreateMode,
    isLoading,
    fetchError,
    provider,

    // Form
    form,
    updateField,
    isDirty,
    protocolOptions,
    autoGenerateSlug,

    // Actions
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,
    testConnection: () => testMutation.mutate(),
    isTesting: testMutation.isPending,
    deleteProvider: () => deleteMutation.mutate(),
    isDeleting: deleteMutation.isPending,

    // Navigation
    goBack: () => router.push("/settings/identity-providers"),

    t,
  };
}
