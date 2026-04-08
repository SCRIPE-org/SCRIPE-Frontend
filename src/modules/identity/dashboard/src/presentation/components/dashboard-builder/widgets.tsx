/**
 * Dashboard Builder Widget Components — Placeholder renderers for dashboard builder preview.
 * Each widget renders demo/placeholder data in the builder canvas.
 * When rendered on the actual dashboard, real data is used instead.
 *
 * @module dashboard/presentation/components/dashboard-builder/widgets
 */
"use client";

import React from "react";
import { cn } from "@core/common/utils";
import {
  Users, Activity, Shield, Building2, TrendingUp, TrendingDown, Minus,
  BarChart3, Table2, Zap, Bell, CalendarDays, Megaphone, Code,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, CheckCircle2, Clock,
  AlertTriangle, Info, ExternalLink,
} from "lucide-react";

// ── Icon Map ──────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Users, Activity, Shield, Building2, TrendingUp, TrendingDown,
  BarChart3, Table2, Zap, Bell, CalendarDays, Megaphone, Code,
};

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] || BarChart3;
}

// ═══════════════════════════════════════════════════════════
// Stats Card Widget
// ═══════════════════════════════════════════════════════════
export function WidgetStatsCard({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Metric";
  const value = (props.value as string) || "0";
  const trend = (props.trend as string) || "";
  const dir = (props.trendDirection as string) || "neutral";
  const iconName = (props.icon as string) || "BarChart3";
  const Icon = resolveIcon(iconName);

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            {dir === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
            {dir === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
            {dir === "neutral" && <Minus className="h-3 w-3 text-muted-foreground" />}
            <span className={cn(
              "text-xs font-medium",
              dir === "up" && "text-emerald-500",
              dir === "down" && "text-red-500",
              dir === "neutral" && "text-muted-foreground",
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Chart Widget (Placeholder)
// ═══════════════════════════════════════════════════════════
export function WidgetChart({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Chart";
  const chartType = (props.chartType as string) || "line";

  // Simulated bars/lines
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68];

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-1 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t transition-all",
              chartType === "line" ? "bg-primary/60" : "bg-primary/80"
            )}
            style={{ height: `${h}%`, minHeight: 4 }}
          />
        ))}
      </div>
      {(props.showLegend as boolean) && (
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Current
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary/30" />
            Previous
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Data Table Widget (Placeholder)
// ═══════════════════════════════════════════════════════════
export function WidgetDataTable({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Data Table";
  const maxRows = (props.maxRows as number) || 5;
  const rows = Array.from({ length: Math.min(maxRows, 5) }, (_, i) => ({
    name: `Record ${i + 1}`,
    status: i % 3 === 0 ? "Active" : i % 3 === 1 ? "Pending" : "Inactive",
    date: "2026-03-30",
  }));

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="pb-2 text-start font-medium">Name</th>
              <th className="pb-2 text-start font-medium">Status</th>
              <th className="pb-2 text-end font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0">
                <td className="py-1.5 font-medium">{row.name}</td>
                <td className="py-1.5">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    row.status === "Active" && "bg-emerald-500/10 text-emerald-500",
                    row.status === "Pending" && "bg-amber-500/10 text-amber-500",
                    row.status === "Inactive" && "bg-red-500/10 text-red-500",
                  )}>
                    {row.status}
                  </span>
                </td>
                <td className="py-1.5 text-end text-muted-foreground">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Quick Actions Widget
// ═══════════════════════════════════════════════════════════
export function WidgetQuickActions({ props }: { props: Record<string, unknown> }) {
  const actions = (props.actions as string[]) || ["Action 1", "Action 2"];
  const columns = (props.columns as number) || 2;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
      <div className={cn("grid flex-1 gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {actions.map((action, i) => (
          <button
            key={i}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <Zap className="h-3 w-3 text-primary" />
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Activity Feed Widget
// ═══════════════════════════════════════════════════════════
export function WidgetActivityFeed({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Recent Activity";
  const maxItems = (props.maxItems as number) || 6;
  const showTimestamps = (props.showTimestamps as boolean) ?? true;

  const items = [
    { icon: CheckCircle2, color: "text-emerald-500", text: "User login successful", time: "2m ago" },
    { icon: AlertTriangle, color: "text-amber-500", text: "Failed login attempt", time: "5m ago" },
    { icon: Users, color: "text-primary", text: "New admin created", time: "12m ago" },
    { icon: Shield, color: "text-blue-500", text: "Permissions updated", time: "30m ago" },
    { icon: Clock, color: "text-muted-foreground", text: "Session expired", time: "1h ago" },
    { icon: Info, color: "text-cyan-500", text: "System backup complete", time: "2h ago" },
  ].slice(0, maxItems);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex-1 space-y-3 overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-full bg-muted p-1">
              <item.icon className={cn("h-3 w-3", item.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium">{item.text}</p>
              {showTimestamps && (
                <p className="text-[10px] text-muted-foreground">{item.time}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Calendar Widget
// ═══════════════════════════════════════════════════════════
export function WidgetCalendar({ props }: { props: Record<string, unknown> }) {
  const maxEvents = (props.maxEvents as number) || 3;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 28 }, (_, i) => i + 1);
  const today = new Date().getDate();

  const events = [
    { title: "Team Meeting", time: "10:00 AM" },
    { title: "Release Review", time: "2:00 PM" },
    { title: "Sprint Planning", time: "4:00 PM" },
  ].slice(0, maxEvents);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">Calendar</h3>
      <div className="mb-2 grid grid-cols-7 gap-0.5 text-center">
        {days.map(d => (
          <span key={d} className="text-[10px] font-medium text-muted-foreground">{d}</span>
        ))}
        {dates.map(d => (
          <span
            key={d}
            className={cn(
              "rounded-md py-0.5 text-[10px]",
              d === today && "bg-primary text-primary-foreground font-bold",
              d !== today && "text-foreground/70 hover:bg-muted",
            )}
          >
            {d}
          </span>
        ))}
      </div>
      {(props.showUpcoming as boolean) && events.length > 0 && (
        <div className="mt-auto space-y-1.5 border-t border-border/50 pt-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="font-medium">{e.title}</span>
              <span className="text-muted-foreground">{e.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Notifications Widget
// ═══════════════════════════════════════════════════════════
export function WidgetNotifications({ props }: { props: Record<string, unknown> }) {
  const maxItems = (props.maxItems as number) || 5;
  const items = [
    { title: "New user registered", unread: true, time: "1m ago" },
    { title: "Backup completed", unread: true, time: "15m ago" },
    { title: "Certificate expiring in 7 days", unread: false, time: "1h ago" },
    { title: "System update available", unread: false, time: "3h ago" },
    { title: "Weekly report generated", unread: false, time: "1d ago" },
  ].slice(0, maxItems);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {items.filter(i => i.unread).length}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className={cn(
            "flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
            item.unread ? "bg-primary/5" : "hover:bg-muted/30"
          )}>
            <Bell className={cn("mt-0.5 h-3 w-3 flex-shrink-0", item.unread ? "text-primary" : "text-muted-foreground")} />
            <div className="flex-1 min-w-0">
              <p className={cn("truncate", item.unread && "font-medium")}>{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Announcement Widget
// ═══════════════════════════════════════════════════════════
export function WidgetAnnouncement({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Announcement";
  const message = (props.message as string) || "Welcome to the platform! Check out our latest features.";
  const variant = (props.variant as string) || "info";

  const variants: Record<string, { bg: string; border: string; icon: React.ElementType }> = {
    info:    { bg: "bg-blue-500/5",   border: "border-blue-500/20",   icon: Info },
    success: { bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: CheckCircle2 },
    warning: { bg: "bg-amber-500/5",   border: "border-amber-500/20",   icon: AlertTriangle },
  };
  const v = variants[variant] || variants.info;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", v.bg, v.border)}>
      <v.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Custom Widget (Enterprise)
// ═══════════════════════════════════════════════════════════
export function WidgetCustom({ props }: { props: Record<string, unknown> }) {
  const title = (props.title as string) || "Custom Widget";
  const url = (props.url as string) || "";
  const height = (props.height as number) || 300;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      {url ? (
        <iframe
          src={url}
          className="flex-1 border-0"
          style={{ minHeight: height }}
          title={title}
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground" style={{ minHeight: height }}>
          <div className="text-center">
            <Code className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p>Configure a URL to embed custom content</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Widget Renderer — Maps type → component
// ═══════════════════════════════════════════════════════════
export function WidgetRenderer({ type, props }: { type: string; props: Record<string, unknown> }) {
  switch (type) {
    case 'statsCard':     return <WidgetStatsCard props={props} />;
    case 'chart':         return <WidgetChart props={props} />;
    case 'dataTable':     return <WidgetDataTable props={props} />;
    case 'quickActions':  return <WidgetQuickActions props={props} />;
    case 'activityFeed':  return <WidgetActivityFeed props={props} />;
    case 'calendar':      return <WidgetCalendar props={props} />;
    case 'notifications': return <WidgetNotifications props={props} />;
    case 'announcement':  return <WidgetAnnouncement props={props} />;
    case 'customWidget':  return <WidgetCustom props={props} />;
    default:              return <div className="rounded border p-4 text-xs text-muted-foreground">Unknown: {type}</div>;
  }
}
