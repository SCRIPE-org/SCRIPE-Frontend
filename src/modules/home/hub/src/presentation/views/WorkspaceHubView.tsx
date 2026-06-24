// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

/**
 * WorkspaceHubView — Premium App Launcher Hub page.
 *
 * Odoo/M365-style full-screen workspace picker with vibrant gradient tiles.
 * This is the landing page after login — shows all accessible workspaces.
 *
 * Sections:
 * - HubTopBar (rendered by NexusLayout in hub mode — not here)
 * - HubHero: greeting + animated mesh gradient
 * - HubSearch: glassmorphism search bar with / shortcut
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

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { useWorkspaceTransition } from "@core/ui/layout/nexus/use-workspace-transition";

import { Loader2, Star } from "lucide-react";
import type { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";

import { HubHero } from "../components/HubHero";
import { HubSearch } from "../components/HubSearch";
import { HubModuleTile } from "../components/HubModuleTile";
import { HubSectionHeader } from "../components/HubSectionHeader";
import { HubSidePanel } from "../components/HubSidePanel";
import { HubFooter } from "../components/HubFooter";
import { useHubActivity } from "../hooks/useHubActivity";

/**
 * React presentation component representing the workspace hub view UI element.
 */
export function WorkspaceHubView() {
  const { workspaceGroups, isLoading, togglePin } = useWorkspace();
  const { switchWorkspace } = useWorkspaceTransition();
  const { language, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [pinLoadingKeys, setPinLoadingKeys] = useState<Set<string>>(new Set());
  const hubActivity = useHubActivity();

  // ── Hub identity: no workspace is active on the Hub page ──────────────────
  useEffect(() => {
    const state = useNavigationStore.getState();
    if (state.activeWorkspaceKey !== null) {
      state.setActiveWorkspace(null);
    }
  }, []);

  // Track whether auto-redirect has already fired this session.
  const hasAutoRedirected = useRef(false);

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
    if (hasAutoRedirected.current) return;
    if (allUnlocked.length === 1 && lockedWorkspaces.length === 0) {
      hasAutoRedirected.current = true;
      switchWorkspace(allUnlocked[0].workspaceKey);
    }
  }, [isLoading, allUnlocked, lockedWorkspaces, switchWorkspace]);

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
      if (ws.isLocked) return; // locked — no action for now
      switchWorkspace(ws.workspaceKey);
    },
    [switchWorkspace]
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
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}
      >
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", color: "rgba(230,233,245,0.5)" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Auto-redirect in progress
  if (allUnlocked.length === 1 && lockedWorkspaces.length === 0 && !hasAutoRedirected.current) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}
      >
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", color: "rgba(230,233,245,0.5)" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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
    <main
      style={{
        position: "relative",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 40px 56px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#e6e9f5",
      }}
    >
      <HubHero />

      <div style={{ height: 8 }} />
      <HubSearch value={searchQuery} onChange={setSearchQuery} />
      <div style={{ height: 32 }} />

      {/* Main content + side panel */}
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Left column — grids */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Pinned strip */}
          {filteredPinned.length > 0 && !searchQuery && (
            <section style={{ marginBottom: 32 }}>
              <HubSectionHeader
                icon={
                  <span
                    style={{
                      display: "inline-flex",
                      color: "#FFC25E",
                      filter: "drop-shadow(0 0 8px rgba(255,194,94,0.35))",
                    }}
                  >
                    <Star size={13} fill="currentColor" strokeWidth={0} />
                  </span>
                }
                title={t("workspaceHub.sections.pinned")}
                subtitle={`${filteredPinned.length} ${filteredPinned.length === 1 ? "app" : "apps"}`}
                action={
                  <button
                    type="button"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "rgba(230,233,245,0.55)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    {t("workspaceHub.pinned.manage")}
                  </button>
                }
              />
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
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
          {filteredModules.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <HubSectionHeader
                title={t("workspaceHub.sections.modules")}
                subtitle={
                  searchQuery
                    ? `${filteredModules.length} results`
                    : t("workspaceHub.modules.licensed", {
                        count: licensedCount,
                        total: totalModules,
                      })
                }
                action={
                  !searchQuery ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        color: "rgba(230,233,245,0.5)",
                        padding: "4px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.025)",
                      }}
                    >
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
          {filteredAdmin.length > 0 && (
            <section style={{ marginBottom: 32 }}>
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
              </div>
            </section>
          )}

          {/* No results */}
          {searchQuery && !hasAnyResults && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "rgba(230,233,245,0.45)",
                fontSize: 14,
              }}
            >
              {t("workspaceHub.noResults")}
            </div>
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

      {/* Mesh animation keyframes */}
      <style>{`
        @keyframes nx-hub-mesh-a-kf {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(40px, 20px) scale(1.08); }
        }
        @keyframes nx-hub-mesh-b-kf {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-30px, 25px) scale(0.94); }
        }
        @keyframes nx-hub-mesh-c-kf {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -15px) scale(1.06); }
        }
        .nx-hub-mesh-a { animation: nx-hub-mesh-a-kf 14s ease-in-out infinite; }
        .nx-hub-mesh-b { animation: nx-hub-mesh-b-kf 18s ease-in-out infinite; }
        .nx-hub-mesh-c { animation: nx-hub-mesh-c-kf 16s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
