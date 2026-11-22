"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useCoreImpersonation } from "@core/hooks/use-auth-bridge";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import { homeContainer } from "../../di";

const WELCOME_POLL_INTERVAL_MS = 150;
const WELCOME_SETTLE_CEILING_MS = 2600;

function isWelcomeCurtainActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEYS.JUST_LOGGED_IN) === "1";
}

/**
 * Coordinates deferred, impersonation-safe personal notifications and sign-in activity feeds
 * for `/hub` via `homeContainer.hubPersonalFeedRepository`.
 */
export function useHubPersonalFeeds() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { isImpersonating } = useCoreImpersonation();
  const routesContextKey = useNavigationStore((s) => s.routesContextKey);
  const storeContextKey = useNavigationStore((s) => s.contextKey);
  const contextKey = routesContextKey || storeContextKey || "default";

  // Defer personal feed calls while the post-login welcome curtain is still animating.
  const [isWelcomeSettled, setIsWelcomeSettled] = useState<boolean>(
    () => !isWelcomeCurtainActive()
  );

  useEffect(() => {
    if (isWelcomeSettled) return;

    const intervalId = window.setInterval(() => {
      if (!isWelcomeCurtainActive()) {
        setIsWelcomeSettled(true);
      }
    }, WELCOME_POLL_INTERVAL_MS);

    const timeoutId = window.setTimeout(() => {
      setIsWelcomeSettled(true);
    }, WELCOME_SETTLE_CEILING_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isWelcomeSettled]);

  const shouldFetchFeeds = !isImpersonating && isWelcomeSettled;

  const notificationsQueryKey = ["hub", "personal-notifications", contextKey] as const;
  const activityQueryKey = ["hub", "personal-activity", contextKey] as const;

  const notificationsQuery = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => homeContainer.hubPersonalFeedRepository.getNotifications(),
    enabled: shouldFetchFeeds,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  const activityQuery = useQuery({
    queryKey: activityQueryKey,
    queryFn: () => homeContainer.hubPersonalFeedRepository.getSignInActivity(5),
    enabled: shouldFetchFeeds,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      homeContainer.hubPersonalFeedRepository.markNotificationAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["sovereign-account", "notifications"] });
    },
    onError: () => {
      toast.error(t("workspaceHub.notifications.markReadFailed"));
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => homeContainer.hubPersonalFeedRepository.markAllNotificationsAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["sovereign-account", "notifications"] });
    },
    onError: () => {
      toast.error(t("workspaceHub.notifications.markReadFailed"));
    },
  });

  return {
    isImpersonating,
    isWelcomeSettled,
    notifications: notificationsQuery.data,
    isLoadingNotifications:
      !isImpersonating &&
      (!isWelcomeSettled || (notificationsQuery.isLoading && !notificationsQuery.data)),
    isNotificationsError: !isImpersonating && notificationsQuery.isError,
    refetchNotifications: notificationsQuery.refetch,
    markNotificationAsRead: (id: string) => markReadMutation.mutateAsync(id),
    markAllNotificationsAsRead: () => markAllReadMutation.mutateAsync(),
    isMarkingNotification: markReadMutation.isPending || markAllReadMutation.isPending,
    activity: activityQuery.data,
    isLoadingActivity:
      !isImpersonating && (!isWelcomeSettled || (activityQuery.isLoading && !activityQuery.data)),
    isActivityError: !isImpersonating && activityQuery.isError,
    refetchActivity: activityQuery.refetch,
  };
}
