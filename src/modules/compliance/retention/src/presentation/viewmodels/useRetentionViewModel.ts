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
      success({ title: t("compliance.policyAdded") || "Policy added successfully" });
    },
    onError: () => {
      error({ title: t("compliance.policyAddFailed") || "Failed to add policy" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRetentionPolicyRequest }) =>
      retentionRepository.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.policyUpdated") || "Policy updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => retentionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      success({ title: t("compliance.policyDeleted") || "Policy deleted successfully" });
    },
  });

  const policies = query.data ?? [];
  const activeCount = policies.filter((p) => p.isActive).length;

  const getFormFields = useCallback(
    (): FieldConfig[] => [
      {
        name: "category",
        label: t("compliance.retentionCategory") || "Category",
        type: "select" as const,
        placeholder: t("compliance.placeholders.selectCategory") || "Select category",
        required: true,
        options: [
          { value: "PersonalData", label: t("compliance.categories.personalData") || "Personal Data" },
          { value: "FinancialData", label: t("compliance.categories.financialData") || "Financial Data" },
          { value: "AuditLogs", label: t("compliance.categories.auditLogs") || "Audit Logs" },
          { value: "MarketingData", label: t("compliance.categories.marketingData") || "Marketing Data" },
        ],
      },
      {
        name: "retentionDays",
        label: t("compliance.retentionDays") || "Retention Days",
        type: "number" as const,
        required: true,
      },
      {
        name: "expiryAction",
        label: t("compliance.expiryAction") || "Expiry Action",
        type: "select" as const,
        placeholder: t("compliance.placeholders.selectExpiryAction") || "Select action",
        required: true,
        options: [
          { value: "Delete", label: t("compliance.expiryActions.Delete") || "Delete" },
          { value: "Anonymize", label: t("compliance.expiryActions.Anonymize") || "Anonymize" },
          { value: "Archive", label: t("compliance.expiryActions.Archive") || "Archive" },
        ],
      },
      {
        name: "isActive",
        label: t("compliance.active") || "Active",
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
