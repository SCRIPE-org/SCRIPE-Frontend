"use client";

/**
 * DateTime's dedicated edit control -- Wave 3.1 Task 12.
 *
 * Task 10 shipped a minimal branch inline in `renderCustomFieldControl.tsx`
 * that correctly unpacks/repacks the `{ value, timeZoneId }` wire object
 * (avoiding the "[object Object]" `toFieldInputValue` trap) and pairs a
 * fresh instant with a default zone, but explicitly deferred the "visible
 * resolved zone" disclosure and its change affordance to this task (see that
 * task's own report). This file is the real control, extracted the same way
 * Task 11 extracted `MultiSelectCustomFieldControl` out of its own minimal
 * branch.
 *
 * **The zone is REQUIRED once any instant is submitted (ruling R7).**
 * `DateTimeValueTypeHandler.IsEmpty` is true only when BOTH pieces are
 * absent -- a half-blank `{ value: "...", timeZoneId: "" }` reaches
 * `Validate` and 422s, it is never silently dropped (Task 7's own report,
 * Decision 3). This control is built so that state is structurally
 * impossible to COMPOSE through the UI, not just discouraged:
 *   1. `handleInstantChange` NEVER emits an instant without a zone -- a
 *      freshly-typed instant with no prior zone is immediately paired with
 *      `getBrowserLocalTimeZoneId()` in the SAME `onChange` call, matching
 *      the pre-plan analysis's §5.3 ruling that the browser zone is the
 *      correct default for "the value this user is entering right now"
 *      (distinct from rendering someone ELSE's scheduled event, which is
 *      what `core/utils/timezone.ts`'s "never the browser's local zone"
 *      warning actually targets).
 *   2. Clearing the instant clears the WHOLE value to `null`, never leaving
 *      a zone-only remnant object behind.
 *   3. `TimezonePicker` is mounted with `allowClear={false}` (see that
 *      file's own header comment) -- there is no "x" affordance that could
 *      blank the zone while an instant still exists. The zone can only ever
 *      be REPLACED with another real IANA id, never removed.
 *   4. The zone picker itself only ever renders once an instant exists
 *      (`{instant && (...)}` below) -- there is nothing to attach a zone TO
 *      before that, so `handleZoneChange` is unreachable in the one state
 *      that would make it meaningless.
 *
 * **The zone is a disclosure, not a question (§5.3's central ruling).** A
 * per-value picker shown as the primary, always-open control over ~400 IANA
 * ids would be a bad interaction for the 95% case ("the zone I am in").
 * Instead: the resolved zone renders inline as plain text next to the
 * instant (`customField.dateTime.zoneDisclosure`, e.g. "Zone:
 * Africa/Cairo") with a small "Change" link that swaps in the real
 * `TimezonePicker` (a searchable combobox, never a flat ~400-row list) only
 * on demand -- exactly the Google Calendar / Cal.com pattern the pre-plan
 * analysis names. A "Cancel" link sits next to the picker while it is open
 * so a user who clicked "Change" by mistake has an explicit way back to the
 * compact disclosure view without being forced to pick a (possibly wrong)
 * zone just to close it.
 *
 * **Composition: `role="group"` with an accessible name, GOV.UK's
 * date-input shape.** §5.3 states there is no single WAI-ARIA "datetime"
 * pattern because this is genuinely three controls (instant, and now a
 * zone) -- the accessible answer is a labelled group containing each
 * sub-control with its own name, not one control pretending to be atomic.
 * `role="group"` here also gives assistive tech a way to announce "Meeting,
 * group" once, rather than the instant picker and the zone picker reading as
 * two unrelated fields with no stated relationship.
 *
 * **RTL: handled deliberately, not inherited wholesale.** The group and the
 * zone-disclosure row are plain flex layouts using gap (never hardcoded
 * left/right margins), so they already follow `direction` with no extra
 * work. `GenericSelect` (`TimezonePicker`'s own primitive) is independently
 * confirmed clean for RTL by the pre-plan analysis's §5.2 (`Popover` with
 * `dir` threaded, logical properties throughout). This control does NOT
 * touch `DatePicker`/`CustomCalendar` at all -- the pre-plan analysis's own
 * scope call (§5.3) restricts DateTime's DatePicker-specific RTL fix (the
 * anchor-edge positioning bug) and the duplicate `time-input` id fix to
 * being named follow-ups rather than bundled into this task, since both
 * live in a shared component with ~8+ unrelated call sites outside this
 * task's file ownership -- see this task's own report for that decision.
 */
import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { DatePicker } from "@core/ui/date-picker";
import { getBrowserLocalTimeZoneId } from "@core/utils/timezone";
import { TimezonePicker } from "./TimezonePicker";
import { isFieldRequired, type FieldConfig } from "@core/ui/forms/generic-form";
import type { CustomFieldDateTimeValue } from "../../../../../custom-field-value/src/data/models/CustomFieldValueModel";

export interface DateTimeCustomFieldControlProps {
  fc: FieldConfig;
  value: unknown;
  onChange: (value: CustomFieldDateTimeValue | null) => void;
  /** Mirrors every other renderCustomFieldControl branch's isViewMode contract. */
  isViewMode?: boolean;
  invalid?: boolean;
  describedBy?: string;
  error?: string;
}

export function DateTimeCustomFieldControl({
  fc,
  value,
  onChange,
  isViewMode,
  invalid,
  describedBy,
  error,
}: DateTimeCustomFieldControlProps): React.ReactElement {
  const isRequired = isFieldRequired(fc);
  const { t } = useI18n();
  const [isChangingZone, setIsChangingZone] = React.useState(false);

  const current =
    value && typeof value === "object" ? (value as Partial<CustomFieldDateTimeValue>) : null;
  const instant = typeof current?.value === "string" ? current.value : "";
  const timeZoneId = typeof current?.timeZoneId === "string" ? current.timeZoneId : null;
  const resolvedZone = timeZoneId ?? getBrowserLocalTimeZoneId();

  const handleInstantChange = (nextInstant: string) => {
    if (!nextInstant || nextInstant.trim() === "") {
      onChange(null);
      setIsChangingZone(false);
      return;
    }
    const resolvedZone = timeZoneId ?? getBrowserLocalTimeZoneId();
    onChange({ value: nextInstant, timeZoneId: resolvedZone });
  };

  const handleZoneChange = (nextZone: string | null) => {
    if (!instant || !nextZone) return;
    onChange({ value: instant, timeZoneId: nextZone });
    setIsChangingZone(false);
  };

  const fieldName = fc.label ?? fc.name;

  return (
    <div role="group" aria-label={fieldName} className="space-y-2">
      <Label htmlFor={fc.name} className="text-sm font-medium">
        {fc.label}
        {isRequired && (
          <span className="text-destructive ms-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <DatePicker
        id={fc.name}
        type="datetime-local"
        value={instant}
        onChange={handleInstantChange}
        required={isRequired}
        disabled={isViewMode}
        // Same accessible-name fix as the Date branch in
        // renderCustomFieldControl.tsx: without a `placeholder`, DatePicker
        // computes its own internal aria-label as the generic
        // `t("common.selectDate")`, never the field's own name.
        placeholder={fc.placeholder || fieldName}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && describedBy ? describedBy : undefined}
        className={cn(invalid && "border-destructive focus-visible:ring-destructive")}
      />
      {invalid && error && (
        <p id={describedBy} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {instant && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-nx-ink-3">
          {isChangingZone ? (
            <>
              <TimezonePicker
                id={`${fc.name}-timezone`}
                aria-label={t("customField.dateTime.timezonePickerLabel", { field: fieldName })}
                value={resolvedZone}
                onChange={handleZoneChange}
                disabled={isViewMode}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setIsChangingZone(false)}
              >
                {t("customField.dateTime.cancelTimezoneChange")}
              </Button>
            </>
          ) : (
            <>
              {/* Always render the resolved zone -- pre-plan analysis §5.3:
                  "a stored DateTime is never ambiguous." */}
              <span>{t("customField.dateTime.zoneDisclosure", { zone: resolvedZone })}</span>
              {!isViewMode && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs font-medium"
                  onClick={() => setIsChangingZone(true)}
                >
                  {t("customField.dateTime.changeTimezone")}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
