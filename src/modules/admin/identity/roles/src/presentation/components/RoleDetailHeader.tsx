/**
 * Role Detail View Header Component
 *
 * Header with breadcrumbs, role title, and save action.
 */
import { Save } from "lucide-react";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { useI18n } from "@core/providers/i18n-provider";
import type { Role } from "../../domain/entities/Role";

/**
 * Interface defining property specifications, keys types, and structural contract rules for role detail header props.
 */
export interface RoleDetailHeaderProps {
  role: Role | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
}

/**
 * Presentation UI component rendering the role detail header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RoleDetailHeader({ role, isLoading, isSaving, onSave }: RoleDetailHeaderProps) {
  const { t, language } = useI18n();
  const roleName = language === "ar" ? role?.nameAr : role?.nameEn;
  const breadcrumbSegments = [
    { label: t("roles.title"), href: "/roles" },
    { label: isLoading ? "..." : roleName || t("roles.roleDetails") },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <PageBreadcrumbs segments={breadcrumbSegments} />

      {/* Title and Save Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-1.5 h-4 w-32" />
            </>
          ) : (
            <>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-nx-ink">
                {roleName}
              </h1>
              <span className="mt-0.5 block truncate font-mono text-sm text-nx-ink-3">
                {role?.code}
              </span>
            </>
          )}
        </div>
        <Button onClick={onSave} loading={isSaving} disabled={isLoading} className="shrink-0">
          {!isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
          {isSaving ? t("common.saving") : t("common.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
