/**
 * Role Card Component
 *
 * Displays a single role in card format with actions dropdown.
 */
import { MoreHorizontal, Pencil, Trash2, Shield, Copy } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
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
import type { Role } from "../../domain/entities/Role";
import { format } from "date-fns";

export interface RoleCardProps {
      role: Role;
      onEdit: () => void;
      onManagePermissions: () => void;
      onClone: () => void;
      onDelete: () => void;
      isCloning?: boolean;
}

export function RoleCard({
      role,
      onEdit,
      onManagePermissions,
      onClone,
      onDelete,
      isCloning = false,
}: RoleCardProps) {
      const { t } = useI18n();

      return (
            <Card className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                    <CardTitle className="flex items-center gap-2">
                                          <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                                          <span className="truncate">{role.name}</span>
                                          {role.isSystem && (
                                                <Badge variant="outline" className="text-xs">
                                                      {t("roles.system")}
                                                </Badge>
                                          )}
                                    </CardTitle>
                                    <CardDescription className="font-mono text-xs mt-1">
                                          {role.code}
                                    </CardDescription>
                              </div>
                              <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                          <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                                <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_UPDATE}>
                                                <DropdownMenuItem onClick={onEdit} disabled={role.isSystem}>
                                                      <Pencil className="mr-2 h-4 w-4" />
                                                      {t("common.edit")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS}>
                                                <DropdownMenuItem onClick={onManagePermissions}>
                                                      <Shield className="mr-2 h-4 w-4" />
                                                      {t("roles.managePermissions")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_CLONE}>
                                                <DropdownMenuItem onClick={onClone} disabled={isCloning}>
                                                      <Copy className="mr-2 h-4 w-4" />
                                                      {t("roles.cloneRole")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <DropdownMenuSeparator />
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_DELETE}>
                                                <DropdownMenuItem
                                                      className="text-destructive"
                                                      onClick={onDelete}
                                                      disabled={role.isSystem}
                                                >
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      {t("common.delete")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                    </DropdownMenuContent>
                              </DropdownMenu>
                        </div>
                  </CardHeader>
                  <CardContent>
                        {role.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {role.description}
                              </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                    <Shield className="h-4 w-4" />
                                    <span>
                                          {role.permissionCount} {t("roles.permissions")}
                                    </span>
                              </div>
                              {role.tenantName && (
                                    <Badge variant="secondary" className="text-xs">
                                          {role.tenantName}
                                    </Badge>
                              )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                              {t("common.createdAt")} {format(new Date(role.createdAt), "MMM dd, yyyy")}
                        </div>
                  </CardContent>
            </Card>
      );
}
