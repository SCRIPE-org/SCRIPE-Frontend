"use client";

/**
 * WorkspaceHubView — The landing page for authenticated users.
 *
 * Design pattern: Microsoft 365 App Launcher meets Notion workspace picker.
 * Shows all accessible workspaces as cards in a responsive grid.
 *
 * Logic:
 * - If admin has only 1 accessible workspace AND this is the first visit (not explicit nav)
 *   → auto-redirect immediately (no Hub shown)
 * - If admin has 2+ workspaces → show the Hub with cards
 * - Locked workspaces (only visible to billing admins) show with lock overlay
 *
 * The old HomeView (KPIs, recent activity) is now at /overview inside the Admin workspace.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { WorkspaceHubCard } from "../components/WorkspaceHubCard";
import { Loader2 } from "lucide-react";
import { useWorkspaceTransitionContext } from "@core/ui/layout/nexus/nexus-layout";
import { cn } from "@core/common/utils";

export function WorkspaceHubView() {
  const { workspaceGroups, isLoading } = useWorkspace();
  const { switchWorkspace } = useWorkspaceTransitionContext();
  const { language, t } = useI18n();
  const isRTL = language === "ar";

  // Stable admin name from plain properties (class getters are lost after Zustand persist)
  const adminName = useAppStore((s) => {
    const u = s.user;
    if (!u) return "";
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.username || "";
  });

  // ── Hub identity: no workspace is active on the Hub page ──────────────────
  // This is the single authoritative guard. Regardless of how the user arrived
  // (logo click, browser back, typed URL, refresh), the Hub declares: "no
  // workspace is selected here". This collapses the secondary rail and resets
  // breadcrumbs/accent to the platform default.
  useEffect(() => {
    const state = useNavigationStore.getState();
    if (state.activeWorkspaceKey !== null) {
      state.setActiveWorkspace(null);
    }
  }, []); // Mount-only

  // Track whether auto-redirect has already fired this session.
  // Prevents the infinite loop where logo-click → Hub → immediate redirect.
  const hasAutoRedirected = useRef(false);

  // Split workspaces into unlocked and locked
  const { unlockedWorkspaces, lockedWorkspaces } = useMemo(() => {
    const unlocked = workspaceGroups.filter((ws) => !ws.isLocked);
    const locked = workspaceGroups.filter((ws) => ws.isLocked);
    return { unlockedWorkspaces: unlocked, lockedWorkspaces: locked };
  }, [workspaceGroups]);

  // Auto-redirect: if exactly 1 workspace AND first mount (not explicit logo-click)
  useEffect(() => {
    if (isLoading) return;
    if (hasAutoRedirected.current) return; // Already redirected once — user explicitly came back
    if (unlockedWorkspaces.length === 1 && lockedWorkspaces.length === 0) {
      hasAutoRedirected.current = true;
      const only = unlockedWorkspaces[0];
      switchWorkspace(only.workspaceKey);
    }
  }, [isLoading, unlockedWorkspaces, lockedWorkspaces, switchWorkspace]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If auto-redirect is in progress (first visit, 1 workspace), show loading
  if (
    unlockedWorkspaces.length === 1 &&
    lockedWorkspaces.length === 0 &&
    !hasAutoRedirected.current
  ) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const greeting = getGreeting(t);

  return (
    <div className={cn("mx-auto max-w-5xl px-6 py-10", isRTL && "rtl")}>
      {/* Hero Section */}
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {greeting}{adminName ? `, ${adminName}` : ""}
        </h1>
        <p className="text-base text-muted-foreground">
          {t("workspaceHub.subtitle")}
        </p>
      </div>

      {/* Unlocked Workspaces Grid */}
      {unlockedWorkspaces.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("workspaceHub.sectionTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedWorkspaces.map((ws) => (
              <WorkspaceHubCard
                key={ws.workspaceKey}
                workspaceKey={ws.workspaceKey}
                nameEn={ws.workspaceNameEn}
                nameAr={ws.workspaceNameAr}
                icon={ws.workspaceIcon}
                colorHue={ws.colorHue}
                colorChroma={ws.colorChroma}
                isLocked={false}
                accessibleItemCount={ws.accessibleItemCount}
                language={language}
                lastAccessed={null}
                onClick={() => switchWorkspace(ws.workspaceKey)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Locked Workspaces — only shown to billing-capable admins */}
      {lockedWorkspaces.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("workspaceHub.upgradeSection")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lockedWorkspaces.map((ws) => (
              <WorkspaceHubCard
                key={ws.workspaceKey}
                workspaceKey={ws.workspaceKey}
                nameEn={ws.workspaceNameEn}
                nameAr={ws.workspaceNameAr}
                icon={ws.workspaceIcon}
                colorHue={ws.colorHue}
                colorChroma={ws.colorChroma}
                isLocked={true}
                accessibleItemCount={0}
                language={language}
                lastAccessed={null}
                onClick={() => {/* locked — no action */}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("workspaceHub.greeting.morning");
  if (hour < 18) return t("workspaceHub.greeting.afternoon");
  return t("workspaceHub.greeting.evening");
}
