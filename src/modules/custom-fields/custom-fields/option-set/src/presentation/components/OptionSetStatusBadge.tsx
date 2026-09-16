/**
 * OptionSetStatusBadge -- the single place an option-set status becomes pixels (P-4)
 *
 * Two DIFFERENT status vocabularies reach this module's screens and they must never be confused:
 *
 *   - `FieldVersionStatus` (Draft / Published / Deprecated / Archived) describes a VERSION -- one
 *     complete snapshot of a set's choices, of which exactly one is Published at a time.
 *   - `FieldOptionStatus` (Active / Deactivated / Deleted) describes ONE OPTION inside a version.
 *
 * They share no member, so a single map would "work" by accident today and break the first time the
 * backend adds a name to both. The `kind` discriminant makes the caller say which vocabulary it is
 * handing over, and TypeScript then refuses `kind="version"` with `"Active"` at the call site.
 *
 * VARIANT MAPPING FOLLOWS FieldHistoryDialog's PRECEDENT, INCLUDING ITS REASONING
 * ------------------------------------------------------------------------------
 * That file's rule is that two states with different consequences must not render identically, and
 * the same rule decides every row below:
 *
 *   - `Deprecated` vs `Archived`. Deprecated was superseded but still INTERPRETS stored values;
 *     Archived is history only and nothing can bind to it. An admin who reads "Deprecated" as
 *     "Archived" goes looking for data loss that never happened, so Deprecated stays a warning tone
 *     while Archived goes fully quiet.
 *   - `Deactivated` vs `Deleted`. A deactivated option stops being offered and keeps rendering on
 *     records that already hold it. A deleted one is a state this UI never authors precisely because
 *     resolving it needs a per-value remap-or-blank decision. Destructive tone for the second only.
 *
 * Unlike FieldHistoryDialog, whose change kinds are an open server-side vocabulary, both unions here
 * are CLOSED on the wire -- so the maps are keyed `Record<FieldVersionStatus, ...>` and
 * `Record<FieldOptionStatus, ...>`, which makes adding a member to either union a compile error here
 * rather than a blank badge in production. The runtime fallback below survives anyway: types describe
 * the contract we were built against, and a server that ships a fifth status still has to render.
 *
 * i18n: this component reads `optionSet.*` keys, so the SCREEN that mounts it must have called
 * `useModuleLocales(() => import("../../../locales"), "customFieldOptionSets")` first. It takes no
 * `labels` prop on purpose -- a badge whose text came from six callers would drift six ways.
 */
"use client";

import { Badge, type BadgeProps } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  FieldOptionStatus,
  FieldVersionStatus,
  OptionSetItemWritableStatus,
} from "../../data/models/OptionSetModel";

/** The badge tones this file is allowed to reach for, narrowed from the primitive's full list. */
type StatusTone = NonNullable<BadgeProps["variant"]>;

/**
 * Version status -> badge tone.
 *
 * Draft is deliberately the quietest FILLED tone rather than a neutral outline: a draft is a real
 * thing an admin is working on, just not one anybody else can see yet. Published is the only
 * success-toned status in the module, because it is the only status that means "this is what users
 * are being offered right now".
 */
const VERSION_STATUS_TONE: Record<FieldVersionStatus, StatusTone> = {
  Draft: "secondary",
  Published: "success",
  Deprecated: "warning",
  Archived: "inactive",
};

/**
 * Option status -> badge tone.
 *
 * `Deleted` is mapped even though this UI never SENDS it: a read of an older version can still return
 * it, and a status the badge cannot colour would fall through to a neutral chip that looks like an
 * ordinary state. See the file header on why it must not look like `Deactivated`.
 */
const OPTION_STATUS_TONE: Record<FieldOptionStatus, StatusTone> = {
  Active: "success",
  Deactivated: "inactive",
  Deleted: "destructive",
};

/**
 * The option statuses the locale dictionary actually carries a label for.
 *
 * Written as an exhaustive record over `OptionSetItemWritableStatus` rather than a hand-listed set,
 * because that type is the same "everything except Deleted" definition the locale file was built
 * against -- so the two cannot drift without a compile error here. `optionSet.items.status` has no
 * `Deleted` key BY DESIGN (its locale test pins the absence), which is exactly why the lookup below
 * has to be guarded instead of trusting every `FieldOptionStatus` to translate.
 */
const LABELLED_OPTION_STATUSES: Record<OptionSetItemWritableStatus, true> = {
  Active: true,
  Deactivated: true,
};

/** Derived, never re-typed, so a tone can never have a label the map does not know about. */
const LABELLED_OPTION_STATUS_KEYS: ReadonlySet<string> = new Set(
  Object.keys(LABELLED_OPTION_STATUSES)
);

/**
 * Resolves an option status to display text.
 *
 * Returns the raw wire value for anything the dictionary does not cover. `t()` has no default-value
 * option -- it returns the KEY on a miss -- so passing `Deleted` straight through would print
 * "optionSet.items.status.Deleted" to an administrator, which is strictly worse than printing
 * "Deleted". Same defence FieldHistoryDialog's `labelFor` provides for its open vocabularies.
 */
function optionStatusLabel(
  status: FieldOptionStatus,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  return LABELLED_OPTION_STATUS_KEYS.has(status) ? t(`optionSet.items.status.${status}`) : status;
}

/**
 * Props for the badge.
 *
 * A discriminated union rather than `{ kind: string; status: string }`: it is what stops a version
 * status being rendered with the option vocabulary (and vice versa) at the type level, which is the
 * whole reason this component exists as one component instead of two.
 */
export type OptionSetStatusBadgeProps =
  | {
      /** The status belongs to a VERSION of a set. */
      kind: "version";
      status: FieldVersionStatus;
      className?: string;
    }
  | {
      /** The status belongs to ONE OPTION inside a version. */
      kind: "option";
      status: FieldOptionStatus;
      className?: string;
    };

/**
 * Renders one option-set status as a badge.
 *
 * Text only -- no icon. A status chip beside an icon that repeats it gives a screen reader two names
 * for one fact, and the four version statuses have no icon vocabulary an admin would recognise
 * anyway. Colour is never the only carrier: every badge here says its status in words.
 */
export function OptionSetStatusBadge(props: OptionSetStatusBadgeProps) {
  const { t } = useI18n();

  // Narrowed through `props.kind` rather than destructured first: destructuring `status` up front
  // would collapse it to the union of both vocabularies and force a cast into each lookup.
  const tone =
    props.kind === "version" ? VERSION_STATUS_TONE[props.status] : OPTION_STATUS_TONE[props.status];

  const label =
    props.kind === "version"
      ? t(`optionSet.versions.status.${props.status}`)
      : optionStatusLabel(props.status, t);

  return (
    // `?? "outline"` is not dead code even though both maps are exhaustive over their unions: the
    // value arrives from the network, and a server that adds a status must still render something
    // legible rather than an unstyled chip. Neutral on purpose -- an unknown state is not a warning.
    <Badge variant={tone ?? "outline"} className={cn("shrink-0", props.className)}>
      {label}
    </Badge>
  );
}

/**
 * Props for the hint line that accompanies a status.
 *
 * Same discriminant as the badge and the same reason for it. Kept in this file rather than its own
 * so a status can never gain a tone and a label without the sentence that explains what it MEANS for
 * the choices people see -- the pairing FieldHistoryDialog enforces between its kind map and its
 * label set, applied one level up.
 */
export type OptionSetStatusHintProps =
  | { kind: "version"; status: FieldVersionStatus; className?: string }
  | { kind: "option"; status: FieldOptionStatus; className?: string };

/**
 * One sentence on what a status means for the options users are offered.
 *
 * Worth rendering next to the badge wherever an admin is about to act: "Deprecated" alone reads as
 * "gone", and the hint is the only thing that says records referencing it still resolve.
 *
 * Returns `null` -- not a fallback sentence -- for a status with no hint key. There is exactly one
 * such status (`Deleted`, deliberately absent from the dictionary), and inventing copy for it here
 * would re-introduce the delete vocabulary the locale layer removed on purpose.
 */
export function OptionSetStatusHint(props: OptionSetStatusHintProps) {
  const { t } = useI18n();

  if (props.kind === "option" && !LABELLED_OPTION_STATUS_KEYS.has(props.status)) {
    return null;
  }

  const key =
    props.kind === "version"
      ? `optionSet.versions.statusHint.${props.status}`
      : `optionSet.items.statusHint.${props.status}`;

  return <p className={cn("text-xs text-nx-ink-3", props.className)}>{t(key)}</p>;
}
