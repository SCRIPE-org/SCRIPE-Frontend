"use client";

/**
 * NexusTopbar
 *
 * 56px header for the Nexus Dual-Rail Layout, on the --nx- token layer.
 * - Panel toggle uses the same custom SVG icons as navigation-header.tsx (PanelMenuIcon / PanelCollapseIcon)
 * - Breadcrumbs are RTL-aware (flex-row-reverse + mirrored chevron)
 * - Background derived from --nx-surface + settings card style (glass/solid/default)
 * - Home button shown whenever pathname !== "/"
 * - Search palette trigger
 *
 * Colour resolves in CSS per theme — no resolvedTheme reads, no hydration
 * placeholder needed.
 */

import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useSettings } from "@core/providers/settings-provider";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@core/store/useAppStore";
import { BRAND } from "@core/config/branding";
import {
  TopbarBreadcrumbs,
  TopbarContextPill,
  TopbarHomeButton,
  TopbarMobileControls,
  TopbarPanelToggle,
  TopbarSearchButton,
} from "./_parts/topbar-parts";
import { useNavigationStore } from "@/core/navigation/store/useNavigationStore";
import { startRoutingProgress } from "@core/ui/routing-progress-bar";

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
  const { activeWorkspace, activeRootItem, isModuleMode } = useWorkspace();
  const { cardStyle } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const tenantCode = useAppStore((s) => s.tenantCode);

  const isRTL = direction === "rtl";

  // ── Breadcrumb segments ───────────────────────────────────────────────────
  const breadcrumbOverride = useNavigationStore((s) => s.breadcrumbOverride);
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] ?? "";
  const parentName = segments[segments.length - 2] ?? "";
  const formattedPage = pageName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const workspaceName = activeWorkspace?.getLocalizedName(language) ?? BRAND?.name ?? "Platform";
  const activeRootName = activeRootItem
    ? language === "ar"
      ? activeRootItem.nameAr || activeRootItem.nameEn
      : activeRootItem.nameEn || activeRootItem.nameAr
    : null;

  const isIdString = (str: string): boolean => {
    if (!str) return false;
    const isGuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
    if (isGuid) return true;
    const isEncrypted = str.length >= 20 && /^[a-zA-Z0-9_\-+ /=]+$/.test(str);
    return isEncrypted;
  };

  const formatParentSegmentAsTitle = (parentSegment: string): string => {
    if (!parentSegment) return "Details";
    let word = parentSegment.replace(/[-_]/g, " ");
    if (word.toLowerCase().endsWith("s") && word.length > 1) {
      word = word.slice(0, -1);
    }
    return word.replace(/\b\w/g, (c) => c.toUpperCase()) + " Details";
  };

  let displayPageName = formattedPage;
  if (breadcrumbOverride) {
    displayPageName = breadcrumbOverride;
  } else if (isIdString(pageName)) {
    displayPageName = formatParentSegmentAsTitle(parentName);
  } else if (activeRootItem && activeRootItem.children) {
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

  // ── Background — derived from cardStyle setting, surface token only ───────
  const bgStyle = (() => {
    if (cardStyle === "glass") {
      return {
        background: "color-mix(in oklch, var(--nx-surface, hsl(var(--card))) 62%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      };
    }
    if (cardStyle === "solid") {
      return {
        background: "var(--nx-surface, hsl(var(--card)))",
        backdropFilter: "none",
      };
    }
    // Default — subtle glass
    return {
      background: "color-mix(in oklch, var(--nx-surface, hsl(var(--card))) 50%, transparent)",
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

  return (
    <header
      data-nexus-topbar=""
      className="relative z-raised"
      style={{
        height: 56,
        minHeight: 56,
        flexShrink: 0,
        borderBottom: "1px solid var(--nx-line, hsl(var(--border)))",
        display: "flex",
        alignItems: "center",
        paddingInlineStart: 20,
        paddingInlineEnd: 12,
        gap: 12,
        direction: isRTL ? "rtl" : "ltr",
        ...bgStyle,
      }}
    >
      {/* Mobile hamburger / Desktop Panel Toggle */}
      <TopbarPanelToggle
        isRTL={isRTL}
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
        <TopbarContextPill isModuleMode={isModuleMode} tenantName={tenantName} />

        <TopbarSearchButton
          onOpenSearch={onOpenSearch}
          placeholder={t("navigation.searchPlaceholder") || "Search anything…"}
        />

        {!isOnHome && (
          <TopbarHomeButton
            ariaLabel={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
            onClick={() => {
              startRoutingProgress();
              router.push(workspaceHomeRoute);
            }}
          />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeSwitcher buttonClassName="h-[33px] w-[33px] text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised rounded-[9px] transition-all duration-nx-micro" />
          <LanguageSwitcher buttonClassName="h-[33px] w-[46px] text-nx-ink-3 hover:text-nx-ink hover:bg-nx-raised rounded-[9px] transition-all duration-nx-micro" />
        </div>

        <TopbarMobileControls />
      </div>
    </header>
  );
}
