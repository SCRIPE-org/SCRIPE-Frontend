/**
 * Tenant Settings ViewModel
 *
 * Manages state for fetching and updating tenant settings.
 * Handles granular updates (security, quotas, branding) via single endpoint.
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@/modules/identity/di";
import type {
  TenantSettingsModel,
  UpdateTenantSettingsRequest,
} from "@/modules/identity/tenant-settings/src/domain/types/SettingsTypes";
import { useState } from "react";

export interface UseTenantSettingsViewModelResult {
  settings: TenantSettingsModel | undefined;
  isLoading: boolean;
  error: Error | null;

  // Edit Dialog State
  editSection: "security" | "audit" | "branding" | null;
  setEditSection: (section: "security" | "audit" | "branding" | null) => void;

  // Update Actions
  updateSettings: (data: UpdateTenantSettingsRequest) => void;
  isUpdating: boolean;

  permissionsOpen: boolean;
  setPermissionsOpen: (open: boolean) => void;

  uploadLogo: (file: File) => Promise<string>;
}

export function useTenantSettingsViewModel(tenantId: string): UseTenantSettingsViewModelResult {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editSection, setEditSection] = useState<
    "security" | "audit" | "branding" | null
  >(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  // Fetch Settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tenant-settings", tenantId],
    queryFn: async () => {
      return systemContainer.tenantService.getSettings(tenantId);
    },
    enabled: !!tenantId,
  });

  // Update Settings
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateTenantSettingsRequest) => {
      await systemContainer.tenantService.updateSettings(tenantId, data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success") || "Success",
        description: t("tenant.settingsSaved") || "Settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tenant-settings", tenantId] });
      setEditSection(null);
    },
    onError: (err: Error) => {
      toast({
        title: t("common.error") || "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error: error as Error | null,
    editSection,
    setEditSection,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    // Permissions Dialog State
    permissionsOpen,
    setPermissionsOpen,

    // Logo Upload
    uploadLogo: async (file: File) => {
      try {
        const result = await systemContainer.tenantService.uploadLogo(tenantId, file);
        toast({
          title: t("common.success") || "Success",
          description: t("tenant.settingsSaved") || "Settings updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["tenant-settings", tenantId] });
        return result.url;
      } catch (err: any) {
        toast({
          title: t("common.error") || "Error",
          description: err.message,
          variant: "destructive",
        });
        throw err;
      }
    },
  };
}
