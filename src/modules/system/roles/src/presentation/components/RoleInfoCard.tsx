/**
 * Role Info Card Component
 *
 * Displays role details (name, code, description, priority) in a sidebar card.
 */
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import type { Role } from "../../domain/entities/Role";

export interface RoleInfoCardProps {
      role: Role | undefined;
      isLoading: boolean;
      selectedCount: number;
      totalCount: number;
      t: (key: string) => string;
}

export function RoleInfoCard({
      role,
      isLoading,
      selectedCount,
      totalCount,
      t,
}: RoleInfoCardProps) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              {t("roles.roleDetails")}
                        </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        {isLoading ? (
                              <RoleInfoSkeleton />
                        ) : (
                              <>
                                    <InfoField label={t("roles.name")} value={role?.name} />
                                    <InfoField label={t("roles.code")} value={role?.code} mono />
                                    <InfoField
                                          label={t("roles.description")}
                                          value={role?.description || "-"}
                                    />
                                    <div>
                                          <label className="text-sm text-muted-foreground">
                                                {t("roles.priority")}
                                          </label>
                                          <div className="mt-1">
                                                <Badge variant="outline">{role?.priority}</Badge>
                                          </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                          <p className="text-sm text-muted-foreground">
                                                {t("roles.selectedPermissions")}
                                          </p>
                                          <p className="text-2xl font-bold">
                                                {selectedCount}{" "}
                                                <span className="text-sm text-muted-foreground font-normal">
                                                      / {totalCount}
                                                </span>
                                          </p>
                                    </div>
                              </>
                        )}
                  </CardContent>
            </Card>
      );
}

function InfoField({
      label,
      value,
      mono = false,
}: {
      label: string;
      value?: string;
      mono?: boolean;
}) {
      return (
            <div>
                  <label className="text-sm text-muted-foreground">{label}</label>
                  <p className={mono ? "font-mono text-sm" : "font-medium"}>{value}</p>
            </div>
      );
}

function RoleInfoSkeleton() {
      return (
            <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
            </>
      );
}
