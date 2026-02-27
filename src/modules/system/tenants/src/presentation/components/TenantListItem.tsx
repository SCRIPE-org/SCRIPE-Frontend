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
import { MoreHorizontal, Pencil, Trash2, Building2, Pause } from "lucide-react";

interface TenantListItemProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

export function TenantListItem({ tenant, onEdit, onDelete }: TenantListItemProps) {
  const { t } = useI18n();

  return (
    <div className="group flex items-center gap-4 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50">
      <Building2 className="h-5 w-5 flex-shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{tenant.name}</span>
          <span className="font-mono text-xs text-muted-foreground">({tenant.code})</span>
        </div>
        {tenant.description && (
          <p className="truncate text-sm text-muted-foreground">{tenant.description}</p>
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
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
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
