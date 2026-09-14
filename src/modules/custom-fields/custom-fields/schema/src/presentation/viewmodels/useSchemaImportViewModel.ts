/**
 * Schema Import ViewModel — Wave 6 row 6.5's import half
 *
 * State for the schema-import dialog: picking a local file, parsing and shape-checking it, posting
 * it, and rendering the per-group Created/Skipped/Failed breakdown.
 *
 * TWO SEPARATE FAILURE SURFACES, NOT ONE
 * -------------------------------------------
 * A picked file can be wrong in a way this client catches on its own (not JSON at all, or not
 * shaped enough like a bundle to be worth sending) BEFORE any request is made -- `pickError`, held
 * outside the mutation entirely because it was never a server round trip. Once a request IS made,
 * it can still be refused WHOLE-CALL (`SchemaImportError`) or succeed with some groups Skipped or
 * Failed inside a 200 (`SchemaImportResult`). Three different things; conflating any two would make
 * this dialog say something that did not happen.
 *
 * THE IMPORT IS A MUTATION, LIKE EVERY OTHER WRITE IN THIS MODULE
 * -------------------------------------------------------------------
 * Modelled with `useMutation`: it is a COMMAND with a visible, real side effect (field groups and
 * fields get created), never something a query's re-run-on-focus/remount behaviour should repeat.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getSchemaExportContainer } from "../../../di";
import {
  MAX_IMPORT_ITEMS,
  looksLikeSchemaBundlePayload,
  type SchemaImportBundlePayload,
} from "../../data/models/SchemaImportModel";
import { SchemaImportError } from "../../domain/entities/SchemaImportError";

/**
 * Reads a File's text.
 *
 * `FileReader` fallback for the same reason `DefinitionExportService.readBlobText` needs one:
 * jsdom's `Blob`/`File` do not implement the promise-based `.text()` accessor in the version this
 * suite runs on, and a real user-selected `File` always does.
 */
async function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") return file.text();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsText(file);
  });
}

export function useSchemaImportViewModel() {
  const { schemaImportRepository } = getSchemaExportContainer();
  const { t } = useI18n();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBundle, setParsedBundle] = useState<SchemaImportBundlePayload | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const importMutation = useMutation({
    mutationFn: (bundle: SchemaImportBundlePayload) => schemaImportRepository.importSchema(bundle),
    onSuccess: (result) => {
      if (result.isEmpty) {
        toast.info(t("schemaImport.toast.nothingToImport"));
        return;
      }
      toast.success(
        t("schemaImport.toast.imported", {
          created: result.createdCount,
          skipped: result.skippedCount,
          failed: result.failedCount,
        })
      );
    },
    onError: (error: Error) => {
      // The item-count REFUSAL, in its own words -- never the generic failure title: nothing is
      // broken, and the remedy (split the file, import each piece separately) is not a retry.
      if (error instanceof SchemaImportError && error.isTooManyRows) {
        toast.error({
          title: t("schemaImport.refused.title"),
          description: t("schemaImport.refused.description", { max: MAX_IMPORT_ITEMS }),
        });
        return;
      }

      toast.error({
        title: t("schemaImport.toast.importFailed"),
        // The server's own message when there is one -- it already names the specific shape
        // problem (an invalid key, an unsupported format version, a duplicate group) far more
        // usefully than a generic title could.
        description: error.message || undefined,
      });
    },
  });

  const { reset: resetMutation } = importMutation;

  /**
   * Picks a file: reads it, parses it as JSON, and shape-checks it -- all locally, before any
   * request is made. Replaces whatever was picked (and any result or error it produced) before,
   * the same way `useDefinitionExportViewModel.setEntityTypeKey` clears a stale result on a new
   * choice.
   */
  const pickFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setParsedBundle(null);
      setPickError(null);
      resetMutation();
      setIsReadingFile(true);

      try {
        const text = await readFileText(file);

        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          setPickError(t("schemaImport.pickError.notJson"));
          return;
        }

        if (!looksLikeSchemaBundlePayload(parsed)) {
          setPickError(t("schemaImport.pickError.notABundle"));
          return;
        }

        setParsedBundle(parsed);
      } catch {
        setPickError(t("schemaImport.pickError.couldNotRead"));
      } finally {
        setIsReadingFile(false);
      }
    },
    [resetMutation, t]
  );

  /** Clears the picked file entirely, for the "choose a different file" control. */
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setParsedBundle(null);
    setPickError(null);
    resetMutation();
  }, [resetMutation]);

  const { mutate } = importMutation;

  const importSchema = useCallback(() => {
    // Guards the mandatory picker: the Import button is disabled until a file has been picked AND
    // parsed successfully, so this is a safety net against firing a request with nothing to send.
    if (!parsedBundle) return;
    mutate(parsedBundle);
  }, [mutate, parsedBundle]);

  /** Resets the dialog to its opening state, for the close handler. */
  const reset = useCallback(() => {
    setSelectedFile(null);
    setParsedBundle(null);
    setPickError(null);
    resetMutation();
  }, [resetMutation]);

  const error = importMutation.error;

  const isRefused = useMemo(
    () => error instanceof SchemaImportError && error.isTooManyRows,
    [error]
  );

  const errorMessage = useMemo(() => (error instanceof Error ? error.message : null), [error]);

  return {
    selectedFile,
    isReadingFile,
    pickError,
    pickFile,
    clearFile,

    /** True once a file has been picked, read and shape-checked, with nothing to fix first. */
    canImport: parsedBundle !== null && !importMutation.isPending,

    importSchema,
    isImporting: importMutation.isPending,
    isError: importMutation.isError,
    isRefused,
    errorMessage,

    result: importMutation.data ?? null,
    /** The server's ceiling, so the dialog can name it without importing the data layer. */
    maxImportItems: MAX_IMPORT_ITEMS,
    reset,
  };
}
