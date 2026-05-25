"use client";

/**
 * HubTopBar — Minimal topbar for the Hub page.
 *
 * Design: NEXORA logo | spacer | "Jump to anything · /" | ⊞ | 🔔 | divider | Avatar pill
 * Background: rgba(10,14,26,0.55) with backdrop-blur.
 *
 * ALL buttons are now wired:
 *  - Search shortcut → opens NexusSearchPalette (via onSearchClick)
 *  - ⊞ App switcher  → opens NexusAppLauncher (via onAppLauncherClick)
 *  - 🔔 Notifications → navigates to /messaging/notifications
 *  - Avatar pill      → navigates to /profile
 */

import React from "react";
import { Search, Grid3x3, Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";

interface HubTopBarProps {
  onSearchClick?: () => void;
  onAppLauncherClick?: () => void;
}

export function HubTopBar({ onSearchClick, onAppLauncherClick }: HubTopBarProps) {
  const { t } = useI18n();
  const router = useRouter();

  const adminName = useAppStore((s) => {
    const u = s.user;
    if (!u) return "";
    const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
    return full || u.username || "";
  });

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
    <header
      style={{
        position: "relative",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 32px",
        height: 60,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(10,14,26,0.55)",
        backdropFilter: "blur(14px) saturate(140%)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* NEXORA wordmark */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="nx-hub-g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C8BFF" />
              <stop offset="1" stopColor="#5A60E0" />
            </linearGradient>
          </defs>
          <path
            d="M4 5 L12 12 L4 19 L4 12 L20 5 L20 12 L12 12 L20 19"
            stroke="url(#nx-hub-g)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#e6e9f5",
          }}
        >
          NEXORA
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Mini search shortcut */}
      <button
        type="button"
        onClick={onSearchClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          height: 34,
          padding: "0 12px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(230,233,245,0.7)",
          fontSize: 12.5,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Search size={14} strokeWidth={1.75} />
        <span>{t("workspaceHub.jumpTo")}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <kbd
          style={{
            font: "inherit",
            fontSize: 11,
            padding: "1px 6px",
            borderRadius: 5,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(230,233,245,0.8)",
          }}
        >
          /
        </kbd>
      </button>

      {/* App switcher → opens NexusAppLauncher */}
      <button
        type="button"
        aria-label="App switcher"
        onClick={onAppLauncherClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(230,233,245,0.8)",
          cursor: "pointer",
        }}
      >
        <Grid3x3 size={16} strokeWidth={1.75} />
      </button>

      {/* Notifications → navigate to /messaging/notifications */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => router.push("/messaging/notifications")}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          color: "rgba(230,233,245,0.8)",
          cursor: "pointer",
        }}
      >
        <Bell size={16} strokeWidth={1.75} />
        <span
          style={{
            position: "absolute",
            top: 7,
            insetInlineEnd: 8,
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "#F04E5A",
            boxShadow: "0 0 0 2px #0A0E1A",
          }}
        />
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 22,
          background: "rgba(255,255,255,0.08)",
        }}
      />

      {/* Avatar pill → navigate to /profile */}
      <button
        type="button"
        onClick={() => router.push("/profile")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 6px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "linear-gradient(135deg, #5E91FF 0%, #9A4DDB 100%)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.12)",
          }}
        >
          {initials}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e6e9f5" }}>{shortName}</span>
          {tenantName && (
            <span style={{ fontSize: 10.5, color: "rgba(230,233,245,0.5)" }}>
              Owner · {tenantName}
            </span>
          )}
        </div>
        <ChevronDown size={14} strokeWidth={1.75} style={{ color: "rgba(230,233,245,0.5)" }} />
      </button>
    </header>
  );
}
