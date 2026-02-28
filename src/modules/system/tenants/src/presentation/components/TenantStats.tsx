/**
 * Tenant Stats Component
 *
 * Dashboard-style stat cards showing counts for tenant resources.
 * Features animated counters and hover effects with RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Users, Shield, Building2, Key, Loader2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { systemContainer } from "@modules/system/di";
import type { TenantStats as TenantStatsType } from "../../domain/interfaces/ITenantRepository";
import { appLogger } from "@/core/common/logger";

interface TenantStatsProps {
  tenantId: string;
  onTabChange?: (tab: string) => void;
}

interface Stats {
  adminsCount: number;
  rolesCount: number;
  subTenantsCount: number;
  permissionsCount: number;
}

export function TenantStats({ tenantId, onTabChange }: TenantStatsProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

  // Use TanStack Query so invalidateQueries can refresh stats
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ["tenant-stats", tenantId],
    queryFn: async () => {
      const data = await systemContainer.tenantRepository.getStats(tenantId);

      return {
        adminsCount: data.adminsCount,
        rolesCount: data.rolesCount,
        subTenantsCount: data.subTenantsCount,
        permissionsCount: data.permissionsCount,
      };
    },
    enabled: !!tenantId,
  });

  const statCards = [
    {
      key: "admins",
      label: t("tenant.statsAdmins") || "Admins",
      value: stats?.adminsCount ?? 0,
      icon: Users,
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/30",
    },
    {
      key: "roles",
      label: t("tenant.statsRoles") || "Roles",
      value: stats?.rolesCount ?? 0,
      icon: Shield,
      color: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/30",
    },
    {
      key: "subtenants",
      label: t("tenant.statsSubTenants") || "Sub-Tenants",
      value: stats?.subTenantsCount ?? 0,
      icon: Building2,
      color: "from-emerald-500/20 to-emerald-600/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/30",
    },
    {
      key: "permissions",
      label: t("tenant.statsPermissions") || "Permissions",
      value: stats?.permissionsCount ?? 0,
      icon: Key,
      color: "from-amber-500/20 to-amber-600/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" dir={direction}>
      {statCards.map((stat) => (
        <Card
          key={stat.key}
          className={cn(
            "group relative cursor-pointer overflow-hidden",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg hover:shadow-primary/5",
            "hover:scale-[1.02]",
            "border",
            stat.borderColor
          )}
          onClick={() => onTabChange?.(stat.key)}
        >
          {/* Gradient Background */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-50",
              "transition-opacity group-hover:opacity-70",
              stat.color
            )}
          />

          <CardContent className="relative p-4">
            <div
              className={cn("flex items-center justify-between gap-3", isRtl && "flex-row-reverse")}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center",
                  "h-12 w-12 rounded-lg",
                  "bg-background/80 backdrop-blur-sm",
                  "border border-border/50 shadow-sm",
                  "transition-transform duration-300",
                  "group-hover:scale-110",
                  isRtl ? "group-hover:-rotate-3" : "group-hover:rotate-3"
                )}
              >
                <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
              </div>

              {/* Value */}
              <div className={cn(isRtl ? "text-left" : "text-right")}>
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber value={stat.value} />
                  </div>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate from 0 to value
    const duration = 600;
    const steps = 20;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="text-3xl font-bold tracking-tight">{displayValue}</span>;
}
