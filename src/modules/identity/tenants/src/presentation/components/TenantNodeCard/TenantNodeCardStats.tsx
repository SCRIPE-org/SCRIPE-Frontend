"use client";

import React from "react";
import { Users, Shield, Building2, Key } from "lucide-react";
import { Skeleton } from "@core/ui/skeleton";
import { cn } from "@core/common/utils";

interface TenantNodeCardStatsProps {
  stats:
    | {
        adminsCount?: number;
        rolesCount?: number;
        subTenantsCount?: number;
        permissionsCount?: number;
      }
    | undefined;
  statsLoading: boolean;
  t: (key: string) => string;
}

/**
 * React presentation component representing the tenant node card stats UI element.
 */
export function TenantNodeCardStats({ stats, statsLoading, t }: TenantNodeCardStatsProps) {
  const statItems = [
    {
      key: "admins",
      label: t("tenant.statsAdmins"),
      value: stats?.adminsCount,
      icon: Users,
      color: "text-blue-500",
    },
    {
      key: "roles",
      label: t("tenant.statsRoles"),
      value: stats?.rolesCount,
      icon: Shield,
      color: "text-purple-500",
    },
    {
      key: "children",
      label: t("tenant.statsSubTenants"),
      value: stats?.subTenantsCount,
      icon: Building2,
      color: "text-emerald-500",
    },
    {
      key: "permissions",
      label: t("tenant.statsPermissions"),
      value: stats?.permissionsCount,
      icon: Key,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {statItems.map((stat) => (
        <div
          key={stat.key}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border/50 p-2.5",
            "bg-muted/20"
          )}
        >
          <stat.icon className={cn("h-4 w-4 shrink-0", stat.color)} />
          <div className="min-w-0">
            {statsLoading ? (
              <Skeleton className="h-5 w-8" />
            ) : (
              <p className="text-sm font-bold">{stat.value ?? 0}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
