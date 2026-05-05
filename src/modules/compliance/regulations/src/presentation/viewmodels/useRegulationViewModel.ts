"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { 
  CreateRegulationRequest, 
  UpdateRegulationRequest, 
  AddConsentPurposeRequest, 
  UpdateConsentPurposeRequest 
} from "../../data/models/RegulationModels";

export function useRegulationViewModel() {
  const { regulationRepository } = complianceContainer;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { success, error } = useEnhancedToast();

  const queryKey = ["compliance", "regulations"];

  const query = useQuery({
    queryKey,
    queryFn: () => regulationRepository.getAll(),
    staleTime: 5 * 60_000,
  });

  const createRegulation = useMutation({
    mutationFn: (data: CreateRegulationRequest) => regulationRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.regulations.regulationAdded") });
    },
    onError: () => {
      error({ title: t("compliance.regulations.regulationAddFailed") });
    }
  });

  const updateRegulation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegulationRequest }) => regulationRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.regulations.regulationUpdated") });
    },
  });

  const deleteRegulation = useMutation({
    mutationFn: (id: string) => regulationRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.regulations.regulationDeleted") });
    },
  });

  const addPurpose = useMutation({
    mutationFn: ({ regId, data }: { regId: string; data: AddConsentPurposeRequest }) => regulationRepository.addPurpose(regId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updatePurpose = useMutation({
    mutationFn: ({ regId, purposeId, data }: { regId: string; purposeId: string; data: UpdateConsentPurposeRequest }) => regulationRepository.updatePurpose(regId, purposeId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deletePurpose = useMutation({
    mutationFn: ({ regId, purposeId }: { regId: string; purposeId: string }) => regulationRepository.removePurpose(regId, purposeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const getFormFields = useCallback(
    (): FieldConfig[] => [
      {
        name: "code",
        label: t("compliance.regulations.code"),
        type: "text" as const,
        placeholder: t("compliance.regulations.placeholders.code"),
        required: true,
      },
      {
        name: "name",
        label: t("compliance.regulations.name"),
        type: "text" as const,
        placeholder: t("compliance.regulations.placeholders.name"),
        required: true,
      },
      {
        name: "jurisdiction",
        label: t("compliance.regulations.jurisdiction"),
        type: "text" as const,
        placeholder: t("compliance.regulations.placeholders.jurisdiction"),
        required: true,
      },
      {
        name: "dsrDeadlineDays",
        label: t("compliance.regulations.dsrDeadlineDays"),
        type: "number" as const,
        required: true,
      },
      {
        name: "referenceUrl",
        label: t("compliance.regulations.referenceUrl"),
        type: "text" as const,
        placeholder: t("compliance.regulations.placeholders.referenceUrl"),
      },
      {
        name: "isActive",
        label: t("compliance.regulations.active"),
        type: "checkbox" as const,
      },
    ],
    [t]
  );

  return {
    regulations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    
    // Regulation Mutations
    createRegulation: createRegulation.mutateAsync,
    updateRegulation: updateRegulation.mutateAsync,
    deleteRegulation: deleteRegulation.mutateAsync,
    
    // Purpose Mutations
    addPurpose: addPurpose.mutateAsync,
    updatePurpose: updatePurpose.mutateAsync,
    deletePurpose: deletePurpose.mutateAsync,
    
    isMutating: 
      createRegulation.isPending || 
      updateRegulation.isPending || 
      deleteRegulation.isPending ||
      addPurpose.isPending ||
      updatePurpose.isPending ||
      deletePurpose.isPending,
      
    getFormFields,
  };
}
