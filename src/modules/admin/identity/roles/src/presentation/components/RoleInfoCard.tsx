/**
 * Role Info Card Component
 *
 * Displays role details (name, code, description, priority) in a sidebar card.
 */
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { useI18n } from "@core/providers/i18n-provider";
import type { Role } from "../../domain/entities/Role";

/**
 * Interface defining property specifications, keys types, and structural contract rules for role info card props.
 */
export interface RoleInfoCardProps {
  role: Role | undefined;
  isLoading: boolean;
  selectedCount: number;
  totalCount: number;
}

/**
 * Presentation UI component rendering the role info card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RoleInfoCard({ role, isLoading, selectedCount, totalCount }: RoleInfoCardProps) {
  const { t, language } = useI18n();

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
            <InfoField label={t("roles.name")} value={role?.getLocalizedName(language)} />
            <InfoField label={t("roles.code")} value={role?.code} mono />
            <InfoField
              label={t("roles.description")}
              value={role?.getLocalizedDescription(language)}
            />
            <div>
              <label className="text-sm text-nx-ink-2">{t("roles.priority")}</label>
              <div className="mt-1">
                <Badge variant="outline" className="tabular-nums">
                  {role?.priority}
                </Badge>
              </div>
            </div>
            {role?.hasGroups && (
              <div className="border-t border-nx-line pt-3">
                <label className="text-sm text-nx-ink-2">{t("roles.groups") || "Groups"}</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {role.getLocalizedGroups(language).map((groupName, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {groupName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="border-t border-nx-line pt-3">
              <p className="text-sm text-nx-ink-2">{t("roles.selectedPermissions")}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-nx-ink">
                {selectedCount}{" "}
                <span className="text-sm font-normal text-nx-ink-3">/ {totalCount}</span>
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
      <label className="text-sm text-nx-ink-2">{label}</label>
      <p className={mono ? "font-mono text-sm text-nx-ink" : "font-medium text-nx-ink"}>{value}</p>
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
