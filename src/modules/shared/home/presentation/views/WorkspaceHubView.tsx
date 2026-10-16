"use client";

/**
 * WorkspaceHubView — Premium App Launcher Hub page.
 *
 * Odoo/M365-style full-screen workspace picker with vibrant gradient tiles.
 * This is the landing page after login — shows all accessible workspaces.
 *
 * Sections:
 * - HubTopBar (rendered by NexusLayout in hub mode — not here)
 * - HubHero: greeting + status pill
 * - HubSearch: the shared Input primitive with a / shortcut
 * - Pinned strip: smaller tiles of pinned workspaces
 * - Modules grid: 5-column grid of all module workspaces
 * - Administration grid: muted admin workspaces
 * - Side panel: Today activity + Recent items
 * - Footer: version + links
 *
 * Smart landing:
 * - 1 workspace only → auto-redirect (skip Hub)
 * - Search filters tiles by name (debounced)
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useWorkspaceTransition } from "@core/ui/layout/nexus/use-workspace-transition";
import { UpgradeDialog } from "@core/ui/layout/nexus/nexus-app-launcher";

import { Star, SearchX, LayoutGrid } from "lucide-react";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

import { HubHero } from "../components/HubHero";
import { HubSearch } from "../components/HubSearch";
import { HubModuleTile } from "../components/HubModuleTile";
import { HubSectionHeader } from "../components/HubSectionHeader";
import { HubSidePanel } from "../components/HubSidePanel";
import { HubFooter } from "../components/HubFooter";
import { useHubActivity } from "../hooks/useHubActivity";

export function WorkspaceHubView() {
  const router = useRouter();
  const { currentTenant } = useTenantContext();
  const hasTenantContext = currentTenant !== null;
  const { workspaceGroups, isLoading, togglePin } = useWorkspace();
  const { switchWorkspace } = useWorkspaceTransition();
  const { language, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [pinLoadingKeys, setPinLoadingKeys] = useState<Set<string>>(new Set());
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null);
  const hubActivity = useHubActivity();

  // ── Hub identity: no workspace is active on the Hub page ──────────────────
  useEffect(() => {
    const state = useNavigationStore.getState();
    if (state.activeWorkspaceKey !== null) {
      state.setActiveWorkspace(null);
    }
  }, []);

  // Track whether auto-redirect has already fired this session.
  const [hasAutoRedirected, setHasAutoRedirected] = useState(false);

  // ── Workspace splits ──────────────────────────────────────────────────────

  const { pinnedWorkspaces, moduleWorkspaces, adminWorkspaces, lockedWorkspaces } = useMemo(() => {
    const pinned: WorkspaceGroup[] = [];
    const modules: WorkspaceGroup[] = [];
    const admin: WorkspaceGroup[] = [];
    const locked: WorkspaceGroup[] = [];

    for (const ws of workspaceGroups) {
      if (ws.isLocked) {
        locked.push(ws);
        continue;
      }
      if (ws.isPinned) pinned.push(ws);
      if (ws.isModuleWorkspace) modules.push(ws);
      else admin.push(ws);
    }

    // Sort pinned by pinSortOrder
    pinned.sort((a, b) => (a.pinSortOrder ?? 999) - (b.pinSortOrder ?? 999));

    return {
      pinnedWorkspaces: pinned,
      moduleWorkspaces: modules,
      adminWorkspaces: admin,
      lockedWorkspaces: locked,
    };
  }, [workspaceGroups]);

  // ── Search filtering ────────────────────────────────────────────────────────

  const filterBySearch = useCallback(
    (ws: WorkspaceGroup) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        ws.workspaceNameEn.toLowerCase().includes(q) ||
        ws.workspaceNameAr.toLowerCase().includes(q) ||
        ws.workspaceKey.toLowerCase().includes(q)
      );
    },
    [searchQuery]
  );

  const filteredModules = useMemo(
    () => moduleWorkspaces.filter(filterBySearch),
    [moduleWorkspaces, filterBySearch]
  );
  const filteredAdmin = useMemo(
    () => adminWorkspaces.filter(filterBySearch),
    [adminWorkspaces, filterBySearch]
  );
  const filteredPinned = useMemo(
    () => pinnedWorkspaces.filter(filterBySearch),
    [pinnedWorkspaces, filterBySearch]
  );
  const filteredLocked = useMemo(
    () => lockedWorkspaces.filter(filterBySearch),
    [lockedWorkspaces, filterBySearch]
  );

  const allUnlocked = useMemo(
    () => workspaceGroups.filter((ws) => !ws.isLocked),
    [workspaceGroups]
  );

  // ── Auto-redirect: 1 unlocked workspace → skip hub ────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (hasAutoRedirected) return;
    if (allUnlocked.length === 1 && lockedWorkspaces.length === 0) {
      queueMicrotask(() => {
        setHasAutoRedirected(true);
        switchWorkspace(allUnlocked[0].workspaceKey);
      });
    }
  }, [isLoading, allUnlocked, lockedWorkspaces, switchWorkspace, hasAutoRedirected]);

  // ── Pin toggle handler ────────────────────────────────────────────────────
  const handleTogglePin = useCallback(
    async (key: string) => {
      setPinLoadingKeys((prev) => new Set(prev).add(key));
      try {
        await togglePin(key);
      } finally {
        setPinLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [togglePin]
  );

  // ── Tile click handler ────────────────────────────────────────────────────
  const handleTileClick = useCallback(
    (ws: WorkspaceGroup) => {
      if (ws.isLocked) {
        setUpgradeTarget(ws.workspaceKey);
        return;
      }
      switchWorkspace(ws.workspaceKey);
    },
    [switchWorkspace]
  );

  const upgradeWs = useMemo(
    () => (upgradeTarget ? workspaceGroups.find((w) => w.workspaceKey === upgradeTarget) : null),
    [upgradeTarget, workspaceGroups]
  );

  // ── Helper: get localized name ─────────────────────────────────────────────
  const getName = useCallback((ws: WorkspaceGroup) => ws.getLocalizedName(language), [language]);

  // ── Helper: item label ─────────────────────────────────────────────────────
  const getItemLabel = useCallback(
    (ws: WorkspaceGroup) => {
      const count = ws.accessibleItemCount;
      if (count === 0) return "";
      if (count === 1) return t("workspaceHub.items.one");
      return t("workspaceHub.items.other", { count });
    },
    [t]
  );

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return <LoadingSpinner fullHeight />;
  }

  // Auto-redirect in progress
  if (allUnlocked.length === 1 && lockedWorkspaces.length === 0 && !hasAutoRedirected) {
    return <LoadingSpinner fullHeight />;
  }

  // ── Total module count for "X of Y licensed" label ─────────────────────────
  const totalModules =
    moduleWorkspaces.length + lockedWorkspaces.filter((ws) => ws.workspaceType === "Module").length;
  const licensedCount = moduleWorkspaces.length;

  const hasAnyResults =
    filteredModules.length > 0 ||
    filteredAdmin.length > 0 ||
    filteredPinned.length > 0 ||
    filteredLocked.length > 0;

  return (
    <main className="relative mx-auto max-w-7xl px-10 pb-14 text-nx-ink">
      <HubHero />

      <div className="h-2" />
      <HubSearch value={searchQuery} onChange={setSearchQuery} />
      <div className="h-8" />

      {/* Main content + side panel */}
      <div className="flex items-start gap-10">
        {/* Left column — grids */}
        <div className="min-w-0 flex-1">
          {/* Pinned strip */}
          {filteredPinned.length > 0 && !searchQuery && (
            <section className="mb-8">
              <HubSectionHeader
                icon={
                  <span className="inline-flex text-warning">
                    <Star size={13} fill="currentColor" strokeWidth={0} />
                  </span>
                }
                title={t("workspaceHub.sections.pinned")}
                subtitle={
                  filteredPinned.length === 1
                    ? t("workspaceHub.pinned.apps_one")
                    : t("workspaceHub.pinned.apps_other", { count: filteredPinned.length })
                }
                action={
                  <button
                    type="button"
                    className="cursor-pointer rounded-nx-sm border-0 bg-transparent p-0 text-xs font-medium text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
                  >
                    {t("workspaceHub.pinned.manage")}
                  </button>
                }
              />
              <div className="flex flex-wrap gap-3.5">
                {filteredPinned.map((ws) => (
                  <HubModuleTile
                    key={ws.workspaceKey}
                    name={getName(ws)}
                    icon={ws.workspaceIcon}
                    colorHue={ws.colorHue}
                    colorChroma={ws.colorChroma}
                    isLocked={false}
                    isPinned={true}
                    isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                    accessibleItemCount={ws.accessibleItemCount}
                    itemLabel={getItemLabel(ws)}
                    size="md"
                    onClick={() => handleTileClick(ws)}
                    onTogglePin={() => handleTogglePin(ws.workspaceKey)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Modules grid */}
          {(filteredModules.length > 0 ||
            filteredLocked.some((ws) => ws.workspaceType === "Module")) && (
            <section className="mb-9">
              <HubSectionHeader
                title={t("workspaceHub.sections.modules")}
                subtitle={
                  searchQuery
                    ? filteredModules.length === 1
                      ? t("workspaceHub.items.one")
                      : t("workspaceHub.items.other", { count: filteredModules.length })
                    : t("workspaceHub.modules.licensed", {
                        count: licensedCount,
                        total: totalModules,
                      })
                }
                action={
                  !searchQuery ? (
                    <span className="rounded-full border border-nx-line bg-nx-hover px-2.5 py-1 text-[11px] font-medium tracking-wide text-nx-ink-3">
                      {t("workspaceHub.modules.sortLabel")}
                    </span>
                  ) : undefined
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, 158px)",
                  gap: 16,
                  maxWidth: 870,
                }}
              >
                {filteredModules.map((ws) => (
                  <HubModuleTile
                    key={ws.workspaceKey}
                    name={getName(ws)}
                    icon={ws.workspaceIcon}
                    colorHue={ws.colorHue}
                    colorChroma={ws.colorChroma}
                    isLocked={false}
                    isPinned={ws.isPinned}
                    isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                    accessibleItemCount={ws.accessibleItemCount}
                    itemLabel={getItemLabel(ws)}
                    size="lg"
                    onClick={() => handleTileClick(ws)}
                    onTogglePin={() => handleTogglePin(ws.workspaceKey)}
                  />
                ))}

                {/* Locked modules in same grid */}
                {filteredLocked
                  .filter((ws) => ws.workspaceType === "Module")
                  .map((ws) => (
                    <HubModuleTile
                      key={ws.workspaceKey}
                      name={getName(ws)}
                      icon={ws.workspaceIcon}
                      colorHue={ws.colorHue}
                      colorChroma={ws.colorChroma}
                      isLocked={true}
                      isPinned={false}
                      accessibleItemCount={0}
                      itemLabel=""
                      size="lg"
                      onClick={() => handleTileClick(ws)}
                      upgradeBadgeText={t("workspaceHub.upgradeBadge")}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Administration grid */}
          {(filteredAdmin.length > 0 ||
            filteredLocked.some((ws) => ws.workspaceType !== "Module")) && (
            <section className="mb-8">
              <HubSectionHeader
                title={t("workspaceHub.sections.administration")}
                subtitle={t("workspaceHub.admin.subtitle")}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, 158px)",
                  gap: 16,
                  maxWidth: 870,
                }}
              >
                {filteredAdmin.map((ws) => (
                  <HubModuleTile
                    key={ws.workspaceKey}
                    name={getName(ws)}
                    icon={ws.workspaceIcon}
                    colorHue={ws.colorHue}
                    colorChroma={ws.colorChroma}
                    isLocked={false}
                    isPinned={ws.isPinned}
                    isPinLoading={pinLoadingKeys.has(ws.workspaceKey)}
                    accessibleItemCount={ws.accessibleItemCount}
                    itemLabel={getItemLabel(ws)}
                    size="lg"
                    onClick={() => handleTileClick(ws)}
                    onTogglePin={() => handleTogglePin(ws.workspaceKey)}
                  />
                ))}

                {/* Locked admin workspaces in same grid */}
                {filteredLocked
                  .filter((ws) => ws.workspaceType !== "Module")
                  .map((ws) => (
                    <HubModuleTile
                      key={ws.workspaceKey}
                      name={getName(ws)}
                      icon={ws.workspaceIcon}
                      colorHue={ws.colorHue}
                      colorChroma={ws.colorChroma}
                      isLocked={true}
                      isPinned={false}
                      accessibleItemCount={0}
                      itemLabel=""
                      size="lg"
                      onClick={() => handleTileClick(ws)}
                      upgradeBadgeText={t("workspaceHub.upgradeBadge")}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* No results — the shared empty anatomy */}
          {searchQuery && !hasAnyResults && (
            <EmptyState icon={SearchX} title={t("workspaceHub.noResults")} />
          )}

          {/* Nothing licensed at all — same anatomy, page size */}
          {!searchQuery && workspaceGroups.length === 0 && (
            <EmptyState size="lg" icon={LayoutGrid} title={t("workspaceHub.emptyState")} />
          )}
        </div>

        {/* Side panel — hide when searching to maximize grid area */}
        {!searchQuery && (
          <HubSidePanel
            todayCount={hubActivity.todayCount}
            moduleCount={hubActivity.moduleCount}
            trendPercent={hubActivity.trendPercent}
            recentItems={hubActivity.recentItems}
            isLoading={hubActivity.isLoading}
          />
        )}
      </div>

      <HubFooter />

      {upgradeTarget && (
        <UpgradeDialog
          workspaceName={
            upgradeWs?.getLocalizedName(language) ?? upgradeWs?.workspaceNameEn ?? upgradeTarget
          }
          isNeedsTenant={!hasTenantContext && (upgradeWs?.isModuleWorkspace ?? false)}
          onClose={() => setUpgradeTarget(null)}
          onUpgrade={() => {
            setUpgradeTarget(null);
            if (!hasTenantContext && upgradeWs?.isModuleWorkspace) {
              router.push("/tenants");
            } else {
              router.push("/entitlements/editions/compare");
            }
          }}
        />
      )}
    </main>
  );
}
