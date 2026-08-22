/**
 * OptionSetItemsEditor -- the table that authors ONE DRAFT VERSION's option list (P-4)
 *
 * A version's items are saved as a FULL REPLACE: whatever rows this table holds when the caller
 * saves become the version's entire contents, and an item missing from the payload is an item
 * deleted from the version. Three consequences shape the whole component:
 *
 *  1. **It is controlled, and holds no item state of its own.** The caller owns the working array
 *     and receives every mutation through `onItemsChange`. That is not ceremony: a full-replace save
 *     must send exactly what the admin sees, and a component with private state has a second, hidden
 *     answer to "what is the list?". It also keeps this file testable without a viewmodel.
 *
 *  2. **`sortOrder` is DERIVED FROM POSITION and never typed.** Every commit re-numbers the whole
 *     array from zero (see `commitRows`), so the list cannot develop gaps or ties that a full replace
 *     would then persist. The Order column is read-only text for the same reason -- two rows racing
 *     to own "3" is a state the UI should be incapable of producing, not one it validates after.
 *
 *  3. **Reordering works WITHOUT A DRAG GESTURE.** Move up / Move down are real buttons with
 *     distinct accessible names, which is WCAG 2.2 SC 2.5.7 (Dragging Movements) and the only way a
 *     keyboard user can reorder at all. This follows `FieldGroupRow`'s precedent in this same module;
 *     the `@dnd-kit` reorder implementations elsewhere in the codebase are pointer-only and are NOT
 *     the pattern copied here. Drag is simply not offered -- inside a table of text inputs a native
 *     drag source fights text selection in every cell, and the buttons are the complete answer.
 *
 * WITHDRAWING AN OPTION: DEACTIVATE, NEVER DELETE
 * ----------------------------------------------
 * `FieldOptionStatus.Deleted` exists on the wire and this component will not produce it under any
 * input. The type of `OptionSetDraftItem.status` excludes it, `toOptionSetDraftItems` degrades a
 * loaded `Deleted` to `Deactivated`, and `OptionSetRepository` throws if one ever arrives by cast.
 * The reason is not squeamishness: deleting an option that stored values already reference needs a
 * per-value remap-or-blank decision, and no screen is entitled to take that on an admin's behalf.
 *
 * So a row that exists SERVER-SIDE (`id !== null`) is offered Deactivate / Reactivate, and
 * `items.deleteUnavailable` is rendered where a delete button would otherwise sit. A row the admin
 * added in this session (`id === null`) is offered Remove instead -- nothing has ever been persisted
 * under it, so removing it cannot orphan anything. This component is presentational and cannot know
 * whether a persisted row has already been materialised into some field's options by a bind, and
 * deactivation is the withdrawal that is correct whether it has or not.
 *
 * THE RULES ARE NOT IN THIS FILE
 * ------------------------------
 * Validation and payload normalisation live in `../viewmodels/optionSetItemRules`, and are re-exported
 * below. That module is plain functions, not a viewmodel, so this component stays testable without
 * one -- but it is shared with `useOptionSetVersionEditor`, and it has to be: the new-draft Save
 * (`POST {id}/versions`) is gated by this table's exports while the opened-version Save
 * (`PUT versions/{versionId}`) is gated by the hook, and a rule that lived here would apply to only
 * one of the two buttons.
 *
 * i18n: reads `optionSet.*` and `common.*`, so the screen mounting this must already have called
 * `useModuleLocales(() => import("../../../locales"), "customFieldOptionSets")`.
 */
"use client";

import { useCallback, useId, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { EmptyState } from "@core/ui/empty-state";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { ArrowDown, ArrowUp, Ban, ListOrdered, Plus, RotateCcw, Trash2 } from "lucide-react";
import { OptionSetStatusBadge } from "./OptionSetStatusBadge";
import {
  OPTION_SET_ITEM_COLOR_MAX_LENGTH,
  OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_KEY_MAX_LENGTH,
  OPTION_SET_ITEM_LABEL_MAX_LENGTH,
  collectOptionSetItemIssues,
  optionSetItemIssueMessageKey,
} from "../viewmodels/optionSetItemRules";
import type { OptionSetItem } from "../../domain/entities/OptionSetItem";
import type { OptionSetItemWritableStatus } from "../../data/models/OptionSetModel";

/* ── The rules, and the caps they enforce ──────────────────────────────────────────────────────── */

/**
 * Re-exported from `optionSetItemRules`, which is where the item rules and the payload normalisation
 * actually live -- and where they live ONLY.
 *
 * This component's caller owns the Save button for a NEW draft (`POST {id}/versions`), while
 * `useOptionSetVersionEditor` owns it for an opened one (`PUT versions/{versionId}`). Both write the
 * same wire shape to the same server validator, so both must judge a list by the same rules and send
 * the same body for the same rows. These names are kept here so existing import sites keep working;
 * nothing below re-implements them.
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
} from "../viewmodels/optionSetItemRules";

/**
 * Client-side row counter for `rowId`.
 *
 * Module-scoped and monotonic rather than `crypto.randomUUID()`: the value never leaves the browser,
 * so uniqueness within one page is the entire requirement, and a deterministic sequence is far
 * easier to read in a failing test's diff.
 */
let rowSequence = 0;

/**
 * One row of the working list.
 *
 * `rowId` vs `id` is the distinction to keep straight:
 *
 *   - `rowId` is a CLIENT-ONLY React key. It exists because reordering rearranges the array, and
 *     keying rows by array index would remount the inputs on every move -- destroying focus and the
 *     caret position mid-edit, which makes the reorder buttons feel broken even though the data is
 *     right. It is never sent anywhere.
 *   - `id` is the SERVER's encrypted item id, or `null` for a row added in this editing session. It
 *     decides whether the row can be removed outright or must be deactivated (see the file header),
 *     and it is not part of the save payload either -- a full replace is matched up server-side.
 *
 * The remaining fields are the wire shape of `OptionSetItemRequest`, with `status` narrowed to the
 * two values this UI may send.
 */
export interface OptionSetDraftItem {
  /** Client-only React identity. Never sent. See this interface's doc comment. */
  rowId: string;
  /** The server's item id, or null for a row that exists only in this editing session. */
  id: string | null;
  key: string;
  labelEn: string;
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  /** Derived from array position on every commit; the admin never types it. */
  sortOrder: number;
  /** `Deleted` is excluded at the type level -- see the file header. */
  status: OptionSetItemWritableStatus;
}

/**
 * A blank row for the Add button.
 *
 * Starts `Active`, because an option nobody can pick is not what "add an option" means, and starts
 * `sortOrder: 0` because the value is overwritten by `commitRows` from the row's final position --
 * seeding it correctly here would just be a second place to get it wrong.
 */
export function newOptionSetDraftItem(): OptionSetDraftItem {
  rowSequence += 1;
  return {
    rowId: `option-set-row-${rowSequence}`,
    id: null,
    key: "",
    labelEn: "",
    labelAr: null,
    color: null,
    iconKey: null,
    sortOrder: 0,
    status: "Active",
  };
}

/**
 * Builds the working list from a loaded version's items.
 *
 * Reads `item.writableStatus`, not `item.status`: that accessor is where a loaded `Deleted` becomes
 * `Deactivated`, and going through it here means the working list is safe to save from the moment it
 * is created rather than needing a scrub on the way out.
 *
 * Order is taken from the array as given -- the read path already returns items in `sortOrder`, and
 * re-sorting here would silently disagree with whatever order the caller decided to display.
 */
export function toOptionSetDraftItems(items: readonly OptionSetItem[]): OptionSetDraftItem[] {
  return items.map((item, index) => {
    rowSequence += 1;
    return {
      rowId: `option-set-row-${rowSequence}`,
      id: item.id,
      key: item.key,
      labelEn: item.labelEn,
      labelAr: item.labelAr,
      color: item.color,
      iconKey: item.iconKey,
      sortOrder: index,
      status: item.writableStatus,
    };
  });
}

/** The text columns this table edits. Used to keep per-field handling exhaustive. */
type EditableTextField = "key" | "labelEn" | "labelAr" | "color" | "iconKey";

/**
 * The three columns whose meaning a header cannot carry, mapped to the sentence that carries it.
 *
 * `keyHint` is the load-bearing one: it is where an admin is told that giving a choice a new key in a
 * later version orphans the values recorded under the old one, which is a consequence nobody should
 * discover after the rename.
 *
 * Each sentence is rendered ONCE beneath the table and pointed at by every row's input through
 * `aria-describedby` -- the same arrangement as the deactivate/reactivate notes. Repeating three
 * sentences verbatim on twenty rows would drown the table, and a hint is a DESCRIPTION rather than a
 * second `<label>` because the accessible-name calculation concatenates every label that matches a
 * control, so a second one would have screen readers announce the field twice.
 */
const OPTION_SET_ITEM_HINT_KEYS = {
  key: "optionSet.items.fields.keyHint",
  color: "optionSet.items.fields.colorHint",
  iconKey: "optionSet.items.fields.iconKeyHint",
} as const;

/** The subset of columns that carry a standing hint. */
type HintedTextField = keyof typeof OPTION_SET_ITEM_HINT_KEYS;

function isHintedTextField(field: EditableTextField): field is HintedTextField {
  return field in OPTION_SET_ITEM_HINT_KEYS;
}

/**
 * Applies one text edit to one row.
 *
 * A switch rather than a computed-key spread so each field's NULL RULE is visible: `labelAr`, `color`
 * and `iconKey` are nullable on the wire and an emptied input must become `null`, not `""` -- the
 * backend stores the empty string as a value, so "" would mean "this option has a colour, and it is
 * the empty string". `key` and `labelEn` are non-nullable and keep whatever was typed, including
 * whitespace, because trimming mid-typing makes a space impossible to enter.
 */
function withTextField(
  row: OptionSetDraftItem,
  field: EditableTextField,
  raw: string
): OptionSetDraftItem {
  switch (field) {
    case "key":
      return { ...row, key: raw };
    case "labelEn":
      return { ...row, labelEn: raw };
    case "labelAr":
      return { ...row, labelAr: raw.length === 0 ? null : raw };
    case "color":
      return { ...row, color: raw.length === 0 ? null : raw };
    case "iconKey":
      return { ...row, iconKey: raw.length === 0 ? null : raw };
  }
}

export interface OptionSetItemsEditorProps {
  /**
   * The working list, in display order. Read-only to this component: every change is reported
   * upward, never applied in place.
   */
  items: readonly OptionSetDraftItem[];
  /**
   * Receives the complete next list on every add, remove, reorder, status change and keystroke, with
   * `sortOrder` already re-derived from position. The caller re-renders with what it is given.
   */
  onItemsChange: (items: OptionSetDraftItem[]) => void;
  /**
   * False for anything that is not an editable draft of an editable set -- a Published, Deprecated or
   * Archived version, or any version of a platform-maintained set. The table then renders the options
   * as text, with no controls at all rather than disabled ones the server would refuse anyway.
   */
  isEditable: boolean;
  /**
   * The already-translated sentence explaining WHY the table is read-only, shown instead of leaving a
   * control-free table to be read as a defect. The caller composes it because only the caller knows
   * which reason applies: `optionSet.versions.readOnlyNote` with `{status}` filled from
   * `optionSet.versions.status.*` for a non-draft version, or `optionSet.refusals.systemManaged` for
   * a platform-maintained set. Ignored while `isEditable` is true.
   */
  readOnlyNote?: string | null;
  /** True while a save is in flight: the rows stay readable, every mutation is blocked. */
  isSaving?: boolean;
  /**
   * True when the working list differs from what the server holds. Renders
   * `optionSet.items.unsavedChanges`, which is also where the draft/publish distinction gets repeated
   * -- saving is the moment an admin is most likely to believe the change went live.
   */
  isDirty?: boolean;
  className?: string;
}

/**
 * The draft-version option table.
 *
 * Presentational by design: no viewmodel, no repository, no DI container. It is the piece most worth
 * testing in isolation, because the reorder-and-renumber logic is the part that silently corrupts a
 * full-replace save when it is wrong.
 */
export function OptionSetItemsEditor({
  items,
  onItemsChange,
  isEditable,
  readOnlyNote,
  isSaving = false,
  isDirty = false,
  className,
}: OptionSetItemsEditorProps) {
  const { t } = useI18n();
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const deactivateNoteId = `${baseId}-deactivate-note`;
  const reactivateNoteId = `${baseId}-reactivate-note`;
  /** The id of one column's standing hint. One sentence per column, shared by every row's input. */
  const hintId = (field: HintedTextField) => `${baseId}-${field}-hint`;

  const issues = useMemo(() => collectOptionSetItemIssues(items), [items]);

  /**
   * The single exit through which every mutation passes, so `sortOrder` cannot drift.
   *
   * Re-derives the whole column on EVERY commit rather than only on reorders. A save is a full
   * replace, so one path that forgot to renumber would persist a gap or a tie; making it
   * unconditional means there is no such path to forget.
   */
  const commitRows = useCallback(
    (rows: OptionSetDraftItem[]) => {
      onItemsChange(rows.map((row, index) => ({ ...row, sortOrder: index })));
    },
    [onItemsChange]
  );

  const addRow = useCallback(() => {
    commitRows([...items, newOptionSetDraftItem()]);
  }, [commitRows, items]);

  const removeRow = useCallback(
    (rowId: string) => {
      commitRows(items.filter((row) => row.rowId !== rowId));
    },
    [commitRows, items]
  );

  /**
   * Swaps a row with its neighbour.
   *
   * Silently ignores a move off either end instead of clamping. The buttons are already disabled at
   * the edges; a guard that quietly did nothing on a real request would hide a bug, whereas a guard
   * against an impossible request is just defence.
   */
  const moveRow = useCallback(
    (index: number, delta: -1 | 1) => {
      const target = index + delta;
      if (target < 0 || target >= items.length) return;

      const next = [...items];
      const moved = next[index];
      next[index] = next[target];
      next[target] = moved;
      commitRows(next);
    },
    [commitRows, items]
  );

  const setTextField = useCallback(
    (rowId: string, field: EditableTextField, raw: string) => {
      commitRows(items.map((row) => (row.rowId === rowId ? withTextField(row, field, raw) : row)));
    },
    [commitRows, items]
  );

  const setStatus = useCallback(
    (rowId: string, status: OptionSetItemWritableStatus) => {
      commitRows(items.map((row) => (row.rowId === rowId ? { ...row, status } : row)));
    },
    [commitRows, items]
  );

  /**
   * The per-row messages, resolved once per render.
   *
   * Keyed by `rowId` then by the input the message belongs under, so each message lands beside the
   * control that can fix it. Rendered as ordinary text tied to the input with `aria-describedby` --
   * NOT as `role="alert"`. These appear and disappear as an admin types, and an alert per keystroke
   * would talk over the typing it is describing.
   */
  const messagesByRow = useMemo(() => {
    const map = new Map<string, Partial<Record<EditableTextField, string>>>();

    const put = (rowId: string, field: EditableTextField, message: string) => {
      const existing = map.get(rowId) ?? {};
      // First message wins: "this key is missing" is more actionable than a second complaint about
      // the same empty box, and one message per control keeps the row from growing a paragraph.
      if (existing[field] === undefined) {
        existing[field] = message;
        map.set(rowId, existing);
      }
    };

    for (const issue of issues) {
      // A list-level problem (`atLeastOne`) has no row and no input to sit under; it is rendered
      // beside the empty state instead. Everything else names the input it belongs to, and the issue
      // already carries the locale path and its interpolation values, so there is no per-code switch
      // here to fall out of step with the rules module.
      if (issue.rowId === null || issue.field === null) continue;
      put(issue.rowId, issue.field, t(optionSetItemIssueMessageKey(issue.code), issue.params));
    }

    return map;
  }, [issues, t]);

  const hasAtLeastOneIssue = issues.some((issue) => issue.code === "atLeastOne");
  const hasPersistedRow = items.some((row) => row.id !== null);
  const isMutable = isEditable && !isSaving;

  const addButton = (
    <Button type="button" size="sm" variant="secondary" onClick={addRow} disabled={!isMutable}>
      <Plus className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
      {t("optionSet.items.add")}
    </Button>
  );

  /**
   * One editable text cell.
   *
   * The accessible name is a VISUALLY HIDDEN `<Label htmlFor>` -- exactly one labelling mechanism per
   * control. A column header cannot name an input for the accessible-name calculation, and adding
   * `aria-label` on top of a real label would make screen readers announce the field twice.
   *
   * The name carries the row's position (`Key 3`, not `Key`) so seven inputs across three rows are
   * twenty-one distinguishable controls rather than seven names repeated three times. Position is
   * 1-based here while the wire's `sortOrder` is 0-based: the number an admin reads matches the
   * Order column beside it, and nothing user-facing quotes the raw index.
   */
  const renderTextCell = (
    row: OptionSetDraftItem,
    position: number,
    field: EditableTextField,
    labelKey: string,
    placeholderKey: string | null,
    maxLength: number,
    direction: "ltr" | "auto"
  ) => {
    const inputId = `${baseId}-${row.rowId}-${field}`;
    const messageId = `${inputId}-message`;
    const message = messagesByRow.get(row.rowId)?.[field];
    // The column's standing hint, if it has one. `aria-describedby` is read in the order given, so
    // the row's own problem comes first and the column's general explanation after it -- an admin
    // with an invalid key needs to hear what is wrong before hearing what keys are for. Both ids
    // always resolve: the hint block below renders under exactly the conditions that render an input.
    const describedBy = [
      message !== undefined ? messageId : null,
      isHintedTextField(field) ? hintId(field) : null,
    ].filter((id): id is string => id !== null);

    return (
      <TableCell className="align-top">
        <Label htmlFor={inputId} className="sr-only">
          {`${t(labelKey)} ${position}`}
        </Label>
        <Input
          id={inputId}
          // `?? ""` keeps every input CONTROLLED: three of these five fields are nullable on the
          // wire, and handing React `null` as a value silently switches the input to uncontrolled.
          value={row[field] ?? ""}
          onChange={(event) => setTextField(row.rowId, field, event.target.value)}
          placeholder={placeholderKey ? t(placeholderKey) : undefined}
          maxLength={maxLength}
          disabled={!isMutable}
          aria-invalid={message !== undefined || undefined}
          aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
          // Machine values stay LTR even on an Arabic page; content fields follow what is typed.
          dir={direction}
          className="min-w-[8rem]"
        />
        {message !== undefined && (
          <p id={messageId} className="mt-1 text-xs text-destructive">
            {message}
          </p>
        )}
      </TableCell>
    );
  };

  /** One read-only text cell, for a version nobody may edit. Empty optionals read as "None". */
  const renderStaticCell = (value: string | null, direction: "ltr" | "auto") => (
    <TableCell className="align-top" dir={direction}>
      {value && value.trim().length > 0 ? (
        value
      ) : (
        <span className="text-nx-ink-3">{t("common.none")}</span>
      )}
    </TableCell>
  );

  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="text-sm font-semibold text-nx-ink">
          {t("optionSet.items.title")}
        </h3>
        <p className="text-xs text-nx-ink-2">{t("optionSet.items.description")}</p>
      </div>

      {!isEditable && readOnlyNote ? (
        <Alert>
          <AlertDescription>{readOnlyNote}</AlertDescription>
        </Alert>
      ) : null}

      {/* Ambient state, not an announcement: a live region here would fire on the keystroke that
          first made the draft dirty and add nothing an admin has not just done themselves. */}
      {isEditable && isDirty ? (
        <p className="text-xs text-nx-ink-2">{t("optionSet.items.unsavedChanges")}</p>
      ) : null}

      {items.length === 0 ? (
        <>
          <EmptyState
            icon={ListOrdered}
            title={t("optionSet.items.noItems.title")}
            description={t("optionSet.items.noItems.description")}
            size="sm"
            bare
            action={isEditable ? addButton : undefined}
          />
          {/* The empty list is a real refusal reason, not just an empty state: the backend will not
              publish an itemless version. Said out loud even while the empty state is showing,
              because the empty state explains what to DO and this explains what is blocked. */}
          {isEditable && hasAtLeastOneIssue ? (
            <p className="text-sm text-destructive">{t("optionSet.items.validation.atLeastOne")}</p>
          ) : null}
        </>
      ) : (
        <>
          <div className="rounded-nx-md border border-nx-line">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("optionSet.items.fields.sortOrder")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.key")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.labelEn")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.labelAr")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.color")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.iconKey")}</TableHead>
                  <TableHead>{t("optionSet.items.fields.status")}</TableHead>
                  <TableHead className="text-end">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row, index) => {
                  const position = index + 1;
                  const isFirst = index === 0;
                  const isLast = index === items.length - 1;

                  return (
                    // Keyed by the client-only rowId, never the index -- see OptionSetDraftItem.
                    <TableRow key={row.rowId}>
                      {/* Read-only on purpose: order is owned by the buttons, not by a number box. */}
                      <TableCell className="align-top tabular-nums text-nx-ink-2">
                        {position}
                      </TableCell>

                      {isEditable ? (
                        <>
                          {renderTextCell(
                            row,
                            position,
                            "key",
                            "optionSet.items.fields.key",
                            "optionSet.items.placeholders.key",
                            OPTION_SET_ITEM_KEY_MAX_LENGTH,
                            "ltr"
                          )}
                          {renderTextCell(
                            row,
                            position,
                            "labelEn",
                            "optionSet.items.fields.labelEn",
                            "optionSet.items.placeholders.labelEn",
                            OPTION_SET_ITEM_LABEL_MAX_LENGTH,
                            "auto"
                          )}
                          {renderTextCell(
                            row,
                            position,
                            "labelAr",
                            "optionSet.items.fields.labelAr",
                            "optionSet.items.placeholders.labelAr",
                            OPTION_SET_ITEM_LABEL_MAX_LENGTH,
                            "auto"
                          )}
                          {renderTextCell(
                            row,
                            position,
                            "color",
                            "optionSet.items.fields.color",
                            "optionSet.items.placeholders.color",
                            OPTION_SET_ITEM_COLOR_MAX_LENGTH,
                            "ltr"
                          )}
                          {renderTextCell(
                            row,
                            position,
                            "iconKey",
                            "optionSet.items.fields.iconKey",
                            "optionSet.items.placeholders.iconKey",
                            OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH,
                            "ltr"
                          )}
                        </>
                      ) : (
                        <>
                          {renderStaticCell(row.key, "ltr")}
                          {renderStaticCell(row.labelEn, "auto")}
                          {renderStaticCell(row.labelAr, "auto")}
                          {renderStaticCell(row.color, "ltr")}
                          {renderStaticCell(row.iconKey, "ltr")}
                        </>
                      )}

                      <TableCell className="align-top">
                        <OptionSetStatusBadge kind="option" status={row.status} />
                      </TableCell>

                      <TableCell className="align-top">
                        {isEditable ? (
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveRow(index, -1)}
                              disabled={!isMutable || isFirst}
                              aria-label={`${t("optionSet.items.moveUp")} ${position}`}
                            >
                              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveRow(index, 1)}
                              disabled={!isMutable || isLast}
                              aria-label={`${t("optionSet.items.moveDown")} ${position}`}
                            >
                              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>

                            {/* A row that never reached the server can simply go. A row that did is
                                deactivated instead -- see the file header on why there is no delete. */}
                            {row.id === null ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/80"
                                onClick={() => removeRow(row.rowId)}
                                disabled={!isMutable}
                                aria-label={`${t("optionSet.items.remove")} ${position}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            ) : row.status === "Active" ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setStatus(row.rowId, "Deactivated")}
                                disabled={!isMutable}
                                aria-label={`${t("optionSet.items.deactivate")} ${position}`}
                                // Points at the note below the table, so the consequence is heard
                                // BEFORE the button is pressed rather than discovered after.
                                aria-describedby={deactivateNoteId}
                              >
                                <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setStatus(row.rowId, "Active")}
                                disabled={!isMutable}
                                aria-label={`${t("optionSet.items.reactivate")} ${position}`}
                                aria-describedby={reactivateNoteId}
                              >
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isEditable ? addButton : null}
            <span className="text-xs text-nx-ink-3">
              {t("optionSet.items.count", { count: items.length })}
            </span>
          </div>

          {/* What the Key, Color and Icon columns actually mean. Rendered only alongside the inputs
              they describe: on a read-only version there is nothing to type and nothing to warn
              about, and an id nobody references would be dead markup. */}
          {isEditable ? (
            <div className="flex flex-col gap-1.5 text-xs text-nx-ink-3">
              {(Object.entries(OPTION_SET_ITEM_HINT_KEYS) as [HintedTextField, string][]).map(
                ([field, messageKey]) => (
                  <p key={field} id={hintId(field)}>
                    {t(messageKey)}
                  </p>
                )
              )}
            </div>
          ) : null}
        </>
      )}

      {/* The three sentences that make the withdrawal model legible. Rendered once for the table
          rather than per row: repeated verbatim on twenty rows they would be noise, and each is
          referenced by the button it explains via aria-describedby. */}
      {isEditable ? (
        <div className="flex flex-col gap-1.5 text-xs text-nx-ink-3">
          <p id={deactivateNoteId}>{t("optionSet.items.deactivateDescription")}</p>
          <p id={reactivateNoteId}>{t("optionSet.items.reactivateDescription")}</p>
          {/* Only where a delete button would otherwise be missed: a list of rows that exist only in
              this session has no absent control to explain. */}
          {hasPersistedRow ? <p>{t("optionSet.items.deleteUnavailable")}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
