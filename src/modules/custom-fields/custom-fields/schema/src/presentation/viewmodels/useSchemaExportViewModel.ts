/**
 * Schema Export ViewModel — Wave 6 row 6.5
 *
 * State for the schema-export dialog: the entity-type scope picker, the export request itself, and
 * the browser download of the resulting bundle.
 *
 * NOT built on `useCrudViewModel`, for the same reason `useFieldGroupViewModel` is not: there is no
 * paginated table here, no search, no sort and no per-row modal. There is one scope choice and one
 * action.
 *
 * THE EXPORT IS A MUTATION EVEN THOUGH THE ENDPOINT IS A GET
 * ---------------------------------------------------------
 * It is modelled with `useMutation` rather than `useQuery` because it is a COMMAND the admin issues,
 * with a side effect the user can see (a file lands on their disk). A query would re-run on window
 * focus, on remount and on cache invalidation, and each of those re-runs would silently download
 * another copy of the file. The backend handler is deliberately not `ICacheable` for the same
 * reason: an export is a point-in-time snapshot someone is about to diff.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { getSchemaExportContainer } from "../../../di";
import { SchemaBundleMapper } from "../../data/mappers/SchemaBundleMapper";
import type { SchemaBundle } from "../../domain/entities/SchemaBundle";

/**
 * The scope picker's "every entity type" sentinel.
 *
 * `""` rather than a word like `"all"`, because the empty string is what the service already treats
 * as "send no `entityTypeKey` parameter". A sentinel spelled `"all"` would be indistinguishable from
 * an entity type genuinely keyed `all` and would reach the server as a scoped export of a
 * non-existent type, which it answers with a 422. Same sentinel convention as
 * `NO_FIELD_GROUP_VALUE` in the field-group picker.
 */
export const ALL_ENTITY_TYPES_VALUE = "";

/**
 * Writes a bundle to the user's disk as a JSON file.
 *
 * Exported so a caller can substitute it and so its two non-obvious properties are testable:
 *
 *  1. **The file content comes from the MAPPER's reverse direction**, not from the raw response. The
 *     entity is the only thing that crosses the repository boundary, so `toModel(...).toJson()` is
 *     the single place the wire shape is reconstructed — and the single place a dropped property
 *     would truncate the file. `SchemaBundleMapper.test.ts` pins that round trip.
 *  2. **Two-space indent and a trailing newline.** The bundle exists to be diffed and committed;
 *     minified JSON diffs as one enormous line, and a missing final newline makes every text tool
 *     complain about the last one.
 */
export function downloadSchemaBundle(bundle: SchemaBundle): void {
  const json = `${JSON.stringify(SchemaBundleMapper.toModel(bundle).toJson(), null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = bundle.suggestedFileName();
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Released immediately. A blob URL held open pins the whole serialized bundle in memory for the
  // lifetime of the document, and a schema export can be several megabytes at the handler's
  // ten-thousand-definition ceiling.
  URL.revokeObjectURL(url);
}

export function useSchemaExportViewModel() {
  const { schemaExportRepository } = getSchemaExportContainer();
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();

  const [entityTypeKey, setEntityTypeKey] = useState<string>(ALL_ENTITY_TYPES_VALUE);
  /**
   * The last bundle handed over, so the dialog can report what was in it.
   *
   * Held separately from `exportMutation.data` because it must survive a scope change: switching the
   * picker after an export should not blank the "exported N definitions" line the admin is reading.
   */
  const [lastBundle, setLastBundle] = useState<SchemaBundle | null>(null);

  // Shares CustomFieldListView's and useFieldGroupViewModel's cache entry (identical key and
  // repository method), so opening this dialog from that screen costs no extra request.
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
      const bundle = await schemaExportRepository.exportSchema(
        scope.length > 0 ? scope : null
      );

      // NO FILE FOR AN EMPTY BUNDLE. An empty result has two causes the client cannot tell apart --
      // the scope really has no fields, or every field in it is restricted from this caller and the
      // handler filtered them out silently. Handing over an empty file lets someone conclude the
      // schema is empty when it is only invisible to them, so the dialog says so instead.
      if (!bundle.isEmpty) {
        downloadSchemaBundle(bundle);
      }

      return bundle;
    },
    onSuccess: (bundle) => {
      setLastBundle(bundle);
      if (bundle.isEmpty) {
        toast.info(t("schemaExport.toast.nothingToExport"));
        return;
      }
      toast.success(t("schemaExport.toast.exported"));
    },
    onError: (error: Error) => {
      toast.error({
        title: t("schemaExport.toast.exportFailed"),
        // The server's own message when there is one -- an unregistered entity type comes back as a
        // 422 naming the key, which is far more useful than the generic title above.
        description: error.message || undefined,
      });
    },
  });

  const { mutate } = exportMutation;

  const exportSchema = useCallback(() => {
    mutate(entityTypeKey);
  }, [mutate, entityTypeKey]);

  /**
   * Clears the previous result when the scope changes.
   *
   * Without this, choosing a different entity type leaves the old "exported 42 definitions" line
   * standing under the new scope, which reads as a report about a bundle nobody has asked for yet.
   */
  const changeEntityTypeKey = useCallback((next: string) => {
    setEntityTypeKey(next);
    setLastBundle(null);
  }, []);

  /** Resets the dialog to its opening state, for the close handler. */
  const reset = useCallback(() => {
    setEntityTypeKey(ALL_ENTITY_TYPES_VALUE);
    setLastBundle(null);
    exportMutation.reset();
  }, [exportMutation]);

  const errorMessage = useMemo(
    () => (exportMutation.error instanceof Error ? exportMutation.error.message : null),
    [exportMutation.error]
  );

  return {
    entityTypes,
    isEntityTypesLoading,
    isEntityTypesError,
    refetchEntityTypes,

    entityTypeKey,
    setEntityTypeKey: changeEntityTypeKey,

    exportSchema,
    isExporting: exportMutation.isPending,
    isError: exportMutation.isError,
    errorMessage,

    lastBundle,
    reset,
  };
}
