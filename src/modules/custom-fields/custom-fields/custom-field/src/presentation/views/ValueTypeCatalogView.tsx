/**
 * Value Types Catalog View -- Wave 5 row 5.4
 *
 * Read-only reference page at /custom-fields/value-types. Design spec §7:
 * "Value Types catalog -- Read-only. Browse available types, what each is
 * for, which are entitlement-locked. This is the 'dynamic types page' you
 * wanted, in its safe form." The product deliberately does not let tenants
 * author their own value types (design decision D1); this page is the
 * honest substitute, so the closed 17-type catalog feels navigable rather
 * than arbitrary.
 *
 * PAGE SHAPE, decided deliberately (pre-plan analysis R5 + this row's own
 * instruction): this is NOT a CrudConfig-over-GenericCrudView screen like
 * CustomFieldListView. There is no create, edit, or delete affordance --
 * the 17 value types are a compile-time constant (ALL_VALUE_TYPES), not a
 * fetched, paginated, mutable resource. Forcing a CrudConfig here would mean
 * stubbing a fake create/edit form, a fake delete confirm flow, and a fake
 * "resource" for GenericCrudView's data-fetching hooks to point at nothing
 * -- dead UI weight, not simplicity. Plain PageHeader + a real <table>
 * (this module's own core/ui/table.tsx, the same primitive
 * PermissionCategoryAccordion.tsx already uses for an equivalent flat
 * read-only reference table) is the honest shape for static reference
 * content, and it is what "match the existing page's routing, layout
 * primitives and i18n conventions" (this row's own instruction) asks for --
 * GenericCrudView itself renders PageHeader internally, so this view reuses
 * the exact same header primitive, just without the CRUD chrome around it.
 *
 * NO BACKEND WORK: built entirely off the existing frontend
 * VALUE_TYPE_CATALOG / ALL_VALUE_TYPES constants (valueTypeRegistry.ts).
 * ValueTypeDescriptor is not exposed by any endpoint and none was added --
 * ruling R5 is explicit that none should be.
 *
 * NO ENTITLEMENT-LOCK COLUMN: §7 mentions "which are entitlement-locked",
 * but that data does not exist on either side -- §4.6's
 * Availability/RequiredFeature descriptor fields were never implemented
 * (ruling R5). Omitted entirely rather than rendered empty or fabricated.
 */
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { ChevronLeft, ChevronRight, ListTree } from "lucide-react";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
} from "../valueTypeRegistry";

/**
 * The validator picker (validatorKindRegistry.ts) is scoped to the Text
 * value type only -- CustomFieldListView.tsx's own admin form gates its
 * validatorKind field with `isVisible: (form) => form.valueType === "Text"`
 * (D4/D5). This is not a field on ValueTypeCatalogEntry itself, so it is
 * mirrored here as the same literal comparison rather than invented as a
 * new catalog flag -- this row's own instruction explicitly calls out
 * surfacing "which types take a validator (only Text does)" as knowledge
 * already in the frontend, not a new catalog field to add.
 */
const VALIDATOR_ELIGIBLE_VALUE_TYPE: CustomFieldValueTypeName = "Text";

/**
 * Presentation UI component rendering the read-only Value Types catalog.
 * Arranges layout boundaries and accessible table semantics (real
 * <table>/<th>/<td>, headers reachable via getByRole) using the core design
 * library (@core/ui/*). No data fetching -- every row comes from the
 * compile-time ALL_VALUE_TYPES / VALUE_TYPE_CATALOG constants.
 */
export function ValueTypeCatalogView() {
  useModuleLocales(() => import("../../../locales"), "customFields");
  const { t, direction } = useI18n();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const rows = useMemo(
    () =>
      ALL_VALUE_TYPES.map((type) => {
        const entry = VALUE_TYPE_CATALOG[type];
        // The descriptions block deliberately reuses the SAME leaf names as
        // valueTypes.* (both keyed by this catalog entry's own labelKey
        // suffix, e.g. "customField.valueTypes.longText" -> "longText") so
        // the two i18n blocks cannot silently drift apart in which 17 names
        // they cover -- there is no second hand-kept type -> key map here.
        const leafKey = entry.labelKey.split(".").pop() ?? type;
        return {
          type,
          entry,
          descriptionKey: `customField.valueTypeCatalog.descriptions.${leafKey}`,
        };
      }),
    []
  );

  const stats = useMemo(() => {
    const withOptions = ALL_VALUE_TYPES.filter((type) => VALUE_TYPE_CATALOG[type].hasOptions).length;
    const withValidator = ALL_VALUE_TYPES.filter(
      (type) => type === VALIDATOR_ELIGIBLE_VALUE_TYPE
    ).length;
    return { total: ALL_VALUE_TYPES.length, withOptions, withValidator };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        icon={ListTree}
        title={t("customField.valueTypeCatalog.title")}
        description={t("customField.valueTypeCatalog.description")}
        eyebrow={
          <Link href="/custom-fields">
            <Button variant="ghost" size="sm">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          </Link>
        }
        meta={[
          { label: t("customField.valueTypeCatalog.stats.total"), value: stats.total },
          { label: t("customField.valueTypeCatalog.stats.withOptions"), value: stats.withOptions },
          {
            label: t("customField.valueTypeCatalog.stats.withValidator"),
            value: stats.withValidator,
          },
        ]}
      />

      <div className="overflow-hidden rounded-nx-md border border-nx-line">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("customField.valueTypeCatalog.columns.valueType")}</TableHead>
              <TableHead>{t("customField.valueTypeCatalog.columns.description")}</TableHead>
              <TableHead>{t("customField.valueTypeCatalog.columns.placeholder")}</TableHead>
              <TableHead>{t("customField.valueTypeCatalog.columns.options")}</TableHead>
              <TableHead>{t("customField.valueTypeCatalog.columns.validator")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ type, entry, descriptionKey }) => (
              <TableRow key={type}>
                <TableCell>
                  <Badge variant={entry.badgeVariant}>{t(entry.labelKey)}</Badge>
                </TableCell>
                <TableCell className="max-w-md text-sm text-nx-ink-2">{t(descriptionKey)}</TableCell>
                <TableCell>
                  <Badge variant={entry.hasPlaceholder ? "active" : "inactive"}>
                    {entry.hasPlaceholder ? t("common.yes") : t("common.no")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={entry.hasOptions ? "active" : "inactive"}>
                    {entry.hasOptions ? t("common.yes") : t("common.no")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={type === VALIDATOR_ELIGIBLE_VALUE_TYPE ? "active" : "inactive"}>
                    {type === VALIDATOR_ELIGIBLE_VALUE_TYPE ? t("common.yes") : t("common.no")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
