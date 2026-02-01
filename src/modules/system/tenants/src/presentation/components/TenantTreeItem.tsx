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

      return (
            <div>
                  <div
                        className={cn(
                              "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group",
                              depth > 0 && "ml-6"
                        )}
                  >
                        {/* Expand/Collapse */}
                        <button
                              onClick={() => setIsExpanded(!isExpanded)}
                              className={cn(
                                    "p-0.5 hover:bg-muted rounded",
                                    !hasChildren && "invisible"
                              )}
                        >
                              {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                        </button>

                        <Building2 className="h-4 w-4 text-muted-foreground" />

                        <div className="flex-1 min-w-0">
                              <span className="font-medium truncate">{node.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({node.code})</span>
                        </div>

                        <Badge variant={node.isActive ? "success" : "secondary"}>
                              {node.isActive ? t("tenant.active") : t("tenant.inactive")}
                        </Badge>

                        <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="opacity-0 group-hover:opacity-100 h-8 w-8"
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
