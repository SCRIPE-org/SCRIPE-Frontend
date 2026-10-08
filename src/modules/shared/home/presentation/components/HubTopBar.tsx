/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * HubTopBar — Minimal topbar for the Hub page.
 *
 * Design: SCRIPE logo | spacer | "Jump to anything · /" | ⊞ | 🔔 | divider | Avatar pill
 * Background: an opaque nx-surface behind a hairline, same as NexusTopbar's
 * default (non-glass) treatment — no blur, so a badge ring can rely on the
 * surface it is actually drawn on.
 *
 * ALL buttons are wired:
 *  - Search shortcut → opens NexusSearchPalette (via onSearchClick)
 *  - ⊞ App switcher  → opens NexusAppLauncher (via onAppLauncherClick)
 *  - 🔔 Notifications → navigates to /communication/notifications
 *  - Avatar pill      → navigates to /profile
 */

import React from "react";
import Image from "next/image";
import { Search, Grid3x3, Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { BRAND } from "@core/config/branding";
import { cn } from "@core/common/utils";

interface HubTopBarProps {
  onSearchClick?: () => void;
  onAppLauncherClick?: () => void;
}

const ICON_BUTTON =
  "inline-flex h-[34px] w-[34px] items-center justify-center rounded-nx-md border border-nx-line text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none";

export function HubTopBar({ onSearchClick, onAppLauncherClick }: HubTopBarProps) {
  const { t } = useI18n();
  const router = useRouter();

  // Initials for avatar
  const initials = useAppStore((s) => {
    const u = s.user;
    if (!u) return "??";
    const f = u.firstName?.[0] || "";
    const l = u.lastName?.[0] || "";
    return (f + l).toUpperCase() || u.username?.slice(0, 2).toUpperCase() || "??";
  });

  const tenantName = useAppStore((s) => (s.user as any)?.tenantName ?? "");

  // Derive short display name: "Seif K." style
  const shortName = useAppStore((s) => {
    const u = s.user;
    if (!u) return "";
    if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName[0]}.`;
    return u.firstName || u.username || "";
  });

  return (
    <header className="relative z-raised flex h-[60px] items-center gap-6 border-b border-nx-line bg-nx-surface px-8">
      {/* SCRIPE wordmark — canonical flat Relay Grid mark, never a redrawn stand-in */}
      <div className="inline-flex items-center gap-2">
        <Image src="/brand/app-logo.svg" alt="" width={22} height={22} aria-hidden="true" />
        <span className="text-sm font-bold tracking-[0.12em] text-nx-ink">
          {BRAND?.name ?? "SCRIPE"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mini search shortcut */}
      <button
        type="button"
        onClick={onSearchClick}
        className="inline-flex h-[34px] cursor-pointer items-center gap-2.5 rounded-nx-md border border-nx-line px-3 text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
      >
        <Search size={14} strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs">{t("workspaceHub.jumpTo")}</span>
        <span aria-hidden="true" className="text-nx-ink-3">
          ·
        </span>
        <kbd className="rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 text-[11px] font-medium text-nx-ink-2">
          /
        </kbd>
      </button>

      {/* App switcher → opens NexusAppLauncher */}
      <button
        type="button"
        aria-label={t("workspaceHub.topbar.appSwitcher")}
        onClick={onAppLauncherClick}
        className={cn("cursor-pointer", ICON_BUTTON)}
      >
        <Grid3x3 size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {/* Notifications → navigate to /communication/notifications */}
      <button
        type="button"
        aria-label={t("workspaceHub.topbar.notifications")}
        onClick={() => router.push("/communication/notifications")}
        className={cn("relative cursor-pointer", ICON_BUTTON)}
      >
        <Bell size={16} strokeWidth={1.75} aria-hidden="true" />
        {/* The ring is the bar's own surface token, so it matches whatever
            ground the dot is actually drawn on in either theme. */}
        <span
          aria-hidden="true"
          className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-nx-surface"
        />
      </button>

      {/* Divider */}
      <div aria-hidden="true" className="h-[22px] w-px bg-nx-line" />

      {/* Avatar pill → navigate to /profile */}
      <button
        type="button"
        onClick={() => router.push("/profile")}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-nx-line py-1 pe-2.5 ps-1 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
      >
        <div
          aria-hidden="true"
          className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-nx-line bg-nx-accent-fill text-[11px] font-bold text-nx-on-fill"
        >
          {initials}
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold text-nx-ink">{shortName}</span>
          {tenantName && (
            <span className="text-[10.5px] text-nx-ink-3">
              {t("workspaceHub.topbar.ownerOf", { tenant: tenantName })}
            </span>
          )}
        </div>
        <ChevronDown size={14} strokeWidth={1.75} className="text-nx-ink-3" aria-hidden="true" />
      </button>
    </header>
  );
}
