/**
 * TenantTreeItem Component
 *
 * Recursive tree item for displaying tenant hierarchy with i18n support.
 */
"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  ChevronRight,
  ChevronDown,
  LogIn,
  Pause,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@core/common/utils";

interface TenantTreeItemProps {
  node: TenantTreeNode;
  depth?: number;
  onEdit: (node: TenantTreeNode) => void;
  onDelete: (node: TenantTreeNode) => void;
  onAddChild: (node: TenantTreeNode) => void;
  onEnter?: (node: TenantTreeNode) => void;
}

export function TenantTreeItem({
  node,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
  onEnter,
}: TenantTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { t } = useI18n();
  const hasChildren = node.children && node.children.length > 0;

  // Derive subscription status from editionEndDate
  const isExpired = node.editionEndDate
    ? new Date(node.editionEndDate) < new Date()
    : false;
  const isExpiringSoon = !isExpired && node.editionEndDate
    ? (() => {
      const diff = Math.ceil(
        (new Date(node.editionEndDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return diff >= 0 && diff <= 7;
    })()
    : false;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted/50",
          depth > 0 && "ml-6",
          (node.isSuspended || isExpired) && "opacity-60"
        )}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn("rounded p-0.5 hover:bg-muted", !hasChildren && "invisible")}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <Building2 className="h-4 w-4 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <span className="truncate font-medium">{node.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">({node.code})</span>
        </div>

        {node.isSuspended && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <Pause className="h-3 w-3" />
            {t("tenant.suspended") || "Suspended"}
          </Badge>
        )}

        {isExpired && !node.isSuspended && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <XCircle className="h-3 w-3" />
            {t("tenant.expired") || "Expired"}
          </Badge>
        )}

        {isExpiringSoon && !node.isSuspended && (
          <Badge variant="outline" className="gap-1 text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {t("tenant.expiringSoon") || "Expiring Soon"}
          </Badge>
        )}

        <Badge variant={node.isActive ? "success" : "secondary"}>
          {node.isActive ? t("tenant.active") : t("tenant.inactive")}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_UPDATE}>
              <DropdownMenuItem onClick={() => onEdit(node)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("tenant.edit")}
              </DropdownMenuItem>
            </PermissionGate>
            <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_CREATE}>
              <DropdownMenuItem onClick={() => onAddChild(node)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("tenant.addChild")}
              </DropdownMenuItem>
            </PermissionGate>
            {onEnter && (
              <DropdownMenuItem onClick={() => onEnter(node)}>
                <LogIn className="mr-2 h-4 w-4" />
                {t("tenant.enterTenantWorld")}
              </DropdownMenuItem>
            )}
            <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_DELETE}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(node)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("tenant.delete")}
              </DropdownMenuItem>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TenantTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onEnter={onEnter}
            />
          ))}
        </div>
      )}
    </div>
  );
}
