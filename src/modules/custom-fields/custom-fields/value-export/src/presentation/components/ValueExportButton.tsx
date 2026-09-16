/**
 * Value export entry point — Wave 6 row 6.4's completion
 *
 * The header action on `/custom-fields` that opens `ValueExportDialog`. Same placement convention
 * as `DefinitionExportButton` and `SchemaExportButton` beside it, and self-contained for the same
 * reasons: it owns its own gate, its own open state and its own locale chunk, so it adds nothing to
 * `CustomFieldListView`'s config memo.
 *
 * THE GATE IS DATA-DRIVEN, NOT A SINGLE STATIC PERMISSION
 * ----------------------------------------------------------
 * `DefinitionExportButton`/`SchemaExportButton` check ONE static permission
 * (`custom-fields.export`) and hide instantly if it is missing. This endpoint has no equivalent: it
 * is gated on `{PermissionResource}.view` for whichever entity type the caller picks in the dialog,
 * so there is no single string this button could check. The same shape is preserved anyway --
 * render nothing when the caller could not use the action -- computed from the entity-type catalog
 * instead of from one permission code. `isEntityTypeViewableForValueExport` is the SAME rule the
 * dialog's own picker applies, so the button and the picker can never disagree about what "nothing
 * to export" means.
 *
 * That rule needs the entity-type catalog, which is the one respect in which this button is NOT as
 * cheap as its siblings' synchronous permission check. In practice it costs nothing extra:
 * `CustomFieldListView` fetches the identical `["customFields", "entityTypes"]` query for its own
 * create-form dropdown, so by the time this button renders in the same header the cache is normally
 * already warm.
 */
"use client";

import React from "react";
import { Database } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useValueExportButtonViewModel } from "../viewmodels/useValueExportButtonViewModel";
import { ValueExportDialog } from "./ValueExportDialog";

export function ValueExportButton() {
  useModuleLocales(() => import("../../../locales"), "customFieldValueExport");
  const { t } = useI18n();
  const { canExport } = useValueExportButtonViewModel();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!canExport) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Database className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("valueExport.openLabel")}
      </Button>

      {/* Mounted only while open -- same reasoning as the sibling export dialogs: the view model
          holds a mutation and a filtered entity-types read, and keeping it mounted behind a closed
          dialog would do that work on every visit to the definitions screen. */}
      {isOpen && <ValueExportDialog open={isOpen} onOpenChange={setIsOpen} />}
    </>
  );
}
