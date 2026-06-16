/**
 * TenantNodeCard Component
 *
 * Refactored modular entrypoint for a single tenant node.
 * Uses subcomponents for header, banners, statistics, progress, and actions.
 *
 * @module tenants
 */
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import {
  Building2,
  Pause,
  Ban,
  XCircle,
} from "lucide-react";
import { systemContainer } from "@modules/identity/di";
import type { TenantTreeNode } from "../../domain/entities/Tenant";

import { TenantNodeCardHeader } from "./TenantNodeCard/TenantNodeCardHeader";
import type { TenantStatus } from "./TenantNodeCard/TenantNodeCardHeader";
import { TenantNodeCardBanners } from "./TenantNodeCard/TenantNodeCardBanners";
import { TenantNodeCardStats } from "./TenantNodeCard/TenantNodeCardStats";
import { TenantNodeCardProgress } from "./TenantNodeCard/TenantNodeCardProgress";
import { TenantNodeCardActions } from "./TenantNodeCard/TenantNodeCardActions";

// ============================================
// Types
// ============================================

interface TenantNodeCardProps {
  node: TenantTreeNode;
  level: number;
  onEdit?: (node: TenantTreeNode) => void;
  onDelete?: (node: TenantTreeNode) => void;
  onCreateChild?: (parentNode: TenantTreeNode) => void;
  compact?: boolean;
}

// ============================================
// Helpers
// ============================================

function getTenantStatus(node: TenantTreeNode): TenantStatus {
  if (node.isSuspended && node.suspensionType === "Canceled") return "canceled";
  if (node.isSuspended) return "suspended";
  if (!node.isActive) return "inactive";
  if (node.editionEndDate) {
    const endDate = new Date(node.editionEndDate);
    if (endDate < new Date()) return "expired";
  }
  return "active";
}

function getDaysRemaining(endDate?: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgressPercentage(endDate?: string): number {
  if (!endDate) return 100;
  const days = getDaysRemaining(endDate);
  if (days === null || days <= 0) return 0;
  if (days >= 365) return 100;
  return Math.min(100, Math.round((days / 365) * 100));
}

function getProgressColor(days: number | null): string {
  if (days === null) return "bg-primary";
  if (days <= 0) return "bg-destructive";
  if (days <= 7) return "bg-red-500";
  if (days <= 30) return "bg-amber-500";
  return "bg-emerald-500";
}

const statusConfig: Record<
  TenantStatus,
  {
    borderColor: string;
    iconBg: string;
    badgeVariant: "success" | "destructive" | "outline" | "secondary";
    badgeClass: string;
    Icon: React.ComponentType<any>;
  }
> = {
  active: {
    borderColor: "border-emerald-500/30 dark:border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    badgeVariant: "success",
    badgeClass: "",
    Icon: Building2,
  },
  suspended: {
    borderColor: "border-amber-500/30 dark:border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-500",
    badgeVariant: "outline",
    badgeClass: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Icon: Pause,
  },
  canceled: {
    borderColor: "border-red-500/30 dark:border-red-500/20",
    iconBg: "bg-red-500/10 text-red-500",
    badgeVariant: "destructive",
    badgeClass: "",
    Icon: Ban,
  },
  expired: {
    borderColor: "border-orange-500/30 dark:border-orange-500/20",
    iconBg: "bg-orange-500/10 text-orange-500",
    badgeVariant: "destructive",
    badgeClass: "",
    Icon: XCircle,
  },
  inactive: {
    borderColor: "border-border/50",
    iconBg: "bg-muted text-muted-foreground",
    badgeVariant: "secondary",
    badgeClass: "",
    Icon: Building2,
  },
};

// ============================================
// Component
// ============================================

export function TenantNodeCard({
  node,
  level,
  onEdit,
  onDelete,
  onCreateChild,
  compact = false,
}: TenantNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, direction } = useI18n();
  const router = useRouter();
  const { canEnterTenantWorld, enterTenantWorld } = useTenantContext();
  const { hasPermission } = usePermissions();
  const isRtl = direction === "rtl";

  const status = getTenantStatus(node);
  const config = statusConfig[status];
  const daysLeft = getDaysRemaining(node.editionEndDate);
  const progress = getProgressPercentage(node.editionEndDate);
  const progressColor = getProgressColor(daysLeft);
  const hasChildren = node.children && node.children.length > 0;

  // Permission checks
  const canViewDetails = hasPermission(SYSTEM_PERMISSIONS.TENANTS_VIEW_DETAILS);
  const canDrillDown = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);
  const canDeleteTenant = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DELETE);
  const canEdit_ = hasPermission(SYSTEM_PERMISSIONS.TENANTS_UPDATE);
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // Fetch stats on demand when expanded
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["tenant-stats", node.id],
    queryFn: () => systemContainer.tenantRepository.getStats(node.id),
    enabled: isExpanded,
    staleTime: 60_000,
  });

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleViewDetails = useCallback(() => {
    router.push(`/tenants/${node.id}`);
  }, [router, node.id]);

  const handleEnterWorld = useCallback(() => {
    enterTenantWorld({ id: node.id, name: node.name, parentId: node.parentId });
    router.push("/");
  }, [enterTenantWorld, router, node]);

  // Status badge content
  const statusBadge = useMemo(() => {
    const StatusIcon = config.Icon;
    const labels: Record<TenantStatus, string> = {
      active: t("tenant.active") || "Active",
      suspended: t("tenant.suspended") || "Suspended",
      canceled: t("tenant.canceled") || "Canceled",
      expired: t("tenant.expired") || "Expired",
      inactive: t("tenant.inactive") || "Inactive",
    };

    return (
      <Badge variant={config.badgeVariant} className={cn("gap-1", config.badgeClass)}>
        {(status === "suspended" || status === "canceled" || status === "expired") && (
          <StatusIcon className="h-3 w-3" />
        )}
        {labels[status]}
      </Badge>
    );
  }, [status, config, t]);

  // Suspension reason tooltip
  const suspensionTooltip =
    (status === "suspended" || status === "canceled") && node.suspensionReason
      ? node.suspensionReason
      : null;

  return (
    <div
      className={cn("group/card", level > 0 && "relative")}
      style={{ paddingInlineStart: level > 0 ? `${level * 32}px` : undefined }}
    >
      {/* Tree connector line */}
      {level > 0 && (
        <div
          className={cn("absolute bottom-0 top-0 w-px bg-border/50", isRtl ? "right-0" : "left-0")}
          style={{
            [isRtl ? "right" : "left"]: `${(level - 1) * 32 + 16}px`,
          }}
        />
      )}
      {level > 0 && (
        <div
          className={cn("absolute top-6 h-px bg-border/50")}
          style={{
            [isRtl ? "right" : "left"]: `${(level - 1) * 32 + 16}px`,
            width: "16px",
          }}
        />
      )}

      {/* Main card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-300 ease-out",
          "bg-card hover:border-border hover:shadow-lg hover:shadow-primary/5",
          config.borderColor,
          isExpanded && "border-border shadow-lg shadow-primary/5",
          (status === "canceled" || status === "inactive") && "opacity-75",
          status === "suspended" && "opacity-90",
          "mb-2"
        )}
      >
        {/* Collapsed Header (always visible) */}
        <TenantNodeCardHeader
          node={node}
          isExpanded={isExpanded}
          status={status}
          daysLeft={daysLeft}
          config={config}
          statusBadge={statusBadge}
          suspensionTooltip={suspensionTooltip}
          hasChildren={hasChildren}
          onToggle={handleToggle}
        />

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={cn(
              "border-t border-border/50 px-4 pb-4",
              "duration-300 animate-in fade-in-0 slide-in-from-top-2"
            )}
          >
            {/* Status-specific banners */}
            <TenantNodeCardBanners node={node} status={status} t={t} />

            {/* Stats row */}
            <TenantNodeCardStats stats={stats} statsLoading={statsLoading} t={t} />

            {/* Subscription progress bar */}
            <TenantNodeCardProgress
              node={node}
              status={status}
              daysLeft={daysLeft}
              progress={progress}
              progressColor={progressColor}
              t={t}
            />

            {/* Description */}
            {node.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {node.description}
              </p>
            )}

            {/* Action buttons */}
            <TenantNodeCardActions
              node={node}
              status={status}
              compact={compact}
              canViewDetails={canViewDetails}
              canEnterTenantWorld={canEnterTenantWorld}
              canDrillDown={canDrillDown}
              canEdit_={canEdit_}
              canCreate={canCreate}
              canDeleteTenant={canDeleteTenant}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              onViewDetails={handleViewDetails}
              onEnterWorld={handleEnterWorld}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Recursive children (only when expanded) */}
      {isExpanded && hasChildren && (
        <div className="mt-0">
          {node.children.map((child) => (
            <TenantNodeCard
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
