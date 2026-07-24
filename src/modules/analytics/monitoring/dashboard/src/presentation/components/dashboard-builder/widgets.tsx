// UI-EXCEPTION: compact studio layout
/**
 * Dashboard Builder Widget Components — Placeholder renderers for dashboard builder preview.
 * Each widget renders demo/placeholder data in the builder canvas.
 * When rendered on the actual dashboard, real data is used instead.
 *
 * These are miniature tiles laid into a 12-column canvas whose rows start at
 * 100px, so every Card* here is handed its own compact padding: the settings-
 * driven p-6 rhythm is correct for a page section and leaves a preview tile
 * with no room for the data it exists to show. Same reason the titles are
 * pinned at text-sm rather than riding CardTitle's own ladder.
 *
 * @module dashboard/presentation/components/dashboard-builder/widgets
 */
"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import {
  Users,
  Activity,
  Shield,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Table2,
  Zap,
  Bell,
  CalendarDays,
  Megaphone,
  Code,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";

// ── Icon Map ──────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Activity,
  Shield,
  Building2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Table2,
  Zap,
  Bell,
  CalendarDays,
  Megaphone,
  Code,
};

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || BarChart3;
}

// ── Shared preview geometry ───────────────────────────────
// The tile ladder, written once so nine previews cannot drift apart.
const TILE = "flex h-full flex-col";
const TILE_HEADER = "flex-row items-center justify-between space-y-0 p-3 pb-2";
const TILE_BODY = "flex-1 p-3 pt-0";
const TILE_TITLE = "text-sm";

// --nx-accent holds a COMPLETE colour value, so Tailwind slash-alpha is
// silently dropped on it (badge.tsx L39 documents this); a tint of the accent
// has to be mixed explicitly.
const ACCENT_60 = "bg-[color:color-mix(in_srgb,var(--nx-accent)_60%,transparent)]";
const ACCENT_35 = "bg-[color:color-mix(in_srgb,var(--nx-accent)_35%,transparent)]";

// ═══════════════════════════════════════════════════════════
// Stats Card Widget
// ═══════════════════════════════════════════════════════════
export function WidgetStatsCard({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.preview.metric");
  const value = (props.value as string) || "0";
  const trend = (props.trend as string) || "";
  const dir = (props.trendDirection as string) || "neutral";
  const iconName = (props.icon as string) || "BarChart3";
  const resolvedIconComponent = resolveIcon(iconName);

  return (
    <Card className={cn(TILE, "justify-between")}>
      <CardHeader className={TILE_HEADER}>
        <span className="truncate text-xs font-medium text-nx-ink-2">{title}</span>
        <div className="shrink-0 rounded-nx-md bg-nx-accent-wash p-2">
          {React.createElement(resolvedIconComponent, {
            className: "h-4 w-4 text-nx-accent",
            "aria-hidden": "true",
          })}
        </div>
      </CardHeader>
      <CardContent className={TILE_BODY}>
        <p className="text-2xl font-bold tracking-tight tabular-nums text-nx-ink">{value}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {dir === "up" && <ArrowUpRight className="h-3 w-3 text-success" aria-hidden="true" />}
            {dir === "down" && (
              <ArrowDownRight className="h-3 w-3 text-destructive" aria-hidden="true" />
            )}
            {dir === "neutral" && <Minus className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />}
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                dir === "up" && "text-success",
                dir === "down" && "text-destructive",
                dir === "neutral" && "text-nx-ink-3"
              )}
            >
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Chart Widget (Placeholder)
// ═══════════════════════════════════════════════════════════
export function WidgetChart({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.widget.chart");
  const chartType = (props.chartType as string) || "line";

  // Simulated bars/lines — fixed heights, never randomised, so the preview does
  // not reshuffle itself on every re-render.
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68];

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>{title}</CardTitle>
        <MoreHorizontal className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      </CardHeader>
      <CardContent className={cn(TILE_BODY, "flex flex-col")}>
        <div className="flex flex-1 items-end gap-1" aria-hidden="true">
          {bars.map((h, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-nx-sm",
                chartType === "line" ? ACCENT_60 : "bg-nx-accent-fill"
              )}
              style={{ height: `${h}%`, minHeight: 4 }}
            />
          ))}
        </div>
        {(props.showLegend as boolean) && (
          <div className="mt-2 flex items-center gap-3 text-xs text-nx-ink-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-nx-accent-fill" aria-hidden="true" />
              {t("dashboard.builder.preview.current")}
            </span>
            <span className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", ACCENT_35)} aria-hidden="true" />
              {t("dashboard.builder.preview.previous")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Data Table Widget (Placeholder)
// ═══════════════════════════════════════════════════════════
export function WidgetDataTable({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.widget.dataTable");
  const maxRows = (props.maxRows as number) || 5;
  // The status key drives both the label and the tone, so the tone switch never
  // depends on translated text.
  const rows = Array.from({ length: Math.min(maxRows, 5) }, (_, i) => ({
    name: t("dashboard.builder.preview.record", { index: i + 1 }),
    status: i % 3 === 0 ? "active" : i % 3 === 1 ? "pending" : "inactive",
    date: "2026-03-30",
  }));

  const statusLabel: Record<string, string> = {
    active: t("common.active"),
    pending: t("common.pending"),
    inactive: t("common.inactive"),
  };

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(TILE_BODY, "overflow-hidden")}>
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="h-auto px-0 pb-2 text-xs">{t("common.name")}</TableHead>
              <TableHead className="h-auto px-0 pb-2 text-xs">{t("common.status")}</TableHead>
              <TableHead variant="numeric" className="h-auto px-0 pb-2 text-xs">
                {t("dashboard.builder.preview.columnDate")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="px-0 py-1.5 font-medium">{row.name}</TableCell>
                <TableCell className="px-0 py-1.5">
                  <Badge
                    variant={
                      row.status === "active"
                        ? "success"
                        : row.status === "pending"
                          ? "warning"
                          : "error"
                    }
                    className="px-2 py-0 text-[10px]"
                  >
                    {statusLabel[row.status]}
                  </Badge>
                </TableCell>
                <TableCell variant="numeric" className="px-0 py-1.5 text-nx-ink-2">
                  {row.date}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Quick Actions Widget
// ═══════════════════════════════════════════════════════════
export function WidgetQuickActions({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const actions = (props.actions as string[]) || [
    t("dashboard.builder.preview.action", { index: 1 }),
    t("dashboard.builder.preview.action", { index: 2 }),
  ];
  const columns = (props.columns as number) || 2;

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>
          {t("dashboard.builder.widget.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className={TILE_BODY}>
        <div className={cn("grid h-full gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {actions.map((action, i) => (
            // A preview of a button, not a button: these carry no action, so
            // rendering them as <button> would put dead stops in the tab order
            // of every canvas tile.
            <span
              key={i}
              className="flex items-center justify-center gap-1.5 rounded-nx-control border border-nx-line bg-nx-raised px-3 py-2.5 text-center text-xs font-medium text-nx-ink"
            >
              <Zap className="h-3 w-3 shrink-0 text-nx-accent" aria-hidden="true" />
              {action}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Activity Feed Widget
// ═══════════════════════════════════════════════════════════
export function WidgetActivityFeed({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.preview.recentActivity");
  const maxItems = (props.maxItems as number) || 6;
  const showTimestamps = (props.showTimestamps as boolean) ?? true;

  const items = [
    {
      icon: CheckCircle2,
      color: "text-success",
      text: t("dashboard.builder.preview.activity.loginSuccess"),
      time: t("common.timeAgo.minutesAgo", { count: 2 }),
    },
    {
      icon: AlertTriangle,
      color: "text-warning",
      text: t("dashboard.builder.preview.activity.loginFailed"),
      time: t("common.timeAgo.minutesAgo", { count: 5 }),
    },
    {
      icon: Users,
      color: "text-nx-accent",
      text: t("dashboard.builder.preview.activity.adminCreated"),
      time: t("common.timeAgo.minutesAgo", { count: 12 }),
    },
    {
      icon: Shield,
      color: "text-info",
      text: t("dashboard.builder.preview.activity.permissionsUpdated"),
      time: t("common.timeAgo.minutesAgo", { count: 30 }),
    },
    {
      icon: Clock,
      color: "text-nx-ink-3",
      text: t("dashboard.builder.preview.activity.sessionExpired"),
      time: t("common.timeAgo.hoursAgo", { count: 1 }),
    },
    {
      icon: Info,
      color: "text-info",
      text: t("dashboard.builder.preview.activity.backupComplete"),
      time: t("common.timeAgo.hoursAgo", { count: 2 }),
    },
  ].slice(0, maxItems);

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(TILE_BODY, "space-y-3 overflow-hidden")}>
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-full bg-nx-raised p-1">
              <item.icon className={cn("h-3 w-3", item.color)} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-nx-ink">{item.text}</p>
              {showTimestamps && (
                <p className="text-[10px] tabular-nums text-nx-ink-3">{item.time}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Calendar Widget
// ═══════════════════════════════════════════════════════════
export function WidgetCalendar({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const maxEvents = (props.maxEvents as number) || 3;
  const days = [
    t("dashboard.builder.preview.weekday.mon"),
    t("dashboard.builder.preview.weekday.tue"),
    t("dashboard.builder.preview.weekday.wed"),
    t("dashboard.builder.preview.weekday.thu"),
    t("dashboard.builder.preview.weekday.fri"),
    t("dashboard.builder.preview.weekday.sat"),
    t("dashboard.builder.preview.weekday.sun"),
  ];
  const dates = Array.from({ length: 28 }, (_, i) => i + 1);
  const today = new Date().getDate();

  const events = [
    {
      title: t("dashboard.builder.preview.event.teamMeeting"),
      time: t("dashboard.builder.preview.event.teamMeetingTime"),
    },
    {
      title: t("dashboard.builder.preview.event.releaseReview"),
      time: t("dashboard.builder.preview.event.releaseReviewTime"),
    },
    {
      title: t("dashboard.builder.preview.event.sprintPlanning"),
      time: t("dashboard.builder.preview.event.sprintPlanningTime"),
    },
  ].slice(0, maxEvents);

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>{t("dashboard.builder.widget.calendar")}</CardTitle>
      </CardHeader>
      <CardContent className={cn(TILE_BODY, "flex flex-col")}>
        <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
          {days.map((d) => (
            <span key={d} className="text-[10px] font-medium text-nx-ink-3">
              {d}
            </span>
          ))}
          {dates.map((d) => (
            <span
              key={d}
              aria-current={d === today ? "date" : undefined}
              className={cn(
                "rounded-nx-sm py-0.5 text-[10px] tabular-nums",
                d === today
                  ? "bg-nx-accent-fill font-bold text-nx-on-fill"
                  : "text-nx-ink-2 hover:bg-nx-hover"
              )}
            >
              {d}
            </span>
          ))}
        </div>
        {(props.showUpcoming as boolean) && events.length > 0 && (
          <div className="mt-auto space-y-1.5 border-t border-nx-line pt-2">
            {events.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="truncate font-medium text-nx-ink">{e.title}</span>
                <span className="shrink-0 tabular-nums text-nx-ink-3">{e.time}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Notifications Widget
// ═══════════════════════════════════════════════════════════
export function WidgetNotifications({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const maxItems = (props.maxItems as number) || 5;
  const items = [
    {
      title: t("dashboard.builder.preview.notification.userRegistered"),
      unread: true,
      time: t("common.timeAgo.minutesAgo", { count: 1 }),
    },
    {
      title: t("dashboard.builder.preview.notification.backupCompleted"),
      unread: true,
      time: t("common.timeAgo.minutesAgo", { count: 15 }),
    },
    {
      title: t("dashboard.builder.preview.notification.certificateExpiring"),
      unread: false,
      time: t("common.timeAgo.hoursAgo", { count: 1 }),
    },
    {
      title: t("dashboard.builder.preview.notification.updateAvailable"),
      unread: false,
      time: t("common.timeAgo.hoursAgo", { count: 3 }),
    },
    {
      title: t("dashboard.builder.preview.notification.weeklyReport"),
      unread: false,
      time: t("common.timeAgo.daysAgo", { count: 1 }),
    },
  ].slice(0, maxItems);

  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <Card className={TILE}>
      <CardHeader className={TILE_HEADER}>
        <CardTitle className={TILE_TITLE}>
          {t("dashboard.builder.widget.notifications")}
        </CardTitle>
        <Badge className="shrink-0 px-2 py-0 text-[10px]">
          <span aria-hidden="true">{unreadCount}</span>
          <span className="sr-only">
            {t("dashboard.builder.preview.unreadCount", { count: unreadCount })}
          </span>
        </Badge>
      </CardHeader>
      <CardContent className={cn(TILE_BODY, "space-y-2 overflow-hidden")}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-nx-control px-2 py-1.5 text-xs",
              item.unread ? "bg-nx-accent-wash" : "hover:bg-nx-hover"
            )}
          >
            <Bell
              aria-hidden="true"
              className={cn(
                "mt-0.5 h-3 w-3 flex-shrink-0",
                item.unread ? "text-nx-accent" : "text-nx-ink-3"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-nx-ink", item.unread && "font-medium")}>
                {item.title}
              </p>
              <p className="text-[10px] tabular-nums text-nx-ink-3">{item.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Announcement Widget
// ═══════════════════════════════════════════════════════════
export function WidgetAnnouncement({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.widget.announcement");
  const message =
    (props.message as string) || t("dashboard.builder.preview.announcementMessage");
  const variant = (props.variant as string) || "info";

  // Severity speaks through the glyph and the hairline; the copy stays neutral
  // ink, because coloured body text on a coloured wash is the least readable
  // thing a banner can do (alert.tsx L23-26). Each tone re-states its hairline
  // for hover, otherwise Card's own hover:border-nx-line-hi washes the severity
  // straight out of the edge.
  const variants: Record<
    string,
    { bg: string; border: string; tone: string; icon: React.ElementType }
  > = {
    info: {
      bg: "bg-info/10",
      border: "border-info/30 hover:border-info/30",
      tone: "text-info",
      icon: Info,
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/30 hover:border-success/30",
      tone: "text-success",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-warning/10",
      border: "border-warning/30 hover:border-warning/30",
      tone: "text-warning",
      icon: AlertTriangle,
    },
  };
  const v = variants[variant] || variants.info;

  return (
    <Card className={cn("flex items-start gap-3 p-4", v.bg, v.border)}>
      <v.icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", v.tone)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-nx-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-nx-ink-2">{message}</p>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Custom Widget (Enterprise)
// ═══════════════════════════════════════════════════════════
export function WidgetCustom({ props }: { props: Record<string, unknown> }) {
  const { t } = useI18n();
  const title = (props.title as string) || t("dashboard.builder.widget.customWidget");
  const url = (props.url as string) || "";
  const height = (props.height as number) || 300;

  return (
    <Card className={cn(TILE, "overflow-hidden")}>
      <CardHeader
        className={cn(TILE_HEADER, "border-b border-nx-line px-4 py-2 pb-2")}
      >
        <CardTitle className={TILE_TITLE}>{title}</CardTitle>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("dashboard.builder.preview.openCustomSource")}
            className="shrink-0 rounded-nx-sm p-1 text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none"
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </CardHeader>
      {url ? (
        <iframe
          src={url}
          className="flex-1 border-0"
          style={{ minHeight: height }}
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <CardContent
          className="flex flex-1 items-center justify-center p-4 text-xs text-nx-ink-3"
          style={{ minHeight: height }}
        >
          <div className="text-center">
            <Code className="mx-auto mb-2 h-8 w-8 text-nx-ink-3" aria-hidden="true" />
            <p>{t("dashboard.builder.preview.customPlaceholder")}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Widget Renderer — Maps type → component
// ═══════════════════════════════════════════════════════════
export function WidgetRenderer({ type, props }: { type: string; props: Record<string, unknown> }) {
  const { t } = useI18n();

  switch (type) {
    case "statsCard":
      return <WidgetStatsCard props={props} />;
    case "chart":
      return <WidgetChart props={props} />;
    case "dataTable":
      return <WidgetDataTable props={props} />;
    case "quickActions":
      return <WidgetQuickActions props={props} />;
    case "activityFeed":
      return <WidgetActivityFeed props={props} />;
    case "calendar":
      return <WidgetCalendar props={props} />;
    case "notifications":
      return <WidgetNotifications props={props} />;
    case "announcement":
      return <WidgetAnnouncement props={props} />;
    case "customWidget":
      return <WidgetCustom props={props} />;
    default:
      return (
        <Card className="p-4 text-xs text-nx-ink-2">
          {t("dashboard.builder.preview.unknownWidget", { type })}
        </Card>
      );
  }
}
