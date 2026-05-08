"use client";

/**
 * NexusTopbar
 *
 * Premium 56px header for the Nexus Dual-Rail Layout.
 * - Panel toggle uses the same custom SVG icons as navigation-header.tsx (PanelMenuIcon / PanelCollapseIcon)
 * - Breadcrumbs are RTL-aware (flex-row-reverse + mirrored chevron)
 * - Background tinted from active workspace accent + settings card style
 * - Home button shown whenever pathname !== "/"
 * - Search palette trigger
 */

import React, { useState, useEffect } from "react";
import { Search, Home } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useSettings } from "@core/providers/settings-provider";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NotificationBell } from "@core/ui/notification";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@core/common/utils";
import { useAppStore } from "@core/store/useAppStore";
import { useTheme } from "next-themes";
import { BRAND } from "@core/config/branding";
import {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "@core/ui/layout/navigation/nav-icons";

// Tiny chevron that auto-mirrors for RTL
function BreadcrumbSep({ isRTL, isDark }: { isRTL: boolean; isDark: boolean }) {
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

interface NexusTopbarProps {
  onMobileMenuOpen: () => void;
  onTogglePanel?: () => void;
  onOpenSearch?: () => void;
  isPanelCollapsed?: boolean;
}

export function NexusTopbar({
  onMobileMenuOpen,
  onTogglePanel,
  onOpenSearch,
  isPanelCollapsed,
}: NexusTopbarProps) {
  const { direction, language, t } = useI18n();
  const { accentColor, activeWorkspace, activeRootItem, isModuleMode } = useWorkspace();
  const { cardStyle } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const isRTL = direction === "rtl";
  const resolvedAccent = accentColor ?? (isDark ? "#7C6FD4" : "#534AB7");

  // ── Panel toggle icon — same SVG set as navigation-header.tsx ─────────────
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

  // ── Breadcrumb segments ───────────────────────────────────────────────────
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] ?? "";
  const formattedPage = pageName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const workspaceName = activeWorkspace?.getLocalizedName(language);
  const activeRootName = activeRootItem
    ? language === "ar"
      ? activeRootItem.nameAr || activeRootItem.nameEn
      : activeRootItem.nameEn || activeRootItem.nameAr
    : null;

  let displayPageName = formattedPage;
  if (activeRootItem && activeRootItem.children) {
    let bestMatch: any = null;
    let maxLen = 0;
    const search = (nodes: any[]) => {
      for (const item of nodes) {
        if (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
          if (item.href.length > maxLen) {
            maxLen = item.href.length;
            bestMatch = item;
          }
        }
        if (item.children) search(item.children);
      }
    };
    search(activeRootItem.children);
    if (bestMatch) {
      displayPageName = language === "ar"
        ? bestMatch.nameAr || bestMatch.nameEn || formattedPage
        : bestMatch.nameEn || bestMatch.nameAr || formattedPage;
    }
  }

  // ── Context pill text ────────────────────────────────────────────────────
  const tenantName =
    (user as any)?.tenantName ??
    (user?.firstName
      ? `${user.firstName} ${user?.lastName ?? ""}`.trim()
      : (BRAND?.name ?? "Platform"));

  // ── Background — derived from cardStyle setting ───────────────────────────
  const bgStyle = (() => {
    if (cardStyle === "glass") {
      return {
        background: isDark
          ? "rgba(10, 15, 28, 0.55)"
          : "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      };
    }
    if (cardStyle === "solid") {
      return {
        background: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
        backdropFilter: "none",
      };
    }
    // Default — subtle glass
    return {
      background: isDark ? "rgba(10, 15, 28, 0.4)" : "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    };
  })();

  const isOnHome = pathname === "/";

  if (!mounted) return <header data-nexus-topbar="" style={{ height: 56, flexShrink: 0 }} />;

  return (
    <header
      data-nexus-topbar=""
      style={{
        height: 56,
        minHeight: 56,
        flexShrink: 0,
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        padding: isRTL ? "0 20px 0 12px" : "0 12px 0 20px",
        gap: 12,
        zIndex: 30,
        position: "relative",
        direction: isRTL ? "rtl" : "ltr",
        ...bgStyle,
      }}
    >
      {/* Mobile hamburger / Desktop Panel Toggle */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onMobileMenuOpen();
          } else if (onTogglePanel) {
            onTogglePanel();
          }
        }}
        aria-label={t("navigation.togglePanel") || "Toggle navigation"}
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9,
          cursor: "pointer",
          color: isDark ? "#AFA9EC" : "#6258c4",
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.07)",
          background: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(98,88,196,0.04)",
          flexShrink: 0,
          transition: "all 200ms ease",
        }}
        className="hover:bg-accent/60 hover:text-accent-foreground hover:scale-105 active:scale-95"
      >
        {renderPanelIcon()}
      </button>

      {/* Breadcrumb — direction is handled by parent header's direction:rtl */}
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
        {/* Root: workspace name */}
        <span
          style={{
            color: isDark ? "#64748B" : "#94A3B8",
            fontWeight: 500,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {workspaceName ?? (BRAND?.name ?? "Platform")}
        </span>

        {/* Section: active root item */}
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

        {/* Current page */}
        {formattedPage && (
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

      {/* Right-side controls — direction inherited from parent, no need to reverse */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Context pill */}
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
            color: isModuleMode
              ? resolvedAccent
              : isDark
              ? "#E2E8F0"
              : "#334155",
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

        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex transition-all duration-200 hover:scale-[1.02] active:scale-95 group"
          style={{
            alignItems: "center",
            gap: 8,
            background: isDark
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.02)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.07)",
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
            className="group-hover:text-foreground transition-colors"
            style={{ flexShrink: 0 }}
          />
          <span
            style={{ flex: 1, userSelect: "none", textAlign: isRTL ? "right" : "left" }}
            className="group-hover:text-foreground transition-colors"
          >
            {t("navigation.searchPlaceholder") || "Search anything…"}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              background: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
              borderRadius: 4,
              padding: "2px 6px",
              color: isDark ? "#CBD5E1" : "#475569",
              letterSpacing: "0.3px",
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Home button — only when not already on "/" */}
        {!isOnHome && (
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
            style={{
              width: 33,
              height: 33,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              cursor: "pointer",
              color: isDark ? "#94A3B8" : "#64748B",
              border: isDark
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.07)",
              background: "transparent",
              flexShrink: 0,
              transition: "all 200ms ease",
            }}
            className="hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95"
          >
            <Home size={15} strokeWidth={2} />
          </button>
        )}

        {/* Theme + Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ThemeSwitcher buttonClassName="h-[33px] w-[33px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[9px] transition-all" />
          <LanguageSwitcher buttonClassName="h-[33px] w-[33px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[9px] transition-all" />
        </div>

        {/* Mobile only: NotificationBell + Avatar */}
        <div className="flex lg:hidden items-center gap-3">
          <NotificationBell
            iconClassName="h-[16px] w-[16px]"
            className="h-[33px] w-[33px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[9px] transition-all"
          />
          <UserProfileDropdown variant="compact" showName={false} />
        </div>
      </div>
    </header>
  );
}
