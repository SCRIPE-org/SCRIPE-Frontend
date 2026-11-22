"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LayoutGrid, SearchX, ShieldAlert } from "lucide-react";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { TenantContextSwitcherDialog } from "@core/components/tenant-context";
import { useAdminContext } from "@core/hooks/useAdminContext";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import {
  buildSearchIndex,
  filterQuickJumpItems,
  type SearchableItem,
} from "@core/navigation/search";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { EmptyState } from "@core/ui/empty-state";
import { NexusWorkspaceLoader } from "@core/ui/layout/nexus/nexus-workspace-loader";
import { useWorkspaceTransition } from "@core/ui/layout/nexus/use-workspace-transition";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";
import { toast } from "@core/ui/sileo-toast";
import { HubAppSquircle } from "../components/HubAppSquircle";
import { HubRecentStrip } from "../components/HubRecentStrip";
import { HubTopbar } from "../components/HubTopbar";
import { HubTypeAheadBar } from "../components/HubTypeAheadBar";
import { HubUnlockSection } from "../components/HubUnlockSection";
import { useHubPersonalFeeds } from "../viewmodels/useHubPersonalFeeds";

const AI_COPILOT_DEMO_ENABLED = process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO === "true";
const AiCopilotDemoHost = AI_COPILOT_DEMO_ENABLED
  ? dynamic(
      () => import("@/features/ai-copilot-demo").then((m) => ({ default: m.AiCopilotDemoHost })),
      { ssr: false }
    )
  : null;

const MICRO_DOT_CANVAS_STYLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, color-mix(in srgb, var(--nx-line) 55%, transparent) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

function matchesWorkspaceQuery(ws: WorkspaceGroup, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  return (
    ws.workspaceNameEn.toLowerCase().includes(q) ||
    ws.workspaceNameAr.toLowerCase().includes(q) ||
    ws.workspaceKey.toLowerCase().includes(q)
  );
}

function orderUnlockedWorkspaces(workspaces: WorkspaceGroup[]): WorkspaceGroup[] {
  const pinned = workspaces
    .filter((ws) => ws.isPinned)
    .sort((a, b) => {
      const aOrder = a.pinSortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.pinSortOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder !== bOrder ? aOrder - bOrder : a.workspaceSortOrder - b.workspaceSortOrder;
    });
  const unpinned = workspaces
    .filter((ws) => !ws.isPinned)
    .sort((a, b) => a.workspaceSortOrder - b.workspaceSortOrder);
  return [...pinned, ...unpinned];
}

/**
 * Standalone Odoo-class SCRIPE Nexus Launchpad (`/hub`).
 *
 * Adheres to SCRIPE frontend architecture invariants:
 * - Zero mount-time auto-redirect (users landing on `/hub` stay on `/hub`)
 * - Single `<main id="hub-content" tabIndex={-1}>` landmark + skip-to-content link
 * - Unified deduplicated squircle grid (pinned sorted first, then unlocked catalog order)
 * - Type-Anywhere Live Search filtering squircles + up to 6 deep Quick Jump pages (`<bdi dir="ltr">`)
 * - Compact topbar popovers for Personal Notifications and Account & Sign-In Activity
 */
export function WorkspaceHubView() {
  const router = useRouter();
  const { activeTenantId } = useAdminContext();
  const hasTenantContext = Boolean(activeTenantId);
  const { workspaceGroups, isLoading, togglePin, setActiveWorkspace, setActiveRootItemId } =
    useWorkspace();
  const { loaderState, switchWorkspace } = useWorkspaceTransition();
  const { hasAnyPermission } = usePermissions();
  const { language, direction, t } = useI18n();

  const recentWorkspaceKeysByContext = useNavigationStore((s) => s.recentWorkspaceKeysByContext);
  const routesContextKey = useNavigationStore((s) => s.routesContextKey);
  const storeContextKey = useNavigationStore((s) => s.contextKey);
  const previousWorkspaceKey = useNavigationStore((s) => s.previousWorkspaceKey);
  const cachedWorkspaces = useNavigationStore((s) => s.workspaces);
  const routeDescriptors = useNavigationStore((s) => s.routeDescriptors);
  const recordRecentWorkspace = useNavigationStore((s) => s.recordRecentWorkspace);
  const navContextKey = routesContextKey || storeContextKey || "default";

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinLoadingKeys, setPinLoadingKeys] = useState<Set<string>>(new Set());
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const feeds = useHubPersonalFeeds();
  const isImpersonating = feeds.isImpersonating;

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

  const visibleWorkspaces = workspaceGroups.filter(
    (ws) =>
      hasTenantContext ||
      (!ws.isTenantOnly && !ws.isLocked && ws.lockReason !== "TenantContextRequired")
  );
  const unlockedWorkspaces = visibleWorkspaces.filter((ws) => !ws.isLocked);
  const unlockedByKey = new Map<string, WorkspaceGroup>(
    unlockedWorkspaces.map((ws) => [ws.workspaceKey, ws])
  );
  const orderedUnlockedWorkspaces = orderUnlockedWorkspaces(unlockedWorkspaces);
  const lockedWorkspaces =
    canManageBilling && hasTenantContext
      ? visibleWorkspaces.filter(
          (ws) => ws.isLocked && ws.lockReason !== "TenantContextRequired"
        )
      : [];

  const isSearchActive = searchQuery.trim().length > 0;
  const filteredUnlocked = orderedUnlockedWorkspaces.filter((ws) =>
    matchesWorkspaceQuery(ws, searchQuery)
  );
  const filteredLocked = lockedWorkspaces.filter((ws) => matchesWorkspaceQuery(ws, searchQuery));

  const recentKeys = recentWorkspaceKeysByContext[navContextKey] ?? [];
  const recentWorkspaces = recentKeys
    .map((key) => unlockedByKey.get(key))
    .filter((ws): ws is WorkspaceGroup => Boolean(ws))
    .slice(0, 4);

  const previousWorkspaceGroup = previousWorkspaceKey
    ? unlockedByKey.get(previousWorkspaceKey) ?? null
    : null;
  const previousWorkspace = previousWorkspaceGroup
    ? { key: previousWorkspaceGroup.workspaceKey, name: previousWorkspaceGroup.getLocalizedName(language) }
    : null;

  const searchableItems = buildSearchIndex({
    workspaceGroups: visibleWorkspaces,
    cachedWorkspaces,
    routeDescriptors,
    language,
    t,
  });
  const quickJumpItems = filterQuickJumpItems(searchableItems, searchQuery, 6);

  const handleTogglePin = async (key: string) => {
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
  };

  const handleSquircleClick = (ws: WorkspaceGroup) => {
    if (ws.isLocked) {
      if (canManageBilling && hasTenantContext) setUpgradeTarget(ws.workspaceKey);
      return;
    }
    switchWorkspace(ws.workspaceKey, { preserveHistory: true });
  };

  const handleQuickJumpSelect = (item: SearchableItem) => {
    setActiveWorkspace(item.workspaceKey, false);
    if (item.rootItemId) setActiveRootItemId(item.rootItemId);
    if (navContextKey) recordRecentWorkspace(navContextKey, item.workspaceKey);
    setIsSearchOpen(false);
    setSearchQuery("");
    startRoutingProgress();
    router.push(item.href);
  };

  const handleReturnToWorkspace = () => {
    if (!previousWorkspace) return;
    switchWorkspace(previousWorkspace.key);
  };

  const upgradeWs = upgradeTarget
    ? visibleWorkspaces.find((w) => w.workspaceKey === upgradeTarget) ?? null
    : null;

  if (isLoading) return <LoadingSpinner fullHeight />;

  const renderLaunchpad = (copilotTrigger: React.ReactNode, copilotPanel: React.ReactNode) => (
    <div dir={direction} className="relative flex min-h-0 flex-1 overflow-hidden">
      <a
        href="#hub-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-tooltip focus:rounded-nx-control focus:bg-nx-accent-fill focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-nx-on-fill focus:shadow-nx-focus focus:outline-none"
      >
        {t("nav.skipToContent")}
      </a>

      <NexusWorkspaceLoader
        show={loaderState.show}
        workspaceName={loaderState.workspaceName}
        workspaceAbbr={loaderState.workspaceAbbr}
        accentColor={loaderState.accentColor}
      />

      <div
        className="relative flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-nx-ground text-nx-ink"
        style={MICRO_DOT_CANVAS_STYLE}
      >
        <HubTopbar
          previousWorkspace={previousWorkspace}
          onReturnToWorkspace={handleReturnToWorkspace}
          onOpenSearch={() => setIsSearchOpen(true)}
          isSearchOpen={isSearchOpen || isSearchActive}
          onOpenContextSwitcher={() => setSwitcherOpen(true)}
          copilotTrigger={copilotTrigger}
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

        <main
          id="hub-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-[920px] flex-1 flex-col justify-center px-4 py-10 focus:outline-none sm:px-6 sm:py-14"
        >
          {isImpersonating && (
            <output
              data-testid="hub-impersonation-notice"
              className="mx-auto mb-6 flex max-w-[600px] items-start gap-2.5 rounded-nx-md border border-warning-strong/40 bg-warning/15 px-4 py-2.5 text-start text-xs leading-relaxed text-nx-ink-2"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-nx-warning-strong" aria-hidden="true" />
              <span>{t("workspaceHub.impersonationHidden")}</span>
            </output>
          )}

          <HubTypeAheadBar
            isOpen={isSearchOpen}
            onOpenChange={setIsSearchOpen}
            value={searchQuery}
            onChange={setSearchQuery}
            quickJumpItems={quickJumpItems}
            onSelectQuickJump={handleQuickJumpSelect}
          />

          {unlockedWorkspaces.length === 0 ? (
            <EmptyState
              size="lg"
              icon={LayoutGrid}
              title={t("workspaceHub.emptyState")}
              description={t("workspaceHub.emptyStateHint")}
            />
          ) : filteredUnlocked.length === 0 && quickJumpItems.length === 0 && filteredLocked.length === 0 ? (
            <EmptyState icon={SearchX} title={t("workspaceHub.noResults")} />
          ) : (
            filteredUnlocked.length > 0 && (
              <section aria-label={t("workspaceHub.launchpad.appsGridAria")}>
                <div className="mx-auto flex max-w-[752px] flex-wrap justify-center gap-x-4 gap-y-6">
                  {filteredUnlocked.map((ws) => (
                    <HubAppSquircle
                      key={ws.workspaceKey}
                      name={ws.getLocalizedName(language)}
                      icon={ws.workspaceIcon}
                      colorHue={ws.colorHue}
                      colorChroma={ws.colorChroma}
                      isLocked={false}
                      isPinned={ws.isPinned}
                      isPinDisabled={isImpersonating}
                      isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                      onClick={() => handleSquircleClick(ws)}
                      onTogglePin={() => void handleTogglePin(ws.workspaceKey)}
                    />
                  ))}
                </div>
              </section>
            )
          )}

          {!isSearchActive && recentWorkspaces.length >= 2 && (
            <HubRecentStrip
              workspaces={recentWorkspaces}
              language={language}
              onOpenWorkspace={handleSquircleClick}
            />
          )}

          {canManageBilling && hasTenantContext && (
            <HubUnlockSection
              lockedWorkspaces={filteredLocked}
              upgradeTargetWorkspace={upgradeWs}
              language={language}
              hasTenantContext={hasTenantContext}
              onSelectLocked={handleSquircleClick}
              onCloseDialog={() => setUpgradeTarget(null)}
              onConfirmUpgrade={(needsTenant) => {
                setUpgradeTarget(null);
                if (needsTenant) setSwitcherOpen(true);
                else router.push("/my-subscription");
              }}
            />
          )}

          {!isSearchOpen && !isSearchActive && unlockedWorkspaces.length > 0 && (
            <p className="mt-10 hidden items-center justify-center gap-1.5 text-center text-xs text-nx-ink-3 sm:flex">
              <span>{t("workspaceHub.launchpad.typeAnywhereHint")}</span>
              <span aria-hidden="true">·</span>
              <kbd className="rounded-nx-sm border border-nx-line bg-nx-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-nx-ink-2">
                /
              </kbd>
            </p>
          )}
        </main>
      </div>

      {copilotPanel}
      <TenantContextSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen} />
    </div>
  );

  if (AiCopilotDemoHost) {
    return (
      <AiCopilotDemoHost>
        {({ triggerNode, panelNode }) => renderLaunchpad(triggerNode, panelNode)}
      </AiCopilotDemoHost>
    );
  }

  return renderLaunchpad(null, null);
}
