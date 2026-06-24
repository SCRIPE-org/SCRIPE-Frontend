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
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-48" />
              <Skeleton className="mt-1 h-5 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{roleName}</h1>
              <span className="text-muted-foreground">{role?.code}</span>
            </>
          )}
        </div>
        <Button onClick={onSave} loading={isSaving}>
          {!isSaving && <Save className="mr-2 h-4 w-4" />}
          {isSaving ? t("common.saving") : t("common.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
