/**
 * Roles Empty State Component
 *
 * Empty state when no roles are found.
 */
import { Shield, Plus } from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useI18n } from "@core/providers/i18n-provider";

export interface RolesEmptyStateProps {
      hasSearch: boolean;
      onCreate: () => void;
}

export function RolesEmptyState({ hasSearch, onCreate }: RolesEmptyStateProps) {
      const { t } = useI18n();

      return (
            <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t("roles.noRolesFound")}</h3>
                        <p className="text-muted-foreground text-center mb-4">
                              {hasSearch ? t("roles.adjustSearch") : t("roles.createFirst")}
                        </p>
                        {!hasSearch && (
                              <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_CREATE}>
                                    <Button onClick={onCreate}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          {t("roles.createRole")}
                                    </Button>
                              </PermissionGate>
                        )}
                  </CardContent>
            </Card>
      );
}
