"use client";

/**
 * ScripeRail — primary icon rail (EDGE skin)
 *
 * Three zones, top to bottom:
 *   1. Mark
 *   2. Root navigation for the active workspace — the active glyph is the one
 *      emitting element on the screen (law 3), marked by a sliding edge light.
 *   3. Pin zone + identity cluster.
 *
 * The pin contract:
 *   - Inside a module workspace the admin workspace auto-pins at the top of the
 *     pin zone as the way back. It is shown only when the user can reach it and
 *     is not user-removable.
 *   - User pins follow, in the backend's pinSortOrder (the pin endpoint is
 *     authoritative; the client never computes order).
 *
 * Every colour is a token — there are no isDark ternaries in this file.
 */

import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";
import { Grid3x3, CornerUpLeft } from "lucide-react";
import type { MenuItem, WorkspaceGroup } from "@core/navigation";

interface ScripeRailProps {
  onLauncherOpen: () => void;
  identitySlot?: React.ReactNode;
}

/** Workspace tile tint derived from the workspace's own OKLCH hue. */
function hueTint(ws: WorkspaceGroup, alpha: number): string {
  const hue = ws.colorHue ?? 262;
  const chroma = ws.colorChroma ?? 0.18;
  return `oklch(0.68 ${chroma} ${hue} / ${alpha})`;
}

/**
 * Presentation UI component rendering the primary icon rail.
 * Colours resolve from the EDGE token layer (@see globals.css); geometry from
 * scripe-constants.ts.
 */
export function ScripeRail({ onLauncherOpen, identitySlot }: ScripeRailProps) {
  const {
    activeWorkspace,
    workspaceGroups,
    rootMenuItems,
    activeRootItem,
    setActiveRootItemId,
    setActiveWorkspace,
    isModuleMode,
  } = useWorkspace();
  const { language, t } = useI18n();

  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const label = (item: { nameEn: string; nameAr: string }) =>
    language === "ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;

  const wsLabel = (ws: WorkspaceGroup) =>
    language === "ar"
      ? ws.workspaceNameAr || ws.workspaceNameEn
      : ws.workspaceNameEn || ws.workspaceNameAr;

  // ── Pin zone: auto back-to-admin + user pins ──
  const adminWorkspace = useMemo(
    () => workspaceGroups.find((ws) => ws.isAdminWorkspace && !ws.isLocked) ?? null,
    [workspaceGroups]
  );
  const userPins = useMemo(
    () =>
      workspaceGroups.filter(
        (ws) => ws.isPinned && !ws.isLocked && ws.workspaceKey !== adminWorkspace?.workspaceKey
      ),
    [workspaceGroups, adminWorkspace]
  );
  const showBackToAdmin = isModuleMode && adminWorkspace !== null;

  // ── Sliding edge light tracks the active root item ──
  // Driven straight onto the node: this is a purely visual position that must
  // land in the same frame as the layout, and routing it through state would
  // cost a second render for something React never needs to know about.
  useLayoutEffect(() => {
    const container = listRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) {
      return;
    }
    const active = container.querySelector<HTMLElement>('[data-active="true"]');
    if (active) {
      indicator.style.transform = `translateY(${active.offsetTop + 9}px)`;
      indicator.style.opacity = "1";
    } else {
      indicator.style.opacity = "0";
    }
  }, [activeRootItem?.id, rootMenuItems.length]);

  return (
    <TooltipProvider delayDuration={300}>
      <nav
        aria-label={t("nav.primary") || "Primary"}
        className="sx-rail flex h-full flex-col items-center gap-1.5 py-3"
        style={{
          width: "var(--sx-rail-w)",
          background: "var(--sx-sub)",
          borderInlineEnd: "1px solid var(--sx-edge)",
        }}
      >
        {/* ── Mark ── */}
        <div className="mb-2 grid h-9 w-9 place-items-center" aria-hidden="true">
          <svg viewBox="0 0 200 260" fill="none" className="h-6 w-6">
            <defs>
              <linearGradient id="sxMark" x1="60" y1="20" x2="120" y2="250" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#c084fc" />
                <stop offset=".45" stopColor="#7c3aed" />
                <stop offset=".8" stopColor="#4f46e5" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d="M138 34 H70 a34 34 0 0 0 0 68 h30 a34 34 0 0 1 0 68 H32"
              stroke="url(#sxMark)"
              strokeWidth="26"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ── App launcher ── */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onLauncherOpen}
              aria-haspopup="dialog"
              aria-label={t("nav.appLauncher") || "App launcher"}
              className="sx-rail-btn grid h-10 w-10 place-items-center rounded-[9px] border border-transparent"
            >
              <Grid3x3 size={17} />
            </button>
          </TooltipTrigger>
          <TooltipContent side={language === "ar" ? "left" : "right"}>
            {t("nav.appLauncher") || "App launcher"}
          </TooltipContent>
        </Tooltip>

        {/* ── Root navigation ── */}
        <div ref={listRef} className="relative flex w-full flex-col items-center gap-1.5">
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="sx-rail-indicator"
            style={{ opacity: 0 }}
          />
          {rootMenuItems.map((item: MenuItem) => {
            const isActive = activeRootItem?.id === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-active={isActive}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveRootItemId(item.id)}
                    className={cn(
                      "sx-rail-btn grid h-10 w-10 place-items-center rounded-[9px] border border-transparent",
                      isActive && "sx-rail-btn--active"
                    )}
                  >
                    <DynamicIcon name={item.icon} size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side={language === "ar" ? "left" : "right"}>
                  {label(item)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* ── Pin zone ── */}
        {(showBackToAdmin || userPins.length > 0) && (
          <>
            <span
              aria-hidden="true"
              className="my-2 block h-px w-6 shrink-0"
              style={{ background: "var(--sx-edge)" }}
            />
            <div className="flex flex-col items-center gap-1.5">
              {showBackToAdmin && adminWorkspace && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setActiveWorkspace(adminWorkspace.workspaceKey, true)}
                      aria-label={`${t("nav.backTo") || "Back to"} ${wsLabel(adminWorkspace)}`}
                      className="sx-pin relative grid h-[38px] w-[38px] place-items-center rounded-[9px] border"
                      style={{
                        background: hueTint(adminWorkspace, 0.15),
                        borderColor: hueTint(adminWorkspace, 0.45),
                        color: hueTint(adminWorkspace, 1),
                      }}
                    >
                      {adminWorkspace.abbreviation}
                      <span className="sx-pin-back grid place-items-center" aria-hidden="true">
                        <CornerUpLeft size={9} />
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={language === "ar" ? "left" : "right"}>
                    {t("nav.backTo") || "Back to"} {wsLabel(adminWorkspace)}
                  </TooltipContent>
                </Tooltip>
              )}

              {userPins.map((ws) => {
                const isActive = ws.workspaceKey === activeWorkspace?.workspaceKey;
                return (
                  <Tooltip key={ws.workspaceKey}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setActiveWorkspace(ws.workspaceKey, true)}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={wsLabel(ws)}
                        className={cn(
                          "sx-pin relative grid h-[38px] w-[38px] place-items-center rounded-[9px] border",
                          isActive && "sx-pin--active"
                        )}
                        style={{
                          background: hueTint(ws, 0.15),
                          borderColor: hueTint(ws, 0.45),
                          color: hueTint(ws, 1),
                        }}
                      >
                        {ws.abbreviation}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={language === "ar" ? "left" : "right"}>
                      {wsLabel(ws)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </>
        )}

        {/* ── Identity cluster — the ONE home for notifications + account ── */}
        <div className="mt-auto flex flex-col items-center gap-1.5">{identitySlot}</div>
      </nav>
    </TooltipProvider>
  );
}
