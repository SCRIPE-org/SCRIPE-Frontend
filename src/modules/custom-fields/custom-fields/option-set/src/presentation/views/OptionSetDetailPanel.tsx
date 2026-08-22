/**
 * OptionSetDetailPanel -- one option set's VERSION CHAIN, and the editor for its draft (P-4)
 *
 * The second half of the Option Sets screen. `OptionSetListView` owns which set is selected; this
 * panel owns everything below that choice: the chain of versions newest first, the one version the
 * admin has opened, that version's options, and the two writes that live at version level (create a
 * draft, publish a draft).
 *
 * WHY THE VERSION CHAIN IS NOT A ROUTE OF ITS OWN
 * ----------------------------------------------
 * `GET {id}` returns the set AND its versions in one response, and every version-level decision is
 * made by comparing versions to each other -- "is there already a draft", "which one is published",
 * "what does publishing this one deprecate". Splitting the chain onto a second route would mean
 * re-fetching the same detail there and re-deriving those comparisons from a single row's point of
 * view. A panel beside the list keeps the comparison visible, which is the whole reason it exists.
 *
 * THE SECOND READ THIS PANEL TRIGGERS BUT DOES NOT PERFORM
 * -------------------------------------------------------
 * The detail response carries versions as SUMMARY rows -- `OptionSetVersion.hasLoadedItems === false`
 * and `items` deliberately `null`, because `items` on a summary means "not loaded", never
 * "loaded and empty". Editing or even displaying a version's options therefore needs a second read,
 * `GET versions/{versionId}`, and only this panel knows which version the admin opened.
 *
 * The SELECTION is this panel's (`openVersionId`); the FETCH is not. It lives in
 * `useOptionSetVersionQuery`, in `presentation/viewmodels/`, which is where every other container
 * call site in this module lives. A view that reached past its viewmodels into the DI container could
 * not be mounted or unit-tested without a DI stub, which is the concrete price of crossing that
 * boundary -- see that hook's own header for the rest of the reasoning, including why the query key
 * has to come from the factory `useOptionSetVersionEditor` invalidates against.
 *
 * A SAVE IS A FULL REPLACE, SO AN UNLOADED VERSION IS NEVER RENDERED AS AN EMPTY ONE
 * ---------------------------------------------------------------------------------
 * `PUT versions/{versionId}` sends the entire item list. A working copy hydrated from a version whose
 * items never arrived is empty, and saving it would replace a real list with nothing. The editor hook
 * refuses that (`saveRefusal.reason === "notLoaded"`), and this panel refuses to render a "no options
 * yet" empty state before `editor.isReady` -- an empty table an admin believes is the truth is how
 * that destructive save gets requested in the first place.
 *
 * WHY PUBLISH LIVES ON THE OPENED VERSION AND NOT ON EVERY CHAIN ROW
 * -----------------------------------------------------------------
 * Publishing swaps which list every bound field offers. Putting the button on the row means it can be
 * pressed without the options ever having been on screen; putting it under the opened version means
 * the list being made live is the list being looked at. The confirmation then names both numbers --
 * the one going live and the incumbent being deprecated -- because the deprecation is the half an
 * admin does not ask for and has to agree to.
 *
 * i18n: reads `optionSet.*` and `common.*`. The SCREEN that mounts this must already have called
 * `useModuleLocales(() => import("../../../locales"), "customFieldOptionSets")`; this panel does not
 * register the dictionary itself, so it cannot be mounted outside that screen and render keys.
 */
"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { SectionState } from "@core/ui/section-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { formatDateTime } from "@core/common/utils";
import { FilePlus2, History, ListOrdered, Lock, Rocket } from "lucide-react";
import {
  OptionSetItemsEditor,
  collectOptionSetItemIssues,
  newOptionSetDraftItem,
  toOptionSetItemInputs as draftRowsToItemInputs,
  type OptionSetDraftItem,
} from "../components/OptionSetItemsEditor";
import { OptionSetStatusBadge, OptionSetStatusHint } from "../components/OptionSetStatusBadge";
import { type OptionSetRefusal } from "../viewmodels/useOptionSetViewModel";
import { useOptionSetVersionQuery } from "../viewmodels/useOptionSetVersionQuery";
import {
  useOptionSetVersionEditor,
  type OptionSetItemDraft,
  type OptionSetItemDraftChanges,
} from "../viewmodels/useOptionSetVersionEditor";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";

/* ── Bridging the items table to the editor hook ──────────────────────────────────────────────── */

/**
 * One mutation the options table asked for.
 *
 * `OptionSetItemsEditor` is a CONTROLLED table: it reports every change as the complete next list,
 * with no statement of what changed. `useOptionSetVersionEditor` is the opposite -- it owns the
 * working copy and exposes named operations (`addItem`, `moveBefore`, `deactivateItem`, ...) so that
 * each rule it enforces has exactly one entry point. Both contracts are deliberate, and neither
 * should bend: a full-replace save must send precisely what the admin sees, and the hook's rules must
 * not be reachable around the side.
 *
 * So the two are joined by naming the delta instead of assigning it. Recovering the operation is
 * sound because the table commits ONE operation per call -- every handler in it (`addRow`,
 * `removeRow`, `moveRow`, `setTextField`, `setStatus`) routes through a single `commitRows` exit and
 * changes exactly one thing. This union is that operation, and `diffTableCommit` below is the only
 * place a next-list is read.
 */
type OptionSetTableCommit =
  /** A blank row was appended. The hook mints its own `rowId`, so the table's is discarded. */
  | { kind: "add" }
  | { kind: "remove"; rowId: string }
  /** `rowId` moved to where `beforeRowId` currently sits -- a splice, matching `moveBefore`. */
  | { kind: "move"; rowId: string; beforeRowId: string }
  | { kind: "update"; rowId: string; changes: OptionSetItemDraftChanges }
  /** Nothing changed -- e.g. a re-render committing an identical list. */
  | { kind: "none" };

/**
 * The fields that differ between one table row and one working-copy row, or null when none do.
 *
 * The two row types disagree about how "no value" is spelled -- the table uses `null` for the three
 * nullable wire fields, the working copy uses `""` so every input stays controlled -- so the
 * comparison normalises to the working copy's spelling. Without that, clearing a label would look
 * like a change from `""` to `null` forever and re-dispatch on every keystroke.
 */
function diffDraftFields(
  current: OptionSetItemDraft,
  next: OptionSetDraftItem
): OptionSetItemDraftChanges | null {
  const changes: OptionSetItemDraftChanges = {};

  if (next.key !== current.key) changes.key = next.key;
  if (next.labelEn !== current.labelEn) changes.labelEn = next.labelEn;
  if ((next.labelAr ?? "") !== current.labelAr) changes.labelAr = next.labelAr ?? "";
  if ((next.color ?? "") !== current.color) changes.color = next.color ?? "";
  if ((next.iconKey ?? "") !== current.iconKey) changes.iconKey = next.iconKey ?? "";
  if (next.status !== current.status) changes.status = next.status;

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Names the single operation that turned `current` into `next`.
 *
 * Order matters and is not arbitrary: length first (an add or a remove is unambiguous and would
 * otherwise read as a wholesale reorder), then row identity (a reorder keeps every `rowId` and only
 * moves it), then field content. `sortOrder` is never compared -- the table re-derives it from
 * position on every commit, so it changes on edits that changed nothing else, and the working copy
 * does not carry it at all.
 */
function diffTableCommit(
  current: readonly OptionSetItemDraft[],
  next: readonly OptionSetDraftItem[]
): OptionSetTableCommit {
  if (next.length > current.length) return { kind: "add" };

  if (next.length < current.length) {
    const survivors = new Set(next.map((row) => row.rowId));
    const dropped = current.find((row) => !survivors.has(row.rowId));
    return dropped ? { kind: "remove", rowId: dropped.rowId } : { kind: "none" };
  }

  const movedIndex = next.findIndex((row, index) => row.rowId !== current[index].rowId);
  if (movedIndex >= 0) {
    return {
      kind: "move",
      rowId: next[movedIndex].rowId,
      beforeRowId: current[movedIndex].rowId,
    };
  }

  for (let index = 0; index < next.length; index += 1) {
    const changes = diffDraftFields(current[index], next[index]);
    if (changes) return { kind: "update", rowId: next[index].rowId, changes };
  }

  return { kind: "none" };
}

/**
 * Working-copy rows -> table rows.
 *
 * `sortOrder` is the array index, assigned here and re-derived by the table on its own commits: the
 * displayed order IS the submitted order, and no stored per-row number is ever trusted. The empty
 * strings the working copy uses for absent optional text become `null`, which is the table's spelling
 * for "this option has no colour" as opposed to "its colour is the empty string".
 */
function toTableRows(rows: readonly OptionSetItemDraft[]): OptionSetDraftItem[] {
  return rows.map((row, index) => ({
    rowId: row.rowId,
    id: row.id,
    key: row.key,
    labelEn: row.labelEn,
    labelAr: row.labelAr.length > 0 ? row.labelAr : null,
    color: row.color.length > 0 ? row.color : null,
    iconKey: row.iconKey.length > 0 ? row.iconKey : null,
    sortOrder: index,
    status: row.status,
  }));
}

/* ── Props ────────────────────────────────────────────────────────────────────────────────────── */

export interface OptionSetDetailPanelProps {
  /**
   * The selected set, or null while its detail is loading or failed. Required by the editor hook for
   * the system-managed and ownership gates, neither of which a version can answer.
   */
  set: OptionSet | null;
  /** The version chain, newest first, exactly as the server ordered it. Summary rows. */
  versions: readonly OptionSetVersion[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /**
   * Why creating a draft version is refused, or null when it is allowed -- `vm.refuseCreateVersion`
   * already applied to this set.
   *
   * The REFUSAL OBJECT rather than a boolean or a sentence, because this panel branches on
   * `reason`: `systemManaged` and `platformOwned` replace the version-level controls with an
   * explanation of the set's provenance, while `permission` simply hides them (an admin who cannot
   * act is owed no lecture about ISO lists). Same reasoning the viewmodel gives for typing refusals
   * as an enum.
   */
  createVersionRefusal: OptionSetRefusal | null;
  /** `vm.refusePublish` bound to this set. Null means publishing this version is allowed. */
  refusePublish: (version: OptionSetVersion) => OptionSetRefusal | null;
  /** `vm.describeRefusal` -- turns any refusal above into its translated sentence. */
  describeRefusal: (refusal: OptionSetRefusal) => string;
  /** `vm.createVersion` bound to this set. Resolves to the new version's id, or null. */
  onCreateVersion: (items: OptionSetItemInput[]) => Promise<string | null>;
  /** `vm.publishVersion` bound to this set. Resolves to whether it happened. */
  onPublishVersion: (version: OptionSetVersion) => Promise<boolean>;
  isCreatingVersion: boolean;
  isPublishing: boolean;
}

/* ── The panel ────────────────────────────────────────────────────────────────────────────────── */

/**
 * Presentation UI component rendering one option set's version chain and its draft editor.
 *
 * Mount it KEYED ON THE SET ID. Which version is open, and any half-typed new draft, are state about
 * one set; carrying either across a change of set would show version 3 of the previous set under the
 * new set's heading -- and is the state from which a save writes the wrong list. Remounting is how
 * that is made impossible rather than merely handled.
 */
export function OptionSetDetailPanel({
  set,
  versions,
  isLoading,
  isError,
  onRetry,
  createVersionRefusal,
  refusePublish,
  describeRefusal,
  onCreateVersion,
  onPublishVersion,
  isCreatingVersion,
  isPublishing,
}: OptionSetDetailPanelProps) {
  const { t, language } = useI18n();
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const chainHeadingId = `${baseId}-chain-heading`;
  const openHeadingId = `${baseId}-open-heading`;
  const newDraftHeadingId = `${baseId}-new-draft-heading`;

  /** Which version the admin opened, or null. Reset by remount when the set changes -- see the doc. */
  const [openVersionId, setOpenVersionId] = useState<string | null>(null);
  /** The rows of a NOT-YET-CREATED draft, or null when the create form is closed. */
  const [newDraftRows, setNewDraftRows] = useState<OptionSetDraftItem[] | null>(null);
  const [pendingPublish, setPendingPublish] = useState<OptionSetVersion | null>(null);

  const versionQuery = useOptionSetVersionQuery(openVersionId);
  const openVersion = versionQuery.data ?? null;

  const editor = useOptionSetVersionEditor({ set, version: openVersion });

  /**
   * The table's rows, derived from the hook's working copy on every render.
   *
   * Derived, never mirrored into state: the hook is the single owner of the working copy, and a second
   * copy here would be a second answer to "what will be saved" -- the exact ambiguity a full-replace
   * save cannot afford.
   */
  const tableRows = useMemo(() => toTableRows(editor.rows), [editor.rows]);

  /**
   * Translates one table commit into the hook operation that performs it.
   *
   * `deactivateItem` / `reactivateItem` are preferred over `updateItem` for a status flip even though
   * all three would produce the same row, because withdrawal is the one operation in this editor with
   * a rule attached to it (a deactivated option keeps rendering on records that already hold it) and
   * routing it through the named method keeps that rule's entry point single.
   */
  const handleTableChange = useCallback(
    (next: OptionSetDraftItem[]) => {
      const commit = diffTableCommit(editor.rows, next);

      switch (commit.kind) {
        case "add":
          editor.addItem();
          return;
        case "remove":
          editor.removeItem(commit.rowId);
          return;
        case "move":
          editor.moveBefore(commit.rowId, commit.beforeRowId);
          return;
        case "update":
          if (commit.changes.status === "Deactivated") {
            editor.deactivateItem(commit.rowId);
            return;
          }
          if (commit.changes.status === "Active") {
            editor.reactivateItem(commit.rowId);
            return;
          }
          editor.updateItem(commit.rowId, commit.changes);
          return;
        case "none":
          return;
      }
    },
    [editor]
  );

  /* ── Read-only provenance ───────────────────────────────────────────────────────────────────── */

  /**
   * Whether the set itself is off limits, and which sentence says so.
   *
   * Read off the viewmodel's create-draft refusal rather than re-deriving platform context here:
   * ownership is a fact about the CALLER, the viewmodel already resolved it once for every write, and
   * a second derivation in a view is how a screen ends up offering what the server refuses.
   * `isPlatformMaintained` is checked directly because it is a fact about the SET, and the entity
   * answers it definitively for every caller including a Super Admin.
   */
  const isPlatformMaintained = set?.isPlatformMaintained === true;
  const isPlatformOwnedElsewhere = createVersionRefusal?.reason === "platformOwned";

  /* ── The version chain ──────────────────────────────────────────────────────────────────────── */

  /**
   * Whether this set already holds a draft.
   *
   * A new draft is only offered when there is none. Not a server rule -- the backend will happily
   * create a second draft -- but a UI one: two drafts of the same set give an admin no way to tell
   * which one publishing will make live, and the draft that already exists is the one they were
   * working on. Offering "create draft" beside an existing draft row is an invitation to abandon work
   * by accident.
   */
  const existingDraft = useMemo(
    () => versions.find((version) => version.isDraft) ?? null,
    [versions]
  );

  const canOfferNewDraft = createVersionRefusal === null && existingDraft === null;

  const startNewDraft = useCallback(() => {
    // Seeded with one blank row, not zero: `POST {id}/versions` refuses an itemless version, and an
    // empty form whose Save is disabled from the first frame reads as broken rather than as unfinished.
    setNewDraftRows([newOptionSetDraftItem()]);
    setOpenVersionId(null);
  }, []);

  const newDraftIssues = useMemo(
    () => (newDraftRows ? collectOptionSetItemIssues(newDraftRows) : []),
    [newDraftRows]
  );

  const handleCreateVersion = useCallback(async () => {
    if (!newDraftRows) return;
    // The table's OWN rule, not a second implementation of it: a Save this screen enabled where the
    // table shows a problem is how a form ends up submitting what the server refuses.
    if (collectOptionSetItemIssues(newDraftRows).length > 0) return;

    const createdId = await onCreateVersion(draftRowsToItemInputs(newDraftRows));
    if (createdId === null) return;

    // Only on success. A refused create leaves the typed rows exactly where they are -- the viewmodel
    // has already said why through its own toast, and discarding the work would add a second loss.
    setNewDraftRows(null);
    setOpenVersionId(createdId);
  }, [newDraftRows, onCreateVersion]);

  /* ── The opened version ─────────────────────────────────────────────────────────────────────── */

  /**
   * Whether the opened version's options are editable HERE.
   *
   * Derived from the editor's own refusal rather than re-checked, so the table and the Save button
   * cannot disagree about what is editable. `invalid` is excluded from the blocking set on purpose:
   * a working copy with a validation problem is still being edited -- turning the table read-only the
   * moment a key is blanked would trap the admin with no way to fix it.
   */
  const blockingSaveRefusal =
    editor.saveRefusal !== null && editor.saveRefusal.reason !== "invalid"
      ? editor.saveRefusal
      : null;

  const isOpenVersionEditable =
    openVersion !== null &&
    openVersion.isEditable &&
    editor.isReady &&
    blockingSaveRefusal === null;

  /**
   * The already-translated sentence the options table renders in place of its controls.
   *
   * Composed here because only this panel knows which reason applies, which is exactly what
   * `OptionSetItemsEditor.readOnlyNote` documents. The version's own status wins over a set-level
   * refusal: an admin looking at version 2 of an editable set needs to hear "this version is
   * Deprecated", not "you lack permission", when both happen to be true.
   */
  const openVersionReadOnlyNote = useMemo(() => {
    if (openVersion === null || isOpenVersionEditable) return null;

    if (!openVersion.isEditable) {
      return t("optionSet.versions.readOnlyNote", {
        status: t(`optionSet.versions.status.${openVersion.status}`),
      });
    }
    if (isPlatformMaintained) return t("optionSet.refusals.systemManaged");
    if (blockingSaveRefusal) return describeRefusal(blockingSaveRefusal);
    return null;
  }, [
    openVersion,
    isOpenVersionEditable,
    isPlatformMaintained,
    blockingSaveRefusal,
    describeRefusal,
    t,
  ]);

  const publishRefusal = openVersion ? refusePublish(openVersion) : null;

  const handleConfirmPublish = useCallback(async () => {
    if (!pendingPublish) return;
    const published = await onPublishVersion(pendingPublish);
    // Closed only on success: a refused publish leaves the dialog up with the sentence that says why
    // still on screen behind it, rather than dismissing itself as though something happened.
    if (published) setPendingPublish(null);
  }, [pendingPublish, onPublishVersion]);

  /**
   * The publish confirmation's body, in one of two genuinely different shapes.
   *
   * With an incumbent, publishing is a SWAP -- the named version is deprecated in the same operation,
   * and that half is what the admin is really agreeing to. With none, nothing is superseded, and
   * `descriptionFirst` carries no `{current}` precisely so a sentence cannot invent a deprecation
   * that never happened.
   */
  const publishDescription = useMemo(() => {
    if (!pendingPublish) return "";
    const number = pendingPublish.versionNumber;

    if (set?.publishedVersionId && set.publishedVersionNumber !== null) {
      return t("optionSet.versions.publishConfirm.description", {
        number,
        current: set.publishedVersionNumber,
      });
    }
    return t("optionSet.versions.publishConfirm.descriptionFirst", { number });
  }, [pendingPublish, set, t]);

  /* ── Render ─────────────────────────────────────────────────────────────────────────────────── */

  if (isError) {
    return <ErrorMessage message={t("optionSet.detailLoadFailed")} onRetry={onRetry} />;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-nx-md border border-nx-line p-4"
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-base font-semibold text-nx-ink">
          {set ? set.displayLabel(language) : t("optionSet.versions.title")}
        </h2>
        {set ? (
          <p className="text-xs text-nx-ink-2">
            {/* The key, always LTR and monospaced: it is the machine identity an export and a binding
                quote, not translated copy. */}
            <span className="font-mono" dir="ltr">
              {set.stableKey}
            </span>
            {set.description ? <span className="ms-2">{set.description}</span> : null}
          </p>
        ) : null}
      </div>

      {isPlatformMaintained ? (
        <Alert variant="warning">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.readOnly.systemManaged.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.readOnly.systemManaged.description")}</AlertDescription>
        </Alert>
      ) : isPlatformOwnedElsewhere ? (
        <Alert variant="info">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.readOnly.platformOwned.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.readOnly.platformOwned.description")}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── The chain ── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 id={chainHeadingId} className="text-sm font-semibold text-nx-ink">
              {t("optionSet.versions.title")}
            </h3>
            <p className="text-xs text-nx-ink-2">{t("optionSet.versions.description")}</p>
          </div>
          {canOfferNewDraft && newDraftRows === null ? (
            <Button type="button" size="sm" variant="secondary" onClick={startNewDraft}>
              <FilePlus2 className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {t("optionSet.versions.createDraft")}
            </Button>
          ) : null}
        </div>

        {/* Said beside the button, not inside a tooltip: a new draft copies NOTHING forward, and an
            admin who expects the published list to be duplicated will publish a shorter one. */}
        {canOfferNewDraft ? (
          <p className="text-xs text-nx-ink-3">{t("optionSet.versions.createDraftHint")}</p>
        ) : null}

        <SectionState isLoading={isLoading} skeletonType="rows" skeletonRows={3} isEmpty={false}>
          {versions.length === 0 ? (
            <EmptyState
              icon={History}
              size="sm"
              title={t("optionSet.versions.noItems.title")}
              description={t("optionSet.versions.noItems.description")}
            />
          ) : (
            <div className="overflow-x-auto rounded-nx-md border border-nx-line">
              <Table aria-labelledby={chainHeadingId}>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("optionSet.columns.versions")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("optionSet.versions.publishedAt")}</TableHead>
                    <TableHead>{t("optionSet.items.title")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium tabular-nums">
                        {t("optionSet.versions.versionLabel", { number: version.versionNumber })}
                      </TableCell>
                      <TableCell>
                        <OptionSetStatusBadge kind="version" status={version.status} />
                      </TableCell>
                      <TableCell className="text-sm text-nx-ink-2" dir="ltr">
                        {version.publishedAtUtc
                          ? formatDateTime(version.publishedAtUtc)
                          : t("optionSet.versions.notPublished")}
                      </TableCell>
                      <TableCell className="text-sm text-nx-ink-2">
                        {/* `itemCount`, never `items.length`: these are summary rows, whose `items` is
                            null by contract, so a length here would read 0 for every version. */}
                        {t("optionSet.versions.itemCount", { count: version.itemCount })}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          type="button"
                          size="sm"
                          variant={openVersionId === version.id ? "secondary" : "ghost"}
                          onClick={() => {
                            setOpenVersionId(version.id);
                            // The create form and an opened version are two answers to "what am I
                            // looking at". Opening one closes the other.
                            setNewDraftRows(null);
                          }}
                          // Row-qualified, so N rows are N distinguishable controls rather than N
                          // buttons all called "Open".
                          aria-label={t("optionSet.versions.openVersion", {
                            number: version.versionNumber,
                          })}
                        >
                          {t("common.open")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionState>
      </div>

      {/* ── A draft being created ── */}
      {newDraftRows !== null ? (
        <div
          className="bg-nx-raised-2/40 flex flex-col gap-3 rounded-nx-md border border-nx-line p-3"
          aria-labelledby={newDraftHeadingId}
          role="group"
        >
          <h3 id={newDraftHeadingId} className="text-sm font-semibold text-nx-ink">
            {t("optionSet.versions.createDraft")}
          </h3>

          <OptionSetItemsEditor
            items={newDraftRows}
            onItemsChange={setNewDraftRows}
            isEditable
            isSaving={isCreatingVersion}
            // Not dirty: nothing exists on the server to diverge from yet, and
            // `items.unsavedChanges` promises that saving is what makes a draft exist -- which for a
            // version that has never been created would be a confusing thing to read twice.
            isDirty={false}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreateVersion}
              disabled={isCreatingVersion || newDraftIssues.length > 0}
            >
              {t("optionSet.versions.saveDraft")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setNewDraftRows(null)}
              disabled={isCreatingVersion}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── The opened version ── */}
      {openVersionId !== null ? (
        <div className="flex flex-col gap-3 rounded-nx-md border border-nx-line p-3">
          {versionQuery.isError ? (
            <ErrorMessage
              size="sm"
              message={t("optionSet.versionLoadFailed")}
              onRetry={() => versionQuery.refetch()}
            />
          ) : (
            <SectionState
              // `!editor.isReady` is part of the loading condition, not a separate branch: the hook
              // hydrates its working copy in an effect, so there is one frame after the version
              // arrives where the rows are still the previous version's. Rendering the table then
              // would show the wrong list, and rendering "no options yet" would invite a save that
              // wipes the real one.
              isLoading={versionQuery.isLoading || openVersion === null || !editor.isReady}
              skeletonType="rows"
              skeletonRows={4}
              isEmpty={false}
            >
              {openVersion ? (
                /* Named from its own version heading, the same way the create-draft block above is:
                   this group holds the options table and the Publish button, so a screen-reader user
                   arriving at either needs to hear WHICH version they are about to change. The role
                   and the label sit on THIS div rather than on the wrapper outside `SectionState`
                   because `openHeadingId`'s heading is rendered in this arm only -- an
                   `aria-labelledby` pointing at an id that does not exist yet during the load names
                   nothing at all, which is worse than the bare div it replaced. */
                <div className="flex flex-col gap-3" role="group" aria-labelledby={openHeadingId}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 id={openHeadingId} className="text-sm font-semibold text-nx-ink">
                          {t("optionSet.versions.versionLabel", {
                            number: openVersion.versionNumber,
                          })}
                        </h3>
                        <OptionSetStatusBadge kind="version" status={openVersion.status} />
                      </div>
                      <OptionSetStatusHint kind="version" status={openVersion.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isOpenVersionEditable ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void editor.save()}
                          disabled={!editor.canSave}
                        >
                          {t("optionSet.versions.saveDraft")}
                        </Button>
                      ) : null}

                      {/* Rendered only when publishing is actually allowed. A disabled Publish beside
                          a Deprecated version would be a control for a state that cannot be reached
                          from here; the status hint above already says why. */}
                      {publishRefusal === null ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setPendingPublish(openVersion)}
                          disabled={isPublishing}
                        >
                          <Rocket className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          {t("optionSet.versions.publish")}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <OptionSetItemsEditor
                    items={tableRows}
                    onItemsChange={handleTableChange}
                    isEditable={isOpenVersionEditable}
                    readOnlyNote={openVersionReadOnlyNote}
                    isSaving={editor.isSaving}
                    isDirty={editor.isDirty}
                  />

                  {/* The one refusal worth stating outside the table: an editable draft whose Save is
                      refused for a reason the table's own read-only note never renders (it renders
                      only while `isEditable` is false). */}
                  {isOpenVersionEditable &&
                  editor.saveRefusal !== null &&
                  editor.saveRefusal.reason === "invalid" ? (
                    <p className="text-xs text-destructive">
                      {describeRefusal(editor.saveRefusal)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  icon={ListOrdered}
                  size="sm"
                  bare
                  title={t("optionSet.versionLoadFailed")}
                />
              )}
            </SectionState>
          )}
        </div>
      ) : null}

      <ConfirmationDialog
        open={pendingPublish !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPublish(null);
        }}
        variant="warning"
        title={t("optionSet.versions.publishConfirm.title", {
          number: pendingPublish?.versionNumber ?? 0,
        })}
        description={publishDescription}
        confirmText={t("optionSet.versions.publishConfirm.confirm")}
        cancelText={t("common.cancel")}
        isLoading={isPublishing}
        onConfirm={handleConfirmPublish}
      />
    </section>
  );
}
