/**
 * Value export dialog — Wave 6 row 6.4's completion
 *
 * Pick an entity type, press Export, get an `.xlsx` of its records' stored custom-field values on
 * disk. Same container choice as `DefinitionExportDialog` and `SchemaExportDialog` — a `Dialog`,
 * matching everything else the definitions screen opens over itself.
 *
 * THE PICKER HAS NO DEFAULT, AND NO EMPTY-STATE FALLBACK ANSWER
 * -----------------------------------------------------------------
 * `DefinitionExportDialog`'s picker opens on "all entity types" because that is a real, working
 * scope. This endpoint has none: `entityTypeKey` is mandatory, so the picker opens unselected and
 * Export stays disabled until a choice is made. When the caller can view no entity type's records
 * at all, the picker has nothing to offer -- see the `hasNoViewableEntityTypes` branch below, which
 * is the one state `DefinitionExportDialog` never has to render because its picker is never empty.
 */
"use client";

import React from "react";
import { AlertCircle, Database, Download, Info, ShieldAlert } from "lucide-react";
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
import { useValueExportViewModel } from "../viewmodels/useValueExportViewModel";

/**
 * Documentation for module export
 */
export interface ValueExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Documentation for module export
 */
export function ValueExportDialog({ open, onOpenChange }: ValueExportDialogProps) {
  const { t, language } = useI18n();
  const vm = useValueExportViewModel();

  const entityTypes = vm.entityTypes;
  const entityTypeOptions = React.useMemo(
    () =>
      entityTypes.map((item) => ({
        value: item.key,
        label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})`,
      })),
    [entityTypes, language]
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
  const hasChosenEntityType = vm.entityTypeKey.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("valueExport.title")}</DialogTitle>
          <DialogDescription>{t("valueExport.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* The real empty state: every entity type loaded, and none of them are ones this caller
              may view records for. Replaces the picker entirely rather than showing it disabled --
              an empty, disabled select invites a retry that cannot succeed. */}
          {vm.hasNoViewableEntityTypes ? (
            <Alert variant="info" data-testid="value-export-no-viewable-entity-types">
              <Info />
              <AlertTitle>{t("valueExport.noViewableEntityTypes.title")}</AlertTitle>
              <AlertDescription>
                {t("valueExport.noViewableEntityTypes.description")}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="value-export-entity-type">{t("valueExport.entityType")}</Label>
              <GenericSelect
                id="value-export-entity-type"
                // GenericSelect's trigger is a role="combobox" DIV, so the <Label htmlFor> above
                // computes no accessible name for it. aria-label is opt-in on this component and
                // must be passed explicitly -- every CustomFields site already does.
                aria-label={t("valueExport.entityType")}
                type="single"
                options={entityTypeOptions}
                value={vm.entityTypeKey}
                onValueChange={(value: string | string[]) =>
                  vm.setEntityTypeKey(typeof value === "string" ? value : (value[0] ?? ""))
                }
                placeholder={t("valueExport.entityTypePlaceholder")}
                loading={vm.isEntityTypesLoading}
                disabled={vm.isExporting}
              />
              <p className="text-sm text-muted-foreground">{t("valueExport.entityTypeHint")}</p>

              {vm.isEntityTypesError && (
                <ErrorMessage
                  size="sm"
                  message={t("valueExport.loadFailed")}
                  onRetry={() => vm.refetchEntityTypes()}
                />
              )}
            </div>
          )}

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Database className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("valueExport.contents")}</span>
          </p>

          {/* The row-cap refusal, before the generic error line and instead of it -- same pattern as
              DefinitionExportDialog's own warning alert. */}
          {vm.isRowCapRefused && (
            <Alert variant="warning" data-testid="value-export-refused">
              <AlertCircle />
              <AlertTitle>{t("valueExport.refused.title")}</AlertTitle>
              <AlertDescription>
                {t("valueExport.refused.description", { max: vm.maxExportRows })}
              </AlertDescription>
            </Alert>
          )}

          {/* FORBIDDEN -- unreachable through the filtered picker on a fresh permission set, but a
              stale one can still get here. Also not a fault: named separately from the generic
              error so the remedy (reopen, or ask for access) is the one shown. */}
          {vm.isForbidden && (
            <Alert variant="warning" data-testid="value-export-forbidden">
              <ShieldAlert />
              <AlertTitle>{t("valueExport.forbidden.title")}</AlertTitle>
              <AlertDescription>{t("valueExport.forbidden.description")}</AlertDescription>
            </Alert>
          )}

          {vm.isError && !vm.isRowCapRefused && !vm.isForbidden && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{vm.errorMessage ?? t("valueExport.toast.exportFailed")}</span>
            </p>
          )}

          {/* Nothing was saved, and saying so is the point. */}
          {exported && !exported.isUsable && (
            <Alert variant="destructive" data-testid="value-export-unexpected-file">
              <AlertCircle />
              <AlertTitle>{t("valueExport.unexpectedFile.title")}</AlertTitle>
              <AlertDescription>{t("valueExport.unexpectedFile.description")}</AlertDescription>
            </Alert>
          )}

          {/* The file WAS saved -- by the download manager, so there is no name or size to report. */}
          {vm.wasIntercepted && (
            <Alert variant="info" data-testid="value-export-intercepted">
              <Info />
              <AlertTitle>{t("valueExport.intercepted.title")}</AlertTitle>
              <AlertDescription>{t("valueExport.intercepted.description")}</AlertDescription>
            </Alert>
          )}

          {exported && exported.isUsable && (
            <p className="text-sm" role="status" data-testid="value-export-result">
              {t("valueExport.result", {
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
          <Button
            onClick={vm.exportValues}
            // Disabled with no scope chosen -- the mandatory picker's counterpart to the
            // definitions export always having a working default. Also disabled once there is
            // nothing this caller could pick at all.
            disabled={vm.isExporting || !hasChosenEntityType || vm.hasNoViewableEntityTypes}
          >
            <Download className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {vm.isExporting ? t("valueExport.exporting") : t("valueExport.exportAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
