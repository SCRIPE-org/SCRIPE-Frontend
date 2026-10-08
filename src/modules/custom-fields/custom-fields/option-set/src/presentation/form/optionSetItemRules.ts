/**
 * The option-item rules -- ONE implementation, shared by every write path (P-4)
 *
 * A draft version's item list is authored from two places and saved through two different endpoints:
 *
 *   - a NEW draft, whose rows live in `OptionSetDetailPanel` and are sent by `POST {id}/versions`;
 *   - an OPENED draft, whose rows live in `useOptionSetVersionEditor` and are sent by
 *     `PUT versions/{versionId}`.
 *
 * Both write the SAME wire shape (`OptionSetItemRequest[]`) to the same validator on the server. This
 * module exists because they used to each carry their own copy of the validation rules and their own
 * copy of the payload normalisation, and the copies had already drifted: one trimmed all five text
 * fields, the other trimmed two of them and sent `color` / `iconKey` with the admin's stray spaces
 * intact. Same admin action, two different bodies, decided by which button was pressed.
 *
 * So the rules and the normalisation live here and nowhere else. `OptionSetItemsEditor` and
 * `useOptionSetVersionEditor` re-export these functions so their existing import paths keep working,
 * but neither re-implements them -- a rule added here is enforced on both Save buttons, which is the
 * only arrangement in which "the Save button agrees with the server" can stay true.
 *
 * ROW SHAPE: the minimum both callers already satisfy. `OptionSetDraftItem` (the table's row, whose
 * optional text is `string | null`) and `OptionSetItemDraft` (the hook's row, whose optional text is
 * `""`) are both structurally assignable to `OptionSetItemRuleRow` without an adapter, which is why
 * the optional fields are typed `string | null` and every read here normalises with `?? ""`.
 */
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";
import type { OptionSetItemWritableStatus } from "../../domain/entities/OptionSetItem";

/* ── Server-side length caps, mirrored so the 400 never happens ────────────────────────────────── */

/** `OptionSetItemRequest.Key` -- `[MaxLength(100)]`. */
export const OPTION_SET_ITEM_KEY_MAX_LENGTH = 100;
/** `OptionSetItemRequest.LabelEn` / `.LabelAr` -- `[MaxLength(200)]`, the same cap for both. */
export const OPTION_SET_ITEM_LABEL_MAX_LENGTH = 200;
/** `OptionSetItemRequest.Color` -- `[MaxLength(50)]`. An opaque string to the backend. */
export const OPTION_SET_ITEM_COLOR_MAX_LENGTH = 50;
/** `OptionSetItemRequest.IconKey` -- `[MaxLength(100)]`. Resolved by the client, not the server. */
export const OPTION_SET_ITEM_ICON_KEY_MAX_LENGTH = 100;

/**
 * The least a row must be for the rules to run over it.
 *
 * Deliberately NOT either caller's full row type: the table's row carries a `sortOrder` and the
 * hook's does not, and neither difference has any bearing on whether the list is valid or on what
 * body it sends. Structural typing means both pass in as-is.
 */
export interface OptionSetItemRuleRow {
  /** Client-only row identity, used to address an issue back to the row that caused it. */
  rowId: string;
  key: string;
  labelEn: string;
  /** `null` in the table's row shape, `""` in the hook's. Both mean "not provided". */
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  status: OptionSetItemWritableStatus;
}

/**
 * A validation problem, as a CODE rather than a sentence.
 *
 * Codes travel and sentences do not: these are produced with no `t` in scope, the tests assert on
 * them without an i18n provider, and the code doubles as the locale path segment under
 * `optionSet.items.validation` (see `optionSetItemIssueMessageKey`).
 */
export type OptionSetItemIssueCode =
  | "keyRequired"
  | "labelEnRequired"
  | "duplicateKey"
  | "keyTooLong"
  | "labelTooLong"
  | "atLeastOne";

/**
 * Documentation for module export
 */
export interface OptionSetItemIssue {
  /** The row it belongs to, or null for a whole-list problem (`atLeastOne`). */
  rowId: string | null;
  /** Which input to attach it to, or null when it is not about one input. */
  field: "key" | "labelEn" | "labelAr" | null;
  code: OptionSetItemIssueCode;
  /** Interpolation values -- `{key}` for `duplicateKey`, `{max}` for the two length codes. */
  params?: Record<string, string | number>;
}

/** Full locale path for one issue code, so no caller hand-builds the string. */
export function optionSetItemIssueMessageKey(code: OptionSetItemIssueCode): string {
  return `optionSet.items.validation.${code}`;
}

/**
 * Trimmed text for a field the request requires.
 *
 * Trimming happens at the payload boundary and NOT while typing: trimming mid-keystroke makes a
 * space impossible to enter. An option key with a trailing space is not a different key, and the
 * duplicate check below compares trimmed values -- so letting an untrimmed one through would mean
 * the check and the payload disagreed about what was sent.
 */
function requiredText(value: string): string {
  return value.trim();
}

/**
 * Trimmed text for a nullable field, with blank collapsed to null.
 *
 * `""` is a VALUE to the backend -- it would mean "this option has a colour, and it is the empty
 * string". One spelling of "absent" keeps request bodies comparable in a log and matches the `?? null`
 * normalisation `OptionSetRepository` already applies. Whitespace-only counts as blank for the same
 * reason a whitespace-only key counts as missing.
 */
function optionalText(value: string | null): string | null {
  return (value ?? "").trim() || null;
}

/**
 * Working rows -> request payload.
 *
 * Two transformations happen here and nowhere else:
 *
 *  - `sortOrder` becomes the ARRAY INDEX. The displayed order is the submitted order, so a list
 *    cannot develop gaps or ties that a full replace would then persist -- and a hand-assembled array
 *    that never went through the table gets renumbered all the same.
 *  - All five text fields are normalised identically: the two required ones trimmed, the three
 *    nullable ones trimmed and collapsed to null. Uniform treatment is the point of the function --
 *    the defect it replaces was `color` and `iconKey` being passed through verbatim on one of the two
 *    paths, which stored `" amber "` with its spaces depending on which Save was used.
 *
 * Objects are built field by field rather than spread, so `rowId` and `id` cannot ride along into a
 * request that has no property for either.
 */
export function toOptionSetItemInputs(rows: readonly OptionSetItemRuleRow[]): OptionSetItemInput[] {
  return rows.map((row, index) => ({
    key: requiredText(row.key),
    labelEn: requiredText(row.labelEn),
    labelAr: optionalText(row.labelAr),
    color: optionalText(row.color),
    iconKey: optionalText(row.iconKey),
    sortOrder: index,
    status: row.status,
  }));
}

/**
 * Every reason a working list cannot be saved yet, in the order a reader would find them.
 *
 * Measured against the values `toOptionSetItemInputs` would SEND, not the raw ones on screen: the
 * gate and the payload have to agree about what is being judged, or a 200-character label with a
 * trailing space passes at 200 and reaches the server at 201.
 *
 * THE DUPLICATE RULE IS CASE-INSENSITIVE. The backend's item validator refuses a list holding both
 * `u18` and `U18`, and the bind collision check uses the same comparison against a field's
 * hand-authored options. A case-sensitive check here would pass a list the server then rejects, with
 * the admin left staring at two rows that look different. Keys are NOT lowercased on input, though --
 * the server accepts mixed case, and silently rewriting what an admin typed is a worse surprise than
 * explaining a collision.
 *
 * Empty keys are excluded from the duplicate check: two blank rows are two `keyRequired` problems,
 * and calling them duplicates of each other would bury the message that actually helps.
 *
 * Deactivated rows are validated exactly like active ones: they are still part of the full replace,
 * and the server validates every item it receives.
 */
export function collectOptionSetItemIssues(
  rows: readonly OptionSetItemRuleRow[]
): OptionSetItemIssue[] {
  // Not merely "the list is empty" -- the backend refuses to publish an itemless version, because
  // binding a field to one would deactivate every set-owned option that field currently shows.
  if (rows.length === 0) {
    return [{ rowId: null, field: null, code: "atLeastOne" }];
  }

  const issues: OptionSetItemIssue[] = [];

  // Non-empty trimmed keys, counted case-insensitively.
  const keyCounts = new Map<string, number>();
  for (const row of rows) {
    const normalized = requiredText(row.key).toLowerCase();
    if (!normalized) continue;
    keyCounts.set(normalized, (keyCounts.get(normalized) ?? 0) + 1);
  }

  for (const row of rows) {
    const key = requiredText(row.key);
    const labelEn = requiredText(row.labelEn);
    const labelAr = optionalText(row.labelAr) ?? "";

    if (!key) {
      issues.push({ rowId: row.rowId, field: "key", code: "keyRequired" });
    } else {
      // Reachable despite `maxLength` on the input: a row can arrive over-length from a loaded
      // version whose data predates the cap, and paste is not always bounded by maxLength either.
      if (key.length > OPTION_SET_ITEM_KEY_MAX_LENGTH) {
        issues.push({
          rowId: row.rowId,
          field: "key",
          code: "keyTooLong",
          params: { max: OPTION_SET_ITEM_KEY_MAX_LENGTH },
        });
      }
      // Reported on EVERY row in the colliding group, not just the second one. The admin has to
      // choose which of them keeps the key, and can only do that if both are marked.
      if ((keyCounts.get(key.toLowerCase()) ?? 0) > 1) {
        issues.push({
          rowId: row.rowId,
          field: "key",
          code: "duplicateKey",
          // The row's OWN spelling, not the normalised one: quoting `u18` back at someone who typed
          // `U18` reads as a different problem than the one they have.
          params: { key },
        });
      }
    }

    if (!labelEn) {
      issues.push({ rowId: row.rowId, field: "labelEn", code: "labelEnRequired" });
    } else if (labelEn.length > OPTION_SET_ITEM_LABEL_MAX_LENGTH) {
      issues.push({
        rowId: row.rowId,
        field: "labelEn",
        code: "labelTooLong",
        params: { max: OPTION_SET_ITEM_LABEL_MAX_LENGTH },
      });
    }

    // No `labelArRequired` counterpart on purpose: the Arabic label is optional on the request, and
    // only its length is capped.
    if (labelAr.length > OPTION_SET_ITEM_LABEL_MAX_LENGTH) {
      issues.push({
        rowId: row.rowId,
        field: "labelAr",
        code: "labelTooLong",
        params: { max: OPTION_SET_ITEM_LABEL_MAX_LENGTH },
      });
    }
  }

  return issues;
}
