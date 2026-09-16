/**
 * Schema import entry point — Wave 6 row 6.5's import half
 *
 * The header action on `/custom-fields` that opens `SchemaImportDialog`. Same placement convention
 * as `SchemaExportButton` beside it, and self-contained for the same reasons: it owns its own gate,
 * its own open state, and shares the schema locale chunk (which now carries both halves -- see
 * `schema/locales/index.ts`).
 *
 * PERMISSION GATE: BOTH `custom-field-groups.create` AND `custom-fields.create`, matching the
 * endpoint's own two `[PermissionRequired]` attributes exactly (ASP.NET Core ANDs them). Unlike
 * `ValueExportButton` beside the OTHER header row, this route's permission IS static -- importing
 * is a bulk create of both kinds of row, gated the same way a single create of either already is --
 * so this button can check it synchronously, the same shape `SchemaExportButton` uses.
 */
"use client";

import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermissions } from "@core/hooks/use-permission";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { SchemaImportDialog } from "./SchemaImportDialog";

export function SchemaImportButton() {
  useModuleLocales(() => import("../../../locales"), "customFieldSchemaImport");
  const { t } = useI18n();
  const { hasAll } = usePermissions();
  const [isOpen, setIsOpen] = React.useState(false);

  const canImport = hasAll([
    CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_CREATE,
    CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_CREATE,
  ]);

  if (!canImport) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Upload className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("schemaImport.openLabel")}
      </Button>

      {/* Mounted only while open -- same reasoning as every sibling export/import dialog in this
          header. */}
      {isOpen && <SchemaImportDialog open={isOpen} onOpenChange={setIsOpen} />}
    </>
  );
}
