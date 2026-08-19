/**
 * Entity Types registry view — Wave 5 row 5.5
 *
 * Read-only reference page at /custom-fields/entity-types over the existing
 * `GET /api/v1/custom-fields/entity-types` endpoint: every entity type a
 * custom field can be defined against, which module owns it, and whether a
 * frontend screen renders its custom fields.
 *
 * PAGE SHAPE — the same call row 5.4 made, for the same reasons plus one
 * ------------------------------------------------------------------------
 * This is NOT a CrudConfig-over-GenericCrudView screen like
 * CustomFieldListView. There is no create, edit or delete affordance: entity
 * types are registered by backend modules at startup
 * (`IEntityTypeCatalog.Register`), and no endpoint exists — or should — to
 * mutate them from a tenant admin screen. A CrudConfig here would mean a fake
 * create form, a fake delete confirm and a fake mutable resource for
 * GenericCrudView's hooks to point at nothing.
 *
 * The extra reason beyond 5.4's: the endpoint returns a FLAT array, not a
 * `PagedResult`. `useCrudViewModel` is built around page/pageSize/totalCount,
 * so driving it from this response would mean fabricating pagination metadata
 * for a fixed, process-lifetime list of ~55 rows. PageHeader + a real
 * `<table>` (the same `@core/ui/table` primitive ValueTypeCatalogView already
 * uses for equivalent flat reference content) is the honest shape.
 *
 * WHY THE "IN THIS APP" AND "STATUS" COLUMNS EXIST
 * ------------------------------------------------
 * `hasFrontendScreen` is a hand-typed literal at each backend registration
 * site — an assertion the backend makes ABOUT this repo. Row 5.5's second
 * deliverable is the drift check between that claim and this repo's own
 * `entityScreenManifest.ts`; those two columns put the same diff in front of
 * an operator instead of only in CI. When they disagree the row says so by
 * name, and which side is ahead. In the current checkout every row is in
 * sync, so the Status column reads uniformly "in sync" — that is the correct
 * rendering of the truth, not a stub.
 *
 * Gated by `custom-fields.view` (PAGE_PERMISSIONS in
 * core/common/types/permissions.ts), the same permission the parent
 * /custom-fields route and the backing endpoint both require.
 */
"use client";

import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { ErrorMessage } from "@core/ui/error-message";
import { SectionState } from "@core/ui/section-state";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@core/ui/table";
import { ChevronLeft, ChevronRight, Boxes } from "lucide-react";
import {
  useEntityTypeCatalogViewModel,
  type EntityTypeScreenAgreement,
} from "../viewmodels/useEntityTypeCatalogViewModel";

/**
 * Badge tone per agreement state. `aligned` is deliberately the quiet
 * `inactive` tone rather than a green success chip: 55 green chips would make
 * the two genuinely interesting states harder to spot, not easier.
 */
const AGREEMENT_BADGE: Record<
  EntityTypeScreenAgreement,
  { variant: "inactive" | "warning" | "info"; labelKey: string }
> = {
  aligned: { variant: "inactive", labelKey: "customField.entityTypeCatalog.agreement.aligned" },
  backendClaimsScreenOnly: {
    variant: "warning",
    labelKey: "customField.entityTypeCatalog.agreement.backendClaimsScreenOnly",
  },
  frontendScreenOnly: {
    variant: "info",
    labelKey: "customField.entityTypeCatalog.agreement.frontendScreenOnly",
  },
};

/**
 * Presentation UI component rendering the read-only Entity Types registry.
 * Arranges layout boundaries and accessible table semantics (real
 * `<table>`/`<th>`/`<td>`, headers reachable via `getByRole`) using the core
 * design library (@core/ui/*). All row derivation lives in
 * `useEntityTypeCatalogViewModel`.
 */
export function EntityTypeCatalogView() {
  useModuleLocales(() => import("../../../locales"), "customFields");
  const { t, language, direction } = useI18n();
  const { rows, stats, isLoading, isError, refetch } = useEntityTypeCatalogViewModel();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        icon={Boxes}
        title={t("customField.entityTypeCatalog.title")}
        description={t("customField.entityTypeCatalog.description")}
        eyebrow={
          <Link href="/custom-fields">
            <Button variant="ghost" size="sm">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          </Link>
        }
        meta={[
          { label: t("customField.entityTypeCatalog.stats.total"), value: stats.total },
          { label: t("customField.entityTypeCatalog.stats.withScreen"), value: stats.withScreen },
          { label: t("customField.entityTypeCatalog.stats.drift"), value: stats.drift },
        ]}
      />

      {isError ? (
        // The module's own specific message rather than SectionState's
        // generic `common.error`: "entity types failed to load" is the one
        // thing that can go wrong on this page, and the definitions screen
        // already surfaces the identical string for the identical query.
        <ErrorMessage
          message={t("customField.entityTypeCatalog.loadFailed")}
          onRetry={() => refetch()}
        />
      ) : (
        <SectionState
          isLoading={isLoading}
          isEmpty={rows.length === 0}
          skeletonType="rows"
          skeletonRows={8}
          emptyMessage={t("customField.entityTypeCatalog.empty")}
        >
          <div className="overflow-hidden rounded-nx-md border border-nx-line">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("customField.entityTypeCatalog.columns.entityType")}</TableHead>
                  <TableHead>{t("customField.entityTypeCatalog.columns.key")}</TableHead>
                  <TableHead>{t("customField.entityTypeCatalog.columns.owningModule")}</TableHead>
                  <TableHead>{t("customField.entityTypeCatalog.columns.backendScreen")}</TableHead>
                  <TableHead>{t("customField.entityTypeCatalog.columns.frontendScreen")}</TableHead>
                  <TableHead>{t("customField.entityTypeCatalog.columns.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ entityType, backendClaimsScreen, frontendHasScreen, agreement }) => {
                  const badge = AGREEMENT_BADGE[agreement];
                  return (
                    <TableRow key={entityType.key}>
                      <TableCell className="font-medium">
                        {language === "ar" ? entityType.displayNameAr : entityType.displayNameEn}
                      </TableCell>
                      <TableCell>
                        {/* Always LTR-read: the key is a machine identifier
                            (`{module}.{entity}`), not translated copy, so it
                            keeps the mono treatment the definitions table
                            already gives identifier columns. */}
                        <span className="font-mono text-xs text-nx-ink-2">{entityType.key}</span>
                      </TableCell>
                      <TableCell className="text-sm text-nx-ink-2">
                        {entityType.owningModule}
                      </TableCell>
                      <TableCell>
                        <Badge variant={backendClaimsScreen ? "active" : "inactive"}>
                          {backendClaimsScreen ? t("common.yes") : t("common.no")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={frontendHasScreen ? "active" : "inactive"}>
                          {frontendHasScreen ? t("common.yes") : t("common.no")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{t(badge.labelKey)}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </SectionState>
      )}
    </div>
  );
}
