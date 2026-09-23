"use client";

/* eslint-disable react-hooks/set-state-in-effect */

/**
 * NotificationBell — the bell and its panel.
 *
 * Wave I2 elevation. What changed, and why:
 *
 *  • COLOUR: the panel was a hand-rolled surface (`0 20px 60px rgba(0,0,0,.2)`,
 *    a 24px backdrop blur, `hsl(var(--primary))` borrowed from the pre-nexus
 *    palette). It now reads --nx-* tokens only — nx-popover / nx-line /
 *    shadow-nx-popover / nx-accent — so it is the same material as every other
 *    overlay in the shell and resolves light/dark in CSS.
 *  • BROKEN CSS: the badge glow was `0 0 8px ${badgeBg}60` — string-concatenated
 *    alpha onto an `hsl(...)` value, which is not a colour. It never rendered.
 *    The badge is now a solid --nx-accent-fill chip with --nx-on-fill text
 *    (the measured pair, ≥4.84:1 on every workspace hue).
 *  • MOTION: the enter animation named `nexus-fade-in`, a keyframe that does
 *    not exist in globals.css, so the panel simply popped. It now uses the
 *    shared animate-in fade + 0.95 zoom from the trigger origin at
 *    --nx-t-micro, with the zoom gated behind motion-safe. Nothing animates at
 *    rest: the unread state is a static chip plus a static lit edge, never a
 *    pulse or a ping.
 *  • RTL: the horizontal placement branch computed the SAME value for LTR and
 *    RTL (`rect.right - panelWidth`), so in Arabic the panel hung off the
 *    wrong edge of its trigger. It now mirrors properly, and every row uses
 *    logical properties.
 *  • SCANNABILITY: the flat list is grouped by day (Intl — today / yesterday /
 *    date, in the active language, with no new locale keys), unread rows wear
 *    the lit inline-start edge instead of a full-row wash, timestamps use the
 *    real common.timeAgo.* strings instead of hardcoded English, and the empty
 *    state is designed rather than a grey line.
 *  • A11Y: the panel is a labelled dialog, Escape closes it and returns focus
 *    to the bell, and every row has a :focus-visible ring.
 *
 * Data wiring is untouched: the same view model, the same markAsRead /
 * markAllAsRead / toggleOpen / close calls, the same actionUrl navigation, and
 * the same portal-to-body escape from overflow-hidden parents.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import { Bell, CheckCheck, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn, resolveIntlLocale } from "@core/common/utils";
import { useNotificationViewModel } from "./useNotificationViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { NotificationItem } from "@core/notification/entities/NotificationItem";
import ReactDOM from "react-dom";

interface NotificationBellProps {
  /** Icon size class */
  iconClassName?: string;
  /** Button class overrides */
  className?: string;
}

const PANEL_WIDTH = 340;
const PANEL_MAX_HEIGHT = 460;
const VIEWPORT_GUTTER = 8;

// ── Time helpers ──────────────────────────────────────────────────────────────
// Both use the ACTIVE language. The relative labels come from the real
// common.timeAgo.* strings; the day headings come from Intl, which already
// speaks "today"/"yesterday" in every locale — so grouping costs zero new
// locale keys and can never leak an untranslated placeholder.

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatDayHeading(date: Date, language: string): string {
  const locale = resolveIntlLocale(language);
  const dayDiff = Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000);

  if (dayDiff === 0 || dayDiff === -1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(dayDiff, "day");
  }

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

function formatTimeAgo(
  dateStr: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  language: string
): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return t("common.timeAgo.justNow");

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("common.timeAgo.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("common.timeAgo.hoursAgo", { count: hours });

  const days = Math.floor(hours / 24);
  if (days < 7) return t("common.timeAgo.daysAgo", { count: days });

  return new Intl.DateTimeFormat(resolveIntlLocale(language), {
    day: "numeric",
    month: "short",
  }).format(date);
}

interface NotificationDayGroup {
  key: string;
  heading: string;
  items: NotificationItem[];
}

/**
 * NotificationBell — reusable bell icon with unread badge and smart-positioned dropdown.
 * Uses a portal so the dropdown is never clipped by overflow-hidden parents.
 * Positioning is viewport-aware: opens upward if there's insufficient space below.
 */
export function NotificationBell({ iconClassName = "h-5 w-5", className }: NotificationBellProps) {
  const vm = useNotificationViewModel();
  const { t, language, direction } = useI18n();
  const isRTL = direction === "rtl";

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Viewport-aware panel geometry. Position only — every colour, radius and
  // shadow lives in classes.
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [transformOrigin, setTransformOrigin] = useState("top center");

  const recalcPosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewport = { w: window.innerWidth, h: window.innerHeight };
    const panelWidth = Math.min(PANEL_WIDTH, viewport.w - VIEWPORT_GUTTER * 2);

    // Vertical: prefer below, flip above when there is not enough room.
    const spaceBelow = viewport.h - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < PANEL_MAX_HEIGHT && spaceAbove > spaceBelow;

    // Horizontal: the panel's INLINE-END edge tracks the trigger's inline-end
    // edge. In RTL the inline-end edge is the LEFT one — the old code used the
    // LTR formula in both branches, which pushed the Arabic panel to the wrong
    // side of its trigger.
    let left = isRTL ? rect.left : rect.right - panelWidth;
    left = Math.max(VIEWPORT_GUTTER, Math.min(left, viewport.w - panelWidth - VIEWPORT_GUTTER));

    setPanelStyle({
      width: panelWidth,
      maxHeight: Math.min(PANEL_MAX_HEIGHT, viewport.h - VIEWPORT_GUTTER * 2),
      left,
      ...(openAbove
        ? { bottom: viewport.h - rect.top + VIEWPORT_GUTTER }
        : { top: rect.bottom + VIEWPORT_GUTTER }),
    });
    // Overlays scale from their trigger origin — nothing slides in from an edge.
    setTransformOrigin(`${openAbove ? "bottom" : "top"} ${isRTL ? "left" : "right"}`);
  }, [isRTL]);

  const handleToggle = useCallback(() => {
    vm.toggleOpen();
    // recalc after state flips
    setTimeout(recalcPosition, 0);
  }, [vm, recalcPosition]);

  // Close on outside click / Escape; Escape returns focus to the bell.
  const isOpen = vm.isOpen;
  const close = vm.close;
  useEffect(() => {
    if (!isOpen) return;
    recalcPosition();
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        close();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", recalcPosition, true);
    window.addEventListener("resize", recalcPosition);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", recalcPosition, true);
      window.removeEventListener("resize", recalcPosition);
    };
  }, [isOpen, close, recalcPosition]);

  // ── Day grouping — insertion order is preserved inside each day, so the
  //    websocket's newest-first prepend still reads newest-first. ────────────
  const notifications = vm.notifications;
  const dayGroups = useMemo<NotificationDayGroup[]>(() => {
    const groups: NotificationDayGroup[] = [];
    const index = new Map<string, NotificationDayGroup>();

    for (const item of notifications) {
      const date = new Date(item.createdAt);
      const valid = !Number.isNaN(date.getTime());
      const key = valid ? String(startOfDay(date)) : "undated";
      let group = index.get(key);
      if (!group) {
        group = { key, heading: valid ? formatDayHeading(date, language) : "", items: [] };
        index.set(key, group);
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [notifications, language]);

  const hasUnread = vm.unreadCount > 0;
  const title = t("notifications.title");

  const dropdownPanel = vm.isOpen ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      dir={direction}
      style={{ ...panelStyle, transformOrigin }}
      className={cn(
        "fixed z-dropdown flex flex-col overflow-hidden",
        "rounded-nx-lg border border-nx-line bg-nx-popover text-nx-ink shadow-nx-popover",
        // Fade always; the 0.95 zoom from the trigger origin only when motion
        // is welcome. An overlay enters on the 200ms standard beat — the micro
        // beat is for hover and press, and at 140ms a 340px panel reads as a
        // pop rather than an arrival.
        "duration-nx-standard ease-nx-enter animate-in fade-in-0 motion-safe:zoom-in-95"
      )}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-nx-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-nx-ink">{title}</h2>
          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-nx-accent-wash px-1.5 text-[11px] font-semibold tabular-nums leading-none text-nx-accent">
              {vm.unreadCount > 99 ? "99+" : vm.unreadCount}
            </span>
          )}
        </div>

        {hasUnread && (
          <button
            type="button"
            onClick={vm.markAllAsRead}
            className={cn(
              // 32px tall: this was a 24px text button, under the hit-target
              // floor and the smallest tap target in the shell.
              "flex h-8 shrink-0 items-center gap-1.5 rounded-nx-sm px-2 text-xs font-medium text-nx-accent",
              "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "hover:bg-nx-accent-wash focus-visible:shadow-nx-focus focus-visible:outline-none"
            )}
          >
            <CheckCheck aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="truncate">{t("notifications.markAllRead")}</span>
          </button>
        )}
      </div>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="nexus-custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {vm.isLoading ? (
          <LoadingSpinner size="sm" showText={false} className="py-10" />
        ) : vm.isError ? (
          // Distinct from the genuine-empty state below: a failed fetch must never be
          // presented as "no notifications" — the user needs to know it didn't load.
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-nx-line bg-nx-ground text-destructive"
            >
              <Bell className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-nx-ink">{t("notifications.loadError")}</p>
            <button
              type="button"
              onClick={vm.refresh}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-nx-sm px-2.5 text-xs font-medium text-nx-accent",
                "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "hover:bg-nx-accent-wash focus-visible:shadow-nx-focus focus-visible:outline-none"
              )}
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              {t("common.retry")}
            </button>
          </div>
        ) : vm.notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-nx-line bg-nx-ground text-nx-ink-3"
            >
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-nx-ink">{t("notifications.empty")}</p>
              <p className="mt-1 text-xs text-nx-ink-3">{t("notifications.emptyDesc")}</p>
            </div>
          </div>
        ) : (
          dayGroups.map((group) => (
            <section key={group.key} aria-label={group.heading || undefined}>
              {group.heading && (
                <h3 className="sticky top-0 z-raised border-b border-nx-line bg-nx-popover px-4 py-1.5 text-[11px] font-semibold capitalize text-nx-ink-3">
                  {group.heading}
                </h3>
              )}
              <ul className="divide-y divide-nx-line">
                {group.items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.isRead) vm.markAsRead(n.id);
                        if (n.actionUrl) window.location.href = n.actionUrl;
                        vm.close();
                      }}
                      className={cn(
                        "group relative flex w-full items-start gap-3 px-4 py-3 text-start",
                        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                        "hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none",
                        // Unread wears the lit inline-start edge — a static
                        // affordance, never a pulse.
                        "before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full",
                        n.isRead ? "before:bg-transparent" : "before:bg-nx-accent"
                      )}
                    >
                      {/* Fixed leading slot keeps every title on one optical
                          column whether or not the row is unread. */}
                      <span
                        aria-hidden="true"
                        className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center"
                      >
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-nx-accent" />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[13px] leading-tight",
                            n.isRead ? "font-normal text-nx-ink-2" : "font-semibold text-nx-ink"
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-snug text-nx-ink-3">
                          {n.body}
                        </span>
                        <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-nx-ink-3">
                          <time dateTime={n.createdAt}>
                            {formatTimeAgo(n.createdAt, t, language)}
                          </time>
                          {n.actionUrl && (
                            <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
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
        // Unread steps the bell up to full ink — the calmest possible
        // at-a-glance signal. It sits after `className` so the state wins over
        // the caller's resting ink; the caller's hover rule is untouched.
        className={cn("relative", className, hasUnread && "text-nx-ink")}
        onClick={handleToggle}
        aria-expanded={vm.isOpen}
        aria-haspopup="dialog"
      >
        <Bell aria-hidden="true" className={iconClassName} />
        {/* The accessible name is built from content, not aria-label: an
            aria-label would SHADOW the count, and the count is exactly the
            part a screen-reader user needs. */}
        <span className="sr-only">{title}</span>
        {hasUnread && (
          <>
            <span className="sr-only">{vm.unreadCount}</span>
            <span
              aria-hidden="true"
              // A count chip is painted ON the bell, not floating above it —
              // the `shadow-nx-sm` it carried was depth it does not have. The
              // solid accent fill against ink-2 glyph is separation enough, and
              // the digits are tabular so 9 → 10 does not shuffle the chip.
              className="pointer-events-none absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nx-accent-fill px-1 text-[9px] font-bold tabular-nums leading-none text-nx-on-fill"
            >
              {vm.unreadCount > 99 ? "99+" : vm.unreadCount}
            </span>
          </>
        )}
      </Button>

      {/* Portal: dropdown is rendered at document.body to escape any overflow clipping */}
      {typeof document !== "undefined" && ReactDOM.createPortal(dropdownPanel, document.body)}
    </>
  );
}
