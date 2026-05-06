"use client";

/**
 * NexusTopbar
 *
 * Matches the Nexus ERP reference design exactly:
 *  - 46px height, #080B15 background, border-bottom #111626
 *  - Left: breadcrumb (faint grey › separator › workspace › page)
 *  - Right: Search box (card-style), ThemeSwitcher, LanguageSwitcher, NotificationBell, ctx pill, UserProfileDropdown
 */

import React from "react";
import { Menu, Search } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useWorkspace } from "@core/providers/workspace-provider";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { NotificationBell } from "@core/ui/notification";
import { usePathname } from "next/navigation";
import { cn } from "@core/common/utils";
import { useAppStore } from "@core/store/useAppStore";

interface NexusTopbarProps {
  onMobileMenuOpen: () => void;
}

export function NexusTopbar({ onMobileMenuOpen }: NexusTopbarProps) {
  const { direction, language } = useI18n();
  const { accentColor, activeWorkspace, isModuleMode } = useWorkspace();
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);

  const resolvedAccent = accentColor ?? "#534AB7";

  // Build breadcrumb from pathname segments
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] ?? "";
  const formattedPage = pageName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const workspaceName = activeWorkspace?.getLocalizedName(language);
  const tenantName = (user as any)?.tenantName ?? user?.firstName ? `${user?.firstName} ${user?.lastName ?? ""}`.trim() : "Nexus ERP";
  const tenantInitials = tenantName.slice(0, 2).toUpperCase();

  const isRTL = direction === "rtl";

  return (
    <header
      style={{
        height: 46,
        minHeight: 46,
        borderBottom: "1px solid #111626",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        flexShrink: 0,
        background: "#080B15",
        zIndex: 30,
      }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation"
        className="lg:hidden"
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          cursor: "pointer",
          color: "#2F3C55",
          border: "none",
          background: "transparent",
          flexShrink: 0,
        }}
      >
        <Menu size={14} />
      </button>

      {/* Breadcrumb */}
      <div
        style={{
          fontSize: 12,
          color: "#566480",
          flex: 1,
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflow: "hidden",
        }}
        className={cn(isRTL && "flex-row-reverse")}
      >
        <span style={{ color: "#2F3C55", flexShrink: 0 }}>Nexus ERP</span>
        {workspaceName && (
          <>
            <span style={{ color: "#2F3C55", fontSize: 11, flexShrink: 0 }}>›</span>
            <span style={{ color: "#8A9BBF", flexShrink: 0 }}>{workspaceName}</span>
          </>
        )}
        {formattedPage && (
          <>
            <span style={{ color: "#2F3C55", fontSize: 11, flexShrink: 0 }}>›</span>
            <span
              style={{
                color: "#8A9BBF",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formattedPage}
            </span>
          </>
        )}
      </div>

      {/* Right-side controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexShrink: 0,
        }}
        className={cn(isRTL && "flex-row-reverse")}
      >
        {/* Search box — reference style */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            gap: 6,
            background: "#0F1322",
            border: "1px solid #181E33",
            borderRadius: 7,
            padding: "0 10px",
            height: 28,
            color: "#2F3C55",
            fontSize: "11.5px",
            minWidth: 180,
            cursor: "text",
            transition: "border-color 150ms",
          }}
        >
          <Search size={12} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, userSelect: "none" }}>Search…</span>
          <span
            style={{
              fontSize: "9.5px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid #181E33",
              borderRadius: 4,
              padding: "1px 4px",
              color: "#2F3C55",
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Theme + Language switchers */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ThemeSwitcher buttonClassName="h-[28px] w-[28px] text-[#2F3C55] hover:text-[#8A9BBF] hover:!bg-white/5 rounded-[7px]" />
          <LanguageSwitcher buttonClassName="h-[28px] w-[28px] text-[#2F3C55] hover:text-[#8A9BBF] hover:!bg-white/5 rounded-[7px]" />
        </div>

        {/* Notification bell */}
        <NotificationBell
          iconClassName="h-[14px] w-[14px]"
          className="h-[28px] w-[28px] text-[#2F3C55] hover:text-[#8A9BBF] hover:bg-white/5 rounded-[7px]"
        />

        {/* Context pill — changes styling based on workspace mode */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 9px",
            borderRadius: 20,
            background: isModuleMode
              ? `${resolvedAccent}22`
              : "#1E1A50",
            border: `1px solid ${isModuleMode ? `${resolvedAccent}55` : "#332D80"}`,
            fontSize: 11,
            fontWeight: 500,
            color: isModuleMode ? resolvedAccent : "#AFA9EC",
            cursor: "default",
            flexShrink: 0,
            transition: "background 300ms, border-color 300ms, color 300ms",
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: resolvedAccent,
              flexShrink: 0,
            }}
          />
          <span className="hidden sm:inline" style={{ whiteSpace: "nowrap" }}>
            {tenantName}
          </span>
        </div>

        {/* User avatar (compact variant, no name) */}
        <UserProfileDropdown variant="compact" showName={false} />
      </div>
    </header>
  );
}
