"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { Edition } from "../../domain/entities/Edition";
import type { Feature } from "@modules/entitlements/features/src/domain/entities/Feature";

export interface EditionDetailViewModelResult {
      edition: Edition | undefined;
      features: Feature[] | undefined;
      isLoading: boolean;
      error: Error | null;
      saveAllFeatures: (updates: Record<string, string>) => void;
      isSaving: boolean;
}

export function useEditionDetailViewModel(editionId: string): EditionDetailViewModelResult {
      const { success, error: toastError } = useEnhancedToast();
      const queryClient = useQueryClient();
      const { editionRepository, featureRepository } = entitlementsContainer;

      const {
            data: edition,
            isLoading: isEditionLoading,
            error: editionError,
      } = useQuery({
            queryKey: ["entitlements", "editions", editionId],
            queryFn: () => editionRepository.getById(editionId),
            enabled: !!editionId,
      });

      const {
            data: featuresResult,
            isLoading: isFeaturesLoading,
            error: featuresError,
      } = useQuery({
            queryKey: ["entitlements", "features", "all"],
            queryFn: () => featureRepository.getAll({ page: 1, pageSize: 1000 }),
      });

      const saveAllMutation = useMutation({
            mutationFn: async (updates: Record<string, string>) => {
                  const entries = Object.entries(updates);
                  // Execute sequentially to prevent DB concurrency exceptions on the same entity
                  for (const [featureId, value] of entries) {
                        await editionRepository.setFeatureValue(editionId, featureId, value);
                  }
            },
            onSuccess: () => {
                  success({
                        title: "Features Updated",
                        description: "All feature modifications have been saved successfully.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Update Failed",
                        description: err instanceof Error ? err.message : "Failed to update features",
                  });
            },
      });

      return {
            edition,
            features: featuresResult?.items,
            isLoading: isEditionLoading || isFeaturesLoading,
            error: (editionError as Error) || (featuresError as Error) || null,
            saveAllFeatures: (updates: Record<string, string>) => saveAllMutation.mutate(updates),
            isSaving: saveAllMutation.isPending,
      };
}
