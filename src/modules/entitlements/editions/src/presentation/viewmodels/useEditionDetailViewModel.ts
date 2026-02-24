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
      setFeatureValue: (featureId: string, value: string) => void;
      isSettingFeature: boolean;
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

      const setFeatureMutation = useMutation({
            mutationFn: ({ featureId, value }: { featureId: string; value: string }) =>
                  editionRepository.setFeatureValue(editionId, featureId, value),
            onSuccess: () => {
                  success({
                        title: "Feature Updated",
                        description: "The feature value has been updated successfully.",
                  });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
            },
            onError: (err) => {
                  toastError({
                        title: "Update Failed",
                        description: err instanceof Error ? err.message : "Failed to update feature",
                  });
            },
      });

      return {
            edition,
            features: featuresResult?.items,
            isLoading: isEditionLoading || isFeaturesLoading,
            error: (editionError as Error) || (featuresError as Error) || null,
            setFeatureValue: (featureId: string, value: string) =>
                  setFeatureMutation.mutate({ featureId, value }),
            isSettingFeature: setFeatureMutation.isPending,
      };
}
