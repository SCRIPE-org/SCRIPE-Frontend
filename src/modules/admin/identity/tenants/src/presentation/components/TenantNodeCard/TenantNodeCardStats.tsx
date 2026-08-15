"use client";

import React from "react";
import { Users, Shield, Building2, Key } from "lucide-react";
import { Skeleton } from "@core/ui/skeleton";
import { DetailRow } from "@core/ui/detail-row";
import { useI18n } from "@core/providers/i18n-provider";

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
}

/**
 * Presentation UI component rendering the tenant node card stats.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantNodeCardStats({ stats, statsLoading }: TenantNodeCardStatsProps) {
  const { t } = useI18n();

  const statItems = [
    { key: "admins", label: t("tenant.statsAdmins"), value: stats?.adminsCount, icon: Users },
    { key: "roles", label: t("tenant.statsRoles"), value: stats?.rolesCount, icon: Shield },
    {
      key: "children",
      label: t("tenant.statsSubTenants"),
      value: stats?.subTenantsCount,
      icon: Building2,
    },
    {
      key: "permissions",
      label: t("tenant.statsPermissions"),
      value: stats?.permissionsCount,
      icon: Key,
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {statItems.map((stat) => (
        <div key={stat.key} className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
          {statsLoading ? (
            <Skeleton shape="text" className="h-5 w-10" />
          ) : (
            <DetailRow
              layout="stacked"
              icon={stat.icon}
              label={stat.label}
              value={stat.value ?? 0}
            />
          )}
        </div>
      ))}
    </div>
  );
}
