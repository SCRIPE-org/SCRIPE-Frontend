"use client";

/**
 * LongText's dedicated edit control -- Wave 3.1 Task 12.
 *
 * Task 10 shipped a minimal, functionally-correct `Textarea` branch inline in
 * `renderCustomFieldControl.tsx` and explicitly deferred the counter/dir/
 * resize polish to this task (see that task's own report). This file is the
 * real control, extracted out of that single `if` branch the same way Task
 * 11 extracted `MultiSelectCustomFieldControl` -- it owns real
 * state-derived behaviour (the throttled counter below) that a plain JSX
 * branch would otherwise have to recompute inline, untested in isolation.
 *
 * **The cap is 10,000 characters (R8), enforced server-side.** `Validate`
 * rejects an over-cap value with a 422 -- this control's job, per the
 * governing pre-plan analysis's §5.1, is to make hitting that cap UNLIKELY
 * and LEGIBLE, not to silently prevent it:
 *
 *   - **No `maxLength` on the `<textarea>`, deliberately.** A hard
 *     `maxLength` silently swallows PASTED content past the cap with no
 *     feedback at all -- the single most-complained-about textarea
 *     behaviour, and GOV.UK's own character-count component explicitly
 *     avoids it for the same reason. Over-typing is allowed; the counter
 *     below goes negative-styled (red) and a real, nameable overage is what
 *     the user sees, matching the shape of the 422 they'd otherwise get.
 *   - **`resize-y` needs no extra work here.** `@core/ui/textarea.tsx`
 *     already bakes in `resize-y` unconditionally (block-axis only, so a
 *     wide textarea never breaks a two-column form or an RTL layout) --
 *     confirmed by reading that file directly before writing this one, so
 *     this control does not re-specify it.
 *   - **`dir={direction}`** closes the asymmetry the pre-plan analysis names
 *     explicitly: the shared `Input` fallthrough in
 *     `renderCustomFieldControl.tsx` sets no `dir` at all, while
 *     `GenericForm`'s own textarea branch does. LongText is body text, not a
 *     pinned physical control (no `Switch`-style LTR pin applies here per
 *     this codebase's own switch-direction convention) -- it follows
 *     `direction` like any other bidi-aware control.
 *
 * **Throttled `aria-live` announcement, not a per-keystroke one.** §5.1 is
 * explicit: "announcing on every keystroke is the classic character-count
 * a11y failure. Announce only on entering the last 10% and on crossing the
 * limit." That rules out simply putting `aria-live="polite"` on the SAME
 * node the visible, always-accurate counter renders into -- any DOM text
 * change inside a live region is a candidate announcement, so a live region
 * that also serves as the real-time visible counter would announce every
 * keystroke, the exact failure mode being avoided. This control therefore
 * splits the two responsibilities into two elements:
 *   1. A plain, non-live `<span>` that updates every keystroke -- what a
 *      SIGHTED user actually needs, always accurate, never throttled.
 *   2. A separate `sr-only` `aria-live="polite"` span whose text is only
 *      ever rewritten when the character count crosses INTO the "near
 *      limit" zone (>= 90% of the cap) or the "over limit" zone, tracked via
 *      a ref so a re-render for any other reason never re-fires the same
 *      announcement.
 * Both are referenced together via one field's `aria-describedby`, so a
 * screen reader still reads the current count when the field receives
 * focus (a static describedby read, not a live one) in addition to the
 * throttled proactive announcements as the user approaches/crosses the cap.
 *
 * A plain `<textarea>` with `<Label htmlFor>` genuinely computes an
 * accessible name here (unlike `GenericSelect`'s `role="combobox"` div --
 * see `MultiSelectCustomFieldControl.tsx`'s header comment for why that one
 * needs `aria-label` instead) -- §5.1 states this explicitly, and this
 * control's own test file verifies the REAL accessible name via
 * `getByRole("textbox", { name })`, not `getByLabelText`, per the same
 * "verify the real name" discipline Task 11 established.
 *
 * **No client-side "block submit" validator wired here, on purpose.** The
 * pre-plan analysis's §5.1 also suggests blocking submit with a named-overage
 * error, mirroring D5's Select/MultiSelect pattern. This control does not
 * build or wire that: D5's validators are exported from
 * `renderCustomFieldControl.tsx` and threaded into all 9 consumer sites'
 * save flows via `assertSelectCustomFieldValuesValid` -- a cross-cutting
 * change to files well outside this task's file ownership (the three
 * controls, their `renderCustomFieldControl.tsx` branches, and their own
 * tests). The counter's visible over-cap styling plus `aria-invalid` already
 * make an over-cap value impossible to submit *unnoticed*, and a real save
 * attempt still gets the server's own legible 422 naming the same cap this
 * control already displays -- there is no silent failure mode being left
 * open, just a client-side pre-empt this task's scope does not reach.
 * Flagged as a deliberate, documented choice, not a gap.
 */
import * as React from "react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { FieldConfig } from "@core/ui/forms/generic-form";

/**
 * The server's own hard cap (R8, `LongTextValueTypeHandler`) -- a storage
 * constraint the module owns, not a per-field preference, exactly like
 * `MULTI_SELECT_MAX_SELECTIONS` in the sibling MultiSelect control. Exported
 * so a future save-flow validator (see header comment above) can reuse this
 * exact number rather than risk a second, drifting copy of the cap.
 */
export const LONG_TEXT_MAX_CHARACTERS = 10_000;

/** The character-count band driving both the visible style and the throttled announcement. */
type CounterZone = "safe" | "nearLimit" | "over";

/** >= 90% of the cap is "near limit" -- matches §5.1's own stated threshold. */
const NEAR_LIMIT_RATIO = 0.9;

function resolveZone(length: number, max: number): CounterZone {
  if (length > max) return "over";
  if (length >= max * NEAR_LIMIT_RATIO) return "nearLimit";
  return "safe";
}

export interface LongTextCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: string) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
}

export function LongTextCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
}: LongTextCustomFieldControlProps): React.ReactElement {
  const { t, direction } = useI18n();
  const counterId = React.useId();
  const announceId = React.useId();

  // Same defensive posture as every other branch's `toFieldInputValue`: an
  // untouched field (undefined/null) reads as the empty string, never a
  // literal "undefined"/"null" typed into the box.
  const text = value === undefined || value === null ? "" : String(value);
  const length = text.length;
  const overBy = Math.max(0, length - LONG_TEXT_MAX_CHARACTERS);
  const zone = resolveZone(length, LONG_TEXT_MAX_CHARACTERS);

  const [announcement, setAnnouncement] = React.useState("");
  const lastAnnouncedZoneRef = React.useRef<CounterZone>("safe");

  React.useEffect(() => {
    // The ref read/write below happens inside the effect, never during
    // render -- the early return is what makes this fire an announcement
    // only when `zone` itself changes, not on every keystroke that leaves
    // the zone unchanged, even though `length`/`overBy` are effect deps.
    if (zone === lastAnnouncedZoneRef.current) return;
    lastAnnouncedZoneRef.current = zone;
    if (zone === "over") {
      setAnnouncement(
        t("customField.longText.charactersOverLimit", { overBy, max: LONG_TEXT_MAX_CHARACTERS })
      );
    } else if (zone === "nearLimit") {
      setAnnouncement(
        t("customField.longText.characterCount", { count: length, max: LONG_TEXT_MAX_CHARACTERS })
      );
    } else {
      // Back to safe (e.g. the user deleted text after being near/over the
      // cap) -- clear the live region rather than leave a stale warning
      // sitting there un-announced-again.
      setAnnouncement("");
    }
  }, [zone, length, overBy, t]);

  const counterText =
    zone === "over"
      ? t("customField.longText.charactersOverLimit", { overBy, max: LONG_TEXT_MAX_CHARACTERS })
      : t("customField.longText.characterCount", { count: length, max: LONG_TEXT_MAX_CHARACTERS });

  return (
    <div className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
      </Label>
      <Textarea
        id={fc.name}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fc.placeholder}
        required={fc.required}
        disabled={isViewMode}
        rows={fc.rows || 4}
        dir={direction}
        aria-describedby={`${counterId} ${announceId}`}
        aria-invalid={zone === "over" || undefined}
        // Deliberately NO maxLength -- see file header comment.
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
      {/* sr-only, throttled -- see file header comment for why this is a
          SEPARATE node from the visible counter above. */}
      <span id={announceId} aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
