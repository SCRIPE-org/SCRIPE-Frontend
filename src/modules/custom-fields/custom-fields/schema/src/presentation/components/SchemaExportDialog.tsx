/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Schema export dialog — Wave 6 row 6.5
 *
 * One scope choice and one action: pick an entity type (or all of them), press Export, get a
 * portable JSON bundle on disk.
 *
 * CONTAINER CHOICE: a `Dialog`, matching `FieldImpactDialog` and `FieldHistoryDialog` — the two
 * other things the definitions screen opens over itself. It is NOT the inline-panel shape
 * `FieldGroupEditor` uses: that panel exists because it is a four-input form on a route page of its
 * own, whereas this is a one-choice action launched from a header on a screen the admin wants to
 * stay on. Nothing here nests a modal inside a modal, which is the constraint row 5.6 spent a commit
 * establishing for this module.
 *
 * WHY THE RESULT LINE AND THE EMPTY NOTICE ARE BOTH HERE
 * -----------------------------------------------------
 * An export is one of the few actions whose outcome the user cannot inspect without leaving the app.
 * "Exported 42 definitions and 6 groups" is how they check the file against their expectation before
 * they carry it to another environment; "nothing to export" is how they learn that an empty scope is
 * not the same thing as a failed request — and that it may mean the fields are simply invisible to
 * their role.
 */
"use client";

import React from "react";
import { AlertCircle, Download, FileJson, Info } from "lucide-react";
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
  useSchemaExportViewModel,
} from "../viewmodels/useSchemaExportViewModel";

/**
 * Documentation for module export
 */
export interface SchemaExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Documentation for module export
 */
export function SchemaExportDialog({ open, onOpenChange }: SchemaExportDialogProps) {
  const { t, language } = useI18n();
  const vm = useSchemaExportViewModel();

  /**
   * The scope options, led by the "all entity types" sentinel.
   *
   * The sentinel is FIRST and is the default: an unscoped export is the complete bundle, which is
   * what someone cloning a schema between environments almost always wants. Scoping is the
   * narrowing choice, not the starting point.
   */
  const entityTypes = vm.entityTypes ?? [];
  const entityTypeOptions = React.useMemo(
    () => [
      { value: ALL_ENTITY_TYPES_VALUE, label: t("schemaExport.allEntityTypes") },
      ...entityTypes.map((item) => ({
        value: item.key,
        label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})`,
      })),
    ],
    [entityTypes, language, t]
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      // Reset on CLOSE, not on open: a dialog that clears itself while the admin is reading the
      // result line of the export they just ran would erase the only report of it.
      if (!next) vm.reset();
      onOpenChange(next);
    },
    [onOpenChange, vm]
  );

  const bundle = vm.lastBundle;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("schemaExport.title")}</DialogTitle>
          <DialogDescription>{t("schemaExport.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schema-export-entity-type">{t("schemaExport.entityType")}</Label>
            <GenericSelect
              id="schema-export-entity-type"
              // GenericSelect's trigger is a role="combobox" DIV, so the <Label htmlFor> above
              // computes no accessible name for it. aria-label is opt-in on this component and must
              // be passed explicitly -- every CustomFields site already does.
              aria-label={t("schemaExport.entityType")}
              type="single"
              options={entityTypeOptions}
              value={vm.entityTypeKey}
              onValueChange={(value: string | string[]) =>
                vm.setEntityTypeKey(typeof value === "string" ? value : (value[0] ?? ""))
              }
              placeholder={t("schemaExport.entityTypePlaceholder")}
              loading={vm.isEntityTypesLoading}
              disabled={vm.isExporting}
            />
            <p className="text-sm text-muted-foreground">{t("schemaExport.entityTypeHint")}</p>

            {/* A failed entity-type fetch is NOT fatal here, unlike on the field-group screen where
                a scope is mandatory: the sentinel above still exports everything. So this reports
                the failure and offers a retry rather than blocking the action. */}
            {vm.isEntityTypesError && (
              <ErrorMessage
                size="sm"
                message={t("schemaExport.loadFailed")}
                onRetry={() => vm.refetchEntityTypes()}
              />
            )}
          </div>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileJson className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("schemaExport.contents")}</span>
          </p>

          {vm.isError && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{vm.errorMessage ?? t("schemaExport.toast.exportFailed")}</span>
            </p>
          )}

          {bundle && bundle.isEmpty && (
            <Alert variant="info" data-testid="schema-export-empty">
              <Info />
              <AlertTitle>{t("schemaExport.empty.title")}</AlertTitle>
              <AlertDescription>{t("schemaExport.empty.description")}</AlertDescription>
            </Alert>
          )}

          {bundle && !bundle.isEmpty && (
            <p className="text-sm" role="status" data-testid="schema-export-result">
              {t("schemaExport.result", {
                definitions: bundle.definitionCount,
                groups: bundle.groupCount,
              })}
            </p>
          )}

          {/* The server's format version is one this app does not know. The file was still handed
              over verbatim -- an exporter only moves bytes -- so this warns rather than blocks, and
              says plainly that nothing was validated. */}
          {bundle && !bundle.isFormatSupported && (
            <Alert variant="warning" data-testid="schema-export-unsupported-version">
              <AlertCircle />
              <AlertTitle>{t("schemaExport.unsupportedVersion.title")}</AlertTitle>
              <AlertDescription>
                {t("schemaExport.unsupportedVersion.description", {
                  version: bundle.formatVersion,
                })}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={vm.isExporting}>
            {t("common.close")}
          </Button>
          <Button onClick={vm.exportSchema} disabled={vm.isExporting}>
            <Download className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {vm.isExporting ? t("schemaExport.exporting") : t("schemaExport.exportAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
