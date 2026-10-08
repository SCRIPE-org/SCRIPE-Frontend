"use client";

/**
 * RichText's dedicated edit control -- Wave 3.4.
 *
 * **THE WHOLE REASON THIS FILE EXISTS IS ONE TRANSLATION.** `RichTextEditor` is
 * `value: string` / `onChange(html: string)`. The wire is an OBJECT:
 * `{ "html": "<p>hello</p>" }`. A control that hands the editor's bare string
 * straight to the form does not produce a slightly-wrong payload, it produces a
 * field that can NEVER be saved -- `RichTextValueTypeHandler.Parse` returns
 * `WasExtractable: false` for a bare string and the save answers 422
 * `customFields.values.unsupportedType`. So the wrap/unwrap is the contract, and
 * it lives here.
 *
 * **WHY THE BACKEND REFUSES THE OBVIOUS SHAPE**, since "just send a string" is
 * what anyone would reach for and the refusal looks like fussiness until you
 * read the middleware. `InputSanitizationMiddleware` strips HTML tags out of
 * every string in every request body except the paths named in
 * `InputSanitizationOptions.HtmlBearingRoutes`, and the entry for the values PUT
 * is `values.*.html` -- a PATH, pinned to the `html` member of a field's value
 * object. A bare string at `values.myField` matches no exempt path, so it would
 * reach the handler with every tag already deleted: the server would answer 200
 * and store prose whose paragraphs, links and lists were destroyed in transit.
 * Refusing is the honest outcome, and the object envelope is what makes the
 * carve-out reachable. (The path form matters the other way too: a field key is
 * validated only `^[a-z][a-z0-9_]*$`, so `html` is a key any tenant admin can
 * create, and a bare-NAME exemption would have handed a plain Text field called
 * `html` the same pass-through with no handler sanitizing it.)
 *
 * **`null`, NEVER `{ html: "" }`, WHEN THE EDITOR IS EMPTIED.** The two are not
 * the same request. `null` is the wire's "clear this field"; an envelope around
 * an empty string is a value, and `IsEmpty` would treat it as empty anyway --
 * but only after `Validate` had run a sanitizer over it. Emitting null also
 * keeps `isRequiredFieldEmpty` and `validateRichTextCustomFieldValue` reading
 * the same fact rather than each having to know that blank markup means blank.
 * The reverse direction matches: `Project` returns null for a blank column
 * rather than an envelope around `""`, so a round trip is stable.
 *
 * **WHY NOT THE EDITOR'S OWN `maxLength`.** `RichTextEditor` forwards
 * `maxLength` into TipTap's `CharacterCount` extension, and that would be wrong
 * twice over. It measures TEXT characters, while the server caps the RAW MARKUP
 * at 50,000 -- markup is a large constant factor over the prose inside it, so
 * the two numbers are not comparable and a limit set to one would fire at the
 * wrong time for the other. And `CharacterCount`'s `limit` HARD-BLOCKS input,
 * which silently swallows pasted content past the cap: the single
 * most-complained-about text-field behaviour, and precisely what
 * `LongTextCustomFieldControl` refuses to do for the same reason (see that
 * file's header on GOV.UK's character-count component). So this control counts
 * the raw HTML itself, exactly what the server measures, lets the operator go
 * over, and makes the overage impossible to miss.
 *
 * The counter is `LongTextCustomFieldControl`'s two-node split, reproduced
 * rather than shared: a plain always-accurate `<span>` for the eye, and a
 * SEPARATE `sr-only` `aria-live="polite"` node whose text is rewritten only when
 * the count crosses INTO the near-limit or over-limit band. Putting
 * `aria-live` on the visible counter is the classic character-count a11y failure
 * -- any text change inside a live region is a candidate announcement, so the
 * always-updating node would announce every keystroke. The two files keep their
 * own copies because they cap different quantities against different backend
 * handlers; what is shared is the shape, and it is named here so the next reader
 * knows there are two and why.
 *
 * **SOURCE MODE IS OFF.** `RichTextEditor` defaults `showSourceToggle` to true,
 * which offers a raw-HTML textarea. For an email template, whose author is
 * building markup on purpose, that is a feature. For a custom field it invites
 * the operator to paste markup the server's allowlist will then remove --
 * `HtmlAllowlistSanitizer.SanitizeRichText` refuses `style` attributes and `img`
 * outright (inline styles let untrusted content overlay the surrounding UI, and
 * a remote image URL is a tracking beacon that fires for every viewer). Leaving
 * it on would mean a field where hand-written markup vanishes on save with no
 * explanation. The toolbar's own image and colour affordances are subject to the
 * same allowlist and are NOT suppressed, because they cannot be from out here --
 * flagged as a real, known rough edge rather than papered over: markup the
 * toolbar can produce and the allowlist then drops is visible to the operator on
 * the next load, since `Project` returns what was actually stored.
 *
 * **ACCESSIBLE NAME COMES FROM `ariaLabel`, NOT `<Label htmlFor>` ALONE.** The
 * element that takes focus is TipTap's contenteditable `<div>`, and
 * `contenteditable` confers no implicit ARIA role, so a `for`/`id` pair pointing
 * at it computes no name -- the same mechanism `MultiSelectCustomFieldControl`
 * and `EntityReferenceCustomFieldControl` document for their `role="combobox"`
 * triggers. The `<Label>` is kept because it is real, visible, clickable DOM for
 * sighted users. The name, the role, the describedby list and `aria-invalid` all
 * reach the contenteditable through the four forwarding props `RichTextEditor`
 * grew for this.
 */
import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { RichTextEditor } from "@core/ui/rich-text-editor/RichTextEditor";
import type { CustomFieldRichTextValue } from "../../../../../custom-field-value/src/domain/entities/CustomFieldValue";
import { RICH_TEXT_MAX_CHARACTERS } from "../../registries/valueTypeRegistry";

/**
 * Re-exported, not declared here, and the difference matters if you come looking
 * for it: the cap lives in `valueTypeRegistry.ts` beside `RATING_MAX`, because
 * `customFieldValueValidation.ts` needs the same number and is imported by all
 * nine consumer save flows -- so declaring it in this file would pull this file,
 * and therefore TipTap, into nine viewmodels that never render an editor. That
 * registry module is pure data with no React import, so both sides reach it for
 * free. See its own doc comment for what the number means and why it is measured
 * on the raw markup.
 *
 * The re-export exists so a reader who expects the constant beside its control --
 * which is where `LONG_TEXT_MAX_CHARACTERS` and `MULTI_SELECT_MAX_SELECTIONS`
 * genuinely are -- finds it rather than concluding there is no cap.
 */
export { RICH_TEXT_MAX_CHARACTERS } from "../../registries/valueTypeRegistry";

/** The band driving both the visible counter style and the throttled announcement. */
type CounterZone = "safe" | "nearLimit" | "over";

/** >= 90% of the cap is "near limit" -- the same threshold LongText's counter uses. */
const NEAR_LIMIT_RATIO = 0.9;

function resolveZone(length: number, max: number): CounterZone {
  if (length > max) return "over";
  if (length >= max * NEAR_LIMIT_RATIO) return "nearLimit";
  return "safe";
}

/**
 * Documentation for module export
 */
export interface RichTextCustomFieldControlProps {
  /**
   * Lands on the contenteditable, so the sibling `<Label htmlFor>` is real DOM
   * wiring and a host's hint/error node can be pointed at this field. It is NOT
   * what computes the accessible name -- see this file's header comment.
   */
  id: string;
  label?: string;
  /**
   * The stored value, already narrowed to the envelope by the renderer. `null`
   * means the field is empty -- there is no second "empty envelope" state to
   * distinguish, by design.
   */
  value: CustomFieldRichTextValue | null;
  /**
   * Emits the ENVELOPE or `null`. Never a bare string: that is the shape the
   * write path refuses, and this signature is what makes the refusal
   * unreachable from the UI rather than merely unlikely.
   */
  onChange: (next: CustomFieldRichTextValue | null) => void;
  required?: boolean;
  /** View mode / form-level read-only. Maps to the editor's `readOnly`, which also hides the toolbar. */
  disabled?: boolean;
  placeholder?: string;
  /** The HOST form's validation verdict, when it has one (GenericForm does; the 8 hand-wired sites do not). */
  invalid?: boolean;
  /** Validation error message to render inline when invalid. */
  error?: string;
  /** Id of the host's own hint/error node, COMPOSED with this control's counter ids rather than replaced. */
  describedBy?: string;
}

/**
 * Draws a rich-text custom field: the editor, its label, and a raw-markup
 * counter against the server's cap.
 *
 * @param props See {@link RichTextCustomFieldControlProps}; the renderer maps a
 * `FieldConfig` onto this narrow prop set once, in
 * `renderCustomFieldControl.tsx`, rather than this control learning how to read
 * a form-layer object.
 * @returns The rendered field.
 */
export function RichTextCustomFieldControl({
  id,
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
  invalid,
  error,
  describedBy,
}: RichTextCustomFieldControlProps): React.ReactElement {
  const { t } = useI18n();
  const counterId = React.useId();
  const announceId = React.useId();

  // Accepted and deliberately NOT forwarded. A contenteditable is not a form
  // control, so there is no native `required` for the browser to enforce and no
  // element to hang one on. The requirement is enforced in the two places that
  // can actually observe a submit: GenericForm's own required pass (via this
  // type's `OBJECT_VALUED_EMPTINESS_CHECKS` rule) and
  // `assertSelectCustomFieldValuesValid` for the 8 hand-wired sites. Taking the
  // prop keeps this control's signature uniform with its siblings; pretending to
  // honour it would be worse than declining it.
  void required;

  const html = value?.html ?? "";
  const length = html.length;
  const overBy = Math.max(0, length - RICH_TEXT_MAX_CHARACTERS);
  const zone = resolveZone(length, RICH_TEXT_MAX_CHARACTERS);

  const [announcement, setAnnouncement] = React.useState("");
  const lastAnnouncedZoneRef = React.useRef<CounterZone>("safe");

  React.useEffect(() => {
    // The ref is read and written inside the effect, never during render, and
    // the early return is what makes this fire only when the BAND changes --
    // `length`/`overBy` are deps because the message interpolates them, not
    // because every keystroke should announce.
    if (zone === lastAnnouncedZoneRef.current) return;
    lastAnnouncedZoneRef.current = zone;
    if (zone === "over") {
      setAnnouncement(
        t("customField.richText.charactersOverLimit", { overBy, max: RICH_TEXT_MAX_CHARACTERS })
      );
    } else if (zone === "nearLimit") {
      setAnnouncement(
        t("customField.richText.characterCount", { count: length, max: RICH_TEXT_MAX_CHARACTERS })
      );
    } else {
      // Back to safe -- clear the region rather than leave a stale warning in it.
      setAnnouncement("");
    }
  }, [zone, length, overBy, t]);

  const counterText =
    zone === "over"
      ? t("customField.richText.charactersOverLimit", { overBy, max: RICH_TEXT_MAX_CHARACTERS })
      : t("customField.richText.characterCount", { count: length, max: RICH_TEXT_MAX_CHARACTERS });

  // COMPOSED, not overwritten: `aria-describedby` is an id list, so the host's
  // error text and this control's counter are both announced. Same treatment
  // every other control in this family gives the prop.
  const describedByIds = [describedBy, counterId, announceId].filter(Boolean).join(" ");

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label ?? id}
        {required && (
          <span className="ms-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <RichTextEditor
        id={id}
        ariaLabel={label ?? id}
        ariaDescribedBy={describedByIds}
        // Announced as invalid for the host's verdict OR a genuine overage. The
        // overage is a real refusal the server will make, so saying so before
        // the round trip is the same bargain the visible counter strikes.
        ariaInvalid={invalid || zone === "over"}
        error={invalid || zone === "over"}
        value={html}
        // The wrap, and the only place it happens. Blank-or-whitespace markup
        // becomes `null` so the field is genuinely CLEARED rather than storing an
        // empty envelope -- see this file's header comment.
        onChange={(next) => onChange(next.trim() === "" ? null : { html: next })}
        placeholder={placeholder}
        readOnly={disabled}
        // Off on purpose -- see this file's header comment on source mode.
        showSourceToggle={false}
      />
      <div className="flex items-center justify-end">
        <span
          id={counterId}
          className={cn(
            "text-xs tabular-nums",
            zone === "over"
              ? "font-medium text-nx-danger"
              : zone === "nearLimit"
                ? "font-medium text-nx-warning"
                : "text-nx-ink-3"
          )}
        >
          {counterText}
        </span>
      </div>
      {/* sr-only and throttled -- a SEPARATE node from the visible counter
          above, for the reason this file's header gives. */}
      <span id={announceId} aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {invalid && error && (
        <p
          id={describedBy}
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
