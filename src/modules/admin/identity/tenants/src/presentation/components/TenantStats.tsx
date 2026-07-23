/**
 * Tenant Stats Component
 *
 * The four tenant KPIs (admins, roles, sub-tenants, permissions) rendered on
 * the core StatCard — the single KPI surface. Each card is activatable and
 * routes to its tab; tone maps to semantic tokens so the figures read
 * correctly in both themes and under any tenant palette.
 *
 * @module tenants
 */
"use client";

import { Users, Shield, Building2, Key } from "lucide-react";
import { StatCard, type StatTone } from "@core/ui/stat-card";
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
  const { t, direction, stats, loading } = useTenantStatsViewModel({ tenantId });

  const statCards: { key: string; label: string; value: number; icon: typeof Users; tone: StatTone }[] =
    [
      {
        key: "admins",
        label: t("tenant.statsAdmins") || "Admins",
        value: stats?.adminsCount ?? 0,
        icon: Users,
        tone: "info",
      },
      {
        key: "roles",
        label: t("tenant.statsRoles") || "Roles",
        value: stats?.rolesCount ?? 0,
        icon: Shield,
        tone: "neutral",
      },
      {
        key: "subtenants",
        label: t("tenant.statsSubTenants") || "Sub-Tenants",
        value: stats?.subTenantsCount ?? 0,
        icon: Building2,
        tone: "success",
      },
      {
        key: "permissions",
        label: t("tenant.statsPermissions") || "Permissions",
        value: stats?.permissionsCount ?? 0,
        icon: Key,
        tone: "warning",
      },
    ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" dir={direction}>
      {statCards.map((stat) => (
        <StatCard
          key={stat.key}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          tone={stat.tone}
          isLoading={loading}
          onClick={onTabChange ? () => onTabChange(stat.key) : undefined}
        />
      ))}
    </div>
  );
}
