/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
/**
 * Identity Provider Detail ViewModel
 *
 * Manages form state for creating/editing a single Identity Provider.
 * Handles fetch-by-ID, save (create/update), test connection, and delete.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { identityContainer } from "@modules/identity/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { TestConnectionResult } from "../../domain/entities/IdentityProvider";
import { identityProviderKeys } from "./useIdentityProvidersViewModel";
import { isSudoCancelledError } from "../utils/sudoCancellation";

// ─── Form State ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for identity provider form state.
 */
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
  trustIdpMfa: boolean;

  // Optimistic Concurrency
  rowVersion: string | null;

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
  enabledForAdmins: true,
  enabledForUsers: true,
  trustIdpMfa: false,
  rowVersion: null,
  claimMappingJson: "{}",
  authorizationEndpoint: "",
  tokenEndpoint: "",
  userInformationEndpoint: "",
  samlIdpEntityId: "",
  samlSsoUrl: "",
  samlCertificate: "",
};

const PROTOCOL_OPTIONS = [
  { value: "oidc", label: "OpenID Connect (OIDC)" },
  { value: "oauth2", label: "OAuth 2.0" },
  { value: "saml", label: "SAML 2.0" },
];

function isConcurrencyConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: unknown; response?: { status?: unknown }; details?: { statusCode?: unknown; status?: unknown } };
  return (
    err.status === 409 ||
    err.response?.status === 409 ||
    err.details?.statusCode === 409 ||
    err.details?.status === 409
  );
}

// ─── Hook ─────────────────────────────────────────────────────────
/**
 * React hook/ViewModel orchestrating state and data flows for identity provider detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useIdentityProviderDetailViewModel(providerId?: string) {
  const { identityProviderRepository } = identityContainer;
  const { t } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();

  const isCreateMode = !providerId;

  const [form, setForm] = useState<IdentityProviderFormState>(DEFAULT_STATE);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [lastTestResult, setLastTestResult] = useState<TestConnectionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

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

  // Populate form on initial load or sync updated rowVersion when clean / refreshed.
  const [initializedForId, setInitializedForId] = useState<string | undefined>(undefined);
  const [syncedRowVersion, setSyncedRowVersion] = useState<string | null>(null);
  const providerRowVersion = provider?.rowVersion ?? null;
  if (provider && (initializedForId !== providerId || (!isDirty && syncedRowVersion !== providerRowVersion))) {
    setInitializedForId(providerId);
    setSyncedRowVersion(providerRowVersion);
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
      trustIdpMfa: provider.trustIdpMfa,
      rowVersion: provider.rowVersion ?? null,
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

  // ─── Apply template (gallery preset) ──────────
  const applyTemplate = useCallback(
    (templateId: string, preset: Partial<IdentityProviderFormState>) => {
      setSelectedTemplateId((prev) => (prev === templateId ? undefined : templateId));
      setForm((prev) => ({ ...prev, ...preset }));
      setIsDirty(true);
    },
    []
  );

  // ─── Save (Create / Update) ──────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmedSecret = form.clientSecret.trim();
      const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        protocol: form.protocol,
        authority: form.authority || undefined,
        clientId: form.clientId || undefined,
        ...(trimmedSecret ? { clientSecret: trimmedSecret } : {}),
        scopes: form.scopes || undefined,
        redirectUri: form.redirectUri || undefined,
        claimMappingJson: form.claimMappingJson || undefined,
        enabledForAdmins: form.enabledForAdmins,
        enabledForUsers: form.enabledForUsers,
        isActive: form.isActive,
        trustIdpMfa: form.trustIdpMfa,
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
        const rowVersion = form.rowVersion ?? provider?.rowVersion ?? undefined;
        await identityProviderRepository.update(providerId!, {
          ...(payload as Record<string, unknown>),
          ...(rowVersion ? { rowVersion } : {}),
        } as any);
        return null;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: identityProviderKeys.all });
      setIsDirty(false);
      if (isCreateMode && result) {
        success({
          title: t("identityProviders.created"),
          description: t("identityProviders.createdDesc"),
        });
        router.push(`/settings/identity-providers/${result.id}`);
      } else {
        success({
          title: t("identityProviders.updated"),
          description: t("identityProviders.updatedDesc"),
        });
        // Refetch detail so rowVersion rotates to latest server token
        queryClient.invalidateQueries({ queryKey: identityProviderKeys.detail(providerId!) });
      }
    },
    onError: (err: Error) => {
      if (isSudoCancelledError(err)) return;
      if (!isCreateMode && providerId && isConcurrencyConflict(err)) {
        setInitializedForId(undefined);
        void queryClient.invalidateQueries({ queryKey: identityProviderKeys.detail(providerId) });
        void queryClient.invalidateQueries({ queryKey: identityProviderKeys.all });
        toastError({
          title: t("common.error"),
          description: t("identityProviders.concurrencyConflict"),
        });
        return;
      }
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ─── Test Connection ──────────────────────────
  const testMutation = useMutation({
    mutationFn: () => identityProviderRepository.testConnection(providerId!),
    onMutate: () => {
      setTestError(null);
    },
    onSuccess: (result) => {
      setLastTestResult(result);
      if (result.isSuccess) {
        success({
          title: t("identityProviders.testSuccess"),
          description: result.message || t("identityProviders.testSuccess"),
        });
      } else {
        toastError({
          title: t("identityProviders.testFailed"),
          description: result.message || t("identityProviders.testFailed"),
        });
      }
    },
    onError: (err: Error) => {
      if (isSudoCancelledError(err)) return;
      setLastTestResult(null);
      setTestError(err.message);
      toastError({
        title: t("common.error"),
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
        title: t("identityProviders.deleted"),
        description: t("identityProviders.deletedDesc"),
      });
      router.push("/settings/identity-providers");
    },
    onError: (err: Error) => {
      if (isSudoCancelledError(err)) return;
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // ─── Auto-generate slug from name ─────────────
  const formName = form.name;
  const autoGenerateSlug = useCallback(() => {
    if (isCreateMode && formName && !isDirty) {
      const slug = formName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [formName, isCreateMode, isDirty]);

  return {
    // Mode
    isCreateMode,
    isLoading,
    fetchError,
    provider,

    // Form
    form,
    updateField,
    applyTemplate,
    selectedTemplateId,
    isDirty,
    protocolOptions: PROTOCOL_OPTIONS,
    autoGenerateSlug,

    // Actions
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,
    testConnection: () => testMutation.mutate(),
    isTesting: testMutation.isPending,
    lastTestResult,
    testError,
    clearTestDiagnostics: () => {
      setLastTestResult(null);
      setTestError(null);
    },
    deleteProvider: () => deleteMutation.mutate(),
    isDeleting: deleteMutation.isPending,

    // Navigation
    goBack: () => router.push("/settings/identity-providers"),

    t,
  };
}
