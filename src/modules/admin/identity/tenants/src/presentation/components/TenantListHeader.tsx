/**
 * TenantListHeader Component
 *
 * Page header for the tenants accordion view.
 * Features: title, subtitle, stats pills (computed from tree data),
 * search input, and Add Tenant button.
 *
 * @module tenants
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Building2, Plus, Search, CheckCircle2, Pause, Ban, XCircle } from "lucide-react";
import type { TenantTreeNode } from "../../domain/entities/Tenant";

interface TenantListHeaderProps {
  tree: TenantTreeNode[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
  canCreate: boolean;
  isLoading?: boolean;
}

interface TreeStats {
  total: number;
  active: number;
  suspended: number;
  canceled: number;
  expired: number;
}

function countTreeStats(
  nodes: TenantTreeNode[],
  acc: TreeStats = { total: 0, active: 0, suspended: 0, canceled: 0, expired: 0 }
): TreeStats {
  for (const node of nodes) {
    acc.total++;
    if (node.isSuspended && node.suspensionType === "Canceled") {
      acc.canceled++;
    } else if (node.isSuspended) {
      acc.suspended++;
    } else if (node.editionEndDate && new Date(node.editionEndDate) < new Date()) {
      acc.expired++;
    } else if (node.isActive) {
      acc.active++;
    }
    if (node.children?.length > 0) {
      countTreeStats(node.children, acc);
    }
  }
  return acc;
}

/**
 * Presentation UI component rendering the tenant list header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantListHeader({
  tree,
  search,
  onSearchChange,
  onAdd,
  canCreate,
  isLoading,
}: TenantListHeaderProps) {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

  const stats = React.useMemo(() => countTreeStats(tree), [tree]);

  const statPills = [
    {
      key: "total",
      label: t("tenant.totalTenants") || "Total",
      value: stats.total,
      className: "bg-primary/10 text-primary border-primary/20",
      icon: Building2,
    },
    {
      key: "active",
      label: t("tenant.active"),
      value: stats.active,
      className: "bg-success/10 text-success border-success/20",
      icon: CheckCircle2,
    },
    {
      key: "suspended",
      label: t("tenant.suspended"),
      value: stats.suspended,
      className: "bg-warning/10 text-warning border-warning/20",
      icon: Pause,
    },
    {
      key: "canceled",
      label: t("tenant.canceled"),
      value: stats.canceled,
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: Ban,
    },
  ];

  // Only show expired if there are any
  if (stats.expired > 0) {
    statPills.push({
      key: "expired",
      label: t("tenant.expired"),
      value: stats.expired,
      className: "bg-warning/10 text-warning border-warning/20",
      icon: XCircle,
    });
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("tenant.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tenant.description")}</p>
        </div>
        {canCreate && (
          <Button onClick={onAdd} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {t("tenant.addTenant")}
          </Button>
        )}
      </div>

      {/* Search + Stats row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Stats pills */}
        <div className="flex flex-wrap items-center gap-2">
          {statPills.map((pill) => (
            <div
              key={pill.key}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1",
                "text-xs font-medium transition-colors",
                pill.className
              )}
            >
              <pill.icon className="h-3.5 w-3.5" />
              <span className="font-bold">{pill.value}</span>
              <span className="opacity-80">{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
              isRtl ? "right-3" : "left-3"
            )}
          />
          <Input
            placeholder={t("tenant.searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn("h-9", isRtl ? "pr-9" : "pl-9")}
          />
        </div>
      </div>
    </div>
  );
}
