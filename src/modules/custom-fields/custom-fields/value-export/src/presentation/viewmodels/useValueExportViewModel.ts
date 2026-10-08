/**
 * Value Export ViewModel — Wave 6 row 6.4's completion
 *
 * State for the value-export dialog: the entity-type picker, the export request itself, and the
 * browser download of the resulting workbook.
 *
 * NOT built on `useCrudViewModel`, for the same reason `useDefinitionExportViewModel` is not: there
 * is no paginated table here, no search, no sort and no per-row modal. There is one scope choice and
 * one action.
 *
 * THE PICKER IS MANDATORY, AND FILTERED TO WHAT THE CALLER CAN ACTUALLY EXPORT
 * -------------------------------------------------------------------------------
 * Two differences from `useDefinitionExportViewModel`'s picker, both forced by this endpoint's own
 * shape:
 *
 *  1. **No "all entity types" sentinel.** `entityTypeKey` is a required route segment on this
 *     endpoint — a values export enumerates actual records through the entity-lookup registry, which
 *     has no "every type at once" shape to ask for. So the picker starts EMPTY and the export action
 *     stays disabled until something is chosen, rather than defaulting to a working "everything"
 *     scope.
 *  2. **Filtered to entity types this caller can view.** This route is gated on
 *     `{PermissionResource}.view` for the CHOSEN entity type, not the single static
 *     `custom-fields.export` permission the sibling exports (and their buttons) check. Offering an
 *     entity type the caller cannot view would be a dead end the dialog can see coming — the
 *     entity-type catalog already reports each type's `permissionResource` for exactly this kind of
 *     translation (see `useRestrictableCustomFieldKeys`, the first consumer of that field). An entity
 *     type without a reported resource is EXCLUDED rather than offered on faith: this client cannot
 *     verify it would succeed, and a guaranteed-403 option is worse than an absent one. The server
 *     remains the actual authority — `isForbidden` below still exists for the case a stale permission
 *     cache disagrees with a fresher server check.
 *
 * THE EXPORT IS A MUTATION EVEN THOUGH THE ENDPOINT IS A GET
 * ---------------------------------------------------------
 * Same reasoning as every export in this module: it is a COMMAND with a visible side effect (a file
 * on disk), so a query's re-run-on-focus/remount/invalidation behaviour would silently re-download a
 * multi-megabyte workbook.
 *
 * FIVE OUTCOMES
 * -------------
 *  1. **Downloaded.** The normal case.
 *  2. **REFUSED for size.** The handler's cell-count ceiling (owners × visible fields).
 *  3. **FORBIDDEN.** The caller lacks view access to the entity type they picked -- unreachable
 *     through the filtered picker on a fresh permission set, reachable on a stale one.
 *  4. **Captured by a download manager.** Reported as the success it is.
 *  5. **Failed.** Everything else.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permission";
import { toast } from "@core/hooks/use-enhanced-toast";
import { DownloadInterceptedError } from "@core/errors/download-intercepted";
import type { EntityTypeInfo } from "../../../../custom-field/src/domain/entities/CustomField";
import { getCustomFieldsContainer } from "../../../../di";
import { getValueExportContainer } from "../../../di";
import { MAX_EXPORT_ROWS, type ValueExport } from "../../domain/entities/ValueExport";
import { ValueExportError } from "../../domain/entities/ValueExportError";

/**
 * True when the caller could plausibly export this entity type's values.
 *
 * Exported so `ValueExportButton` can apply the identical rule when deciding whether to render at
 * all -- the button and the dialog's picker must agree on what "nothing to export" means, or the
 * button would promise an action the picker then has nothing to offer for.
 *
 * An entity type that has not reported `permissionResource` yet (optional on the wire until Tier 1
 * slice 7) is excluded rather than guessed at -- see this file's header.
 */
export function isEntityTypeViewableForValueExport(
  entityType: EntityTypeInfo,
  hasPermission: (permission: string) => boolean
): boolean {
  return !!entityType.permissionResource && hasPermission(`${entityType.permissionResource}.view`);
}

/**
 * Documentation for module export
 */
export function useValueExportViewModel() {
  const { valueExportRepository } = getValueExportContainer();
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const { has: hasPermission } = usePermissions();

  const [entityTypeKey, setEntityTypeKey] = useState<string>("");
  /**
   * The last export handed over, so the dialog can report what was downloaded. Held separately from
   * `exportMutation.data` for the same reason `useDefinitionExportViewModel.lastExport` is: it must
   * survive a scope change without going stale under the new choice.
   */
  const [lastExport, setLastExport] = useState<ValueExport | null>(null);
  /** Set when an external download manager took the stream -- NOT an error, the file was captured. */
  const [wasIntercepted, setWasIntercepted] = useState(false);

  // Shares CustomFieldListView's and every sibling export dialog's cache entry (identical key and
  // repository method), so opening this dialog costs no extra request on a warm cache.
  const {
    data: allEntityTypes = [],
    isLoading: isEntityTypesLoading,
    isError: isEntityTypesError,
    refetch: refetchEntityTypes,
  } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  // Deliberately NOT memoized: `hasPermission` is a fresh closure from `usePermissions()` every
  // render (same shape `useRestrictableCustomFieldKeys` reasons about for its own filter), and the
  // cost is a linear scan of an hour-cached list of a few dozen entity types.
  const entityTypes = allEntityTypes.filter((item) =>
    isEntityTypeViewableForValueExport(item, hasPermission)
  );

  const exportMutation = useMutation({
    mutationFn: async (scope: string) => {
      const exported = await valueExportRepository.exportValues(scope);

      // NO FILE FOR A PAYLOAD THAT IS NOT A WORKBOOK -- same usability gate as the definitions
      // export. Saved as `.xlsx` that would produce a file a spreadsheet refuses to open, which is a
      // worse outcome than being told the export did not work.
      if (exported.isUsable) {
        downloadValueExport(exported);
      }

      return exported;
    },
    onSuccess: (exported) => {
      setWasIntercepted(false);
      setLastExport(exported);

      if (!exported.isUsable) {
        toast.error({ title: t("valueExport.toast.unexpectedFile") });
        return;
      }

      toast.success(t("valueExport.toast.exported"));
    },
    onError: (error: Error) => {
      // Captured by a download manager: the file is on disk. Reported as the success it is.
      if (error instanceof DownloadInterceptedError) {
        setWasIntercepted(true);
        setLastExport(null);
        toast.success(t("valueExport.toast.intercepted"));
        return;
      }

      setWasIntercepted(false);

      // The row-cap REFUSAL, in its own words -- never the generic failure title: nothing is
      // broken, and the remedy (fewer records or fewer fields on this entity type) is not something
      // a retry fixes.
      if (error instanceof ValueExportError && error.isRowCapRefusal) {
        toast.error({
          title: t("valueExport.refused.title"),
          description: t("valueExport.refused.description", { max: MAX_EXPORT_ROWS }),
        });
        return;
      }

      // FORBIDDEN -- the caller cannot view this entity type's records. Also not a fault: the
      // filtered picker makes this unreachable on a fresh permission set, so reaching it at all means
      // the cached permission list is stale relative to the server's.
      if (error instanceof ValueExportError && error.isForbidden) {
        toast.error({ title: t("valueExport.forbidden.title") });
        return;
      }

      toast.error({
        title: t("valueExport.toast.exportFailed"),
        // The server's own message when there is one -- an unregistered entity type comes back as a
        // 422 naming the key, which is far more useful than the generic title above.
        description: error.message || undefined,
      });
    },
  });

  const { mutate } = exportMutation;

  const exportValues = useCallback(() => {
    // Guards the mandatory picker: the Export button is disabled until a choice is made, so this is
    // a safety net against firing a request with no scope, not the primary gate.
    if (entityTypeKey.length === 0) return;
    mutate(entityTypeKey);
  }, [mutate, entityTypeKey]);

  /**
   * Clears the previous result when the scope changes.
   *
   * Without this, choosing a different entity type leaves the old "downloaded ...xlsx" line
   * standing under the new scope, which reads as a report about a file nobody has asked for yet.
   */
  const changeEntityTypeKey = useCallback((next: string) => {
    setEntityTypeKey(next);
    setLastExport(null);
    setWasIntercepted(false);
  }, []);

  /** Resets the dialog to its opening state, for the close handler. */
  const reset = useCallback(() => {
    setEntityTypeKey("");
    setLastExport(null);
    setWasIntercepted(false);
    exportMutation.reset();
  }, [exportMutation]);

  const error = exportMutation.error;

  const isRowCapRefused = useMemo(
    () => error instanceof ValueExportError && error.isRowCapRefusal,
    [error]
  );

  const isForbidden = useMemo(
    () => error instanceof ValueExportError && error.isForbidden,
    [error]
  );

  const errorMessage = useMemo(() => (error instanceof Error ? error.message : null), [error]);

  return {
    /** Entity types the caller can actually export -- already filtered, see this file's header. */
    entityTypes,
    isEntityTypesLoading,
    isEntityTypesError,
    refetchEntityTypes,
    /**
     * True once entity types have loaded and NONE of them are viewable by this caller. The dialog's
     * real empty state, distinct from "still loading" and from "failed to load".
     */
    hasNoViewableEntityTypes:
      !isEntityTypesLoading && !isEntityTypesError && entityTypes.length === 0,

    entityTypeKey,
    setEntityTypeKey: changeEntityTypeKey,

    exportValues,
    isExporting: exportMutation.isPending,
    // A download the manager captured is not an error, so it is excluded here rather than being
    // filtered again at every render site.
    isError: exportMutation.isError && !wasIntercepted,
    isRowCapRefused,
    isForbidden,
    errorMessage,
    wasIntercepted,

    lastExport,
    /** The server's ceiling, so the dialog can name it without importing the data layer. */
    maxExportRows: MAX_EXPORT_ROWS,
    reset,
  };
}

/**
 * Writes the workbook to the user's disk.
 *
 * Exported so a caller can substitute it and so its two non-obvious properties are testable -- same
 * two properties `downloadDefinitionExport` documents:
 *
 *  1. **The bytes are the SERVER's bytes.** This client never composes, re-encodes or opens the
 *     payload.
 *  2. **The blob URL is released immediately.**
 */
export function downloadValueExport(exported: ValueExport): void {
  const url = URL.createObjectURL(exported.blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exported.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
