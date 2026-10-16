/**
 * Definition export entry point — Wave 6 row 6.4
 *
 * The header action on `/custom-fields` that opens `DefinitionExportDialog`.
 *
 * THIS CONTROL IS THE POINT OF THE CHANGE
 * ---------------------------------------
 * The export endpoint has been complete and tested server-side for a while and had ZERO frontend
 * callers — reaching it required a raw API call, and the operator guide told testers to click an
 * Export action in this header that did not exist. This is that action.
 *
 * WHY THE OPEN STATE AND THE LOCALE LOAD LIVE HERE AND NOT IN THE LIST VIEW
 * ------------------------------------------------------------------------
 * `CustomFieldListView` builds its whole `CrudConfig` -- `customHeaderContent` included -- inside one
 * `useMemo`. Putting the dialog's open flag in that component would add a dependency to that memo and
 * rebuild the entire table config on every open and close. Owning the state here keeps the definitions
 * screen's diff to a single self-contained element.
 *
 * The same reasoning applies to the dictionary: this feature's strings live in their own lazily loaded
 * chunk under `definition-export/locales`, registered by this component rather than by the host
 * screen, so the host does not have to know that a submodule it merely renders has copy of its own.
 *
 * PERMISSION GATE: `custom-fields.export`, the same permission the endpoint requires. An admin without
 * it would get a 403 from the only action this dialog offers, so the button is not rendered at all --
 * the same choice the schema-export button and the "Manage field groups" link beside it make.
 */
"use client";

import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { CUSTOM_FIELDS_EXPORT_PERMISSION } from "../../../../permission-constants";
import { DefinitionExportDialog } from "./DefinitionExportDialog";

/**
 * Documentation for module export
 */
export function DefinitionExportButton() {
  useModuleLocales(() => import("../../../locales"), "customFieldDefinitionExport");
  const { t } = useI18n();
  const canExport = usePermission(CUSTOM_FIELDS_EXPORT_PERMISSION);
  const [isOpen, setIsOpen] = React.useState(false);

  if (!canExport) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <FileSpreadsheet className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
        {t("definitionExport.openLabel")}
      </Button>

      {/* Mounted only while open. The dialog's view model holds an entity-types query and a
          mutation; keeping it mounted behind a closed dialog would run that query on every visit to
          the definitions screen for a feature most visits never touch. */}
      {isOpen && <DefinitionExportDialog open={isOpen} onOpenChange={setIsOpen} />}
    </>
  );
}
