"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { MenuItem, type WorkspaceGroup } from "@core/navigation";
import { authBroadcast } from "@core/common/broadcast-auth";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { getCoreContainer } from "@core/di";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import * as NavigationProviderModule from "@core/providers/navigation-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { resolveBilingualLabel } from "@core/common/utils";
import { toast } from "@core/hooks/use-enhanced-toast";
import { cleanPath } from "./_parts/secondary-rail-parts";

export type RailStartPageActionKind =
  | "hidden"
  | "locked"
  | "current_custom"
  | "current_default"
  | "settable";

export interface RailStartPageActionState {
  kind: RailStartPageActionKind;
  workspaceName: string;
  currentPageName: string;
  enforcingRoleName: string | null;
  isPending: boolean;
  onSetAsStartPage: () => Promise<void>;
  onResetStartPage: () => Promise<void>;
}

const emptySubscribe = () => () => {};

function subscribeImpersonation(onStoreChange: () => void): () => void {
  const unsubBroadcast = authBroadcast.onImpersonation(() => onStoreChange());
  if (typeof window === "undefined") {
    return unsubBroadcast;
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEYS.IMPERSONATING) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    unsubBroadcast();
    window.removeEventListener("storage", onStorage);
  };
}

function getImpersonationSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.IMPERSONATING) === "true";
  } catch {
    return false;
  }
}

function getServerImpersonationSnapshot(): boolean {
  return false;
}

function resolveOptionalNavigationHook(): () => NavigationProviderModule.NavigationContextType | null {
  try {
    const mod = NavigationProviderModule as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(mod, "useOptionalNavigation")) {
      const candidate = mod["useOptionalNavigation"];
      if (typeof candidate === "function") {
        return candidate as () => NavigationProviderModule.NavigationContextType | null;
      }
    }
  } catch {
    /* ignore mocked module inspection errors */
  }
  return () => null;
}

const useSafeOptionalNavigation = resolveOptionalNavigationHook();

function isValidStartPageHref(rawHref: string | null | undefined): rawHref is string {
  if (!rawHref) return false;
  const cleaned = cleanPath(rawHref);
  if (!cleaned || cleaned === "#" || cleaned.startsWith("#")) return false;
  if (cleaned.toLowerCase() === "/hub") return false;
  if (cleaned.includes("[") || cleaned.includes("{")) return false;
  return true;
}

function findLeafByPath(
  items: readonly MenuItem[],
  normalizedPath: string,
  canAccessPage: (path: string) => boolean
): MenuItem | null {
  for (const item of items) {
    if (
      isValidStartPageHref(item.href) &&
      item.slug?.trim() &&
      cleanPath(item.href).toLowerCase() === normalizedPath &&
      canAccessPage(cleanPath(item.href))
    ) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const childMatch = findLeafByPath(item.children, normalizedPath, canAccessPage);
      if (childMatch) return childMatch;
    }
  }
  return null;
}

export interface UseRailStartPageToggleParams {
  activeWorkspace: WorkspaceGroup | null;
  activeRootItem: MenuItem | null;
  rootMenuItems: readonly MenuItem[];
  pathname: string;
  language: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * ViewModel hook for the single in-context workspace start-page control in `RailHeader`.
 * Resolves eligibility, role enforcement, impersonation read-only hiding, and executes
 * optimistic `setWorkspaceStartPage` / `resetWorkspaceStartPage` mutations via `INavigationRepository`.
 */
export function useRailStartPageToggle({
  activeWorkspace,
  activeRootItem,
  rootMenuItems,
  pathname,
  language,
  t,
}: UseRailStartPageToggleParams): RailStartPageActionState {
  const [isPending, setIsPending] = useState(false);
  const {
    canAccessPage,
    isSuperAdmin = false,
    isPlatformSuperAdmin = false,
    isTenantSuperAdmin = false,
  } = usePermissions();
  const navigation = useSafeOptionalNavigation();
  const refreshNavigation = navigation?.refreshNavigation;

  const isImpersonating = useSyncExternalStore(
    typeof window !== "undefined" ? subscribeImpersonation : emptySubscribe,
    getImpersonationSnapshot,
    getServerImpersonationSnapshot
  );

  const normalizedPathname = cleanPath(pathname).toLowerCase();
  const isHubPath = !normalizedPathname || normalizedPathname === "/hub";

  const candidatePools: readonly (readonly MenuItem[])[] = [
    ...(activeRootItem ? [[activeRootItem]] : []),
    rootMenuItems,
    ...(activeWorkspace?.menuItems ? [activeWorkspace.menuItems] : []),
  ];

  let currentLeaf: MenuItem | null = null;
  if (!isHubPath && activeWorkspace && !activeWorkspace.isLocked) {
    for (const pool of candidatePools) {
      const match = findLeafByPath(pool, normalizedPathname, canAccessPage);
      if (match) {
        currentLeaf = match;
        break;
      }
    }
  }

  const workspaceName = activeWorkspace
    ? typeof activeWorkspace.getLocalizedName === "function"
      ? activeWorkspace.getLocalizedName(language)
      : resolveBilingualLabel(
          activeWorkspace.workspaceNameEn,
          activeWorkspace.workspaceNameAr,
          language
        ) || activeWorkspace.workspaceKey
    : "";

  const currentPageName = currentLeaf
    ? resolveBilingualLabel(
        currentLeaf.nameEn || currentLeaf.name,
        currentLeaf.nameAr || currentLeaf.nameEn || currentLeaf.name,
        language
      ) || currentLeaf.slug
    : "";

  const onSetAsStartPage = useCallback(async () => {
    if (!activeWorkspace || !currentLeaf?.slug || isPending || isImpersonating) return;

    const wsKey = activeWorkspace.workspaceKey;
    const leafSlug = currentLeaf.slug.trim();
    const target = `menu:${leafSlug}`;
    const storeState =
      typeof (useNavigationStore as unknown as { getState?: () => unknown }).getState ===
      "function"
        ? useNavigationStore.getState()
        : null;
    const previousData =
      typeof activeWorkspace.toData === "function" ? activeWorkspace.toData() : null;

    setIsPending(true);
    storeState?.updateWorkspaceStartPageLocal?.(wsKey, {
      effectiveHomeRoute: cleanPath(currentLeaf.href),
      effectiveHomeSource: "PersonalOverride",
      effectiveHomeMenuSlug: leafSlug,
      effectiveHomeLabelEn: currentLeaf.nameEn || currentLeaf.name,
      effectiveHomeLabelAr: currentLeaf.nameAr || currentLeaf.nameEn || currentLeaf.name,
      isEffectiveHomeEnforced: false,
      enforcingRoleName: null,
    });

    try {
      const { navigationRepository } = getCoreContainer();
      const saved = await navigationRepository.setWorkspaceStartPage(wsKey, target);
      storeState?.updateWorkspaceStartPageLocal?.(wsKey, {
        effectiveHomeRoute: saved.route || cleanPath(currentLeaf.href),
        effectiveHomeSource: "PersonalOverride",
        effectiveHomeMenuSlug: saved.menuItemSlug || leafSlug,
        effectiveHomeLabelEn: saved.menuItemNameEn || currentLeaf.nameEn || currentLeaf.name,
        effectiveHomeLabelAr:
          saved.menuItemNameAr || saved.menuItemNameEn || currentLeaf.nameAr || currentLeaf.name,
        isEffectiveHomeEnforced: false,
        enforcingRoleName: null,
      });
      if (typeof toast === "function") {
        toast({
          title: t("chrome.startPageSavedToast", {
            page: currentPageName,
            workspace: workspaceName,
          }),
          variant: "success",
          duration: 3000,
        });
      }
      await refreshNavigation?.();
    } catch {
      if (previousData) {
        storeState?.updateWorkspaceStartPageLocal?.(wsKey, previousData);
      }
      if (typeof toast === "function") {
        toast({
          title: t("chrome.startPageErrorToast"),
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      setIsPending(false);
    }
  }, [
    activeWorkspace,
    currentLeaf,
    currentPageName,
    isImpersonating,
    isPending,
    refreshNavigation,
    t,
    workspaceName,
  ]);

  const onResetStartPage = useCallback(async () => {
    if (!activeWorkspace || isPending || isImpersonating) return;

    const wsKey = activeWorkspace.workspaceKey;
    const storeState =
      typeof (useNavigationStore as unknown as { getState?: () => unknown }).getState ===
      "function"
        ? useNavigationStore.getState()
        : null;
    const previousData =
      typeof activeWorkspace.toData === "function" ? activeWorkspace.toData() : null;

    setIsPending(true);
    storeState?.updateWorkspaceStartPageLocal?.(wsKey, {
      effectiveHomeSource: "WorkspaceHome",
      effectiveHomeMenuSlug: null,
    });

    try {
      const { navigationRepository } = getCoreContainer();
      await navigationRepository.resetWorkspaceStartPage(wsKey);
      if (typeof toast === "function") {
        toast({
          title: t("chrome.startPageResetToast", {
            workspace: workspaceName,
          }),
          variant: "success",
          duration: 3000,
        });
      }
      await refreshNavigation?.();
    } catch {
      if (previousData) {
        storeState?.updateWorkspaceStartPageLocal?.(wsKey, previousData);
      }
      if (typeof toast === "function") {
        toast({
          title: t("chrome.startPageErrorToast"),
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      setIsPending(false);
    }
  }, [activeWorkspace, isImpersonating, isPending, refreshNavigation, t, workspaceName]);

  if (!activeWorkspace || activeWorkspace.isLocked || isHubPath || !currentLeaf || isImpersonating) {
    return {
      kind: "hidden",
      workspaceName,
      currentPageName,
      enforcingRoleName: null,
      isPending: false,
      onSetAsStartPage,
      onResetStartPage,
    };
  }

  const isEffectiveSuperAdmin = Boolean(
    isSuperAdmin || isPlatformSuperAdmin || isTenantSuperAdmin
  );
  if (activeWorkspace.isEffectiveHomeEnforced && !isEffectiveSuperAdmin) {
    return {
      kind: "locked",
      workspaceName,
      currentPageName,
      enforcingRoleName: activeWorkspace.enforcingRoleName?.trim() || null,
      isPending: false,
      onSetAsStartPage,
      onResetStartPage,
    };
  }

  const effectiveSlug = activeWorkspace.effectiveHomeMenuSlug?.trim() || null;
  const leafSlug = currentLeaf.slug.trim();
  const isCurrentStartPage = effectiveSlug
    ? effectiveSlug.toLowerCase() === leafSlug.toLowerCase()
    : Boolean(
        activeWorkspace.effectiveHomeRoute &&
          cleanPath(activeWorkspace.effectiveHomeRoute).toLowerCase() ===
            cleanPath(currentLeaf.href).toLowerCase()
      );
  const isPersonalOverride = activeWorkspace.effectiveHomeSource === "PersonalOverride";

  const kind: RailStartPageActionKind = isCurrentStartPage
    ? isPersonalOverride
      ? "current_custom"
      : "current_default"
    : "settable";

  return {
    kind,
    workspaceName,
    currentPageName,
    enforcingRoleName: null,
    isPending,
    onSetAsStartPage,
    onResetStartPage,
  };
}
