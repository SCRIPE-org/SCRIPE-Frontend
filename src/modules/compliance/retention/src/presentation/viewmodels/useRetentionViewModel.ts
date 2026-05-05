"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import type { RetentionPolicy, UpdateRetentionPolicyRequest } from "../../domain/entities/RetentionPolicy";
import type { CreateRetentionPolicyRequest } from "../../data/models/RetentionModels";

export function useRetentionViewModel() {
  const { retentionRepository } = complianceContainer;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { success, error } = useEnhancedToast();

  const queryKey = ["compliance", "retention"];

  const query = useQuery({
    queryKey,
    queryFn: () => retentionRepository.getAll(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRetentionPolicyRequest) => retentionRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.policyAdded") });
    },
    onError: () => {
      error({ title: t("compliance.policyAddFailed") });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRetentionPolicyRequest }) =>
      retentionRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.policyUpdated") });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => retentionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.policyDeleted") });
    },
  });

  const policies = query.data ?? [];
  const activeCount = policies.filter((p) => p.isActive).length;

  const getFormFields = useCallback(
    (): FieldConfig[] => [
      {
        name: "category",
        label: t("compliance.retentionCategory"),
        type: "select" as const,
        placeholder: t("compliance.placeholders.selectCategory"),
        required: true,
        options: [
          { value: "PersonalData", label: t("compliance.categories.personalData") },
          { value: "FinancialData", label: t("compliance.categories.financialData") },
          { value: "AuditLogs", label: t("compliance.categories.auditLogs") },
          { value: "MarketingData", label: t("compliance.categories.marketingData") },
        ],
      },
      {
        name: "retentionDays",
        label: t("compliance.retentionDays"),
        type: "number" as const,
        required: true,
      },
      {
        name: "expiryAction",
        label: t("compliance.expiryAction"),
        type: "select" as const,
        placeholder: t("compliance.placeholders.selectExpiryAction"),
        required: true,
        options: [
          { value: "Delete", label: t("compliance.expiryActions.Delete") },
          { value: "Anonymize", label: t("compliance.expiryActions.Anonymize") },
          { value: "Archive", label: t("compliance.expiryActions.Archive") },
        ],
      },
      {
        name: "isActive",
        label: t("compliance.active"),
        type: "checkbox" as const,
      },
    ],
    [t]
  );

  return {
    policies,
    activeCount,
    totalCount: policies.length,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createPolicy: createMutation.mutateAsync,
    updatePolicy: updateMutation.mutateAsync,
    deletePolicy: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    getFormFields,
  };
}
