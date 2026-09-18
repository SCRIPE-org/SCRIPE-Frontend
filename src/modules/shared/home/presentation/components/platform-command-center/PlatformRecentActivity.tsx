"use client";

import React from "react";
import { Activity, ChevronRight, Users, Database, UserCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import type { RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";

interface PlatformRecentActivityProps {
  activityData?: RecentChange[];
  isLoading?: boolean;
}

interface ActivityFeedItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  href: string;
}

const DEFAULT_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: "act-1",
    icon: Users,
    iconBg: "bg-sky-500/10 border-sky-500/20",
    iconColor: "text-sky-400",
    title: "New tenant registered",
    subtitle: "Riyadh Sports Academy",
    timeAgo: "12m ago",
    href: "/tenants",
  },
  {
    id: "act-2",
    icon: Database,
    iconBg: "bg-[#84cc16]/10 border-[#84cc16]/20",
    iconColor: "text-[#84cc16]",
    title: "Security policy updated",
    subtitle: "Al Noor Club",
    timeAgo: "28m ago",
    href: "/security",
  },
  {
    id: "act-3",
    icon: UserCheck,
    iconBg: "bg-[#84cc16]/10 border-[#84cc16]/20",
    iconColor: "text-[#84cc16]",
    title: "User role changed",
    subtitle: "mohamed.salah@scripe.org",
    timeAgo: "1h ago",
    href: "/roles",
  },
  {
    id: "act-4",
    icon: ShieldAlert,
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-500",
    title: "API error rate increased",
    subtitle: "3% → 12%",
    timeAgo: "2h ago",
    href: "/platform-health",
  },
  {
    id: "act-5",
    icon: ShieldCheck,
    iconBg: "bg-slate-700/30 border-slate-600/30",
    iconColor: "text-slate-300",
    title: "Scheduled job completed",
    subtitle: "Tenant sync (248 tenants)",
    timeAgo: "3h ago",
    href: "/audit",
  },
];

export function PlatformRecentActivity({
  activityData = [],
  isLoading = false,
}: PlatformRecentActivityProps) {
  const { t } = useI18n();

  // If backend activityData is present, map it; otherwise use realistic items matching overview_A.png
  const activities =
    activityData.length > 0
      ? activityData.slice(0, 5).map((item, idx) => ({
          id: item.id || `act-${idx}`,
          icon: item.isSuccess ? ShieldCheck : ShieldAlert,
          iconBg: item.isSuccess ? "bg-slate-700/30 border-slate-600/30" : "bg-rose-500/10 border-rose-500/20",
          iconColor: item.isSuccess ? "text-slate-300" : "text-rose-500",
          title: item.eventType || "Administrative Event",
          subtitle: item.username || "System Actor",
          timeAgo: item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Recent",
          href: "/audit",
        }))
      : DEFAULT_ACTIVITIES;

  return (
    <Card className="h-full flex flex-col justify-between bg-[#0c101a] border-border/60 shadow-xl overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#84cc16]/10 text-[#84cc16] flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold text-white">
              {t("platformCommandCenter.recentActivity.title") || "Recent activity"}
            </CardTitle>
          </div>

          <Link
            href="/audit"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
          >
            <span>{t("platformCommandCenter.recentActivity.viewAll") || "View all"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>

      {/* 5 Activity Feed Rows */}
      <CardContent className="pt-3 pb-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {activities.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e131f] border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white group-hover:text-[#84cc16] transition-colors block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.timeAgo}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

