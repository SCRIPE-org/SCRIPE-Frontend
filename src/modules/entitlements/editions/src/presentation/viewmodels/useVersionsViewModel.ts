"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { EditionVersion } from "../../domain/entities/EditionVersion";

/**
 * Interface defining property specifications, keys types, and structural contract rules for versions view model result.
 */
export interface VersionsViewModelResult {
  versions: EditionVersion[];
  isLoading: boolean;

  // Create Form State
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  changeNotes: string;
  setChangeNotes: (notes: string) => void;

  // Publish Form State
  publishVersionId: string | null;
  setPublishVersionId: (id: string | null) => void;
  rolloutStrategy: string;
  setRolloutStrategy: (strategy: string) => void;
  scheduledAt: string;
  setScheduledAt: (date: string) => void;
  canaryPercentage: number;
  setCanaryPercentage: (pct: number) => void;

  // Validation
  canPublish: boolean;

  // Mutations
  createMutation: { mutate: () => void; isPending: boolean };
  publishMutation: { mutate: (id: string) => void; isPending: boolean };
  cancelMutation: { mutate: (id: string) => void; isPending: boolean };
}

/**
 * React hook/ViewModel orchestrating state and data flows for versions view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useVersionsViewModel(editionId: string): VersionsViewModelResult {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();
  const { editionRepository } = entitlementsContainer;

  // ── State ──
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");

  const [publishVersionId, setPublishVersionId] = useState<string | null>(null);
  const [rolloutStrategy, setRolloutStrategy] = useState("Immediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [canaryPercentage, setCanaryPercentage] = useState(10);

  // ── Fetch versions (Repository → Mapper → Entity) ──
  const { data: versions, isLoading } = useQuery({
    queryKey: ["entitlements", "editions", editionId, "versions"],
    queryFn: () => editionRepository.getVersions(editionId),
    enabled: !!editionId,
  });

  // ── Create version mutation ──
  const createMutation = useMutation({
    mutationFn: () => editionRepository.createVersion(editionId, changeNotes || undefined),
    onSuccess: () => {
      success({
        title: t("entitlements.editions.versions.created") || "Version Created",
        description:
          t("entitlements.editions.versions.createdDesc") ||
          "Feature snapshot saved as a new draft version.",
      });
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "editions", editionId, "versions"],
      });
      setShowCreateForm(false);
      setChangeNotes("");
    },
    onError: (err) =>
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      }),
  });

  // ── Publish version mutation ──
  const publishMutation = useMutation({
    mutationFn: (versionId: string) => {
      const payload: { rolloutStrategy: string; scheduledAt?: string; canaryPercentage?: number } =
        {
          rolloutStrategy,
        };

      if (rolloutStrategy === "Scheduled" && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }
      if (rolloutStrategy === "Staged") {
        payload.canaryPercentage = canaryPercentage;
      }

      return editionRepository.publishVersion(editionId, versionId, payload);
    },
    onSuccess: () => {
      success({
        title: t("entitlements.editions.versions.published") || "Version Published",
        description: t("entitlements.editions.versions.publishedDesc") || "Rollout started.",
      });
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "editions", editionId, "versions"],
      });
      queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId] });
      setPublishVersionId(null);
      setRolloutStrategy("Immediate");
      setScheduledAt("");
      setCanaryPercentage(10);
    },
    onError: (err) =>
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      }),
  });

  // ── Cancel version mutation ──
  const cancelMutation = useMutation({
    mutationFn: (versionId: string) => editionRepository.cancelVersion(editionId, versionId),
    onSuccess: () => {
      success({ title: t("entitlements.editions.versions.canceled") || "Version Canceled" });
      queryClient.invalidateQueries({
        queryKey: ["entitlements", "editions", editionId, "versions"],
      });
    },
    onError: (err) =>
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.error"),
      }),
  });

  const canPublish = (() => {
    if (rolloutStrategy === "Scheduled" && !scheduledAt) return false;
    if (rolloutStrategy === "Staged" && (canaryPercentage < 1 || canaryPercentage > 99))
      return false;
    return true;
  })();

  return {
    versions: versions || [],
    isLoading,
    showCreateForm,
    setShowCreateForm,
    changeNotes,
    setChangeNotes,
    publishVersionId,
    setPublishVersionId,
    rolloutStrategy,
    setRolloutStrategy,
    scheduledAt,
    setScheduledAt,
    canaryPercentage,
    setCanaryPercentage,
    canPublish,
    createMutation: { mutate: createMutation.mutate, isPending: createMutation.isPending },
    publishMutation: { mutate: publishMutation.mutate, isPending: publishMutation.isPending },
    cancelMutation: { mutate: cancelMutation.mutate, isPending: cancelMutation.isPending },
  };
}
