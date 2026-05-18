"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pluginsContainer } from "@modules/plugins/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

const QUERY_KEY = ["plugins", "definitions"];

export function useDefinitionsViewModel() {
  const queryClient = useQueryClient();
  const { definitionsRepository } = pluginsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const {
    data: definitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => definitionsRepository.getAll(),
    staleTime: 2 * 60_000,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const publishMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defPublish") });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  const deprecateMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.deprecate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDeprecate") });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => definitionsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      success({ title: t("plugins.defDelete") });
    },
    onError: () => error({ title: t("plugins.definitionsError") }),
  });

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = {
    total: definitions.length,
    published: definitions.filter((d) => d.isPublished).length,
    draft: definitions.filter((d) => d.isDraft).length,
    pending: definitions.filter((d) => d.isPendingReview).length,
    deprecated: definitions.filter((d) => d.isDeprecated).length,
    tier1: definitions.filter((d) => d.isTier1).length,
    tier2: definitions.filter((d) => d.isTier2).length,
  };

  return {
    definitions,
    isLoading,
    isError,
    refetch,
    stats,
    publish: (id: string) => publishMutation.mutate(id),
    deprecate: (id: string) => deprecateMutation.mutate(id),
    deleteDefinition: (id: string) => deleteMutation.mutate(id),
    isPublishing: publishMutation.isPending,
    isDeprecating: deprecateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
