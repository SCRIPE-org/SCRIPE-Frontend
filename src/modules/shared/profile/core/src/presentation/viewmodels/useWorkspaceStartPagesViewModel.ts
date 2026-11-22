"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import * as NavigationProviderModule from "@core/providers/navigation-provider";
import { toast } from "@core/ui/sileo-toast";

function resolveOptionalNavigationHook() {
  try {
    const mod = NavigationProviderModule as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(mod, "useOptionalNavigation")) {
      const candidate = mod["useOptionalNavigation"];
      if (typeof candidate === "function") {
        return candidate as typeof NavigationProviderModule.useOptionalNavigation;
      }
    }
  } catch {
    /* ignore mocked module inspection errors */
  }
  return () => null;
}

const useSafeOptionalNavigation = resolveOptionalNavigationHook();

/**
 * ViewModel for managing per-workspace start-page overrides on `/account/preferences`.
 * Coordinates repository mutations, TanStack Query invalidation, and shell navigation refresh.
 */
export function useWorkspaceStartPagesViewModel(activeContextKey: string) {
  const { t } = useI18n();
  const queryClient = React.useContext(QueryClientContext);
  const nav = useSafeOptionalNavigation();
  const refreshNavigation = nav?.refreshNavigation;
  const [mutatingWorkspaceKey, setMutatingWorkspaceKey] = useState<string | null>(null);

  const syncAfterMutation = useCallback(async () => {
    if (refreshNavigation) {
      await refreshNavigation();
    }
    if (queryClient) {
      await queryClient.invalidateQueries({
        queryKey: qk.navigation.workspaceEntries(activeContextKey),
      });
      await queryClient.invalidateQueries({
        queryKey: qk.navigation.landingTargets(activeContextKey || "default", "current_context"),
      });
    }
  }, [refreshNavigation, queryClient, activeContextKey]);

  const setWorkspaceStartPage = useCallback(
    async (workspaceKey: string, workspaceLabel: string, target: string) => {
      const normalizedKey = workspaceKey.trim().toLowerCase();
      if (!normalizedKey || !target.trim()) return;
      setMutatingWorkspaceKey(normalizedKey);
      try {
        await getCoreContainer().navigationRepository.setWorkspaceStartPage(normalizedKey, target);
        await syncAfterMutation();
        toast.success(
          t("profile.preferences.workspaceEntrySaveSuccess", {
            workspace: workspaceLabel || normalizedKey,
          })
        );
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t("profile.preferences.workspaceEntrySaveError");
        toast.error(message);
      } finally {
        setMutatingWorkspaceKey(null);
      }
    },
    [syncAfterMutation, t]
  );

  const resetWorkspaceStartPage = useCallback(
    async (workspaceKey: string, workspaceLabel: string) => {
      const normalizedKey = workspaceKey.trim().toLowerCase();
      if (!normalizedKey) return;
      setMutatingWorkspaceKey(normalizedKey);
      try {
        await getCoreContainer().navigationRepository.resetWorkspaceStartPage(normalizedKey);
        await syncAfterMutation();
        toast.success(
          t("profile.preferences.workspaceEntryResetSuccess", {
            workspace: workspaceLabel || normalizedKey,
          })
        );
      } catch (err) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : t("profile.preferences.workspaceEntrySaveError");
        toast.error(message);
      } finally {
        setMutatingWorkspaceKey(null);
      }
    },
    [syncAfterMutation, t]
  );

  return {
    mutatingWorkspaceKey,
    setWorkspaceStartPage,
    resetWorkspaceStartPage,
  };
}
