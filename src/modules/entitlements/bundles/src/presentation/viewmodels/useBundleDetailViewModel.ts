"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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

// Local rule shapes for batch state
interface LocalPermRule {
      permissionCode: string;
      mode: string;
}
interface LocalFeatRule {
      featureName: string;
      value: string;
}

export interface BundleDetailViewModelResult {
      bundle: Bundle | undefined;
      isLoading: boolean;
      error: Error | null;

      // Available items for pickers
      allPermissions: PermissionItem[];
      allFeatures: Feature[];
      isLoadingPickers: boolean;

      // Local (pending) state for batch save
      pendingPermissions: LocalPermRule[];
      pendingFeatures: LocalFeatRule[];
      assignedPermCodes: Set<string>;
      assignedFeatNames: Set<string>;

      // Actions — modify LOCAL state only (no API calls)
      togglePermission: (code: string, mode: string) => void;
      removePermission: (code: string) => void;
      addFeatureRule: (featureName: string, value: string) => void;
      removeFeatureRule: (featureName: string) => void;

      // Batch save/discard
      save: () => void;
      discard: () => void;
      isDirty: boolean;
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

      // ── LOCAL state for batch save ──
      const [pendingPermissions, setPendingPermissions] = useState<LocalPermRule[]>([]);
      const [pendingFeatures, setPendingFeatures] = useState<LocalFeatRule[]>([]);
      const [serverPermissions, setServerPermissions] = useState<LocalPermRule[]>([]);
      const [serverFeatures, setServerFeatures] = useState<LocalFeatRule[]>([]);

      // Sync local state from server when bundle loads/changes
      useEffect(() => {
            if (bundle) {
                  const perms = bundle.permissionRules.map(r => ({
                        permissionCode: r.permissionCode,
                        mode: r.mode,
                  }));
                  const feats = bundle.featureRules.map(r => ({
                        featureName: r.featureName,
                        value: r.value,
                  }));
                  setPendingPermissions(perms);
                  setPendingFeatures(feats);
                  setServerPermissions(perms);
                  setServerFeatures(feats);
            }
      }, [bundle]);

      // ── Derived sets for quick lookup (from LOCAL state) ──
      const assignedPermCodes = useMemo(() => {
            return new Set(pendingPermissions.map(r => r.permissionCode));
      }, [pendingPermissions]);

      const assignedFeatNames = useMemo(() => {
            return new Set(pendingFeatures.map(r => r.featureName));
      }, [pendingFeatures]);

      // ── isDirty: compare local vs server state ──
      const isDirty = useMemo(() => {
            const permsDirty =
                  JSON.stringify([...pendingPermissions].sort((a, b) => a.permissionCode.localeCompare(b.permissionCode))) !==
                  JSON.stringify([...serverPermissions].sort((a, b) => a.permissionCode.localeCompare(b.permissionCode)));
            const featsDirty =
                  JSON.stringify([...pendingFeatures].sort((a, b) => a.featureName.localeCompare(b.featureName))) !==
                  JSON.stringify([...serverFeatures].sort((a, b) => a.featureName.localeCompare(b.featureName)));
            return permsDirty || featsDirty;
      }, [pendingPermissions, pendingFeatures, serverPermissions, serverFeatures]);

      // ── Mutation for batch save ──
      const saveMutation = useMutation({
            mutationFn: async () => {
                  await bundleRepository.update(bundleId, {
                        displayNameEn: bundle?.displayNameEn || "",
                        displayNameAr: bundle?.displayNameAr || "",
                        description: bundle?.description || "",
                        permissionRules: pendingPermissions,
                        featureRules: pendingFeatures,
                  });
            },
            onSuccess: () => {
                  success({
                        title: "Bundle Updated",
                        description: "Bundle rules have been saved successfully.",
                  });
                  // Update server state to match what we just saved
                  setServerPermissions([...pendingPermissions]);
                  setServerFeatures([...pendingFeatures]);
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

      // ── Actions — modify LOCAL state only ──
      const togglePermission = useCallback((code: string, mode: string) => {
            setPendingPermissions(prev => {
                  const exists = prev.some(r => r.permissionCode === code);
                  if (exists) {
                        return prev.filter(r => r.permissionCode !== code);
                  }
                  return [...prev, { permissionCode: code, mode }];
            });
      }, []);

      const removePermission = useCallback((code: string) => {
            setPendingPermissions(prev => prev.filter(r => r.permissionCode !== code));
      }, []);

      const addFeatureRule = useCallback((featureName: string, value: string) => {
            setPendingFeatures(prev => {
                  if (prev.some(r => r.featureName === featureName)) return prev;
                  return [...prev, { featureName, value }];
            });
      }, []);

      const removeFeatureRule = useCallback((featureName: string) => {
            setPendingFeatures(prev => prev.filter(r => r.featureName !== featureName));
      }, []);

      // ── Batch save / discard ──
      const save = useCallback(() => {
            saveMutation.mutate();
      }, [saveMutation]);

      const discard = useCallback(() => {
            setPendingPermissions([...serverPermissions]);
            setPendingFeatures([...serverFeatures]);
      }, [serverPermissions, serverFeatures]);

      return {
            bundle,
            isLoading: isBundleLoading,
            error: bundleError as Error | null,
            allPermissions: allPermissions ?? [],
            allFeatures: featuresResult?.items ?? [],
            isLoadingPickers: isPermissionsLoading || isFeaturesLoading,
            pendingPermissions,
            pendingFeatures,
            assignedPermCodes,
            assignedFeatNames,
            togglePermission,
            removePermission,
            addFeatureRule,
            removeFeatureRule,
            save,
            discard,
            isDirty,
            isSaving: saveMutation.isPending,
      };
}
