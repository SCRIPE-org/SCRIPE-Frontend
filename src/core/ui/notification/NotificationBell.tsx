"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, Check, CheckCheck, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useNotificationViewModel } from "./useNotificationViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import ReactDOM from "react-dom";

interface NotificationBellProps {
  /** Icon size class */
  iconClassName?: string;
  /** Button class overrides */
  className?: string;
}

/**
 * NotificationBell — reusable bell icon with unread badge and smart-positioned dropdown.
 * Uses a portal so the dropdown is never clipped by overflow-hidden parents.
 * Positioning is viewport-aware: opens upward if there's insufficient space below.
 */
export function NotificationBell({ iconClassName = "h-5 w-5", className }: NotificationBellProps) {
  const vm = useNotificationViewModel();
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Viewport-aware panel position
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const recalcPosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 320;
    const panelHeight = 420; // max estimated
    const viewport = { w: window.innerWidth, h: window.innerHeight };

    // Vertical: prefer below, flip to above if not enough space
    const spaceBelow = viewport.h - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;

    // Horizontal: align to inlineEnd of trigger
    let left: number;
    if (isRTL) {
      // panel's right edge aligns with trigger's right edge
      left = rect.right - panelWidth;
    } else {
      // panel's right edge aligns with trigger's right edge
      left = rect.right - panelWidth;
    }
    // Clamp within viewport
    left = Math.max(8, Math.min(left, viewport.w - panelWidth - 8));

    setPanelStyle({
      position: "fixed",
      zIndex: 9999,
      width: panelWidth,
      left,
      ...(openAbove ? { bottom: viewport.h - rect.top + 8 } : { top: rect.bottom + 8 }),
    });
  }, [isRTL]);

  const handleToggle = useCallback(() => {
    vm.toggleOpen();
    // recalc after state flips
    setTimeout(recalcPosition, 0);
  }, [vm, recalcPosition]);

  // Close on outside click
  useEffect(() => {
    if (!vm.isOpen) return;
    recalcPosition();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        vm.close();
      }
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", recalcPosition, true);
    window.addEventListener("resize", recalcPosition);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", recalcPosition, true);
      window.removeEventListener("resize", recalcPosition);
    };
  }, [vm.isOpen, vm.close, recalcPosition]);

  // ── Panel colours (semantic tokens — they resolve per theme on their own) ───
  const panelBg = "hsl(var(--popover))";
  const panelBorder = "hsl(var(--border))";
  const headerBorderColor = "hsl(var(--border))";
  const unreadBg = "hsl(var(--primary) / 0.08)";
  const hoverBg = "hsl(var(--accent))";
  const badgeBg = "hsl(var(--primary))";
  const badgeGlow = "hsl(var(--primary) / 0.38)";
  const strongText = "hsl(var(--popover-foreground))";
  const mutedText = "hsl(var(--muted-foreground))";
  const faintText = "hsl(var(--muted-foreground) / 0.5)";

  const dropdownPanel = vm.isOpen ? (
    <div
      ref={panelRef}
      style={{
        ...panelStyle,
        background: panelBg,
        border: `1px solid ${panelBorder}`,
        borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)",
        overflow: "hidden",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        animation: "nexus-fade-in 180ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${headerBorderColor}`,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: strongText,
              margin: 0,
            }}
          >
            {t("notifications.title") || "Notifications"}
          </h3>
          {vm.unreadCount > 0 && (
            <p style={{ fontSize: 11, color: mutedText, margin: "2px 0 0" }}>
              {vm.unreadCount} unread
            </p>
          )}
        </div>
        {vm.unreadCount > 0 && (
          <button
            onClick={vm.markAllAsRead}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 500,
              color: badgeBg,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--primary) / 0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <CheckCheck size={12} />
            {t("notifications.markAllRead") || "Mark all read"}
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {vm.isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <Loader2
              size={20}
              style={{
                animation: "spin 1s linear infinite",
                color: mutedText,
              }}
            />
          </div>
        ) : vm.notifications.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <Bell size={28} style={{ color: faintText, margin: "0 auto 8px" }} />
            <p style={{ fontSize: 13, color: mutedText, margin: 0 }}>
              {t("notifications.empty") || "No notifications yet"}
            </p>
          </div>
        ) : (
          vm.notifications.map((n) => (
            <button
              key={n.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                width: "100%",
                textAlign: "start",
                padding: "12px 16px",
                cursor: "pointer",
                border: "none",
                background: !n.isRead ? unreadBg : "transparent",
                transition: "background 150ms",
                borderBottom: `1px solid ${headerBorderColor}`,
              }}
              onMouseEnter={(e) => {
                if (n.isRead) (e.currentTarget as HTMLElement).style.background = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (n.isRead) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
              onClick={() => {
                if (!n.isRead) vm.markAsRead(n.id);
                if (n.actionUrl) window.location.href = n.actionUrl;
                vm.close();
              }}
            >
              {/* Indicator */}
              <div style={{ paddingTop: 3, flexShrink: 0 }}>
                {n.isRead ? (
                  <Check size={12} style={{ color: faintText }} />
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: badgeBg,
                      boxShadow: `0 0 6px ${badgeGlow}`,
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: n.isRead ? 400 : 600,
                    color: n.isRead ? mutedText : strongText,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: 0,
                  }}
                >
                  {n.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: mutedText,
                    margin: "3px 0 4px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {n.body}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <time style={{ fontSize: 10, color: faintText }}>
                    {formatTimeAgo(n.createdAt)}
                  </time>
                  {n.actionUrl && <ExternalLink size={10} style={{ color: faintText }} />}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={handleToggle}
        aria-label={t("notifications.title") || "Notifications"}
      >
        <Bell className={iconClassName} />
        {vm.unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: badgeBg,
              boxShadow: `0 0 8px ${badgeBg}60`,
              fontSize: 9,
              fontWeight: 700,
              color: "hsl(var(--primary-foreground))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
            }}
          >
            {vm.unreadCount > 99 ? "99+" : vm.unreadCount}
          </span>
        )}
      </Button>

      {/* Portal: dropdown is rendered at document.body to escape any overflow clipping */}
      {typeof document !== "undefined" && ReactDOM.createPortal(dropdownPanel, document.body)}
    </>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
