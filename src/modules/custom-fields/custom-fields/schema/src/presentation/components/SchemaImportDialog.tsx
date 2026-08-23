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
 * as `AttachmentUploader`'s own control) rather than a bare native `<input type="file">` sitting
 * unstyled in the dialog -- this module already has a file-picking convention elsewhere in the app
 * and there is no reason to invent a plainer one here.
 */
"use client";

import React from "react";
import { AlertCircle, FileJson, Info, Upload, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { SchemaImportGroupOutcome } from "../../domain/entities/SchemaImportResult";
import { useSchemaImportViewModel } from "../viewmodels/useSchemaImportViewModel";

export interface SchemaImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes: number): string {
  const kib = bytes / 1024;
  if (kib < 1) return `${bytes} B`;
  if (kib < 1024) return `${kib.toFixed(1)} KB`;
  return `${(kib / 1024).toFixed(1)} MB`;
}

function outcomeBadgeVariant(outcome: SchemaImportGroupOutcome): "success" | "warning" | "destructive" {
  if (outcome === "Created") return "success";
  if (outcome === "Skipped") return "warning";
  return "destructive";
}

export function SchemaImportDialog({ open, onOpenChange }: SchemaImportDialogProps) {
  const { t } = useI18n();
  const vm = useSchemaImportViewModel();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

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

          {/* The file picker: a drop zone, click-to-open or drag-and-drop, keyboard-operable. */}
          {!vm.selectedFile ? (
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled || undefined}
              aria-label={t("schemaImport.dropZoneLabel")}
              data-testid="schema-import-drop-zone"
              className={cn(
                "cursor-pointer rounded-nx-lg border-2 border-dashed p-6 text-center transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "focus-visible:border-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none",
                dragOver && "border-nx-accent bg-nx-accent-wash",
                !dragOver && "border-nx-line hover:border-nx-accent",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={() => !disabled && inputRef.current?.click()}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!disabled) handleFiles(e.dataTransfer.files);
              }}
            >
              <Upload className="mx-auto mb-2 h-6 w-6 text-nx-ink-3" aria-hidden="true" />
              <p className="text-sm text-nx-ink-2">{t("schemaImport.dropZoneLabel")}</p>
              <p className="mt-1 text-xs text-nx-ink-3">{t("schemaImport.dropZoneHint")}</p>
              <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label={t("schemaImport.chooseFile")}
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
                disabled={disabled}
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-2"
              data-testid="schema-import-selected-file"
            >
              <FileJson className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-nx-ink">{vm.selectedFile.name}</p>
                <span className="text-xs text-nx-ink-3">
                  {formatFileSize(vm.selectedFile.size)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                {t("schemaImport.changeFile")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={vm.clearFile}
                disabled={disabled}
                aria-label={t("schemaImport.removeFile")}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              {/* Kept mounted (hidden) so "change file" can reopen the same picker without
                  re-rendering the whole drop zone back in. */}
              <input
                ref={inputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                aria-label={t("schemaImport.chooseFile")}
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
                disabled={disabled}
              />
            </div>
          )}

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
