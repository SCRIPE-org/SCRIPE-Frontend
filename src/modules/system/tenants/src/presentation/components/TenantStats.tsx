/**
 * Tenant Stats Component — Deep Redesign
 *
 * Premium glassmorphism stat cards with gradient watermark icons,
 * animated counters with micro-animation hover effects.
 * Full RTL/LTR support.
 *
 * @module tenants
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Users, Shield, Building2, Key, Loader2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { systemContainer } from "@modules/system/di";
import type { TenantStats as TenantStatsType } from "../../domain/interfaces/ITenantRepository";

interface TenantStatsProps {
  tenantId: string;
  onTabChange?: (tab: string) => void;
}

export function TenantStats({ tenantId, onTabChange }: TenantStatsProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

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
      gradient: "from-blue-500 to-blue-600",
      glowColor: "shadow-blue-500/20",
      bgGlow: "bg-blue-500",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      key: "roles",
      label: t("tenant.statsRoles") || "Roles",
      value: stats?.rolesCount ?? 0,
      icon: Shield,
      gradient: "from-violet-500 to-purple-600",
      glowColor: "shadow-violet-500/20",
      bgGlow: "bg-violet-500",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
    },
    {
      key: "subtenants",
      label: t("tenant.statsSubTenants") || "Sub-Tenants",
      value: stats?.subTenantsCount ?? 0,
      icon: Building2,
      gradient: "from-emerald-500 to-teal-600",
      glowColor: "shadow-emerald-500/20",
      bgGlow: "bg-emerald-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
    {
      key: "permissions",
      label: t("tenant.statsPermissions") || "Permissions",
      value: stats?.permissionsCount ?? 0,
      icon: Key,
      gradient: "from-amber-500 to-orange-600",
      glowColor: "shadow-amber-500/20",
      bgGlow: "bg-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" dir={direction}>
      {statCards.map((stat) => (
        <button
          key={stat.key}
          onClick={() => onTabChange?.(stat.key)}
          className={cn(
            "group relative overflow-hidden rounded-xl",
            "border border-border/50 bg-card",
            "p-4 text-start",
            "transition-all duration-300 ease-out",
            "hover:shadow-lg",
            `hover:${stat.glowColor}`,
            "hover:scale-[1.02] hover:border-border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          {/* Background glow on hover */}
          <div
            className={cn(
              "absolute -top-12 -end-12 h-24 w-24 rounded-full opacity-0",
              "transition-opacity duration-500 group-hover:opacity-10 blur-2xl",
              stat.bgGlow
            )}
          />

          {/* Watermark icon */}
          <stat.icon
            className={cn(
              "absolute -bottom-2 opacity-[0.03] transition-all duration-500",
              "group-hover:opacity-[0.06] group-hover:scale-110",
              isRtl ? "-left-2" : "-right-2",
              "h-20 w-20"
            )}
          />

          <div className="relative flex items-center gap-3">
            {/* Icon badge */}
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                stat.iconBg,
                "transition-all duration-300",
                "group-hover:scale-110",
                isRtl ? "group-hover:-rotate-3" : "group-hover:rotate-3"
              )}
            >
              <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
            </div>

            {/* Value + Label */}
            <div>
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              ) : (
                <AnimatedNumber value={stat.value} />
              )}
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {stat.label}
              </p>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div
            className={cn(
              "absolute bottom-0 inset-x-0 h-0.5 opacity-0",
              "transition-opacity duration-300 group-hover:opacity-100",
              "bg-gradient-to-r",
              stat.gradient
            )}
          />
        </button>
      ))}
    </div>
  );
}

// Animated Number Component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
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

  return <span className="text-2xl font-bold tracking-tight">{displayValue}</span>;
}
