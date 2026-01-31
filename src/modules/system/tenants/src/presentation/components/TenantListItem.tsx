/**
 * TenantListItem Component
 * 
 * List row item for tenant display with i18n support.
 */
"use client";

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
import { Tenant } from "../../domain/entities/Tenant";
import {
      MoreHorizontal,
      Pencil,
      Trash2,
      Building2,
} from "lucide-react";

interface TenantListItemProps {
      tenant: Tenant;
      onEdit: (tenant: Tenant) => void;
      onDelete: (tenant: Tenant) => void;
}

export function TenantListItem({ tenant, onEdit, onDelete }: TenantListItemProps) {
      const { t } = useI18n();

      return (
            <div className="flex items-center gap-4 py-3 px-4 border-b last:border-b-0 hover:bg-muted/50 group">
                  <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                              <span className="font-medium">{tenant.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">({tenant.code})</span>
                        </div>
                        {tenant.description && (
                              <p className="text-sm text-muted-foreground truncate">{tenant.description}</p>
                        )}
                  </div>

                  <div className="flex items-center gap-2">
                        {tenant.parentName && (
                              <Badge variant="outline" className="text-xs">
                                    {t("tenant.parent")}: {tenant.parentName}
                              </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                              {t("tenant.level")} {tenant.level}
                        </Badge>
                        <Badge variant={tenant.isActive ? "success" : "secondary"}>
                              {tenant.isActive ? t("tenant.active") : t("tenant.inactive")}
                        </Badge>
                  </div>

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
                                    <DropdownMenuItem onClick={() => onEdit(tenant)}>
                                          <Pencil className="mr-2 h-4 w-4" />
                                          {t("tenant.edit")}
                                    </DropdownMenuItem>
                              </PermissionGate>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_DELETE}>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                          onClick={() => onDelete(tenant)}
                                          className="text-destructive focus:text-destructive"
                                    >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          {t("tenant.delete")}
                                    </DropdownMenuItem>
                              </PermissionGate>
                        </DropdownMenuContent>
                  </DropdownMenu>
            </div>
      );
}
