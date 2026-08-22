/**
 * OptionSet draft-version editor -- P-4 (shared option sets)
 *
 * The working copy for ONE draft version's option list: add, remove, reorder, edit a field,
 * activate/deactivate, validate, and save. Deliberately a state hook over a plain array rather than
 * anything table-aware, so every rule below can be exercised without rendering a row.
 *
 * SAVING IS A FULL REPLACE, AND THAT SHAPES EVERYTHING HERE
 * --------------------------------------------------------
 * `PUT versions/{versionId}` takes the ENTIRE item list. An item missing from the payload is an item
 * deleted from the version -- there is no delta, no patch, and no way to say "leave the rest alone".
 * Three consequences run through this file:
 *
 *  1. THE WORKING COPY MUST BE COMPLETE BEFORE IT CAN BE SAVED. A summary version row carries
 *     `items === null` (not loaded), and saving from one would replace a real list with an empty one
 *     -- exactly the destructive edit the backend's itemless-version refusal exists to prevent. So
 *     the editor hydrates ONLY from a version whose items actually loaded, and refuses to save
 *     otherwise. `isReady` is that distinction, and it is the single most load-bearing flag here.
 *
 *  2. `sortOrder` IS THE ARRAY INDEX, assigned at save time. Not a stored per-row value the user
 *     edits. Row 5.2's reorder work learned this the hard way: several rows routinely share the same
 *     stored sort value, and swapping two equal numbers is a no-op that reads as a broken button.
 *     Renumbering the whole list from its displayed order cannot have that failure mode.
 *
 *  3. NOTHING IS PARTIALLY LIVE. A rejected save changed nothing at all, which is what makes it safe
 *     to restructure a list wholesale instead of nibbling at it -- and is why the failure toast says
 *     so.
 *
 * WHAT THIS EDITOR WILL NEVER DO
 * -----------------------------
 * Send `FieldOptionStatus.Deleted`. Deactivating is the withdrawal action: a deactivated option
 * stops being offered and still renders on every record already holding it. Deleting one would leave
 * those records needing a value-by-value remap-or-blank decision that no screen is entitled to take
 * on an administrator's behalf. The draft row type carries `OptionSetItemWritableStatus`, which
 * excludes it at the type level; `OptionSetItem.writableStatus` degrades an inbound `Deleted` to
 * `Deactivated` on hydration; and `OptionSetRepository` throws if one ever arrives through a cast.
 * Three independent stops, none of them redundant.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { getCustomFieldsContainer } from "../../../../di";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetItem } from "../../domain/entities/OptionSetItem";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";
import type { OptionSetItemWritableStatus } from "../../data/models/OptionSetModel";
import {
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemIssue,
} from "./optionSetItemRules";
import {
  optionSetDetailQueryKey,
  optionSetVersionQueryKey,
  reportOptionSetRefusal,
  type OptionSetRefusal,
} from "./useOptionSetViewModel";

/**
 * The rules, re-exported from `optionSetItemRules` -- which is where they live, and where they live
 * ONLY.
 *
 * This hook owns the Save for an OPENED draft (`PUT versions/{versionId}`), while
 * `OptionSetItemsEditor`'s caller owns the Save for a NEW one (`POST {id}/versions`). Both write the
 * same wire shape to the same server validator. When each path carried its own copy of these, the
 * copies drifted -- one trimmed all five text fields, the other trimmed two -- so the same rows
 * produced two different request bodies depending on which Save was pressed. There is one
 * implementation now, and adding a rule to it applies to both buttons.
 */
export {
  OPTION_SET_ITEM_COLOR_MAX_LENGTH,
  OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
  toOptionSetItemInputs,
  type OptionSetItemIssue,
  type OptionSetItemIssueCode,
  type OptionSetItemRuleRow,
} from "./optionSetItemRules";

/**
 * One row of the working copy.
 *
 * Not `OptionSetItem`: an entity is a server fact, and half of what a half-typed row holds is not a
 * fact yet. Three differences are deliberate.
 *
 * `rowId` is a CLIENT-ONLY identity. React needs a stable key per row and the obvious candidates all
 * fail: `key` is empty on a fresh row and duplicated while the admin is mid-rename, `id` does not
 * exist yet for a row added here, and the array index changes under every reorder. Every operation
 * below addresses rows by `rowId` for the same reason.
 *
 * The nullable text fields are `string`, not `string | null`. A controlled `<input>` cannot take
 * null, so the null/empty-string conversion has to happen SOMEWHERE; doing it once at the payload
 * boundary (`toOptionSetItemInputs`) beats sprinkling `?? ""` through the table.
 *
 * There is no `sortOrder`. See point 2 of the file header.
 */
export interface OptionSetItemDraft {
  /** Stable client-side row identity. Never sent. */
  rowId: string;
  /** The server's item id, or null for a row added in this session. Never sent either -- a full
   *  replace is matched by `key`, not by id -- but kept so a view can tell new rows from existing
   *  ones (a key rename on an existing row orphans values; on a new row it is free). */
  id: string | null;
  key: string;
  labelEn: string;
  labelAr: string;
  color: string;
  iconKey: string;
  status: OptionSetItemWritableStatus;
}

/** The fields `updateItem` may change. `rowId` and `id` are identity, not content. */
export type OptionSetItemDraftChanges = Partial<Omit<OptionSetItemDraft, "rowId" | "id">>;

/**
 * Row-id generator.
 *
 * A module-level counter rather than `crypto.randomUUID()`: this value is never persisted, never
 * compared across sessions and never sent, so uniqueness within one page load is the entire
 * requirement -- and a counter is deterministic, which makes the tests readable.
 */
let rowIdSequence = 0;
function nextRowId(): string {
  rowIdSequence += 1;
  return `option-row-${rowIdSequence}`;
}

/**
 * A blank row, ready to type into.
 *
 * Starts `Active`, because that is what "add an option" means -- adding one already withdrawn would
 * be a strange default, and `Deactivated` is reachable in one click afterwards.
 *
 * Exported because a create-draft flow needs the identical row shape and would otherwise reimplement
 * it: `POST {id}/versions` refuses an empty item list, so a new version has to be seeded with at
 * least one row before it can exist at all.
 */
export function createEmptyOptionSetItemDraft(): OptionSetItemDraft {
  return {
    rowId: nextRowId(),
    id: null,
    key: "",
    labelEn: "",
    labelAr: "",
    color: "",
    iconKey: "",
    status: "Active",
  };
}

/**
 * Entity -> working-copy row.
 *
 * Reads `writableStatus`, never `status`: a version can legitimately hold a `Deleted` item from
 * before this UI existed, and a full replace re-submits every row it keeps. Degrading it here means
 * the round trip cannot ask the backend to re-delete an option whose stored values were never
 * remapped. Nothing is resurrected by this -- a `Deactivated` option is still absent from every
 * picker.
 */
export function toOptionSetItemDraft(item: OptionSetItem): OptionSetItemDraft {
  return {
    rowId: nextRowId(),
    id: item.id,
    key: item.key,
    labelEn: item.labelEn,
    labelAr: item.labelAr ?? "",
    color: item.color ?? "",
    iconKey: item.iconKey ?? "",
    status: item.writableStatus,
  };
}

export interface UseOptionSetVersionEditorArgs {
  /**
   * The version's parent set. Required for the system-managed and ownership gates -- both are facts
   * about the SET, and the version cannot answer either. Null while the detail is still loading, in
   * which case saving is refused rather than attempted ungated.
   */
  set: OptionSet | null;
  /**
   * The version being edited. Must have come from `getVersion` (items loaded); a summary row from
   * the detail response cannot be saved from. See point 1 of the file header.
   */
  version: OptionSetVersion | null;
  /** Called after a successful save, with the saved version's id. */
  onSaved?: (versionId: string) => void;
}

export function useOptionSetVersionEditor({
  set,
  version,
  onSaved,
}: UseOptionSetVersionEditorArgs) {
  const { optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  const canUpdate = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE);
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  const [rows, setRows] = useState<OptionSetItemDraft[]>([]);
  /**
   * The rows as last loaded or last saved. The comparison target for `isDirty`, and what `reset`
   * restores -- kept as state rather than derived from `version`, because after a successful save
   * the baseline is the just-sent working copy, not anything the query has produced yet.
   */
  const [baseline, setBaseline] = useState<OptionSetItemDraft[]>([]);
  /**
   * Which version id the current `rows` were hydrated from, or null for none.
   *
   * This is what stops a background refetch from discarding the admin's typing. The query
   * invalidations around this screen produce a NEW `OptionSetVersion` instance with the SAME id on
   * every refetch; without this guard, an effect keyed on the version object would re-hydrate from
   * the server and silently undo unsaved edits.
   */
  const [hydratedVersionId, setHydratedVersionId] = useState<string | null>(null);

  useEffect(() => {
    // Already hydrated from this exact version -- leave the working copy alone. See the field's doc.
    if (version && version.id === hydratedVersionId) return;

    if (version?.hasLoadedItems) {
      // Ascending by sortOrder, because the editor's own contract is that position IS order.
      // `Array.prototype.sort` is stable, so items sharing a sortOrder keep the server's relative
      // order instead of being shuffled -- which matters, since nothing stops a version from
      // holding several items at 0.
      const hydrated = [...version.items]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toOptionSetItemDraft);
      setRows(hydrated);
      setBaseline(hydrated);
      setHydratedVersionId(version.id);
      return;
    }

    // No version, or one whose items are still in flight. Either way the PREVIOUS version's rows
    // have to go: showing version 3's options under version 4's heading is worse than showing none,
    // and it is the state from which an accidental save would write the wrong list.
    setHydratedVersionId(null);
    setRows((current) => (current.length === 0 ? current : []));
    setBaseline((current) => (current.length === 0 ? current : []));
  }, [version, hydratedVersionId]);

  /**
   * Whether the working copy is a complete, saveable picture of the version.
   *
   * All three conjuncts are needed: a version must exist, its items must have loaded, and the rows
   * on screen must be the ones hydrated FROM it (the effect above runs after render, so there is a
   * frame where a newly arrived version has not been copied in yet).
   */
  const isReady = version !== null && version.hasLoadedItems && hydratedVersionId === version.id;

  /** The request body this working copy would send. Exposed so a view can preview or reuse it. */
  const payload = useMemo(() => toOptionSetItemInputs(rows), [rows]);

  /**
   * Whether the working copy differs from what the server holds.
   *
   * Compared as PAYLOADS, not as rows, and that is the interesting part: it means a whitespace-only
   * edit is correctly not dirty (it would send an identical body after trimming), while a pure
   * reorder correctly IS dirty (every `sortOrder` moves). `JSON.stringify` is sound here only
   * because both sides are built by the same mapper and therefore carry the same property order --
   * a hand-built object on either side would break that assumption.
   */
  const isDirty = useMemo(
    () => JSON.stringify(payload) !== JSON.stringify(toOptionSetItemInputs(baseline)),
    [payload, baseline]
  );

  const issues = useMemo(() => collectOptionSetItemIssues(rows), [rows]);
  const isValid = issues.length === 0;

  /** Issues that belong to a row, indexed by `rowId`, for inline rendering beside the inputs. */
  const rowIssues = useMemo(() => {
    const byRow: Record<string, OptionSetItemIssue[]> = {};
    for (const issue of issues) {
      if (issue.rowId === null) continue;
      (byRow[issue.rowId] ??= []).push(issue);
    }
    return byRow;
  }, [issues]);

  /** Issues about the list as a whole -- today only `atLeastOne`. */
  const listIssues = useMemo(() => issues.filter((issue) => issue.rowId === null), [issues]);

  const describeIssue = useCallback(
    (issue: OptionSetItemIssue) => t(optionSetItemIssueMessageKey(issue.code), issue.params),
    [t]
  );

  // ── Row operations ────────────────────────────────────────────────────────────────────────────

  const addItem = useCallback(() => {
    setRows((current) => [...current, createEmptyOptionSetItemDraft()]);
  }, []);

  /**
   * Drop a row from the working copy.
   *
   * This is a WORKING-COPY removal, not an option deletion: nothing is sent until save, and what a
   * save sends is a full replace. Removing a row that already exists on the server therefore does
   * delete that option -- which is why a view offers this on rows the admin just added and offers
   * `deactivateItem` on the rest. `optionSet.items.deleteUnavailable` is the sentence that explains
   * the difference where a delete button would otherwise sit.
   */
  const removeItem = useCallback((rowId: string) => {
    setRows((current) => current.filter((row) => row.rowId !== rowId));
  }, []);

  const updateItem = useCallback((rowId: string, changes: OptionSetItemDraftChanges) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, ...changes } : row))
    );
  }, []);

  /**
   * Withdraw an option: it stops being offered on new records and keeps rendering on every record
   * already holding it. The ONLY withdrawal this editor performs -- see the file header.
   */
  const deactivateItem = useCallback((rowId: string) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, status: "Deactivated" } : row))
    );
  }, []);

  const reactivateItem = useCallback((rowId: string) => {
    setRows((current) =>
      current.map((row) => (row.rowId === rowId ? { ...row, status: "Active" } : row))
    );
  }, []);

  // ── Reordering ────────────────────────────────────────────────────────────────────────────────
  //
  // Position in the array is the whole truth; `sortOrder` is derived at save time. So a move is a
  // splice, never an arithmetic swap of two stored numbers -- see point 2 of the file header for the
  // bug that avoids.

  const indexOfRow = useCallback(
    (rowId: string) => rows.findIndex((row) => row.rowId === rowId),
    [rows]
  );

  /**
   * Whether a row can move in a direction -- the single source of truth for both a button's
   * `disabled` state and its handler's own guard, so a disabled control and a no-op handler can
   * never disagree. Same pattern as the Field Groups screen.
   */
  const canMoveUp = useCallback((rowId: string) => indexOfRow(rowId) > 0, [indexOfRow]);

  const canMoveDown = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      return index >= 0 && index < rows.length - 1;
    },
    [indexOfRow, rows.length]
  );

  const swap = useCallback((index: number, targetIndex: number) => {
    setRows((current) => {
      if (index < 0 || targetIndex < 0) return current;
      if (index >= current.length || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const moveUp = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      if (index <= 0) return;
      swap(index, index - 1);
    },
    [indexOfRow, swap]
  );

  const moveDown = useCallback(
    (rowId: string) => {
      const index = indexOfRow(rowId);
      if (index < 0 || index >= rows.length - 1) return;
      swap(index, index + 1);
    },
    [indexOfRow, rows.length, swap]
  );

  /**
   * Drag-drop reorder, kept in lockstep with the buttons.
   *
   * Drag is the SECOND way to do this, never the only one: the Move up / Move down pair is what
   * satisfies WCAG 2.2 SC 2.5.7, and `optionSet.items.moveUp` / `moveDown` exist as distinct
   * accessible names for exactly that reason.
   */
  const moveBefore = useCallback((draggedRowId: string, targetRowId: string) => {
    if (draggedRowId === targetRowId) return;
    setRows((current) => {
      const from = current.findIndex((row) => row.rowId === draggedRowId);
      const to = current.findIndex((row) => row.rowId === targetRowId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  /** Discard every unsaved change, back to what was last loaded or saved. */
  const reset = useCallback(() => {
    setRows(baseline);
  }, [baseline]);

  // ── Save ──────────────────────────────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: ({ versionId, items }: { versionId: string; items: OptionSetItemInput[] }) =>
      optionSetRepository.updateVersion(versionId, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: optionSetVersionQueryKey(variables.versionId) });
      // The version chain shows an item count per version, so the detail is stale too. The set LIST
      // is not: neither `versionCount` nor `publishedVersionId` moves when a draft's items change.
      if (set) {
        queryClient.invalidateQueries({ queryKey: optionSetDetailQueryKey(set.id) });
      }
      toast.success(t("optionSet.toast.versionSaved"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.versionSaveFailed"),
        description: err.message || undefined,
      });
    },
  });

  /**
   * Why saving is refused right now, or null when it is allowed.
   *
   * Ordered so the reason shown is the one the admin can act on. Permission first (nothing else
   * matters if the action is not theirs), then the two facts about the set that refuse every write,
   * then the version's own state, then the working copy's own problems. `invalid` carries the FIRST
   * issue's locale path so the toast names a real problem rather than "check the form".
   */
  const saveRefusal = useMemo((): OptionSetRefusal | null => {
    if (!canUpdate) {
      return { reason: "permission", messageKey: "optionSet.permissions.update" };
    }
    if (!set) {
      return { reason: "notLoaded", messageKey: "optionSet.detailLoadFailed" };
    }
    if (!set.isContentEditable) {
      return { reason: "systemManaged", messageKey: "optionSet.refusals.systemManaged" };
    }
    if (set.isPlatformOwned && !isPlatformContext) {
      return { reason: "platformOwned", messageKey: "optionSet.refusals.platformOwned" };
    }
    if (!version) {
      return { reason: "notLoaded", messageKey: "optionSet.versionLoadFailed" };
    }
    if (!version.isEditable) {
      return { reason: "notDraft", messageKey: "optionSet.refusals.notDraft" };
    }
    // The guard that matters most: an unloaded version's working copy is empty, and saving it would
    // replace a real option list with nothing. See point 1 of the file header.
    if (!isReady) {
      return { reason: "notLoaded", messageKey: "optionSet.versionLoadFailed" };
    }
    const firstIssue = issues[0];
    if (firstIssue) {
      return {
        reason: "invalid",
        messageKey: optionSetItemIssueMessageKey(firstIssue.code),
        params: firstIssue.params,
      };
    }
    return null;
  }, [canUpdate, set, isPlatformContext, version, isReady, issues]);

  /**
   * Whether the Save control should be enabled.
   *
   * `isDirty` is a separate conjunct from `saveRefusal` on purpose: having nothing to save is not a
   * refusal, and rendering "you can't do this" for it would be a lie. A view shows
   * `optionSet.items.unsavedChanges` while dirty and simply leaves the button quiet otherwise.
   */
  const canSave = saveRefusal === null && isDirty && !saveMutation.isPending;

  /**
   * Send the working copy as a full replace of the version's item list.
   *
   * Resolves true when the version now matches the working copy -- which includes the no-op case,
   * where there was nothing to send. Never throws: the mutation's `onError` already reported the
   * failure, and rethrowing would either double-report it or force a do-nothing `catch` at every
   * call site.
   */
  const save = useCallback(async (): Promise<boolean> => {
    if (saveRefusal) {
      reportOptionSetRefusal(saveRefusal, t);
      return false;
    }
    // `saveRefusal === null` already guarantees this, but the narrowing is not visible to the
    // compiler across a memo boundary.
    if (!version) return false;

    if (!isDirty) return true;

    try {
      await saveMutation.mutateAsync({ versionId: version.id, items: payload });
      // The working copy IS the server's state now. Re-baselining here rather than waiting for the
      // refetch keeps the dirty indicator honest even if the invalidated query is slow.
      setBaseline(rows);
      onSaved?.(version.id);
      return true;
    } catch {
      return false;
    }
  }, [saveRefusal, version, isDirty, saveMutation, payload, rows, onSaved, t]);

  return {
    // ── Working copy ──
    rows,
    isReady,
    isDirty,
    /** The exact body a save would send. Also what a create-draft flow passes to `createVersion`. */
    payload,

    // ── Validation ──
    issues,
    rowIssues,
    listIssues,
    isValid,
    describeIssue,

    // ── Row operations ──
    addItem,
    removeItem,
    updateItem,
    deactivateItem,
    reactivateItem,
    reset,

    // ── Reordering ──
    canMoveUp,
    canMoveDown,
    moveUp,
    moveDown,
    moveBefore,

    // ── Save ──
    save,
    canSave,
    saveRefusal,
    isSaving: saveMutation.isPending,
  };
}
