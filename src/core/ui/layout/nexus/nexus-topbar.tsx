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
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useSettings } from "@core/providers/settings-provider";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { useTheme } from "next-themes";
import { BRAND } from "@core/config/branding";
import { useNexusPalette } from "./_parts/nexus-theme-utils";
import {
  TopbarBreadcrumbs,
  TopbarContextPill,
  TopbarHomeButton,
  TopbarMobileControls,
  TopbarPanelToggle,
  TopbarSearchButton,
} from "./_parts/topbar-parts";

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
  const tenantCode = useAppStore((s) => s.tenantCode);
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isRTL = direction === "rtl";
  const { isDark, accent: resolvedAccent } = useNexusPalette(
    resolvedTheme === "dark",
    accentColor || "#6258c4"
  );

  // ── Breadcrumb segments ───────────────────────────────────────────────────
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] ?? "";
  const formattedPage = pageName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const workspaceName = activeWorkspace?.getLocalizedName(language) ?? BRAND?.name ?? "Platform";
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
      displayPageName =
        language === "ar"
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
        background: isDark ? "rgba(10, 15, 28, 0.55)" : "rgba(255, 255, 255, 0.72)",
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

  // ── Home route — context-aware, backend-authoritative per workspace ───────────
  // Platform context (no tenant): use platformHomeRoute > homeRoute > "/"
  // Tenant context: use homeRoute > "/"
  const isPlatformContext = tenantCode === null;
  const workspaceHomeRoute = isPlatformContext
    ? (activeWorkspace?.platformHomeRoute ?? activeWorkspace?.homeRoute ?? "/")
    : (activeWorkspace?.homeRoute ?? "/");
  const isOnHome =
    pathname === workspaceHomeRoute || (workspaceHomeRoute === "/" && pathname === "/");

  if (!mounted) return <header data-nexus-topbar="" style={{ height: 56, flexShrink: 0 }} />;

  return (
    <header
      data-nexus-topbar=""
      style={{
        height: 56,
        minHeight: 56,
        flexShrink: 0,
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        paddingInlineStart: 20,
        paddingInlineEnd: 12,
        gap: 12,
        zIndex: 30,
        position: "relative",
        direction: isRTL ? "rtl" : "ltr",
        ...bgStyle,
      }}
    >
      {/* Mobile hamburger / Desktop Panel Toggle */}
      <TopbarPanelToggle
        isRTL={isRTL}
        isDark={isDark}
        isPanelCollapsed={isPanelCollapsed}
        ariaLabel={t("navigation.togglePanel") || "Toggle navigation"}
        onToggle={() => {
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onMobileMenuOpen();
          } else if (onTogglePanel) {
            onTogglePanel();
          }
        }}
      />

      {/* Breadcrumbs */}
      <TopbarBreadcrumbs
        isRTL={isRTL}
        isDark={isDark}
        workspaceName={workspaceName}
        activeRootName={activeRootName}
        displayPageName={displayPageName}
      />

      {/* Right-side controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <TopbarContextPill
          isDark={isDark}
          isModuleMode={isModuleMode}
          resolvedAccent={resolvedAccent}
          tenantName={tenantName}
        />

        <TopbarSearchButton
          isRTL={isRTL}
          isDark={isDark}
          onOpenSearch={onOpenSearch}
          placeholder={t("navigation.searchPlaceholder") || "Search anything…"}
        />

        {!isOnHome && (
          <TopbarHomeButton
            isDark={isDark}
            ariaLabel={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
            onClick={() => router.push(workspaceHomeRoute)}
          />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <ThemeSwitcher buttonClassName="h-[33px] w-[33px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[9px] transition-all" />
          <LanguageSwitcher buttonClassName="h-[33px] w-[33px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-[9px] transition-all" />
        </div>

        <TopbarMobileControls />
      </div>
    </header>
  );
}
