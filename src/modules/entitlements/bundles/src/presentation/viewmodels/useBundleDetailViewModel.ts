"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { getBaseApiService } from "@core/services/api-factory";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { Bundle } from "../../domain/entities/Bundle";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";

// Permission shape from the Identity Permissions API
export interface PermissionItem {
      id: string;
      resource: string;
      action: string;
      code: string;
      defaultScope: string;
      descriptionEn?: string;
      descriptionAr?: string;
      nameEn?: string;
      nameAr?: string;
      category?: string;
      displayOrder: number;
}

export interface BundleDetailViewModelResult {
      bundle: Bundle | undefined;
      isLoading: boolean;
      error: Error | null;

      // Available items for pickers
      allPermissions: PermissionItem[];
      allFeatures: Feature[];
      isLoadingPickers: boolean;

      // Current bundle's rules (codes/names for quick lookup)
      assignedPermCodes: Set<string>;
      assignedFeatNames: Set<string>;

      // Actions
      togglePermission: (code: string, mode: string) => void;
      removePermission: (code: string) => void;
      addFeatureRule: (featureName: string, value: string) => void;
      removeFeatureRule: (featureName: string) => void;

      isSaving: boolean;
}

export function useBundleDetailViewModel(bundleId: string): BundleDetailViewModelResult {
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { bundleRepository } = entitlementsContainer;
      const apiService = getBaseApiService();

      // ── Load bundle detail ──
      const {
            data: bundle,
            isLoading: isBundleLoading,
            error: bundleError,
      } = useQuery({
            queryKey: ["entitlements", "bundles", bundleId],
            queryFn: () => bundleRepository.getById(bundleId),
            enabled: !!bundleId,
      });

      // ── Load all permissions from Identity API ──
      const {
            data: allPermissions,
            isLoading: isPermissionsLoading,
      } = useQuery({
            queryKey: ["identity", "permissions", "all"],
            queryFn: () => apiService.get<PermissionItem[]>(API_ENDPOINTS.PERMISSIONS.LIST),
      });

      // ── Load all features from Entitlements API ──
      const {
            data: featuresResult,
            isLoading: isFeaturesLoading,
      } = useQuery({
            queryKey: ["entitlements", "features", "all"],
            queryFn: () => entitlementsContainer.featureRepository.getAll({ page: 1, pageSize: 1000 }),
      });

      // ── Derived sets for quick lookup ──
      const assignedPermCodes = useMemo(() => {
            const set = new Set<string>();
            bundle?.permissionRules?.forEach(r => set.add(r.permissionCode));
            return set;
      }, [bundle?.permissionRules]);

      const assignedFeatNames = useMemo(() => {
            const set = new Set<string>();
            bundle?.featureRules?.forEach(r => set.add(r.featureName));
            return set;
      }, [bundle?.featureRules]);

      // ── Mutation for updating rules ──
      const updateMutation = useMutation({
            mutationFn: async (data: {
                  permissionRules: { permissionCode: string; mode: string }[];
                  featureRules: { featureName: string; value: string }[];
            }) => {
                  await bundleRepository.update(bundleId, {
                        displayNameEn: bundle?.displayNameEn || "",
                        displayNameAr: bundle?.displayNameAr || "",
                        description: bundle?.description || "",
                        permissionRules: data.permissionRules,
                        featureRules: data.featureRules,
                  });
            },
            onSuccess: () => {
                  success({
                        title: "Bundle Updated",
                        description: "Bundle rules have been saved successfully.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "bundles", bundleId] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "bundles"] });
            },
            onError: (err) => {
                  toastError({
                        title: "Update Failed",
                        description: err instanceof Error ? err.message : "Failed to update bundle",
                  });
            },
      });

      // ── Actions ──
      const togglePermission = useCallback((code: string, mode: string) => {
            if (!bundle) return;
            const currentPerms = bundle.permissionRules.map(r => ({
                  permissionCode: r.permissionCode,
                  mode: r.mode,
            }));
            const currentFeats = bundle.featureRules.map(r => ({
                  featureName: r.featureName,
                  value: r.value,
            }));

            // If already assigned, remove it (toggle off)
            if (assignedPermCodes.has(code)) {
                  updateMutation.mutate({
                        permissionRules: currentPerms.filter(r => r.permissionCode !== code),
                        featureRules: currentFeats,
                  });
            } else {
                  // Add new
                  updateMutation.mutate({
                        permissionRules: [...currentPerms, { permissionCode: code, mode }],
                        featureRules: currentFeats,
                  });
            }
      }, [bundle, assignedPermCodes, updateMutation]);

      const removePermission = useCallback((code: string) => {
            if (!bundle) return;
            updateMutation.mutate({
                  permissionRules: bundle.permissionRules
                        .filter(r => r.permissionCode !== code)
                        .map(r => ({ permissionCode: r.permissionCode, mode: r.mode })),
                  featureRules: bundle.featureRules.map(r => ({
                        featureName: r.featureName,
                        value: r.value,
                  })),
            });
      }, [bundle, updateMutation]);

      const addFeatureRule = useCallback((featureName: string, value: string) => {
            if (!bundle) return;
            if (assignedFeatNames.has(featureName)) return;
            updateMutation.mutate({
                  permissionRules: bundle.permissionRules.map(r => ({
                        permissionCode: r.permissionCode,
                        mode: r.mode,
                  })),
                  featureRules: [
                        ...bundle.featureRules.map(r => ({
                              featureName: r.featureName,
                              value: r.value,
                        })),
                        { featureName, value },
                  ],
            });
      }, [bundle, assignedFeatNames, updateMutation]);

      const removeFeatureRule = useCallback((featureName: string) => {
            if (!bundle) return;
            updateMutation.mutate({
                  permissionRules: bundle.permissionRules.map(r => ({
                        permissionCode: r.permissionCode,
                        mode: r.mode,
                  })),
                  featureRules: bundle.featureRules
                        .filter(r => r.featureName !== featureName)
                        .map(r => ({ featureName: r.featureName, value: r.value })),
            });
      }, [bundle, updateMutation]);

      return {
            bundle,
            isLoading: isBundleLoading,
            error: bundleError as Error | null,
            allPermissions: allPermissions ?? [],
            allFeatures: featuresResult?.items ?? [],
            isLoadingPickers: isPermissionsLoading || isFeaturesLoading,
            assignedPermCodes,
            assignedFeatNames,
            togglePermission,
            removePermission,
            addFeatureRule,
            removeFeatureRule,
            isSaving: updateMutation.isPending,
      };
}
