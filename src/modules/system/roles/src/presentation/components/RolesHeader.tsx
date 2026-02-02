/**
 * Roles Header Component
 *
 * Header section with title, description, and action buttons.
 */
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@core/ui/button";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

export interface RolesHeaderProps {
      title: string;
      description: string;
      createLabel: string;
      onRefresh: () => void;
      onCreate: () => void;
}

export function RolesHeader({
      title,
      description,
      createLabel,
      onRefresh,
      onCreate,
}: RolesHeaderProps) {
      return (
            <div className="flex items-center justify-between">
                  <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={onRefresh}>
                              <RefreshCw className="h-4 w-4" />
                        </Button>
                        <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_CREATE}>
                              <Button onClick={onCreate}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {createLabel}
                              </Button>
                        </PermissionGate>
                  </div>
            </div>
      );
}
