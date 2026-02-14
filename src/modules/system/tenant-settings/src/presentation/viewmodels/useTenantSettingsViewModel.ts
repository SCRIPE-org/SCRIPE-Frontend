"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import type { TenantSettings } from "../../domain/entities/TenantSettings";
import { DEFAULT_TENANT_SETTINGS } from "../../domain/entities/TenantSettings";

// Query keys factory
export const tenantSettingsKeys = {
  all: ["tenantSettings"] as const,
  my: () => [...tenantSettingsKeys.all, "my"] as const,
};

/**
 * ViewModel for the My Tenant Settings page
 * Handles fetching and updating tenant settings via repository
 */
export function useTenantSettingsViewModel() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TenantSettings | null>(null);

  // Get repository from system DI container
  const tenantSettingsRepository = systemContainer.tenantSettingsRepository;

  // Fetch settings via repository
  const {
    data: settings,
    isLoading,
    error,
    isError,
  } = useQuery<TenantSettings, Error>({
    queryKey: tenantSettingsKeys.my(),
    queryFn: async () => {
      const result = await tenantSettingsRepository.getMySettings();
      if (result.kind === "err") {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize form when data loads
  const effectiveSettings = formData ?? settings ?? DEFAULT_TENANT_SETTINGS;

  // Update field helper
  const updateField = <K extends keyof TenantSettings>(field: K, value: TenantSettings[K]) => {
    setFormData((prev) => ({
      ...(prev ?? settings ?? DEFAULT_TENANT_SETTINGS),
      [field]: value,
    }));
  };

  // Save mutation via repository
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<TenantSettings>) => {
      const result = await tenantSettingsRepository.updateMySettings(data);
      if (result.kind === "err") {
        throw result.error;
      }
    },
    onSuccess: () => {
      toast({
        title: t("tenantSettings.saveSuccess"),
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: tenantSettingsKeys.my() });
      setFormData(null); // Reset to server state
    },
    onError: (error: Error) => {
      toast({
        title: t("tenantSettings.saveError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if there are unsaved changes
  const hasChanges = formData !== null;

  // Save handler
  const saveSettings = () => {
    if (formData) {
      saveMutation.mutate(formData);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(null);
  };

  // Check if system admin (no tenant)
  const isSystemAdmin = isError && error?.message?.includes("System administrators");

  return {
    // State
    settings: effectiveSettings,
    isLoading,
    isError,
    error,
    isSystemAdmin,

    // Form state
    hasChanges,
    updateField,
    resetForm,

    // Actions
    saveSettings,
    isSaving: saveMutation.isPending,

    // Translations
    t,
  };
}
