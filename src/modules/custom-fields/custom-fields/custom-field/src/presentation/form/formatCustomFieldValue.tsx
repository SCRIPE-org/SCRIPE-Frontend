"use client";

/**
 * Shared per-type READ/format function -- Wave 2 Step 2.2, Task 5.
 *
 * Ports the Number/Boolean/Date/Text-and-Select-fallthrough branches of
 * buildCustomFieldColumn's own inline switch (core/crud/customFieldsExtension.tsx)
 * into ONE function, registered against
 * CustomFieldsExtensionApi.formatValueForDisplay (customFieldsCrudIntegration.tsx)
 * the same way getFormFields/saveValues/getBulkColumnValues/InlineAddTrigger are
 * already registered -- the read-side counterpart of renderCustomFieldControl.tsx
 * (Tasks 2-4), which owns the EDIT side of these same 5 value types.
 *
 * ARCHITECTURE DECISION (Option B, of the two the task brief laid out):
 * buildCustomFieldColumn lives in `core`, and `core` cannot import from
 * `src/modules/*` (docs/architecture/01-modularity.md's Dependency Rule;
 * customFieldsExtension.tsx's own header comment describes the one
 * deliberate exception this file exists to contain). That leaves two
 * legitimate homes for the new shared table:
 *   (a) inside `core` itself, keyed on the CustomFieldValueTypeName type
 *       core already redeclares independently (customFieldsExtension.tsx:32);
 *   (b) inside this module, behind a new CustomFieldsExtensionApi member the
 *       module registers -- the exact mechanism this file already uses for
 *       every other piece of per-type CustomFields knowledge core needs
 *       (getFormFields turns a value type into a FieldConfig; saveValues and
 *       getBulkColumnValues round-trip stored values; InlineAddTrigger owns
 *       the create-time UI). Per-type DISPLAY formatting is the same shape
 *       of capability as those four, not a different one, so (b) keeps this
 *       file internally consistent instead of introducing a second, parallel
 *       way for core to get type-aware CustomFields behavior -- one inline
 *       redeclared type for a data SHAPE (CustomFieldColumnDefinition's
 *       wire contract) is not the same thing as duplicating per-type
 *       BEHAVIOR in core, which is exactly what buildCustomFieldColumn's
 *       switch was doing before this task and what option (a) would have
 *       relocated rather than fixed. Formatting logic belongs with the
 *       module that owns the value-type domain (and, per Task 1's own
 *       VALUE_TYPE_CATALOG living here, already keeps the rest of that
 *       domain's presentation metadata) -- so this file lives in
 *       `presentation/form/`, next to renderCustomFieldControl.tsx and the
 *       other pieces a host form needs to draw and submit a custom field.
 *       The catalog it reads (VALUE_TYPE_CATALOG) is pure data and sits one
 *       folder over in `presentation/registries/`; core reaches neither path
 *       directly -- it goes through the submodule barrel.
 *
 * `formatValueForDisplay`'s signature grew one parameter beyond the task
 * brief's own illustrative sketch (`(valueType, value, language) => ReactNode`):
 * the Boolean branch's Badge label goes through `t("common.yes"/"common.no")`,
 * exactly as it did in the original inline switch, so `t` has to be threaded
 * through as a fourth parameter the same way buildCustomFieldColumn itself
 * already receives it -- dropping it would silently regress Boolean cells to
 * an untranslated hardcoded string.
 *
 * CATALOG-DRIVEN OR MANUAL CASES (Wave 3.1 Task 10 decision): this switch
 * stays a hand-maintained `switch (valueType)`, matching Wave 2's own
 * carried-forward structural exception, rather than growing a `format`
 * function field on `ValueTypeCatalogEntry`. Reasoning:
 *   1. `valueTypeRegistry.ts` is pure data today (strings/booleans) with no
 *      React import at all -- every entry mirrors a backend
 *      `ValueTypeDescriptor`, itself pure data (LabelKey/BadgeVariant/
 *      HasPlaceholder/HasOptions/FieldConfigType, no formatter). Keeping the
 *      frontend catalog data-only preserves that parallel structure, which
 *      several ValueTypeDescriptor doc comments explicitly lean on ("Mirrors
 *      VALUE_TYPE_CATALOG.LongText exactly").
 *   2. The completeness gate below (`it.each(ALL_VALUE_TYPES)`, extended in
 *      this task to all 8 members) is exactly as strong against a manual
 *      switch as it would be against a catalog-owned formatter -- the
 *      vacuousness risk Step 2.2's review found was a testing-discipline gap
 *      (a fallthrough that never got its own assertion), not a structural
 *      one a catalog would have prevented by itself.
 *   3. MultiSelect's and DateTime's read-side presentation (chips vs. a
 *      richer removable-token display; the DateTime zone disclosure's exact
 *      visual treatment) is still Task 11/12's to design. Locking a
 *      catalog-owned formatter shape in now, before those land, risks
 *      redesigning this same abstraction twice. Revisit once Tasks 11/12
 *      ship if the manual switch has grown unwieldy.
 *
 * FILE-OWNERSHIP NOTE (Wave 3.1 Task 12): Task 10/11 settled the LongText/
 * DateTime/MultiSelect cases below and Task 12's brief named this file
 * as theirs, not to be redesigned here. The ONE exception is the pre-existing
 * `case "Date"` -- Task 10's own closing report explicitly left it untouched
 * ("Flagging so nobody assumes this task fixed Date's existing UTC/local
 * mismatch -- it did not touch it at all... is a backend+frontend joint-
 * deploy change the pre-plan assigns to T12, not T10") and Task 12's own
 * brief separately named this exact function's day-shift bug as the one
 * real, must-fix defect in its scope. That single case (and its own test
 * coverage in formatCustomFieldValue.test.tsx) is the only part of this file
 * Task 12 touched -- see that case's own comment for the fix.
 */
import React from "react";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { EmptyCustomFieldCell } from "@core/crud/customFieldsExtension";
import { formatInTimeZone, isValidTimeZoneId } from "@core/utils/timezone";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type {
  CustomFieldCurrencyValue,
  CustomFieldDateTimeValue,
  CustomFieldValueTypeName,
} from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { isEntityReferenceValue } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import { RATING_MAX, VALUE_TYPE_CATALOG } from "../registries/valueTypeRegistry";

/** Matches useI18n()'s own `t` signature, and buildCustomFieldColumn's existing `t` parameter. */
export type FormatTranslateFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Formats one already-known-non-empty custom-field value for read-only table
 * display. The empty-value gate (`isEmptyCustomFieldValue`/`EmptyCustomFieldCell`
 * for `null`/`undefined`/`""`) stays in buildCustomFieldColumn itself -- it is
 * type-BLIND (applies before this function is ever called, regardless of
 * `valueType`) and is deliberately NOT duplicated or re-implemented here.
 *
 * Number/Date each still render `EmptyCustomFieldCell` for their OWN
 * type-specific reason (a non-empty raw value that nonetheless fails to
 * parse as a finite number / valid date, e.g. a corrupt or manually-edited
 * stored value) -- that is a per-type concern, not the type-blind gate
 * above, so it belongs in this per-type function, ported verbatim from the
 * original switch's own NaN guards.
 */
export function formatCustomFieldValue(
  valueType: CustomFieldValueTypeName,
  value: unknown,
  language: string,
  t: FormatTranslateFn
): React.ReactNode {
  switch (valueType) {
    case "Number": {
      const num = typeof value === "number" ? value : Number(value);
      return Number.isNaN(num) ? (
        <EmptyCustomFieldCell />
      ) : (
        num.toLocaleString(resolveIntlLocale(language))
      );
    }
    case "Boolean": {
      const bool = Boolean(value);
      return (
        <Badge variant={bool ? "info" : "secondary"}>
          {bool ? t("common.yes") : t("common.no")}
        </Badge>
      );
    }
    // Wave 3.1 Task 12 bug fix -- a real, pre-existing day-shift defect, not
    // a design question. Task 6 (backend) made Date a true calendar date:
    // `DateValueTypeHandler.Project` now returns a C# `DateOnly`, and with no
    // custom `DateOnly` JSON converter registered (confirmed by reading
    // `ServiceExtensions.cs`'s `AddJsonOptions`), .NET's built-in converter
    // serializes it as a BARE "yyyy-MM-dd" string on the wire -- no time
    // component, no "Z", never an instant (Task 6's own report: the fallback
    // path also always resolves to a `DateOnly` before it is ever
    // serialized, so there is no transition-window wire-shape ambiguity).
    //
    // The code this replaced -- `new Date(value as string)` followed by
    // `toLocaleDateString()` -- was already wrong for that bare-date shape
    // before this task, and Task 6's true-date storage turns it from
    // "sometimes wrong" into "wrong for every value, for every viewer west
    // of UTC": per ECMA-262 21.4.3.2, a date-only ISO string parses as UTC
    // MIDNIGHT, and `toLocaleDateString()` then renders in the VIEWER's own
    // LOCAL zone. `new Date("2026-08-18")` is `2026-08-18T00:00:00.000Z`;
    // for a viewer in `America/Los_Angeles` (UTC-8) that instant is
    // `2026-08-17T16:00` LOCAL, so `toLocaleDateString()` silently prints
    // "8/17/2026" -- one calendar day EARLIER than the value actually
    // stored, for every viewer west of UTC, every time.
    //
    // Fix: parse the three calendar components directly out of the string
    // and construct a LOCAL `Date` from them via the 3-arg constructor
    // (`Date(y, m-1, d)` never touches UTC at all, unlike the 1-arg string
    // constructor), so the same Y/M/D value round-trips through
    // `toLocaleDateString()` unchanged in every timezone. A value that isn't
    // exactly a bare `yyyy-MM-dd` string (including a full ISO instant --
    // this type must never accept one) renders the same empty-cell marker
    // every other type-specific parse failure in this switch already uses.
    // Pinned in formatCustomFieldValue.test.tsx with a test that sets
    // `process.env.TZ` to a zone west of UTC (and one east) and would fail
    // under the old `new Date(iso)` implementation.
    case "Date": {
      const match = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
      if (!match) {
        return <EmptyCustomFieldCell />;
      }
      const [, y, m, d] = match;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return Number.isNaN(date.getTime()) ? (
        <EmptyCustomFieldCell />
      ) : (
        date.toLocaleDateString(resolveIntlLocale(language))
      );
    }
    // LongText deliberately shares Text/Select's plain-string fallthrough --
    // it is a genuinely separate WRITE-side capability (its own unbounded
    // column, R8) but there is no read-side transformation a longer string
    // needs that a shorter one doesn't already skip. Truncation/expand-in-
    // place for a very long value is a table-cell layout concern, not a
    // formatting one, and is left to Task 12 if it turns out to matter.
    case "LongText":
    case "Text":
    case "Select":
      return String(value);
    // MultiSelect: chips, not a joined string -- pre-plan analysis §5.2
    // names `String(["a","b"])` producing "a,b" as indistinguishable from a
    // Text value that happens to contain a comma, so this renders each
    // selected label as its own Badge instead. Non-interactive (no remove
    // affordance) -- this is the READ side; Task 11 owns the edit-side
    // token/keyboard behaviour. An empty array reaches here only if a row
    // was ever persisted with zero selections (defensive, not the expected
    // shape -- IsEmpty([]) means no row is written at all), so it gets the
    // same EmptyCustomFieldCell every other type's own "technically present
    // but nothing to show" case uses.
    case "MultiSelect": {
      const labels = Array.isArray(value) ? (value as unknown[]) : [];
      if (labels.length === 0) {
        return <EmptyCustomFieldCell />;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {labels.map((label, index) => (
            <Badge key={`${index}-${String(label)}`} variant="secondary">
              {String(label)}
            </Badge>
          ))}
        </div>
      );
    }
    // DateTime: renders both the instant AND its stored zone, per the
    // pre-plan analysis's §5.3 ruling ("Always render the resolved zone on
    // the read side, so a stored DateTime is never ambiguous") -- a bare
    // `toLocaleString()` would silently reinterpret the instant in the
    // VIEWER's own local zone, which is a different moment-in-context than
    // the zone the value was actually entered in. `formatInTimeZone` is
    // `core/utils/timezone.ts`'s existing render-only helper (this module
    // must not hand-roll zone math) -- its own contract does not accept a
    // locale parameter (always the runtime's default), a known, narrower-
    // than-ideal limitation left for Task 12 to revisit if it matters enough
    // to matter, not silently worked around here.
    case "DateTime": {
      const dt =
        value && typeof value === "object" ? (value as Partial<CustomFieldDateTimeValue>) : null;
      if (!dt?.value || !dt.timeZoneId || !isValidTimeZoneId(dt.timeZoneId)) {
        return <EmptyCustomFieldCell />;
      }
      try {
        const formatted = formatInTimeZone(dt.value, dt.timeZoneId, {
          dateStyle: "medium",
          timeStyle: "short",
        });
        return `${formatted} · ${dt.timeZoneId}`;
      } catch {
        return <EmptyCustomFieldCell />;
      }
    }
    // Email (Wave 3.2 Batch 3, R6): a real `mailto:` link, not plain text --
    // the one read-side treatment R6 names explicitly for this type.
    // EmailValueTypeHandler's own write-time check (`MailAddress` parsing,
    // `parsed.Address == trimmed`) already rejects a `"Display Name <addr>"`
    // wrapper, so every stored value here is a bare address -- safe to drop
    // straight into `mailto:` with no extra encoding beyond what a template
    // literal already does (no query-string params like `?cc=`/`?body=` can
    // be smuggled in, since those would have failed the write-time
    // `Address == trimmed` equality check).
    case "Email": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      return (
        <a href={`mailto:${text}`} className="text-nx-accent hover:underline">
          {text}
        </a>
      );
    }
    // Url (Wave 3.2 Batch 3, R4/trap #3): this module's FIRST live `<a href>`
    // -- `target="_blank" rel="noopener noreferrer"` per R4's explicit
    // instruction (no `rel="noopener noreferrer"` would let the opened page
    // reach back via `window.opener`). UrlValueTypeHandler's http/https
    // scheme allowlist is the real defence, but it only runs at WRITE time
    // and only as of this wave's backend deploy -- a row written before that
    // (or, in principle, one that reached the column through some other path
    // this module doesn't control) could still hold a `javascript:`/`data:`/
    // `vbscript:`/`file:` value. This is the module's first live anchor, so
    // there is no existing sink to inherit encoding/scheme discipline from --
    // the scheme is re-checked HERE, client-side, as defence-in-depth: only
    // `http:`/`https:` ever become a clickable anchor; anything else
    // (including a value that fails to parse as an absolute URL at all)
    // renders as inert plain text -- still shown (this is legitimate stored
    // data, not something to hide), just never wired to `href`.
    case "Url": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      let isSafeScheme = false;
      try {
        const parsed = new URL(text);
        isSafeScheme = parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        isSafeScheme = false;
      }
      if (!isSafeScheme) {
        return text;
      }
      return (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="text-nx-accent hover:underline"
        >
          {text}
        </a>
      );
    }
    // Phone (Wave 3.2 Batch 3, R3): the stored value is canonical E.164
    // ("+201234567890"), correct but not itself human-friendly.
    // `libphonenumber-js` is already a real dependency of this module's own
    // edit control (`core/ui/phone-input.tsx` imports it) -- reused here, not
    // newly added, purely for its international-format ("+20 123 456 7890")
    // read-side rendering. Falls back to the raw stored string if it doesn't
    // parse (defensive, matching Number/Date's own NaN/invalid-parse
    // fallback pattern in this same switch -- a malformed historical value
    // must never throw, only degrade to its plain stored form).
    case "Phone": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      try {
        const parsed = parsePhoneNumberFromString(text);
        return parsed ? parsed.formatInternational() : text;
      } catch {
        return text;
      }
    }
    // Percent (Wave 3.2 Batch 3, R5 -- THE formatting trap this batch exists
    // to defend against). `PercentValueTypeHandler` stores 0-100, the number
    // the user typed (PD-2) -- NOT a 0-1 fraction.
    // `Intl.NumberFormat(locale, { style: "percent" })` expects a 0-1
    // fraction and MULTIPLIES BY 100 internally, so feeding it a stored `25`
    // directly would render "2500%". Deliberately NOT using that API at all
    // (rather than remembering to divide by 100 first, which is one silent
    // off-by-100x away from reintroducing this exact bug the next time this
    // case is touched): format the number with the locale's own
    // grouping/decimal rules via `toLocaleString` -- the SAME call Number's
    // own case above uses -- then hand-append "%". `maximumFractionDigits: 6`
    // matches `ValueNumber`'s own `HasPrecision(18, 6)` column headroom
    // (Percent decimals are allowed, unlike Rating) so a stored `33.5`
    // round-trips as "33.5%", never rounded away.
    // Pinned by a test asserting a stored 25 renders "25%", never "2500%".
    case "Percent": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })}%`;
    }
    // Rating (Wave 3.2 Batch 3, R2/R6): "N / 5" is the whole read-side
    // treatment -- R6 states this explicitly ("Read side '3 / 5' is
    // sufficient for v1; a star-glyph control is explicitly out of scope").
    // `RATING_MAX` is imported from valueTypeRegistry.ts, the same constant
    // the write-side Slider branch uses, so the two can never drift to
    // different ceilings.
    case "Rating": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num} / ${RATING_MAX}`;
    }
    // Currency (Wave 3.3 Batch C, rulings R1/R2): a real, locale-aware
    // currency-formatted string ("USD 1,234.56"), not a bare number next to
    // a bare code -- `Intl.NumberFormat`'s own `style: "currency"` handles
    // grouping, decimal separator AND the currency's conventional decimal
    // places for free. `currencyDisplay: "code"` (not the default "symbol")
    // is deliberate: R2's own ruling is that no authoritative ISO 4217 list
    // exists in this repo, so a shape-valid-but-unassigned code (e.g. "ZZZ")
    // is accepted server-side -- a symbol lookup for an unrecognized code
    // would be ambiguous or absent, while the code itself is always exactly
    // what was stored, unambiguous by construction.
    // `Intl.NumberFormat` THROWS a RangeError for a currency code it does
    // not recognize as ISO 4217-shaped at all (distinct from "recognized
    // shape, not a real/assigned currency", which it accepts and formats) --
    // caught here and degraded to a plain locale-formatted concatenation,
    // the same "never throw, degrade to the raw stored data" posture Url/
    // Phone/Date already use in this switch for their own malformed-input
    // cases. This is legitimate stored data either way, never hidden.
    case "Currency": {
      const currency =
        value && typeof value === "object" ? (value as Partial<CustomFieldCurrencyValue>) : null;
      const amountNum =
        typeof currency?.amount === "number" ? currency.amount : Number(currency?.amount);
      if (!currency || Number.isNaN(amountNum) || !currency.currencyCode) {
        return <EmptyCustomFieldCell />;
      }
      try {
        return new Intl.NumberFormat(resolveIntlLocale(language), {
          style: "currency",
          currency: currency.currencyCode,
          currencyDisplay: "code",
        }).format(amountNum);
      } catch {
        return `${currency.currencyCode} ${amountNum.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })}`;
      }
    }
    // Duration (Wave 3.3 Batch C, ruling R4): storage is bare minutes -- the
    // read side is the OTHER half (alongside DurationCustomFieldControl's
    // edit-side annotation) of making that unit explicit rather than
    // implicit, so a table cell never shows a bare, unit-less "90" the way
    // PD-2 was decided to avoid for Percent. `maximumFractionDigits: 6`
    // mirrors Percent's own choice (matches ValueNumber's `HasPrecision(18,
    // 6)` column headroom) so a stored `1.5` (= 90 seconds, per R4) round-
    // trips as "1.5 minutes", never silently rounded to "2 minutes".
    case "Duration": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return <EmptyCustomFieldCell />;
      return `${num.toLocaleString(resolveIntlLocale(language), { maximumFractionDigits: 6 })} ${t("customField.duration.unitLabel")}`;
    }
    // Time (Wave 3.3 Batch C, ruling R3): the stored value is canonical,
    // zero-padded `HH:mm:ss` text -- already human-legible, but not
    // locale-aware (a 24-hour "14:30:00" reads oddly for a 12-hour-clock
    // locale). Parsed by hand into its three numeric components and used to
    // construct a LOCAL `Date` (never a UTC-anchored `new Date(string)`),
    // the exact same "parse the components directly" shape this switch's
    // own Date case uses to avoid its day-shift hazard -- there is no
    // day-shift risk for a time-only value, but the same discipline avoids
    // introducing one by accident. A value that isn't exactly two-digit
    // `HH:mm:ss` (including a legacy un-padded submission that somehow
    // reached storage before the backend's own normalization, or a
    // corrupted value) renders the empty-cell marker, matching every other
    // type-specific parse failure in this switch.
    case "Time": {
      const match = typeof value === "string" ? /^(\d{2}):(\d{2}):(\d{2})$/.exec(value) : null;
      if (!match) return <EmptyCustomFieldCell />;
      const [, h, m, s] = match;
      const hours = Number(h);
      const minutes = Number(m);
      const seconds = Number(s);
      if (hours > 23 || minutes > 59 || seconds > 59) return <EmptyCustomFieldCell />;
      const date = new Date(2000, 0, 1, hours, minutes, seconds);
      return new Intl.DateTimeFormat(resolveIntlLocale(language), { timeStyle: "medium" }).format(
        date
      );
    }
    // Color (Wave 3.3 Batch C, ruling R5): a small swatch alongside the
    // stored hex text, not just the raw string -- the same "make the value
    // visually legible, not just technically present" treatment Boolean's
    // Badge and MultiSelect's chips already give their own types in this
    // switch. The swatch only renders when the stored text is genuinely a
    // valid `#rgb`/`#rrggbb` hex shape (re-validated here, not trusted
    // blindly) -- both because a historical/corrupt value must never throw
    // trying to paint an invalid CSS color, and because this value feeds a
    // `style` attribute directly, the same "never trust a stored value
    // blindly" discipline Url's own read case already applies to its `href`.
    case "Color": {
      const text = typeof value === "string" ? value : String(value);
      if (!text) return <EmptyCustomFieldCell />;
      const isValidHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(text);
      return (
        <span className="inline-flex items-center gap-1.5">
          {isValidHex && (
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 rounded-nx-sm border border-nx-line"
              style={{ backgroundColor: text }}
            />
          )}
          <span className="font-mono text-xs">{text}</span>
        </span>
      );
    }
    // EntityReference / UserReference (Wave 4). THE HARD CASE IN THIS FILE,
    // and the reasoning matters more than the four lines it produces.
    //
    // This function is SYNCHRONOUS, hookless, and called once per table CELL.
    // A reference's display name is not in the stored value and never will be:
    // `Project` refuses to snapshot one because the owner record's view
    // permission would then be enough to read a name the TARGET type's own
    // permission resource guards. The only way to obtain a name is
    // `IEntityLookupRegistry.ResolveAsync` -- async, permission-checked, and
    // one cross-module query per reference. So there are exactly four things
    // this case could do, and three of them are wrong:
    //
    //   (a) Render the stored `entityId`. REFUSED. It is an encrypted primary
    //       key -- an opaque ciphertext that means nothing to a reader, and
    //       putting it in a table cell leaks it into every screenshot, CSV
    //       export and support ticket for no benefit at all.
    //   (b) Render nothing / a blank. REFUSED, and this is the specific defect
    //       the backend's own `Project` doc comment is written against: blank
    //       is what "this field was never filled in" looks like, and an
    //       operator staring at a blank cell has to be able to tell a
    //       never-filled field from a filled one whose name simply is not
    //       available here. Collapsing the two is how a dangling reference
    //       stays invisible for a year.
    //   (c) Return a component that resolves the name itself. REFUSED. It
    //       would work, and it would fan out one permission-checked
    //       cross-module query PER ROW on every list read of any table with a
    //       reference column -- exactly the cost `Project` is written to avoid
    //       by not resolving on the read path. The resolve belongs to the
    //       EDIT control, which renders one reference at a time.
    //   (d) Render what IS synchronously known, honestly. TAKEN.
    //
    // What is known is the target's entity-type KEY. It is stored (it has to
    // be -- an id with no key cannot be dispatched to a module), and it is not
    // sensitive: it names a TABLE, not a row, and reveals nothing about the
    // record or the caller's access to it. So the cell says what KIND of thing
    // this is (the value type's own catalog label -- "Entity Reference" /
    // "User Reference", already localized and already required to exist by the
    // catalog/locale parity gate) and WHICH table it points into. That is a
    // cell a reader can act on: it is unmistakably a filled reference, and the
    // name is one click away in the record's own form, where resolving it
    // costs one query instead of one per row.
    //
    // A value that is not reference-shaped at all falls to
    // `EmptyCustomFieldCell`, matching every other type-specific parse failure
    // in this switch (Date, Time, Currency, MultiSelect). That is not the
    // blank case (b) refuses: (b) is about a value that IS a valid reference.
    // A shape this function cannot read is corrupt or out-of-band data, and
    // `Project` already returns null rather than a half-reference for the one
    // way that could happen legitimately.
    case "EntityReference":
    case "UserReference": {
      if (!isEntityReferenceValue(value) || value.entityTypeKey.trim() === "") {
        return <EmptyCustomFieldCell />;
      }
      return (
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="default">{t(VALUE_TYPE_CATALOG[valueType].labelKey)}</Badge>
          <span className="font-mono text-xs text-nx-ink-3">{value.entityTypeKey}</span>
        </span>
      );
    }
    default:
      return String(value);
  }
}
