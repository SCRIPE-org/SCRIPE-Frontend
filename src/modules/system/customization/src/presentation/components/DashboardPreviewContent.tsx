/**
 * DashboardPreviewContent — Mock dashboard page content for the layout preview.
 * Renders realistic stat cards, chart areas, and table to fill the layout.
 * Receives settings updates via postMessage from the Customizer Studio
 * and injects them into localStorage to trigger SettingsProvider re-render.
 */
"use client";

import { useEffect, useCallback, useState } from "react";
import { useSettings } from "@core/providers/settings-provider";
import {
  Users, DollarSign, Activity, Eye, TrendingUp,
  BarChart3, ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { cn } from "@core/common/utils";

const STORAGE_KEY = "dashboard_settings";

export function DashboardPreviewContent() {
  const settings = useSettings();
  const [isPreview] = useState(true);

  // ── Listen for postMessage from studio parent ──
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || event.data.type !== "DASHBOARD_SETTINGS_UPDATE") return;

      const newSettings = event.data.settings;
      if (!newSettings) return;

      try {
        // Merge into localStorage so SettingsProvider picks it up
        const existing = localStorage.getItem(STORAGE_KEY);
        const current = existing ? JSON.parse(existing) : {};
        const merged = { ...current, ...newSettings };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

        // Trigger re-merge in SettingsProvider
        window.dispatchEvent(new Event("admin-settings-loaded"));
      } catch (e) {
        console.error("[DashboardPreview] Failed to apply settings:", e);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── Notify parent when ready ──
  useEffect(() => {
    window.parent?.postMessage({ type: "DASHBOARD_PREVIEW_READY" }, "*");
  }, []);

  const stats = [
    { icon: Users, label: "Total Users", value: "2,847", change: "+12.5%", positive: true, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: DollarSign, label: "Revenue", value: "$48.2K", change: "+8.1%", positive: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Activity, label: "Active Now", value: "342", change: "-2.4%", positive: false, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Eye, label: "Page Views", value: "12.4K", change: "+23.7%", positive: true, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  const tableRows = [
    { name: "John Doe", email: "john@company.com", role: "Admin", status: "Active", date: "Today" },
    { name: "Sarah Miller", email: "sarah@company.com", role: "Editor", status: "Active", date: "Yesterday" },
    { name: "Alex Kim", email: "alex@company.com", role: "Viewer", status: "Pending", date: "2 days ago" },
    { name: "Maria Garcia", email: "maria@company.com", role: "Admin", status: "Active", date: "3 days ago" },
    { name: "James Wilson", email: "james@company.com", role: "Editor", status: "Inactive", date: "1 week ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors">
            Export
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            + New Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className={cn("flex items-center gap-1 mt-1 text-xs",
                stat.positive ? "text-emerald-500" : "text-rose-500"
              )}>
                <TrendingUp className={cn("h-3 w-3", !stat.positive && "rotate-180")} />
                <span>{stat.change} from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue for 2026</p>
            </div>
            <div className="flex gap-1">
              {["7d", "30d", "90d", "1y"].map((period, i) => (
                <button key={period} className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors",
                  i === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                )}>{period}</button>
              ))}
            </div>
          </div>
          {/* Bar chart mock */}
          <div className="flex items-end gap-1.5 h-[160px] px-2">
            {[35, 50, 70, 45, 80, 60, 90, 55, 72, 42, 85, 68].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Traffic Sources</h3>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center my-4">
            <div className="relative h-[120px] w-[120px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-primary" strokeWidth="3"
                  strokeDasharray="55 45" strokeLinecap="round" />
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-primary/40" strokeWidth="3"
                  strokeDasharray="25 75" strokeDashoffset="-55" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">68%</span>
                  <span className="block text-[10px] text-muted-foreground">Organic</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Direct", pct: "42%", color: "bg-primary" },
              { label: "Social", pct: "28%", color: "bg-primary/60" },
              { label: "Referral", pct: "18%", color: "bg-primary/30" },
              { label: "Other", pct: "12%", color: "bg-muted" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-xs font-medium text-foreground">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">Recent Users</h3>
            <p className="text-xs text-muted-foreground">Latest user registrations</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-start text-xs font-medium text-muted-foreground p-3">Name</th>
                <th className="text-start text-xs font-medium text-muted-foreground p-3">Email</th>
                <th className="text-start text-xs font-medium text-muted-foreground p-3">Role</th>
                <th className="text-start text-xs font-medium text-muted-foreground p-3">Status</th>
                <th className="text-start text-xs font-medium text-muted-foreground p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium text-foreground">{row.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{row.email}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{row.role}</span></td>
                  <td className="p-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full",
                      row.status === "Active" ? "bg-emerald-500/10 text-emerald-500" :
                      row.status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                      "bg-muted text-muted-foreground"
                    )}>{row.status}</span>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
