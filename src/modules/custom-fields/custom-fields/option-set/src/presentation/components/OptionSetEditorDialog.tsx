/**
 * OptionSetEditorDialog -- create or rename one option set's METADATA (P-4)
 *
 * This dialog never touches a set's CONTENTS. Choices live in versions, and versions are edited by
 * `OptionSetItemsEditor` on a screen of their own. What is edited here is the set's identity: its key,
 * its two labels, its description, and (at creation only) its tenant scope.
 *
 * WHY A DIALOG, GIVEN THAT THIS MODULE PREFERS INLINE PANELS
 * ---------------------------------------------------------
 * `FieldGroupEditor` is deliberately an inline panel, and its header explains why: Wave 5 row 5.6
 * spent a commit removing nested-modal focus traps from custom-fields, and an inline panel cannot
 * trap focus or fight a portaled dropdown. That reasoning is about NESTING, and it holds here: this
 * dialog is a top-level overlay over the option-sets list route -- the same position
 * `FieldHistoryDialog` and `FieldImpactDialog` occupy over the definitions screen -- with no modal
 * above it and no portaled combobox inside it. Five inputs, none of them a picker.
 *
 * WHAT THE EDIT FORM DOES NOT OFFER, AND WHY IT CANNOT
 * ---------------------------------------------------
 * `UpdateOptionSetRequest` carries exactly three properties: `labelEn`, `labelAr`, `description`.
 *
 *   - `stableKey` is the set's portable identity. A re-import or a platform reconcile matches on it,
 *     so a rename would silently turn an update into a create against a previously exported bundle.
 *     Shown as read-only TEXT on the edit form, not as a disabled input: the admin needs to SEE the
 *     key a binding and an export quote, and there is no control to enable.
 *   - `isGlobal` is a create-time decision. Changing which tenants a live set applies to is a
 *     different feature, not a missing input -- the same call `FieldGroupEditor` and
 *     `CustomFieldListView` make for their own scope flags.
 *
 * That omission is enforced by the SHAPE of what this dialog emits, not by a comment: `onSubmit`
 * receives a discriminated union whose `"edit"` arm has no `stableKey` and no `isGlobal` property at
 * all, so a viewmodel physically cannot spread either one into an update request.
 *
 * A SET THE SERVER WILL NOT LET ANYONE CHANGE RENDERS AS AN EXPLANATION, NOT A FORM
 * --------------------------------------------------------------------------------
 * `OptionSet.isPlatformMaintained` (the seeded ISO 3166 / ISO 4217 / BCP 47 lists) is refused on all
 * five mutating paths for every caller, Super Admin included, and this component checks it itself
 * rather than trusting the caller to -- the entity answers that question definitively, so an ISO list
 * cannot be handed an editable form by mistake. Ownership and permission are facts about the CALLER,
 * not about the set, so those arrive as `readOnlyReason`.
 *
 * i18n: reads `optionSet.*` and `common.*`; the screen mounting this must already have called
 * `useModuleLocales(() => import("../../../locales"), "customFieldOptionSets")`.
 */
"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
// No `Lock` here on purpose: the scope badge below renders only for a platform-owned (global) set, so
// the only icon that can appear beside it is `Globe2`. A lock beside the word "Global" contradicted
// its own text.
import { AlertTriangle, Globe2 } from "lucide-react";
import type { OptionSet } from "../../domain/entities/OptionSet";

/** `CreateOptionSetRequest.StableKey` / `UpdateOptionSetRequest` label caps -- max 100 server-side. */
export const OPTION_SET_STABLE_KEY_MAX_LENGTH = 100;
/** `LabelEn` and `LabelAr` -- max 200 server-side, the same cap for both. */
export const OPTION_SET_LABEL_MAX_LENGTH = 200;
/** `Description` -- max 1000 server-side. */
export const OPTION_SET_DESCRIPTION_MAX_LENGTH = 1000;

/**
 * A HOUSE CONVENTION enforced client-side. NOT a mirror of a server regex -- there is no server regex.
 *
 * `CreateOptionSetRequest.StableKey` carries `[Required]` and `[MaxLength(100)]` and nothing else, and
 * `CreateOptionSetCommandHandler` only trims and rejects empty. So this pattern is stricter than the
 * server, which matters because a `pattern` on a `required` input inside a `<form>` makes the browser
 * HARD-BLOCK submit with a generic "match the requested format" -- every character excluded here is a
 * key the server would have accepted and the admin can never send.
 *
 * The hyphen is therefore included: the platform's own three seeded sets are keyed
 * `iso-3166-1-countries`, `iso-4217-currencies` and `bcp-47-languages`, and a create form that cannot
 * express the platform's own convention is refusing valid input. Lowercase start, then lowercase
 * letters, digits, underscores and hyphens -- which is what `optionSet.fields.stableKeyHint` promises.
 *
 * Deliberately NOT copied from `CreateFieldGroupRequest.StableKey`, which really does carry a
 * `[RegularExpression]` with no hyphen. That is a different request with a different contract.
 *
 * THE HYPHEN IS ESCAPED, AND IT HAS TO BE. HTML compiles `pattern` with the `v` (unicodeSets) flag,
 * under which a bare `-` inside a character class is a SYNTAX ERROR -- and an unparseable pattern is
 * not an error the admin ever sees: the spec says the attribute is ignored, so `[a-z][a-z0-9_-]*`
 * would quietly remove the gate instead of widening it. `OptionSetEditorDialog.test.tsx` compiles this
 * string under `v` to keep that from being re-introduced by someone tidying up the backslash.
 */
const STABLE_KEY_PATTERN = "[a-z][a-z0-9_\\-]*";

/**
 * What the dialog hands back on save.
 *
 * A discriminated union rather than one flat value object, because the two requests are genuinely
 * different shapes and the difference is load-bearing: the `"edit"` arm has NO `stableKey` and NO
 * `isGlobal`, so there is nothing for a caller to accidentally forward into `UpdateOptionSetInput`.
 * A single flat shape with "ignore these two on edit" in a comment is the version of this that leaks.
 *
 * Both arms map 1:1 onto `CreateOptionSetInput` / `UpdateOptionSetInput` minus the `mode` tag.
 */
export type OptionSetEditorSubmission =
  | {
      mode: "create";
      /** Trimmed and already lowercase -- the input lowercases as it is typed. */
      stableKey: string;
      labelEn: string;
      /** Empty means "not provided"; the caller sends null. */
      labelAr: string;
      description: string;
      /** A REQUEST for platform ownership. Re-checked against super-admin status server-side. */
      isGlobal: boolean;
    }
  | {
      mode: "edit";
      labelEn: string;
      labelAr: string;
      description: string;
    };

/**
 * Why the form is not offered at all.
 *
 * Three separate facts, kept separate because each needs its own sentence -- a single "read-only"
 * state would leave an admin unable to tell an ISO list from a permission they are missing:
 *
 *   - `systemManaged`: the platform maintains this set. Nobody can change it. Derived from the entity,
 *     so passing it is optional -- the component reaches this state on its own.
 *   - `platformOwned`: the set belongs to the platform and this caller is not platform-level. Readable
 *     and bindable, not editable.
 *   - `permission`: the caller lacks `custom-field-option-sets.create` / `.update`.
 */
export type OptionSetEditorReadOnlyReason = "systemManaged" | "platformOwned" | "permission";

export interface OptionSetEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The set being edited, or null for a create. */
  optionSet: OptionSet | null;
  /**
   * Set when this caller may not write the set, to render the reason instead of a form. A
   * platform-maintained set forces `"systemManaged"` regardless of what is passed -- see the file
   * header. Ownership and permission cannot be derived from the entity, so they must be passed.
   */
  readOnlyReason?: OptionSetEditorReadOnlyReason | null;
  /**
   * Whether to offer the scope switch on create. Only a platform-level principal ever sees it, and
   * the backend re-checks: `isGlobal` is a request, never an assertion.
   */
  canChooseScope: boolean;
  /** With no tenant selected the set is global regardless -- the switch shows on and inert. */
  isPlatformContext: boolean;
  isSaving: boolean;
  /**
   * A server refusal, shown INSIDE the dialog rather than as a toast. A toast outlives the dialog and
   * lands next to a form the admin can no longer see; a 409 on a duplicate key needs to be readable
   * beside the key that caused it.
   */
  errorMessage?: string | null;
  onSubmit: (submission: OptionSetEditorSubmission) => void;
}

export function OptionSetEditorDialog({
  open,
  onOpenChange,
  optionSet,
  readOnlyReason,
  canChooseScope,
  isPlatformContext,
  isSaving,
  errorMessage,
  onSubmit,
}: OptionSetEditorDialogProps) {
  const { t } = useI18n();
  const fieldId = useId();
  const isEdit = optionSet !== null;

  const [stableKey, setStableKey] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [description, setDescription] = useState("");
  const [isGlobal, setIsGlobal] = useState(isPlatformContext);

  /**
   * Reseeds the form whenever the dialog opens, or whenever it is pointed at a different set.
   *
   * A dialog is not remounted between openings, so without this the second row an admin edits would
   * still show the first row's labels. Keyed on `open` AND on the set's id rather than on the entity
   * object, so a background refetch that produces an equal-but-new `OptionSet` cannot wipe out typing
   * that is already in progress.
   */
  useEffect(() => {
    if (!open) return;
    setStableKey(optionSet?.stableKey ?? "");
    setLabelEn(optionSet?.labelEn ?? "");
    setLabelAr(optionSet?.labelAr ?? "");
    setDescription(optionSet?.description ?? "");
    setIsGlobal(optionSet?.isPlatformOwned ?? isPlatformContext);
    // Identity-keyed on purpose, so a refetch that produces an equal-but-new OptionSet does not
    // discard in-flight edits. Listing the individual fields would do exactly that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, optionSet?.id, isPlatformContext]);

  /**
   * The reason the form is withheld, with the entity's answer winning.
   *
   * A platform-maintained set cannot be made editable by a caller passing nothing here, which is the
   * point: the server refuses those five paths for everyone, and a screen that offered the form anyway
   * would collect a whole edit before failing.
   */
  const effectiveReadOnlyReason: OptionSetEditorReadOnlyReason | null =
    optionSet?.isPlatformMaintained ? "systemManaged" : (readOnlyReason ?? null);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (isSaving) return;

      if (isEdit) {
        // No stableKey, no isGlobal -- not omitted here, absent from the type. See the file header.
        onSubmit({
          mode: "edit",
          labelEn: labelEn.trim(),
          labelAr: labelAr.trim(),
          description: description.trim(),
        });
        return;
      }

      onSubmit({
        mode: "create",
        // Already lowercase: the input lowercases as it is typed, so the `pattern` attribute and the
        // submitted value can never disagree. Trimmed only.
        stableKey: stableKey.trim(),
        labelEn: labelEn.trim(),
        labelAr: labelAr.trim(),
        description: description.trim(),
        isGlobal,
      });
    },
    [description, isEdit, isGlobal, isSaving, labelAr, labelEn, onSubmit, stableKey]
  );

  /* ── Read-only presentation ──────────────────────────────────────────────────────────────────── */

  if (effectiveReadOnlyReason !== null) {
    const readOnlyCopy =
      effectiveReadOnlyReason === "systemManaged"
        ? {
            title: t("optionSet.readOnly.systemManaged.title"),
            description: t("optionSet.readOnly.systemManaged.description"),
          }
        : effectiveReadOnlyReason === "platformOwned"
          ? {
              title: t("optionSet.readOnly.platformOwned.title"),
              description: t("optionSet.readOnly.platformOwned.description"),
            }
          : {
              // Permission is a fact about the viewer, not a property of the set, so the heading stays
              // the action they attempted and the body says why it is unavailable.
              title: isEdit ? t("optionSet.editTitle") : t("optionSet.addNew"),
              description: isEdit
                ? t("optionSet.permissions.update")
                : t("optionSet.permissions.create"),
            };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{readOnlyCopy.title}</DialogTitle>
            <DialogDescription>{readOnlyCopy.description}</DialogDescription>
          </DialogHeader>

          {/* The set's identity is still worth showing: an admin who opened this wants to know WHICH
              list is locked, and the key is what an export and a binding quote. */}
          {optionSet !== null && (
            <dl className="flex flex-col gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-nx-ink-2">
                  {t("optionSet.fields.stableKey")}
                </dt>
                <dd className="font-mono text-nx-ink" dir="ltr">
                  {optionSet.stableKey}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium text-nx-ink-2">
                  {t("optionSet.fields.labelEn")}
                </dt>
                <dd className="text-nx-ink">{optionSet.labelEn}</dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── Editable form ───────────────────────────────────────────────────────────────────────────── */

  const canSave = !isSaving && labelEn.trim().length > 0 && (isEdit || stableKey.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("optionSet.editTitle") : t("optionSet.addNew")}</DialogTitle>
          {/* The screen-level explanation doubles as the dialog's description: an admin creating a
              first set needs to know a set is versioned before they name one. */}
          <DialogDescription>{t("optionSet.description")}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Platform context is not an error and not a choice -- it is the scope the set will land
              in, said before the admin commits to a name. */}
          {!isEdit && isPlatformContext && (
            <Alert>
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>{t("optionSet.platformContext.title")}</AlertTitle>
              <AlertDescription>{t("optionSet.platformContext.description")}</AlertDescription>
            </Alert>
          )}

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {/* role="alert" so a refusal that arrives after submit is announced; the admin's focus
                  is on the Save button by then and nothing else would tell them. */}
              <AlertDescription role="alert">{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tested against `optionSet` rather than the `isEdit` alias so the narrowing that makes
                `optionSet.stableKey` legal below is visible to the compiler at this exact node. */}
            {optionSet !== null ? (
              /* Read-only TEXT, not a disabled input: there is no control to enable, and the key still
                 has to be readable because exports and bindings quote it. */
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-nx-ink-2">
                  {t("optionSet.fields.stableKey")}
                </span>
                <code
                  className="rounded-nx-sm border border-nx-line bg-nx-raised px-2 py-1.5 font-mono text-sm text-nx-ink"
                  dir="ltr"
                >
                  {optionSet.stableKey}
                </code>
                <p className="text-xs text-nx-ink-3">{t("optionSet.immutable.stableKey")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${fieldId}-stableKey`}>{t("optionSet.fields.stableKey")}</Label>
                <Input
                  id={`${fieldId}-stableKey`}
                  value={stableKey}
                  // Lowercased as it is typed so the value can never disagree with `pattern`, and so
                  // an admin cannot create `Training_Intensity` and then wonder why an import missed
                  // it. Same treatment FieldGroupEditor gives its own stable key.
                  onChange={(event) => setStableKey(event.target.value.toLowerCase())}
                  required
                  maxLength={OPTION_SET_STABLE_KEY_MAX_LENGTH}
                  pattern={STABLE_KEY_PATTERN}
                  placeholder={t("optionSet.placeholders.stableKey")}
                  disabled={isSaving}
                  dir="ltr"
                  aria-describedby={`${fieldId}-stableKey-hint`}
                />
                <p id={`${fieldId}-stableKey-hint`} className="text-xs text-nx-ink-3">
                  {t("optionSet.fields.stableKeyHint")}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${fieldId}-labelEn`}>{t("optionSet.fields.labelEn")}</Label>
              <Input
                id={`${fieldId}-labelEn`}
                value={labelEn}
                onChange={(event) => setLabelEn(event.target.value)}
                required
                maxLength={OPTION_SET_LABEL_MAX_LENGTH}
                placeholder={t("optionSet.placeholders.labelEn")}
                disabled={isSaving}
                dir="auto"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${fieldId}-labelAr`}>{t("optionSet.fields.labelAr")}</Label>
              <Input
                id={`${fieldId}-labelAr`}
                value={labelAr}
                onChange={(event) => setLabelAr(event.target.value)}
                maxLength={OPTION_SET_LABEL_MAX_LENGTH}
                placeholder={t("optionSet.placeholders.labelAr")}
                disabled={isSaving}
                // Direction follows the content: an admin may legitimately paste a Latin brand name
                // into the Arabic label, and pinning rtl would render it backwards.
                dir="auto"
              />
            </div>

            {/* Scope: create-time only. On edit it is REPORTED, never offered -- see the file header.
                And it is reported only when there is something true to report.

                `OptionSetResponse` carries no `isGlobal`; `isPlatformOwned` (server-derived from
                `TenantId == null`) is the only scope signal that exists. So a platform-owned set gets
                the platform-owned badge, and an ordinary tenant-owned set gets NOTHING -- the same
                call OptionSetListView makes on its scope column, and the reason `optionSet.badge` has
                no tenant key to render. The row itself is withheld with the badge rather than left
                standing empty, because its label reads "Global (all tenants)": a tenant-scoped set
                shown under that heading tells the admin every tenant inherits a set that in fact
                only their own tenant can see, and they never create the per-tenant set they came for.
                An empty badge slot under that heading says the same thing more quietly. */}
            {optionSet !== null ? (
              optionSet.isPlatformOwned && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-nx-ink-2">
                    {t("optionSet.fields.isGlobal")}
                  </span>
                  <div>
                    {/* `info`, matching the same badge on the list's scope column -- one fact, one
                        tone, so the two screens do not disagree about how loud it is. */}
                    <Badge variant="info" className="gap-1">
                      <Globe2 className="h-3 w-3" aria-hidden="true" />
                      {t("optionSet.badge.platformOwned")}
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-3">{t("optionSet.immutable.isGlobal")}</p>
                </div>
              )
            ) : canChooseScope && (
              isPlatformContext ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-nx-ink-2">
                    {t("optionSet.fields.isGlobal")}
                  </span>
                  <div>
                    <Badge variant="info" className="gap-1">
                      <Globe2 className="h-3 w-3" aria-hidden="true" />
                      {t("optionSet.badge.platformOwned")}
                    </Badge>
                  </div>
                  <p className="text-xs text-nx-ink-3">
                    {t("optionSet.isGlobalDescription.platformContext")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${fieldId}-isGlobal`}>{t("optionSet.fields.isGlobal")}</Label>
                  <Switch
                    id={`${fieldId}-isGlobal`}
                    checked={isGlobal}
                    onCheckedChange={setIsGlobal}
                    disabled={isSaving}
                    aria-describedby={`${fieldId}-isGlobal-hint`}
                  />
                  <p id={`${fieldId}-isGlobal-hint`} className="text-xs text-nx-ink-3">
                    {t("optionSet.isGlobalDescription.tenantContext")}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-description`}>{t("optionSet.fields.description")}</Label>
            <Textarea
              id={`${fieldId}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={OPTION_SET_DESCRIPTION_MAX_LENGTH}
              placeholder={t("optionSet.placeholders.description")}
              disabled={isSaving}
              rows={3}
              dir="auto"
              aria-describedby={`${fieldId}-description-hint`}
            />
            <p id={`${fieldId}-description-hint`} className="text-xs text-nx-ink-3">
              {t("optionSet.fields.descriptionHint")}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave} loading={isSaving}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
