"use client";

import React from "react";
import { Search, Home } from "lucide-react";
import { NotificationBell } from "@core/ui/notification";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "@core/ui/layout/navigation/nav-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

// ── Breadcrumbs ──────────────────────────────────────────────────────────────
export function BreadcrumbSep({ isRTL, isDark }: { isRTL: boolean; isDark: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        transform: isRTL ? "scaleX(-1)" : undefined,
        color: isDark ? "#334155" : "#CBD5E1",
      }}
    >
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface TopbarBreadcrumbsProps {
  isRTL: boolean;
  isDark: boolean;
  workspaceName: string;
  activeRootName?: string | null;
  displayPageName: string;
}

export function TopbarBreadcrumbs({
  isRTL,
  isDark,
  workspaceName,
  activeRootName,
  displayPageName,
}: TopbarBreadcrumbsProps) {
  return (
    <div
      style={{
        fontSize: 13,
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <span
        style={{
          color: isDark ? "#64748B" : "#94A3B8",
          fontWeight: 500,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {workspaceName}
      </span>

      {activeRootName && (
        <>
          <BreadcrumbSep isRTL={isRTL} isDark={isDark} />
          <span
            style={{
              color: isDark ? "#94A3B8" : "#64748B",
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {activeRootName}
          </span>
        </>
      )}

      {displayPageName && (
        <>
          <BreadcrumbSep isRTL={isRTL} isDark={isDark} />
          <span
            style={{
              color: isDark ? "#F8FAFC" : "#0F172A",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "-0.2px",
            }}
          >
            {displayPageName}
          </span>
        </>
      )}
    </div>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
export interface TopbarPanelToggleProps {
  isRTL: boolean;
  isDark: boolean;
  isPanelCollapsed?: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

export function TopbarPanelToggle({
  isRTL,
  isDark,
  isPanelCollapsed,
  onToggle,
  ariaLabel,
}: TopbarPanelToggleProps) {
  const renderPanelIcon = () => {
    if (isRTL) {
      return isPanelCollapsed ? (
        <PanelMenuIconRTL className="h-[18px] w-[18px]" />
      ) : (
        <PanelCollapseIconRTL className="h-[18px] w-[18px]" />
      );
    }
    return isPanelCollapsed ? (
      <PanelMenuIcon className="h-[18px] w-[18px]" />
    ) : (
      <PanelCollapseIcon className="h-[18px] w-[18px]" />
    );
  };

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onToggle}
            aria-label={ariaLabel}
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              cursor: "pointer",
              color: isDark ? "#AFA9EC" : "#6258c4",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(98,88,196,0.04)",
              flexShrink: 0,
              transition: "all 200ms ease",
            }}
            className="hover:scale-105 hover:bg-accent/60 hover:text-accent-foreground active:scale-95"
          >
            {renderPanelIcon()}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Context Pill ──────────────────────────────────────────────────────────────
export interface TopbarContextPillProps {
  isDark: boolean;
  isModuleMode: boolean;
  resolvedAccent: string;
  tenantName: string;
}

export function TopbarContextPill({
  isDark,
  isModuleMode,
  resolvedAccent,
  tenantName,
}: TopbarContextPillProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: isModuleMode
          ? `${resolvedAccent}15`
          : isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.03)",
        border: `1px solid ${
          isModuleMode
            ? `${resolvedAccent}40`
            : isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)"
        }`,
        fontSize: 11,
        fontWeight: 600,
        color: isModuleMode ? resolvedAccent : isDark ? "#E2E8F0" : "#334155",
        cursor: "default",
        flexShrink: 0,
        transition: "all 300ms ease",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap",
      }}
      className="hidden sm:flex"
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: resolvedAccent,
          flexShrink: 0,
          boxShadow: `0 0 8px ${resolvedAccent}`,
        }}
      />
      <span>{tenantName}</span>
    </div>
  );
}

// ── Search Button ─────────────────────────────────────────────────────────────
export interface TopbarSearchButtonProps {
  isRTL: boolean;
  isDark: boolean;
  onOpenSearch?: () => void;
  placeholder: string;
}

export function TopbarSearchButton({
  isRTL,
  isDark,
  onOpenSearch,
  placeholder,
}: TopbarSearchButtonProps) {
  return (
    <button
      onClick={onOpenSearch}
      className="group hidden transition-all duration-200 hover:scale-[1.02] active:scale-95 md:flex"
      style={{
        alignItems: "center",
        gap: 8,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.04)"
          : "inset 0 1px 0 rgba(255,255,255,0.5)",
        borderRadius: 9,
        padding: "0 12px",
        height: 33,
        color: isDark ? "#94A3B8" : "#64748B",
        fontSize: "12px",
        fontWeight: 500,
        minWidth: 160,
        cursor: "pointer",
      }}
    >
      <Search
        size={13}
        className="transition-colors group-hover:text-foreground"
        style={{ flexShrink: 0 }}
      />
      <span
        style={{ flex: 1, userSelect: "none", textAlign: "start" }}
        className="transition-colors group-hover:text-foreground"
      >
        {placeholder}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
          borderRadius: 4,
          padding: "2px 6px",
          color: isDark ? "#CBD5E1" : "#475569",
          letterSpacing: "0.3px",
        }}
      >
        ⌘K
      </span>
    </button>
  );
}

// ── Home Button ───────────────────────────────────────────────────────────────
export interface TopbarHomeButtonProps {
  isDark: boolean;
  ariaLabel: string;
  onClick: () => void;
}

export function TopbarHomeButton({ isDark, ariaLabel, onClick }: TopbarHomeButtonProps) {
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            style={{
              width: 33,
              height: 33,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              cursor: "pointer",
              color: isDark ? "#94A3B8" : "#64748B",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
              background: "transparent",
              flexShrink: 0,
              transition: "all 200ms ease",
            }}
            className="hover:scale-105 hover:bg-secondary hover:text-foreground active:scale-95"
          >
            <Home size={15} strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {ariaLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Mobile Controls ───────────────────────────────────────────────────────────
export function TopbarMobileControls() {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <NotificationBell
        iconClassName="h-[16px] w-[16px]"
        className="h-[33px] w-[33px] rounded-[9px] text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
      />
      <UserProfileDropdown variant="compact" showName={false} />
    </div>
  );
}
