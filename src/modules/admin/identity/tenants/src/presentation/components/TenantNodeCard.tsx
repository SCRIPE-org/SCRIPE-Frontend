// FILE-EXCEPTION: file length
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
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Building2, Pause, Ban, XCircle } from "lucide-react";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import { useTenantStatsViewModel } from "../viewmodels/useTenantStatsViewModel";

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
  if (days === null) return "bg-nx-accent-fill";
  if (days <= 0) return "bg-destructive";
  if (days <= 7) return "bg-destructive";
  if (days <= 30) return "bg-warning";
  return "bg-success";
}

const statusConfig: Record<
  TenantStatus,
  {
    borderColor: string;
    iconBg: string;
    badgeVariant: "success" | "warning" | "destructive" | "secondary";
    Icon: React.ComponentType<any>;
  }
> = {
  active: {
    borderColor: "border-success/30",
    iconBg: "bg-success/10 text-success",
    badgeVariant: "success",
    Icon: Building2,
  },
  suspended: {
    borderColor: "border-warning/30",
    iconBg: "bg-warning/10 text-warning",
    badgeVariant: "warning",
    Icon: Pause,
  },
  canceled: {
    borderColor: "border-destructive/30",
    iconBg: "bg-destructive/10 text-destructive",
    badgeVariant: "destructive",
    Icon: Ban,
  },
  expired: {
    borderColor: "border-warning/30",
    iconBg: "bg-warning/10 text-warning",
    badgeVariant: "destructive",
    Icon: XCircle,
  },
  inactive: {
    borderColor: "border-nx-line",
    iconBg: "bg-nx-raised text-nx-ink-2",
    badgeVariant: "secondary",
    Icon: Building2,
  },
};

// ============================================
// Component
// ============================================

/**
 * Presentation UI component rendering the tenant node card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantNodeCard({
  node,
  level,
  onEdit,
  onDelete,
  onCreateChild,
  compact = false,
}: TenantNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useI18n();
  const router = useRouter();
  const { canEnterTenantWorld, enterTenantWorld } = useTenantContext();
  const { hasPermission } = usePermissions();

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
  const { stats, loading: statsLoading } = useTenantStatsViewModel({
    tenantId: node.id,
    enabled: isExpanded,
  });

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const nodeId = node.id;
  const handleViewDetails = useCallback(() => {
    router.push(`/tenants/${nodeId}`);
  }, [router, nodeId]);

  const handleEnterWorld = useCallback(() => {
    enterTenantWorld({ id: node.id, name: node.name, parentId: node.parentId });
    router.push("/");
  }, [enterTenantWorld, router, node]);

  // Status badge content
  const statusBadge = useMemo(() => {
    const StatusIcon = config.Icon;
    const labels: Record<TenantStatus, string> = {
      active: t("tenant.active"),
      suspended: t("tenant.suspended"),
      canceled: t("tenant.canceled"),
      expired: t("tenant.expired"),
      inactive: t("tenant.inactive"),
    };

    return (
      <Badge variant={config.badgeVariant} className="gap-1">
        {(status === "suspended" || status === "canceled" || status === "expired") && (
          <StatusIcon className="h-3 w-3" aria-hidden="true" />
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
      {/* Tree connector line — inset via logical insetInlineStart, correct in
          both directions by construction, no isRtl branching needed. */}
      {level > 0 && (
        <div
          className="absolute bottom-0 top-0 w-px bg-nx-line"
          style={{ insetInlineStart: `${(level - 1) * 32 + 16}px` }}
        />
      )}
      {level > 0 && (
        <div
          className="absolute top-6 h-px w-4 bg-nx-line"
          style={{ insetInlineStart: `${(level - 1) * 32 + 16}px` }}
        />
      )}

      {/* Main card */}
      <Card
        className={cn(
          "relative mb-2 overflow-hidden",
          config.borderColor,
          (status === "canceled" || status === "inactive") && "opacity-75",
          status === "suspended" && "opacity-90"
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

        {/* Expanded Content — a fade-in reveal; no slide, no idle motion. */}
        {isExpanded && (
          <div
            className={cn(
              "border-t border-nx-line px-4 pb-4",
              "duration-nx-standard ease-nx-enter animate-in fade-in-0"
            )}
          >
            {/* Status-specific banners */}
            <TenantNodeCardBanners node={node} status={status} />

            {/* Stats row */}
            <TenantNodeCardStats stats={stats} statsLoading={statsLoading} />

            {/* Subscription progress bar */}
            <TenantNodeCardProgress
              node={node}
              status={status}
              daysLeft={daysLeft}
              progress={progress}
              progressColor={progressColor}
            />

            {/* Description */}
            {node.description && (
              <p className="mt-3 text-pretty text-sm leading-relaxed text-nx-ink-2">
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
            />
          </div>
        )}
      </Card>

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
