// UI-EXCEPTION: compact studio layout
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

import { useEffect, useState } from "react";
import { Users, Shield, Building2, Key, Loader2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { useTenantStatsViewModel } from "../viewmodels/useTenantStatsViewModel";

interface TenantStatsProps {
  tenantId: string;
  onTabChange?: (tab: string) => void;
}

/**
 * Presentation UI component rendering the tenant stats.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantStats({ tenantId, onTabChange }: TenantStatsProps) {
  const { t, direction, isRtl, stats, loading } = useTenantStatsViewModel({ tenantId });

  const statCards = [
    {
      key: "admins",
      label: t("tenant.statsAdmins") || "Admins",
      value: stats?.adminsCount ?? 0,
      icon: Users,
      gradient: "from-info to-info",
      glowColor: "shadow-info/20",
      bgGlow: "bg-info",
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      key: "roles",
      label: t("tenant.statsRoles") || "Roles",
      value: stats?.rolesCount ?? 0,
      icon: Shield,
      gradient: "from-primary to-primary",
      glowColor: "shadow-primary/20",
      bgGlow: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      key: "subtenants",
      label: t("tenant.statsSubTenants") || "Sub-Tenants",
      value: stats?.subTenantsCount ?? 0,
      icon: Building2,
      gradient: "from-success to-success",
      glowColor: "shadow-success/20",
      bgGlow: "bg-success",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      key: "permissions",
      label: t("tenant.statsPermissions") || "Permissions",
      value: stats?.permissionsCount ?? 0,
      icon: Key,
      gradient: "from-warning to-warning",
      glowColor: "shadow-warning/20",
      bgGlow: "bg-warning",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
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
              "absolute -end-12 -top-12 h-24 w-24 rounded-full opacity-0",
              "blur-2xl transition-opacity duration-500 group-hover:opacity-10",
              stat.bgGlow
            )}
          />

          {/* Watermark icon */}
          <stat.icon
            className={cn(
              "absolute -bottom-2 opacity-[0.03] transition-all duration-500",
              "group-hover:scale-110 group-hover:opacity-[0.06]",
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
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>

          {/* Bottom gradient line */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 h-0.5 opacity-0",
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
