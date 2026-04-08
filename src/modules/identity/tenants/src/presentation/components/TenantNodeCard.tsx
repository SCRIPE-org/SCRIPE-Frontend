/**
 * TenantNodeCard Component
 *
 * Premium expandable accordion card for a single tenant node.
 * Features:
 * - Color-coded left border (green/amber/red/gray) by status
 * - Collapsed: icon, name, code, edition badge, status badge, chevron
 * - Expanded: stats row, subscription progress bar, actions, description
 * - RTL/LTR support
 * - On-demand stats fetch when expanded
 *
 * @module tenants
 */
"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { cn } from "@core/common/utils";
import { Badge } from "@core/ui/badge";
import {
      Tooltip,
      TooltipContent,
      TooltipTrigger,
} from "@core/ui/tooltip";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import {
      Building2,
      ChevronDown,
      Eye,
      LogIn,
      Pencil,
      Trash2,
      Pause,
      Ban,
      XCircle,
      AlertTriangle,
      Users,
      Shield,
      Key,
      Clock,
      Play,
      ArrowUpCircle,
      Loader2,
} from "lucide-react";
import { systemContainer } from "@/modules/identity/di";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";

// ============================================
// Types
// ============================================

type TenantStatus = "active" | "suspended" | "canceled" | "expired" | "inactive";

interface TenantNodeCardProps {
      node: TenantTreeNode;
      level: number;
      onEdit?: (node: TenantTreeNode) => void;
      onDelete?: (node: TenantTreeNode) => void;
      onCreateChild?: (parentNode: TenantTreeNode) => void;
      /** Compact mode for sub-tenants tab (no View Details/Enter World) */
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
      if (!endDate) return 100; // Lifetime = full bar
      const days = getDaysRemaining(endDate);
      if (days === null || days <= 0) return 0;
      if (days >= 365) return 100;
      // Assume 365-day max for visual
      return Math.min(100, Math.round((days / 365) * 100));
}

function getProgressColor(days: number | null): string {
      if (days === null) return "bg-primary"; // Lifetime
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
            Icon: typeof Pause;
      }
> = {
      active: {
            borderColor: "border-s-emerald-500",
            iconBg: "bg-emerald-500/10 text-emerald-500",
            badgeVariant: "success",
            badgeClass: "",
            Icon: Building2,
      },
      suspended: {
            borderColor: "border-s-amber-500",
            iconBg: "bg-amber-500/10 text-amber-500",
            badgeVariant: "outline",
            badgeClass:
                  "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
            Icon: Pause,
      },
      canceled: {
            borderColor: "border-s-red-500",
            iconBg: "bg-red-500/10 text-red-500",
            badgeVariant: "destructive",
            badgeClass: "",
            Icon: Ban,
      },
      expired: {
            borderColor: "border-s-orange-500",
            iconBg: "bg-orange-500/10 text-orange-500",
            badgeVariant: "destructive",
            badgeClass: "",
            Icon: XCircle,
      },
      inactive: {
            borderColor: "border-s-muted-foreground/30",
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
                              className={cn(
                                    "absolute top-0 bottom-0 w-px bg-border/50",
                                    isRtl ? "right-0" : "left-0"
                              )}
                              style={{
                                    [isRtl ? "right" : "left"]: `${(level - 1) * 32 + 16}px`,
                              }}
                        />
                  )}
                  {level > 0 && (
                        <div
                              className={cn(
                                    "absolute top-6 h-px bg-border/50"
                              )}
                              style={{
                                    [isRtl ? "right" : "left"]: `${(level - 1) * 32 + 16}px`,
                                    width: "16px",
                              }}
                        />
                  )}

                  {/* Main card */}
                  <div
                        className={cn(
                              "relative overflow-hidden rounded-xl border border-border/50",
                              "bg-card transition-all duration-300 ease-out",
                              "hover:border-border hover:shadow-lg hover:shadow-primary/5",
                              `border-s-4 ${config.borderColor}`,
                              isExpanded && "shadow-lg shadow-primary/5 border-border",
                              (status === "canceled" || status === "inactive") && "opacity-75",
                              status === "suspended" && "opacity-90",
                              "mb-2"
                        )}
                  >
                        {/* Collapsed Header (always visible) */}
                        <button
                              type="button"
                              className={cn(
                                    "flex w-full items-center gap-3 p-4",
                                    "text-start transition-colors",
                                    "hover:bg-muted/30",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              )}
                              onClick={handleToggle}
                              aria-expanded={isExpanded}
                        >
                              {/* Tenant icon */}
                              <div
                                    className={cn(
                                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                          "border border-border/50",
                                          config.iconBg,
                                          "transition-transform duration-300",
                                          "group-hover/card:scale-105"
                                    )}
                              >
                                    <Building2 className="h-5 w-5" />
                              </div>

                              {/* Name + Code */}
                              <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-foreground truncate">
                                                {node.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground font-mono">
                                                ({node.code})
                                          </span>
                                          {hasChildren && (
                                                <Badge
                                                      variant="secondary"
                                                      className="gap-1 text-xs px-1.5 py-0"
                                                >
                                                      <Building2 className="h-3 w-3" />
                                                      {node.children.length}
                                                </Badge>
                                          )}
                                    </div>
                              </div>

                              {/* Badges row */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    {/* Edition badge */}
                                    {node.editionName && (
                                          <Badge variant="outline" className="text-xs">
                                                {node.editionName}
                                          </Badge>
                                    )}

                                    {/* Days remaining chip */}
                                    {status === "active" && daysLeft !== null && daysLeft > 0 && (
                                          <Badge
                                                variant="outline"
                                                className={cn(
                                                      "gap-1 text-xs",
                                                      daysLeft <= 7
                                                            ? "border-red-500/50 text-red-500"
                                                            : daysLeft <= 30
                                                                  ? "border-amber-500/50 text-amber-500"
                                                                  : "border-muted-foreground/30 text-muted-foreground"
                                                )}
                                          >
                                                <Clock className="h-3 w-3" />
                                                {daysLeft} {t("tenant.daysLeft")}
                                          </Badge>
                                    )}

                                    {/* Status badge with optional tooltip */}
                                    {suspensionTooltip ? (
                                          <Tooltip>
                                                <TooltipTrigger asChild>{statusBadge}</TooltipTrigger>
                                                <TooltipContent>
                                                      <p className="max-w-xs">{suspensionTooltip}</p>
                                                </TooltipContent>
                                          </Tooltip>
                                    ) : (
                                          statusBadge
                                    )}
                              </div>

                              {/* Chevron */}
                              <ChevronDown
                                    className={cn(
                                          "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                                          isExpanded && "rotate-180"
                                    )}
                              />
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                              <div
                                    className={cn(
                                          "border-t border-border/50 px-4 pb-4",
                                          "animate-in fade-in-0 slide-in-from-top-2 duration-300"
                                    )}
                              >
                                    {/* Status-specific banners */}
                                    {status === "suspended" && (
                                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                                                <div className="text-sm">
                                                      <p className="font-medium text-amber-500">
                                                            {t("tenant.suspendedBanner")}
                                                      </p>
                                                      {node.suspensionReason && (
                                                            <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
                                                      )}
                                                </div>
                                          </div>
                                    )}
                                    {status === "canceled" && (
                                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                                <Ban className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                                <div className="text-sm">
                                                      <p className="font-medium text-red-500">
                                                            {t("tenant.canceledBanner")}
                                                      </p>
                                                      {node.suspensionReason && (
                                                            <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
                                                      )}
                                                </div>
                                          </div>
                                    )}
                                    {status === "expired" && (
                                          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                                <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                                                <div className="text-sm">
                                                      <p className="font-medium text-red-500">
                                                            {t("tenant.expiredBanner")}
                                                      </p>
                                                </div>
                                          </div>
                                    )}

                                    {/* Stats row */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                          {[
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
                                          ].map((stat) => (
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
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                  {stat.label}
                                                            </p>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>

                                    {/* Subscription progress bar */}
                                    {status === "active" && node.editionName && (
                                          <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                                      <span>
                                                            {node.editionName}
                                                            {daysLeft !== null
                                                                  ? ` • ${daysLeft} ${t("tenant.daysLeft")}`
                                                                  : ` • ${t("tenant.lifetime") || "Lifetime"}`}
                                                      </span>
                                                      {node.editionEndDate && (
                                                            <span>
                                                                  {t("tenant.endDate")}: {new Date(node.editionEndDate).toLocaleDateString()}
                                                            </span>
                                                      )}
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                                                      <div
                                                            className={cn("h-full rounded-full transition-all duration-500", progressColor)}
                                                            style={{ width: `${progress}%` }}
                                                      />
                                                </div>
                                          </div>
                                    )}

                                    {/* Depleted bar for expired */}
                                    {status === "expired" && (
                                          <div className="mt-3">
                                                <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                                                      <div className="h-full w-0 rounded-full bg-destructive" />
                                                </div>
                                          </div>
                                    )}

                                    {/* Description */}
                                    {node.description && (
                                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                                {node.description}
                                          </p>
                                    )}

                                    {/* Action buttons */}
                                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                                          {/* View Details */}
                                          {canViewDetails && !compact && (
                                                <Button size="sm" onClick={handleViewDetails}>
                                                      <Eye className="h-4 w-4 me-1.5" />
                                                      {t("common.view") || "View Details"}
                                                </Button>
                                          )}

                                          {/* Enter Tenant World */}
                                          {canEnterTenantWorld &&
                                                canDrillDown &&
                                                !compact &&
                                                status !== "canceled" && (
                                                      <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleEnterWorld}
                                                            disabled={status === "suspended"}
                                                      >
                                                            <LogIn className="h-4 w-4 me-1.5" />
                                                            {t("tenant.enterTenantWorld")}
                                                      </Button>
                                                )}

                                          {/* Edit */}
                                          {canEdit_ && onEdit && (
                                                <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => onEdit(node)}
                                                >
                                                      <Pencil className="h-4 w-4 me-1.5" />
                                                      {t("tenant.edit")}
                                                </Button>
                                          )}

                                          {/* Add Child */}
                                          {canCreate && onCreateChild && (
                                                <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => onCreateChild(node)}
                                                >
                                                      <Building2 className="h-4 w-4 me-1.5" />
                                                      {t("tenant.addChild")}
                                                </Button>
                                          )}

                                          {/* Reassign Plan - for canceled/expired */}
                                          {(status === "canceled" || status === "expired") &&
                                                canViewDetails &&
                                                !compact && (
                                                      <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-primary text-primary hover:bg-primary/10"
                                                            onClick={handleViewDetails}
                                                      >
                                                            <ArrowUpCircle className="h-4 w-4 me-1.5" />
                                                            {t("tenant.reassignPlan")}
                                                      </Button>
                                                )}

                                          {/* Delete */}
                                          {canDeleteTenant && onDelete && (
                                                <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive ms-auto"
                                                      onClick={() => onDelete(node)}
                                                >
                                                      <Trash2 className="h-4 w-4 me-1.5" />
                                                      {t("common.delete") || "Delete"}
                                                </Button>
                                          )}
                                    </div>
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
