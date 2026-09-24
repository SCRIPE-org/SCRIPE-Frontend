/**
 * Definition export dialog — Wave 6 row 6.4
 *
 * One scope choice and one action: pick an entity type (or all of them), press Export, get an `.xlsx`
 * of the field definitions on disk.
 *
 * CONTAINER CHOICE: a `Dialog`, matching `SchemaExportDialog`, `FieldImpactDialog` and
 * `FieldHistoryDialog` — everything the definitions screen opens over itself. It is NOT the inline-panel
 * shape `FieldGroupEditor` uses: that panel exists because it is a four-input form on a route page of
 * its own, whereas this is a one-choice action launched from a header on a screen the admin wants to
 * stay on. Nothing here nests a modal inside a modal, which is the constraint row 5.6 spent a commit
 * establishing for this module.
 *
 * THE REFUSAL GETS ITS OWN ALERT, AND IT IS NOT DESTRUCTIVE-COLOURED
 * -----------------------------------------------------------------
 * Past the server's row cap the export is REFUSED rather than truncated. That is a working system
 * declining a request, not a fault, so it renders as a `warning` with the cap and the remedy named —
 * and the generic error line is suppressed while it shows, because an admin reading both would
 * reasonably conclude two things went wrong.
 *
 * WHY THE 'INCLUDED IN EXPORTS' NOTE IS IN THE DIALOG AT ALL
 * ---------------------------------------------------------
 * Because the flag's name invites exactly the wrong inference. It means "values of this field are
 * included in export" — a statement about VALUES — and the handler reports it as a column while
 * deliberately never filtering on it. An admin who assumed it filtered would read a complete workbook
 * as a partial one, so the dialog says which of the two it is before the file is downloaded.
 */
"use client";

import React from "react";
import { AlertCircle, Download, FileSpreadsheet, Info } from "lucide-react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { ErrorMessage } from "@core/ui/error-message";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import {
  ALL_ENTITY_TYPES_VALUE,
  useDefinitionExportViewModel,
} from "../viewmodels/useDefinitionExportViewModel";

export interface DefinitionExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DefinitionExportDialog({ open, onOpenChange }: DefinitionExportDialogProps) {
  const { t, language } = useI18n();
  const vm = useDefinitionExportViewModel();

  /**
   * The scope options, led by the "all entity types" sentinel.
   *
   * The sentinel is FIRST and is the default: an admin auditing their field configuration usually
   * wants the whole list, and narrowing is the second thought — which is also the remedy the row-cap
   * refusal points at.
   */
  const entityTypes = vm.entityTypes ?? [];
  const entityTypeOptions = React.useMemo(
    () => [
      { value: ALL_ENTITY_TYPES_VALUE, label: t("definitionExport.allEntityTypes") },
      ...entityTypes.map((item) => ({
        value: item.key,
        label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})`,
      })),
    ],
    [entityTypes, language, t]
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      // Reset on CLOSE, not on open: a dialog that clears itself while the admin is reading which
      // file just landed would erase the only report of it.
      if (!next) vm.reset();
      onOpenChange(next);
    },
    [onOpenChange, vm]
  );

  const exported = vm.lastExport;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("definitionExport.title")}</DialogTitle>
          <DialogDescription>{t("definitionExport.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="definition-export-entity-type">
              {t("definitionExport.entityType")}
            </Label>
            <GenericSelect
              id="definition-export-entity-type"
              // GenericSelect's trigger is a role="combobox" DIV, so the <Label htmlFor> above
              // computes no accessible name for it. aria-label is opt-in on this component and must
              // be passed explicitly -- every CustomFields site already does.
              aria-label={t("definitionExport.entityType")}
              type="single"
              options={entityTypeOptions}
              value={vm.entityTypeKey}
              onValueChange={(value: string | string[]) =>
                vm.setEntityTypeKey(typeof value === "string" ? value : (value[0] ?? ""))
              }
              placeholder={t("definitionExport.entityTypePlaceholder")}
              loading={vm.isEntityTypesLoading}
              disabled={vm.isExporting}
            />
            <p className="text-sm text-muted-foreground">
              {t("definitionExport.entityTypeHint")}
            </p>

            {/* A failed entity-type fetch is NOT fatal here, unlike on the field-group screen where a
                scope is mandatory: the sentinel above still exports everything. So this reports the
                failure and offers a retry rather than blocking the action. */}
            {vm.isEntityTypesError && (
              <ErrorMessage
                size="sm"
                message={t("definitionExport.loadFailed")}
                onRetry={() => vm.refetchEntityTypes()}
              />
            )}
          </div>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("definitionExport.contents")}</span>
          </p>

          <p
            className="flex items-start gap-2 text-sm text-muted-foreground"
            data-testid="definition-export-exportable-note"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("definitionExport.exportableNote")}</span>
          </p>

          {/* The refusal, before the generic error line and instead of it. */}
          {vm.isRowCapRefused && (
            <Alert variant="warning" data-testid="definition-export-refused">
              <AlertCircle />
              <AlertTitle>{t("definitionExport.refused.title")}</AlertTitle>
              <AlertDescription>
                {t("definitionExport.refused.description", { max: vm.maxExportRows })}
              </AlertDescription>
            </Alert>
          )}

          {vm.isError && !vm.isRowCapRefused && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{vm.errorMessage ?? t("definitionExport.toast.exportFailed")}</span>
            </p>
          )}

          {/* Nothing was saved, and saying so is the point: an `.xlsx` that a spreadsheet refuses to
              open is a worse outcome than a clear refusal. */}
          {exported && !exported.isUsable && (
            <Alert variant="destructive" data-testid="definition-export-unexpected-file">
              <AlertCircle />
              <AlertTitle>{t("definitionExport.unexpectedFile.title")}</AlertTitle>
              <AlertDescription>{t("definitionExport.unexpectedFile.description")}</AlertDescription>
            </Alert>
          )}

          {/* The file WAS saved -- by the download manager, so there is no name or size to report. */}
          {vm.wasIntercepted && (
            <Alert variant="info" data-testid="definition-export-intercepted">
              <Info />
              <AlertTitle>{t("definitionExport.intercepted.title")}</AlertTitle>
              <AlertDescription>{t("definitionExport.intercepted.description")}</AlertDescription>
            </Alert>
          )}

          {exported && exported.isUsable && (
            <p className="text-sm" role="status" data-testid="definition-export-result">
              {t("definitionExport.result", {
                fileName: exported.fileName,
                size: exported.formattedSize(),
              })}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={vm.isExporting}
          >
            {t("common.close")}
          </Button>
          <Button onClick={vm.exportDefinitions} disabled={vm.isExporting}>
            <Download className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {vm.isExporting ? t("definitionExport.exporting") : t("definitionExport.exportAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
