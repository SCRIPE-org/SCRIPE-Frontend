/* eslint-disable jsx-a11y/role-supports-aria-props */
"use client";

/**
 * File / Image's dedicated edit control -- Wave 3.4.
 *
 * ONE COMPONENT FOR BOTH VALUE TYPES, distinguished by `imagesOnly`. They differ
 * only in whether the referenced media row has to be an image, which is a
 * constraint, not a control kind -- the same "the UI is genuinely the same, only
 * the data differs" reasoning that keeps Select and MultiSelect on one
 * `GenericSelect`. They arrive here through TWO `FieldConfig["type"]` members
 * (`"media-file"` and `"media-image"`) rather than one, because that flag has
 * nowhere else to travel: both value types pin the same target entity type, so a
 * shared dispatch key would leave the branch unable to tell them apart at all.
 *
 * **THE EMITTED SHAPE IS `{ entityTypeKey, entityId }` OR `null`, AND NOTHING
 * ELSE.** Not a base64 string (which is what `FieldConfig`'s pre-existing
 * `"image"` arm produces, through `ImageUploader`), and not a browser `File`
 * (which is what its `"file"` arm produces, through `<Input type="file">`).
 * Those are the two shapes this type is most likely to be mis-wired to, and both
 * would be refused by `RichTextValueTypeHandler`'s neighbours with a 422 the
 * operator cannot connect to anything they did. On the backend
 * `FileValueTypeHandler` literally extends `EntityReferenceValueTypeHandler`, so
 * the value IS a reference envelope -- read and written under the same two
 * property names, with the id ENCRYPTED and passed back verbatim.
 *
 * ---
 *
 * **WHY THERE IS NO PICKER HERE, WHICH IS THE CENTRAL FACT ABOUT THIS FILE.**
 *
 * The backend requires more of a media value than "you may read it". A File or
 * Image value is accepted only if the referenced `MediaFile`'s OWNER PAIR
 * (`OwnerEntityTypeKey`, `OwnerEntityId`) IS the record being edited. That fence
 * is not a nicety -- it is what makes `media.file` a legal reference target at
 * all. `MediaFile.TenantId` is NULLABLE and `BaseDbContext.ApplyTenantFilters`
 * builds `TenantId == null || TenantId == CurrentTenantId`, so a tenant-global
 * media row (a branding logo, anything uploaded with no tenant context) is
 * visible through the ambient filter to EVERY tenant, and
 * `IEntityReadAuthorizer` resolves through the existence registry with
 * `tenantId: null` and leans on that same filter. The read gate therefore does
 * NOT fence a media value to the caller's tenant; the owner-pair check does,
 * because a tenant-global file has a null owner pair and can never match any
 * record. (This is the same disqualifying property that keeps `identity.admin`
 * off `UserReferenceValueTypeHandler`'s allowlist -- `Admin.TenantId` is
 * nullable too.)
 *
 * NOTHING ON THIS TIER CAN ASK FOR "MEDIA OWNED BY THIS RECORD", and it is worth
 * being precise about which piece is missing, because three separate ones are:
 *   1. The lookup search route is `GET /entity-lookup/{entityTypeKey}` with
 *      `search`/`page`/`pageSize` and no owner filter. There is nowhere to
 *      express the owner pair.
 *   2. No `IEntityLookupProvider` is registered for `media.file` at all --
 *      Identity, Hrms, OrganizationCore and PartyKernel register theirs; Media
 *      registers none. So `media.file` can be neither SEARCHED nor RESOLVED
 *      through that registry, which is also why this control shows no file name:
 *      there is no endpoint that would return one.
 *   3. The owner id never reaches this layer. `mapValueToFieldConfig` carries
 *      only the target-type pin, and on a CREATE form there is no owner record
 *      yet -- so at pick time there is no record for a file to be owned BY.
 *
 * So the two shapes a real picker could take are both blocked on new server
 * surface: an owner-scoped media list endpoint, or an uploader that creates the
 * `MediaFile` with the owner pair already set. (Today no upload path sets that
 * pair at all -- `MediaFileRegistrar` accepts an owner and does not copy it onto
 * the row -- so the fence currently refuses every File and Image write. That is
 * the correct direction for a security fence to fail.)
 *
 * WHAT WAS DELIBERATELY NOT DONE: pinning `EntityReferenceCustomFieldControl` at
 * `media.file` as a stand-in. It would compile, it would look finished, and it
 * would be worse than this: that picker offers every media row the caller can
 * READ, which by the paragraph above includes every tenant-global one -- i.e. it
 * would systematically offer exactly the picks the owner-pair fence then refuses,
 * and every one of them would 422 after the operator had chosen it.
 * `renderCustomFieldControl` already refuses that failure mode by name for the
 * target-pin ordering: "the picker would quietly disagree with the definition and
 * every new pick made through it would be one the write-side gate then refuses."
 *
 * SO THIS CONTROL DOES THE THREE THINGS IT HONESTLY CAN, and says so:
 *   - It PRESERVES a stored value. Opening a form must never destroy a reference
 *     the field already holds, and the fallthrough text input this type would
 *     otherwise land on did exactly that -- `[object Object]` in an editable box,
 *     replaced by a string on the first keystroke.
 *   - It CLEARS one, which is a complete, correct operation and the only edit
 *     that needs no picker.
 *   - It STATES why attaching is not available here, in localized copy. An empty
 *     dropdown would have been the alternative, and it reads as "the server
 *     returned no records" -- sending whoever hits it to look in entirely the
 *     wrong place. Same choice, same reason, as the reference control's
 *     `noTargetConfigured` state.
 *
 * **THE IMAGE-ONLY CONSTRAINT IS STATED UP FRONT, not discovered on save.** The
 * backend refuses a non-image with `customFields.values.mediaReferenceNotAnImage`
 * after the owner-pair fence has passed. This tier cannot pre-empt that check --
 * the stored value carries an entity type key and an encrypted id and no content
 * type, so there is genuinely nothing here to inspect -- so the useful thing is
 * to say the requirement before anyone acts on it, which is what the
 * `imagesOnly` note does. The mirrored message exists under
 * `customField.values.mediaReferenceNotAnImage` for the save path to surface.
 *
 * **THE TARGET KEY IS NOT RENDERED, and the encrypted id never is.** The id is
 * another module's primary key: opaque to every reader, and putting it on screen
 * leaks it into screenshots and support tickets while telling nobody anything --
 * the same refusal `formatCustomFieldValue`'s reference case makes. The type key
 * is not secret (it names a table, not a row) but it is also not informative
 * here: unlike a table cell, this field is already known to be a File field, so
 * the key would be constant noise. It is still read from the pin rather than
 * hardcoded -- see `targetEntityTypeKey`.
 *
 * A11Y: the field is a `role="group"`, because it is a labelled region
 * containing a statement and possibly a button rather than a single widget --
 * `role="group"` is what makes `aria-label`/`aria-describedby` actually exposed
 * on a `<div>`. `<Label htmlFor={id}>` is kept as real visible DOM for sighted
 * users; the announced name comes from the group's `aria-label`, since a `for`
 * pointing at a non-labelable element computes no name (the mechanism
 * `EntityReferenceCustomFieldControl` documents for its `role="combobox"`
 * trigger).
 */
import * as React from "react";
import { AlertCircle, Image as ImageIcon, Paperclip } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import type { CustomFieldEntityReferenceValue } from "../../../../../custom-field-value/src/data/models/CustomFieldValueModel";

/** This control's own i18n namespace, spelled once. */
const I18N = "customField.mediaReference";

export interface MediaReferenceCustomFieldControlProps {
  /**
   * Lands on the `role="group"` region, so the sibling `<Label htmlFor>` is real
   * DOM wiring. It is NOT what computes the accessible name -- see this file's
   * header comment.
   */
  id: string;
  label?: string;
  /**
   * The target entity type the field's DEFINITION is pinned to, resolved
   * server-side. For both media types the backend derives it from a code-owned
   * one-key allowlist (`ImplicitTargetEntityTypeKey`), so in practice it is
   * always `media.file` -- and it is still read from the pin rather than written
   * as a literal here, for the reason `renderCustomFieldControl`'s
   * UserReference note gives: restating a backend allowlist this layer cannot
   * see is how the two silently diverge.
   *
   * Currently used only to decide whether the field is CONFIGURED at all. A
   * value is preserved and displayed regardless, because a stored reference
   * carries its own key and stays meaningful even if the definition later loses
   * its pin.
   */
  targetEntityTypeKey?: string | null;
  /**
   * True for the Image value type. The ONLY thing that distinguishes the two
   * types at this tier, and the reason they cannot share a dispatch key.
   */
  imagesOnly?: boolean;
  value: CustomFieldEntityReferenceValue | null;
  /**
   * Emits the reference envelope or `null`. Typed to the envelope rather than
   * `unknown` so a base64 string or a browser `File` is a compile error here
   * rather than a 422 in production.
   */
  onChange: (next: CustomFieldEntityReferenceValue | null) => void;
  required?: boolean;
  disabled?: boolean;
  /** The HOST form's validation verdict, when it has one. */
  invalid?: boolean;
  /** Id of the host's own hint/error node, COMPOSED with this control's note rather than replaced. */
  describedBy?: string;
  /** The host form's error message when invalid. */
  error?: string;
}

/**
 * Draws a File or Image custom field: what it holds, how to clear it, and why it
 * cannot be attached from here.
 *
 * @param props See {@link MediaReferenceCustomFieldControlProps}. The renderer
 * maps a `FieldConfig` onto this narrow prop set once, rather than this control
 * learning to read a form-layer object.
 * @returns The rendered field.
 */
export function MediaReferenceCustomFieldControl({
  id,
  label,
  targetEntityTypeKey,
  imagesOnly,
  value,
  onChange,
  required,
  disabled,
  invalid,
  describedBy,
  error,
}: MediaReferenceCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();
  const noteId = React.useId();

  // PRESENCE, not shape. A stored value with a blank id is a half-reference the
  // backend refuses with its own `referenceIncomplete` message, and it must not
  // be treated as "attached" (which would offer a clear affordance for nothing)
  // nor silently rewritten to null (which is the wire's "delete this value").
  // It reads as not-attached here and travels to the server intact.
  const hasValue = value !== null && value.entityId.trim() !== "";
  const isConfigured = (targetEntityTypeKey ?? "").trim() !== "" || hasValue;

  // Clearing is refused on a REQUIRED field, following the reference control's
  // `allowClear={!required}` precedent -- clearing one only trades a stored
  // value for a validation error. Here the argument is stronger than there: with
  // no picker, a cleared value cannot be re-attached from this form at all, so
  // the clear would be irreversible in the session.
  const canClear = hasValue && !required && !disabled;

  const stateText = hasValue
    ? t(imagesOnly ? `${I18N}.imageAttached` : `${I18N}.fileAttached`)
    : t(imagesOnly ? `${I18N}.noImage` : `${I18N}.noFile`);

  const describedByValue = [describedBy, noteId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label ?? id}
        {required && (
          <span className="text-destructive ms-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <div
        id={id}
        role="group"
        aria-label={label ?? id}
        aria-describedby={describedByValue}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-surface px-3 py-2"
      >
        {/* Decorative: the state is already in the text beside it, and an icon
            that repeats its neighbour announces the same fact twice. */}
        {imagesOnly ? (
          <ImageIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-nx-ink-3" />
        ) : (
          <Paperclip aria-hidden="true" className="h-4 w-4 shrink-0 text-nx-ink-3" />
        )}
        <span className={hasValue ? "truncate text-sm" : "truncate text-sm text-nx-ink-3"}>
          {stateText}
        </span>
        {canClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ms-auto px-2 text-xs"
            onClick={() => onChange(null)}
          >
            {t(`${I18N}.clear`)}
          </Button>
        )}
      </div>

      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {/* The described-by region: why attaching is unavailable, plus the
          image-only requirement when it applies. Stated as a fact about the
          product, not an error -- the field is correctly configured and the
          stored value is fine; there is simply no attach affordance yet. */}
      <div id={noteId} className="space-y-1">
        <p className="text-xs text-nx-ink-3">
          {t(isConfigured ? `${I18N}.attachUnavailable` : `${I18N}.notConfigured`)}
        </p>
        {imagesOnly && <p className="text-xs text-nx-ink-3">{t(`${I18N}.imagesOnly`)}</p>}
      </div>
    </div>
  );
}
