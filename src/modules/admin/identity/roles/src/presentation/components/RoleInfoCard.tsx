/**
 * Role Info Card Component
 *
 * The identity sidebar of the role detail page: who this role is (name, code,
 * description), how it ranks (priority), where it belongs (groups) and how much
 * reach it currently carries (the permission meter).
 *
 * Reads as three bands — identity, placement, reach — so the eye lands on the
 * number that matters without scanning a flat list of label/value pairs.
 */
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Progress } from "@core/ui/progress";
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
  const pct = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;

  return (
    <Card className="lg:sticky lg:top-4 lg:self-start">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          {t("roles.roleDetails")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <RoleInfoSkeleton />
        ) : (
          <>
            {/* ── Identity ── */}
            <div className="space-y-3">
              <InfoField label={t("roles.name")} value={role?.getLocalizedName(language)} />
              <InfoField label={t("roles.code")} value={role?.code} mono />
              <InfoField
                // roles.description is the PAGE subtitle ("Manage roles and their
                // permissions."); the field label is roles.descriptionField.
                label={t("roles.descriptionField")}
                value={role?.getLocalizedDescription(language)}
              />
            </div>

            {/* ── Placement ── */}
            <div className="space-y-3 border-t border-nx-line pt-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
                  {t("roles.priority")}
                </p>
                <Badge variant="outline" className="mt-1.5 tabular-nums">
                  {role?.priority}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
                  {t("roles.groups")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {role?.hasGroups ? (
                    role.getLocalizedGroups(language).map((groupName, i) => (
                      <Badge key={`${i}-${groupName}`} variant="secondary" className="text-xs">
                        {groupName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-nx-ink-3">{t("roles.noGroups")}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Reach — the one number this card exists to show ── */}
            <div className="space-y-2 border-t border-nx-line pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">
                {t("roles.selectedPermissions")}
              </p>
              <p className="text-2xl font-semibold tabular-nums leading-none text-nx-ink">
                {selectedCount}
                <span className="text-sm font-normal text-nx-ink-3"> / {totalCount}</span>
              </p>
              <Progress
                value={pct}
                className="h-1"
                aria-label={t("roles.selectedPermissions")}
                getValueLabel={() => `${selectedCount} / ${totalCount}`}
              />
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
      <p className="text-xs font-medium uppercase tracking-wide text-nx-ink-3">{label}</p>
      <p
        className={
          mono ? "mt-0.5 font-mono text-sm text-nx-ink" : "mt-0.5 text-sm font-medium text-nx-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

function RoleInfoSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-3 border-t border-nx-line pt-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="space-y-2 border-t border-nx-line pt-4">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-1 w-full" />
      </div>
    </div>
  );
}
