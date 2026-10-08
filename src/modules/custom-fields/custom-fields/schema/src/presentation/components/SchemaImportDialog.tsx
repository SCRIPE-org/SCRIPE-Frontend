/**
 * Schema import dialog — Wave 6 row 6.5's import half
 *
 * Pick a local JSON file, press Import, see exactly what happened to every group the file
 * described. Same container choice as `SchemaExportDialog` beside it — a `Dialog`, matching
 * everything else the definitions screen opens over itself.
 *
 * THE BREAKDOWN TABLE IS THE POINT, AND IT NEVER COLLAPSES INTO A COUNT
 * -------------------------------------------------------------------------
 * "3 created, 1 skipped" tells an admin nothing about WHICH group collided or WHY. Every group in
 * the response gets its own row with its own reason, always -- the summary line above the table is
 * exactly that, a summary, never a substitute for reading the rows.
 *
 * THE FILE PICKER IS A DROP ZONE, MATCHING `AttachmentUploader`'S OWN SHAPE
 * -------------------------------------------------------------------------
 * Click-to-open OR drag-and-drop, keyboard-operable (Enter/Space activate the hidden input, same
 * as `AttachmentUploader`'s own control) rather than a bare native file input sitting
 * unstyled in the dialog -- this module already has a file-picking convention elsewhere in the app
 * and there is no reason to invent a plainer one here.
 */
"use client";

import React from "react";
import { AlertCircle, Info, Upload } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { useI18n } from "@core/providers/i18n-provider";
import type { SchemaImportGroupOutcome } from "../../domain/entities/SchemaImportResult";
import { useSchemaImportViewModel } from "../viewmodels/useSchemaImportViewModel";
import { SchemaImportDropZone } from "./SchemaImportDropZone";

/**
 * Documentation for module export
 */
export interface SchemaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function outcomeBadgeVariant(
  outcome: SchemaImportGroupOutcome
): "success" | "warning" | "destructive" {
  if (outcome === "Created") return "success";
  if (outcome === "Skipped") return "warning";
  return "destructive";
}

/**
 * Documentation for module export
 */
export function SchemaImportDialog({ open, onOpenChange }: SchemaImportDialogProps) {
  const { t } = useI18n();
  const vm = useSchemaImportViewModel();

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      // Reset on CLOSE, not on open: a dialog that clears itself while the admin is reading the
      // breakdown of the import they just ran would erase the only report of it.
      if (!next) vm.reset();
      onOpenChange(next);
    },
    [onOpenChange, vm]
  );

  const handleFiles = React.useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void vm.pickFile(file);
    },
    [vm]
  );

  const outcomeLabel = React.useCallback(
    (outcome: SchemaImportGroupOutcome) => {
      if (outcome === "Created") return t("schemaImport.outcome.created");
      if (outcome === "Skipped") return t("schemaImport.outcome.skipped");
      return t("schemaImport.outcome.failed");
    },
    [t]
  );

  const result = vm.result;
  const disabled = vm.isImporting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("schemaImport.title")}</DialogTitle>
          <DialogDescription>{t("schemaImport.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t("schemaImport.collisionNote")}</span>
          </p>

          <SchemaImportDropZone
            selectedFile={vm.selectedFile}
            disabled={disabled}
            onFilesSelected={handleFiles}
            onClearFile={vm.clearFile}
          />

          {vm.isReadingFile && (
            <p className="text-sm text-muted-foreground" role="status">
              {t("schemaImport.importing")}
            </p>
          )}

          {/* The file was wrong in a way caught locally -- no request was ever made. */}
          {vm.pickError && (
            <p
              className="flex items-start gap-2 text-sm text-destructive"
              role="alert"
              data-testid="schema-import-pick-error"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{vm.pickError}</span>
            </p>
          )}

          {/* The item-count REFUSAL, before the generic error line and instead of it. */}
          {vm.isRefused && (
            <Alert variant="warning" data-testid="schema-import-refused">
              <AlertCircle />
              <AlertTitle>{t("schemaImport.refused.title")}</AlertTitle>
              <AlertDescription>
                {t("schemaImport.refused.description", { max: vm.maxImportItems })}
              </AlertDescription>
            </Alert>
          )}

          {vm.isError && !vm.isRefused && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{vm.errorMessage ?? t("schemaImport.toast.importFailed")}</span>
            </p>
          )}

          {/* The file named zero groups at all -- distinct from every group being Skipped/Failed. */}
          {result && result.isEmpty && (
            <Alert variant="info" data-testid="schema-import-empty-bundle">
              <Info />
              <AlertTitle>{t("schemaImport.emptyBundle.title")}</AlertTitle>
              <AlertDescription>{t("schemaImport.emptyBundle.description")}</AlertDescription>
            </Alert>
          )}

          {result && !result.isEmpty && (
            <div className="flex flex-col gap-2" data-testid="schema-import-result">
              <p className="text-sm" role="status">
                {t("schemaImport.summary", {
                  created: result.createdCount,
                  skipped: result.skippedCount,
                  failed: result.failedCount,
                })}
              </p>

              {result.createdCount === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("schemaImport.allSkippedOrFailed")}
                </p>
              )}

              <div className="overflow-x-auto rounded-nx-md border border-nx-line">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("schemaImport.table.entityType")}</TableHead>
                      <TableHead>{t("schemaImport.table.groupKey")}</TableHead>
                      <TableHead>{t("schemaImport.table.outcome")}</TableHead>
                      <TableHead>{t("schemaImport.table.fieldsCreated")}</TableHead>
                      <TableHead>{t("schemaImport.table.reason")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.groups.map((group) => (
                      <TableRow key={`${group.entityTypeKey}:${group.stableKey}`}>
                        <TableCell className="whitespace-nowrap">{group.entityTypeKey}</TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {group.stableKey}
                        </TableCell>
                        <TableCell>
                          <Badge variant={outcomeBadgeVariant(group.outcome)}>
                            {outcomeLabel(group.outcome)}
                          </Badge>
                        </TableCell>
                        <TableCell>{group.fieldsCreated}</TableCell>
                        {/* The reason is rendered PER ROW, never summarized away -- this is the one
                            outcome an admin needs to act on (rename or delete the conflict, then
                            re-import). */}
                        <TableCell className="text-sm text-muted-foreground">
                          {group.reason ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={disabled}>
            {t("common.close")}
          </Button>
          <Button onClick={vm.importSchema} disabled={disabled || !vm.canImport}>
            <Upload className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {vm.isImporting ? t("schemaImport.importing") : t("schemaImport.importAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
