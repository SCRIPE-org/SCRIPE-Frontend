/**
 * Role Detail View Header Component
 *
 * The standard opening of a record page: breadcrumb eyebrow, the accent icon
 * tile, the role's name, its code, and the save action.
 *
 * It used to hand-assemble that anatomy — an `h1` at `text-2xl` (two steps
 * louder than the system's own page title), no icon tile, and its own
 * title/actions flex row. Composing PageHeader means the role page opens
 * exactly like every other record page in the product.
 */
import { Save, Shield } from "lucide-react";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { PageHeader } from "@core/ui/page-header";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveBilingualLabel } from "@core/common/utils";
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
  const roleName = resolveBilingualLabel(role?.nameEn ?? "", role?.nameAr ?? "", language);
  const breadcrumbSegments = [
    { label: t("roles.title"), href: "/roles" },
    { label: isLoading ? t("common.loading") : roleName || t("roles.roleDetails") },
  ];

  return (
    <PageHeader
      // The detail view already owns the page rhythm in its own stack; the
      // header's default bottom margin would double the gap under it.
      className="mb-0"
      icon={Shield}
      eyebrow={<PageBreadcrumbs segments={breadcrumbSegments} />}
      // The placeholder keeps the heading's box while the name is in flight, so
      // the save action does not jump down the moment the record lands.
      title={isLoading ? <Skeleton className="h-6 w-48" /> : (roleName ?? "")}
      // The code is an identifier, and identifiers stay mono here — the list
      // column and the info card render it the same way.
      description={role?.code ? <span className="font-mono">{role.code}</span> : undefined}
      actions={
        <Button onClick={onSave} loading={isSaving} disabled={isLoading} className="shrink-0">
          {!isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
          {isSaving ? t("common.saving") : t("common.saveChanges")}
        </Button>
      }
    />
  );
}
