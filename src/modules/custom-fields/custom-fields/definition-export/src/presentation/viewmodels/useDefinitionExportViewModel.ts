/**
 * Definition Export ViewModel — Wave 6 row 6.4
 *
 * State for the definition-export dialog: the entity-type scope picker, the export request itself,
 * and the browser download of the resulting workbook.
 *
 * NOT built on `useCrudViewModel`, for the same reason `useFieldGroupViewModel` is not: there is no
 * paginated table here, no search, no sort and no per-row modal. There is one scope choice and one
 * action.
 *
 * THE EXPORT IS A MUTATION EVEN THOUGH THE ENDPOINT IS A GET
 * ---------------------------------------------------------
 * Modelled with `useMutation` rather than `useQuery` because it is a COMMAND the admin issues, with a
 * side effect they can see: a file lands on their disk. A query would re-run on window focus, on
 * remount and on cache invalidation, and each re-run would silently download another copy of a
 * multi-megabyte workbook. The backend handler is deliberately not `ICacheable` for the same reason —
 * an export is a point-in-time snapshot someone is about to act on.
 *
 * FOUR OUTCOMES, NOT TWO
 * ----------------------
 * The dialog has to be able to say four different things, and collapsing any of them into "failed"
 * is what makes an export feel broken when it is not:
 *
 *  1. **Downloaded.** The normal case, reported with the file's name and size so the admin can
 *     recognise it in their downloads folder.
 *  2. **REFUSED for size.** A 422 that is not a fault: past `MaxExportRows` the server refuses rather
 *     than truncating, because a workbook that stops at row 10,000 reads as a complete answer. Gets
 *     its own message naming the cap and the remedy.
 *  3. **Captured by a download manager.** The stream was taken by IDM or similar, which means the
 *     file WAS saved. Reported as a success, because it is one.
 *  4. **Failed.** Everything else, with the server's own sentence when there is one.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import { getCustomFieldsContainer } from "../../../../di";
import { getDefinitionExportContainer } from "../../../di";
import {
  MAX_EXPORT_ROWS,
  type DefinitionExport,
} from "../../domain/entities/DefinitionExport";
import { DefinitionExportError } from "../../domain/entities/DefinitionExportError";

/**
 * The scope picker's "every entity type" sentinel.
 *
 * `""` rather than a word like `"all"`, because the empty string is what the service already treats
 * as "send no `entityTypeKey` parameter". A sentinel spelled `"all"` would be indistinguishable from
 * an entity type genuinely keyed `all` and would reach the server as a scoped export of a
 * non-existent type, which it answers with a 422. Same sentinel convention as `ALL_ENTITY_TYPES_VALUE`
 * in the schema-export picker and `NO_FIELD_GROUP_VALUE` in the field-group picker.
 */
export const ALL_ENTITY_TYPES_VALUE = "";

/**
 * Writes the workbook to the user's disk.
 *
 * Exported so a caller can substitute it and so its two non-obvious properties are testable:
 *
 *  1. **The bytes are the SERVER's bytes.** Unlike the schema export — where the file is rebuilt from
 *     the entity by the mapper's reverse direction — this client never composes, re-encodes or even
 *     opens the payload. An `.xlsx` is a ZIP container; anything this code did to it could only
 *     corrupt it.
 *  2. **The blob URL is released immediately.** A URL held open pins the whole workbook in memory for
 *     the lifetime of the document, and at the handler's ten-thousand-definition ceiling that is not
 *     a rounding error.
 */
export function downloadDefinitionExport(exported: DefinitionExport): void {
  const url = URL.createObjectURL(exported.blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exported.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useDefinitionExportViewModel() {
  const { definitionExportRepository } = getDefinitionExportContainer();
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();

  const [entityTypeKey, setEntityTypeKey] = useState<string>(ALL_ENTITY_TYPES_VALUE);
  /**
   * The last export handed over, so the dialog can report what was downloaded.
   *
   * Held separately from `exportMutation.data` because it must survive a scope change: switching the
   * picker after an export should not blank the line the admin is reading to check which file landed.
   */
  const [lastExport, setLastExport] = useState<DefinitionExport | null>(null);
  /**
   * Set when an external download manager took the stream.
   *
   * Tracked separately from the mutation's own error state because it is NOT an error — the file was
   * captured — and the dialog must not show a failure over a download that succeeded.
   */
  const [wasIntercepted, setWasIntercepted] = useState(false);

  // Shares CustomFieldListView's, useFieldGroupViewModel's and the schema dialog's cache entry
  // (identical key and repository method), so opening this dialog from the definitions screen costs
  // no extra request.
  const {
    data: entityTypes = [],
    isLoading: isEntityTypesLoading,
    isError: isEntityTypesError,
    refetch: refetchEntityTypes,
  } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  const exportMutation = useMutation({
    mutationFn: async (scope: string) => {
      const exported = await definitionExportRepository.exportDefinitions(
        scope.length > 0 ? scope : null
      );

      // NO FILE FOR A PAYLOAD THAT IS NOT A WORKBOOK. Zero bytes, or a body announcing itself as
      // HTML or JSON, means something between this client and the API answered instead of the
      // handler. Saved as `.xlsx` that produces a file a spreadsheet refuses to open with no
      // explanation, which is a worse outcome than being told the export did not work.
      if (exported.isUsable) {
        downloadDefinitionExport(exported);
      }

      return exported;
    },
    onSuccess: (exported) => {
      setWasIntercepted(false);
      setLastExport(exported);

      if (!exported.isUsable) {
        toast.error({ title: t("definitionExport.toast.unexpectedFile") });
        return;
      }

      toast.success(t("definitionExport.toast.exported"));
    },
    onError: (error: Error) => {
      // Captured by a download manager: the file is on disk. Reported as the success it is, and the
      // stale result line is cleared because the descriptor for this run never existed.
      if (error instanceof DownloadInterceptedError) {
        setWasIntercepted(true);
        setLastExport(null);
        toast.success(t("definitionExport.toast.intercepted"));
        return;
      }

      setWasIntercepted(false);

      // The refusal, in its own words. Never the generic failure title: nothing is broken, a retry
      // will not help, and the remedy is a choice only the admin can make. Our own copy rather than
      // the server's sentence -- both say the same thing, but ours is guaranteed to be present and
      // in the reader's language even if the error body could not be recovered from the blob.
      if (error instanceof DefinitionExportError && error.isRowCapRefusal) {
        toast.error({
          title: t("definitionExport.refused.title"),
          description: t("definitionExport.refused.description", { max: MAX_EXPORT_ROWS }),
        });
        return;
      }

      toast.error({
        title: t("definitionExport.toast.exportFailed"),
        // The server's own message when there is one -- an unregistered entity type comes back as a
        // 422 naming the key, which is far more useful than the generic title above.
        description: error.message || undefined,
      });
    },
  });

  const { mutate } = exportMutation;

  const exportDefinitions = useCallback(() => {
    mutate(entityTypeKey);
  }, [mutate, entityTypeKey]);

  /**
   * Clears the previous result when the scope changes.
   *
   * Without this, choosing a different entity type leaves the old "downloaded ...xlsx" line standing
   * under the new scope, which reads as a report about a file nobody has asked for yet.
   */
  const changeEntityTypeKey = useCallback((next: string) => {
    setEntityTypeKey(next);
    setLastExport(null);
    setWasIntercepted(false);
  }, []);

  /** Resets the dialog to its opening state, for the close handler. */
  const reset = useCallback(() => {
    setEntityTypeKey(ALL_ENTITY_TYPES_VALUE);
    setLastExport(null);
    setWasIntercepted(false);
    exportMutation.reset();
  }, [exportMutation]);

  const error = exportMutation.error;

  /**
   * True when the server REFUSED the export for exceeding the row cap.
   *
   * Surfaced as its own flag so the dialog can render a refusal instead of an error, without having
   * to know what an `errorCode` is.
   */
  const isRowCapRefused = useMemo(
    () => error instanceof DefinitionExportError && error.isRowCapRefusal,
    [error]
  );

  const errorMessage = useMemo(() => (error instanceof Error ? error.message : null), [error]);

  return {
    entityTypes,
    isEntityTypesLoading,
    isEntityTypesError,
    refetchEntityTypes,

    entityTypeKey,
    setEntityTypeKey: changeEntityTypeKey,

    exportDefinitions,
    isExporting: exportMutation.isPending,
    // A download the manager captured is not an error, so it is excluded here rather than being
    // filtered again at every render site.
    isError: exportMutation.isError && !wasIntercepted,
    isRowCapRefused,
    errorMessage,
    wasIntercepted,

    lastExport,
    /** The server's cap, so the dialog can name it without importing the data layer. */
    maxExportRows: MAX_EXPORT_ROWS,
    reset,
  };
}
