"use client";

/**
 * WorkspaceHubView — Personal Operational Home (`/hub`).
 *
 * Strictly adheres to SCRIPE frontend architecture invariants:
 * - Zero mount-time auto-redirect (users explicitly landing on `/hub` stay on `/hub`)
 * - Strictly authorized unlocked workspaces + permission-gated billing/upgrade visibility
 * - Context-isolated Recent Workspaces strip + AdminWorkspacePin persistence
 * - Deferred, impersonation-safe Personal Notifications + Account & Sign-In Activity panels
 * - Zero audit/hub-summary telemetry calls and zero fabricated placeholder content
 */

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { History, LayoutGrid, SearchX, Star } from "lucide-react";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { TenantContextSwitcherDialog } from "@core/components/tenant-context";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { EmptyState } from "@core/ui/empty-state";
import { UpgradeDialog } from "@core/ui/layout/nexus/nexus-app-launcher";
import { useWorkspaceTransition } from "@core/ui/layout/nexus/use-workspace-transition";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { toast } from "@core/ui/sileo-toast";
import { HubHero } from "../components/HubHero";
import { HubModuleTile } from "../components/HubModuleTile";
import { HubRecentWorkspacesStrip } from "../components/HubRecentWorkspacesStrip";
import { HubSearch } from "../components/HubSearch";
import { HubSectionHeader } from "../components/HubSectionHeader";
import { HubSidePanel } from "../components/HubSidePanel";
import { formatHubItemCount, formatPinnedWorkspaceCount } from "../utils/hub-plurals";
import { useHubPersonalFeeds } from "../viewmodels/useHubPersonalFeeds";

function matchesWorkspaceQuery(ws: WorkspaceGroup, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  return (
    ws.workspaceNameEn.toLowerCase().includes(q) ||
    ws.workspaceNameAr.toLowerCase().includes(q) ||
    ws.workspaceKey.toLowerCase().includes(q)
  );
}

export function WorkspaceHubView() {
  const router = useRouter();
  const { activeTenantId } = useAdminContext();
  const hasTenantContext = Boolean(activeTenantId);
  const { workspaceGroups, isLoading, togglePin } = useWorkspace();
  const { switchWorkspace } = useWorkspaceTransition();
  const { hasAnyPermission } = usePermissions();
  const { language, t } = useI18n();

  const recentWorkspaceKeysByContext = useNavigationStore((s) => s.recentWorkspaceKeysByContext);
  const routesContextKey = useNavigationStore((s) => s.routesContextKey);
  const storeContextKey = useNavigationStore((s) => s.contextKey);
  const navContextKey = routesContextKey || storeContextKey || "default";

  const [searchQuery, setSearchQuery] = useState("");
  const [pinLoadingKeys, setPinLoadingKeys] = useState<Set<string>>(new Set());
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const feeds = useHubPersonalFeeds();
  const isImpersonating = feeds.isImpersonating;

  // Hub owns no active workspace highlight on the rail while browsing `/hub`.
  useEffect(() => {
    const state = useNavigationStore.getState();
    if (state.activeWorkspaceKey !== null) {
      state.setActiveWorkspace(null);
    }
  }, []);

  const canManageBilling = hasAnyPermission([
    SYSTEM_PERMISSIONS.BILLING_DASHBOARD_VIEW,
    SYSTEM_PERMISSIONS.BILLING_MANAGE,
    SYSTEM_PERMISSIONS.SUBSCRIPTIONS_VIEW,
    SYSTEM_PERMISSIONS.EDITIONS_VIEW,
  ]);

  const unlockedWorkspaces = workspaceGroups.filter((ws) => !ws.isLocked);
  const unlockedByKey = new Map<string, WorkspaceGroup>(
    unlockedWorkspaces.map((ws) => [ws.workspaceKey, ws])
  );

  const pinnedWorkspaces = unlockedWorkspaces
    .filter((ws) => ws.isPinned)
    .sort((a, b) => (a.pinSortOrder ?? 999) - (b.pinSortOrder ?? 999));

  const moduleWorkspaces = unlockedWorkspaces.filter((ws) => ws.isModuleWorkspace);
  const adminWorkspaces = unlockedWorkspaces.filter((ws) => !ws.isModuleWorkspace);
  const lockedWorkspaces = canManageBilling ? workspaceGroups.filter((ws) => ws.isLocked) : [];

  const recentKeys = recentWorkspaceKeysByContext[navContextKey] ?? [];
  const recentWorkspaces = recentKeys
    .map((key) => unlockedByKey.get(key))
    .filter((ws): ws is WorkspaceGroup => Boolean(ws))
    .slice(0, 4);

  const filteredPinned = pinnedWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));
  const filteredRecent = recentWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));
  const filteredModules = moduleWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));
  const filteredAdmin = adminWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));
  const filteredLocked = lockedWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));

  const handleTogglePin = useCallback(
    async (key: string) => {
      if (isImpersonating) return;
      setPinLoadingKeys((prev) => new Set(prev).add(key));
      try {
        await togglePin(key);
      } catch {
        toast.error(t("workspaceHub.pin.toggleFailed"));
      } finally {
        setPinLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [isImpersonating, t, togglePin]
  );

  const handleTileClick = useCallback(
    (ws: WorkspaceGroup) => {
      if (ws.isLocked) {
        if (canManageBilling) {
          setUpgradeTarget(ws.workspaceKey);
        }
        return;
      }
      switchWorkspace(ws.workspaceKey, { preserveHistory: true });
    },
    [canManageBilling, switchWorkspace]
  );

  const upgradeWs = upgradeTarget
    ? workspaceGroups.find((w) => w.workspaceKey === upgradeTarget) ?? null
    : null;

  const hasAnyMatches =
    filteredPinned.length > 0 ||
    filteredRecent.length > 0 ||
    filteredModules.length > 0 ||
    filteredAdmin.length > 0 ||
    filteredLocked.length > 0;

  if (isLoading) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="min-h-full bg-nx-ground">
      <div className="mx-auto max-w-[1360px] px-4 pb-16 sm:px-6 lg:px-8">
        <HubHero />
        <HubSearch value={searchQuery} onChange={setSearchQuery} />

        {unlockedWorkspaces.length === 0 ? (
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <EmptyState
              size="lg"
              icon={LayoutGrid}
              title={t("workspaceHub.emptyState")}
              description={t("workspaceHub.emptyStateHint")}
            />
            <HubSidePanel
              isImpersonating={feeds.isImpersonating}
              notifications={feeds.notifications}
              isLoadingNotifications={feeds.isLoadingNotifications}
              isNotificationsError={feeds.isNotificationsError}
              onRetryNotifications={() => void feeds.refetchNotifications()}
              onMarkNotificationAsRead={feeds.markNotificationAsRead}
              onMarkAllNotificationsAsRead={feeds.markAllNotificationsAsRead}
              isMarkingNotification={feeds.isMarkingNotification}
              activity={feeds.activity}
              isLoadingActivity={feeds.isLoadingActivity}
              isActivityError={feeds.isActivityError}
              onRetryActivity={() => void feeds.refetchActivity()}
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Left column: Workspaces & Launcher */}
            <div className="min-w-0 space-y-10">
              {/* 1. Pinned Workspaces */}
              {filteredPinned.length > 0 && (
                <section aria-label={t("workspaceHub.sections.pinned")}>
                  <HubSectionHeader
                    icon={<Star size={14} className="text-nx-accent" aria-hidden="true" />}
                    title={t("workspaceHub.sections.pinned")}
                    subtitle={formatPinnedWorkspaceCount(filteredPinned.length, language, t)}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filteredPinned.map((ws) => (
                      <HubModuleTile
                        key={ws.workspaceKey}
                        name={ws.getLocalizedName(language)}
                        icon={ws.workspaceIcon}
                        colorHue={ws.colorHue}
                        colorChroma={ws.colorChroma}
                        isLocked={false}
                        isPinned={true}
                        isPinDisabled={isImpersonating}
                        isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                        accessibleItemCount={ws.accessibleItemCount}
                        itemLabel={
                          ws.accessibleItemCount > 0
                            ? formatHubItemCount(ws.accessibleItemCount, language, t)
                            : ""
                        }
                        size="lg"
                        onClick={() => handleTileClick(ws)}
                        onTogglePin={() => void handleTogglePin(ws.workspaceKey)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 2. Recent Workspaces (context-isolated from useNavigationStore) */}
              {filteredRecent.length > 0 && (
                <section aria-label={t("workspaceHub.sections.recent")}>
                  <HubSectionHeader
                    icon={<History size={14} className="text-nx-ink-3" aria-hidden="true" />}
                    title={t("workspaceHub.sections.recent")}
                    subtitle={formatPinnedWorkspaceCount(filteredRecent.length, language, t)}
                  />
                  <HubRecentWorkspacesStrip
                    workspaces={filteredRecent}
                    language={language}
                    onOpenWorkspace={handleTileClick}
                  />
                </section>
              )}

              {/* 3. Operational Module Workspaces */}
              {filteredModules.length > 0 && (
                <section aria-label={t("workspaceHub.sections.modules")}>
                  <HubSectionHeader
                    title={t("workspaceHub.sections.modules")}
                    subtitle={formatPinnedWorkspaceCount(filteredModules.length, language, t)}
                  />
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filteredModules.map((ws) => (
                      <HubModuleTile
                        key={ws.workspaceKey}
                        name={ws.getLocalizedName(language)}
                        icon={ws.workspaceIcon}
                        colorHue={ws.colorHue}
                        colorChroma={ws.colorChroma}
                        isLocked={false}
                        isPinned={ws.isPinned}
                        isPinDisabled={isImpersonating}
                        isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                        accessibleItemCount={ws.accessibleItemCount}
                        itemLabel={
                          ws.accessibleItemCount > 0
                            ? formatHubItemCount(ws.accessibleItemCount, language, t)
                            : ""
                        }
                        size="lg"
                        onClick={() => handleTileClick(ws)}
                        onTogglePin={() => void handleTogglePin(ws.workspaceKey)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Administration Workspaces */}
              {filteredAdmin.length > 0 && (
                <section aria-label={t("workspaceHub.sections.administration")}>
                  <HubSectionHeader
                    title={t("workspaceHub.sections.administration")}
                    subtitle={formatPinnedWorkspaceCount(filteredAdmin.length, language, t)}
                  />
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filteredAdmin.map((ws) => (
                      <HubModuleTile
                        key={ws.workspaceKey}
                        name={ws.getLocalizedName(language)}
                        icon={ws.workspaceIcon}
                        colorHue={ws.colorHue}
                        colorChroma={ws.colorChroma}
                        isLocked={false}
                        isPinned={ws.isPinned}
                        isPinDisabled={isImpersonating}
                        isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                        accessibleItemCount={ws.accessibleItemCount}
                        itemLabel={
                          ws.accessibleItemCount > 0
                            ? formatHubItemCount(ws.accessibleItemCount, language, t)
                            : ""
                        }
                        size="lg"
                        onClick={() => handleTileClick(ws)}
                        onTogglePin={() => void handleTogglePin(ws.workspaceKey)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 5. Upgrade-Gated Locked Workspaces (billing/subscription administrators only) */}
              {canManageBilling && filteredLocked.length > 0 && (
                <section aria-label={t("workspaceHub.sections.upgrade")}>
                  <HubSectionHeader
                    title={t("workspaceHub.sections.upgrade")}
                    subtitle={formatPinnedWorkspaceCount(filteredLocked.length, language, t)}
                  />
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {filteredLocked.map((ws) => (
                      <HubModuleTile
                        key={ws.workspaceKey}
                        name={ws.getLocalizedName(language)}
                        icon={ws.workspaceIcon}
                        colorHue={ws.colorHue}
                        colorChroma={ws.colorChroma}
                        isLocked={true}
                        isPinned={false}
                        accessibleItemCount={0}
                        itemLabel=""
                        size="lg"
                        onClick={() => handleTileClick(ws)}
                        upgradeBadgeText={
                          ws.lockReason === "TenantContextRequired"
                            ? t("workspaceHub.needsTenant")
                            : t("workspaceHub.upgradeBadge")
                        }
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Search empty state */}
              {searchQuery.trim() && !hasAnyMatches && (
                <EmptyState icon={SearchX} title={t("workspaceHub.noResults")} />
              )}
            </div>

            {/* Right column: Deferred, Impersonation-Safe Personal Operational Feeds */}
            <HubSidePanel
              isImpersonating={feeds.isImpersonating}
              notifications={feeds.notifications}
              isLoadingNotifications={feeds.isLoadingNotifications}
              isNotificationsError={feeds.isNotificationsError}
              onRetryNotifications={() => void feeds.refetchNotifications()}
              onMarkNotificationAsRead={feeds.markNotificationAsRead}
              onMarkAllNotificationsAsRead={feeds.markAllNotificationsAsRead}
              isMarkingNotification={feeds.isMarkingNotification}
              activity={feeds.activity}
              isLoadingActivity={feeds.isLoadingActivity}
              isActivityError={feeds.isActivityError}
              onRetryActivity={() => void feeds.refetchActivity()}
            />
          </div>
        )}
      </div>

      {canManageBilling && upgradeWs && (
        <UpgradeDialog
          workspaceName={upgradeWs.getLocalizedName(language)}
          isNeedsTenant={!hasTenantContext && upgradeWs.lockReason === "TenantContextRequired"}
          onClose={() => setUpgradeTarget(null)}
          onUpgrade={() => {
            setUpgradeTarget(null);
            if (!hasTenantContext && upgradeWs.lockReason === "TenantContextRequired") {
              setSwitcherOpen(true);
            } else {
              router.push("/my-subscription");
            }
          }}
        />
      )}

      <TenantContextSwitcherDialog
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
      />
    </div>
  );
}
