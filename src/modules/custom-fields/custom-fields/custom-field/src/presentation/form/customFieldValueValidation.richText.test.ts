// `validateRichTextCustomFieldValue` and its arm in
// `assertSelectCustomFieldValuesValid` -- Wave 3.4.
//
// WHAT THESE PIN, and why the bare-string case is the one that matters. RichText's
// wire shape is the one-key object `{ html }`, and a BARE STRING is refused by
// `RichTextValueTypeHandler.Parse` -- not on taste, but because
// `InputSanitizationMiddleware`'s carve-out for the values route is the PATH
// `values.*.html`, so a bare string at `values.myField` reaches the handler with
// every tag already stripped. Accepting it would mean a 200 over prose whose
// paragraphs, links and lists had been deleted in transit. So the client must
// refuse the same shape the server refuses, before the round trip.
//
// THE SUBTLE ONE IS THE DEFAULT. `assertSelectCustomFieldValuesValid` reads
// `values[fc.name] ?? fc.defaultValue ?? null` for this arm. Select's arm uses
// `?? ""` -- and `""` IS a bare string, so had rich text been folded into that
// arm, every untouched optional rich-text field would have failed its own save
// with a shape error. That is asserted below rather than left as a comment.
//
// RED WITHOUT THE FIX: the whole first describe block fails to import
// (`validateRichTextCustomFieldValue` would not exist), and every `toThrow` in the
// save-flow block passes vacuously against a loop with no `"rich-text"` arm --
// which is what makes those the discriminating assertions.
//
// No DOM here, so this is a `.ts` file separate from the control's own tests --
// the same split `customFieldValueValidation.entityReference.test.ts` established.
import { describe, it, expect } from "vitest";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import {
  assertSelectCustomFieldValuesValid,
  validateRichTextCustomFieldValue,
  CustomFieldValidationError,
} from "./customFieldValueValidation";
import { RICH_TEXT_MAX_CHARACTERS } from "../controls/RichText/RichTextCustomFieldControl";

/** Echoes key + params, so an assertion can prove WHICH message key was chosen. */
const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key;

const OPTIONAL: FieldConfig = { name: "cf_notes", label: "Notes", type: "rich-text" };
const REQUIRED: FieldConfig = { ...OPTIONAL, required: true };

describe("validateRichTextCustomFieldValue", () => {
  it("accepts a real envelope", () => {
    expect(validateRichTextCustomFieldValue(REQUIRED, { html: "<p>hello</p>" }, t)).toBeNull();
  });

  it("ignores a field of any other type, even one holding a broken rich-text value", () => {
    // The type filter is the first line for the same reason every other validator
    // in this module has one: this must be safe to call over a whole unfiltered
    // fieldConfigs list, which is exactly how the save flows call it.
    expect(
      validateRichTextCustomFieldValue(
        { name: "cf_note", label: "Note", type: "text" },
        { notHtml: true },
        t
      )
    ).toBeNull();
    // And specifically not the pre-existing `"richtext"` member, whose contract is
    // a BARE STRING. Admitting it here would refuse every value that member's own
    // GenericForm arm produces.
    expect(
      validateRichTextCustomFieldValue(
        { name: "cf_body", label: "Body", type: "richtext" },
        "<p>a bare string, which is correct for that type</p>",
        t
      )
    ).toBeNull();
  });

  describe("the shape refusal", () => {
    it("REFUSES a bare string -- the shape the middleware would have stripped", () => {
      // THE LOAD-BEARING CASE. Asserted on the message KEY, not merely on
      // non-null: a validator that returned `validation.required` here would also
      // be non-null and would be wrong, telling the operator to fill in a field
      // that is full.
      expect(validateRichTextCustomFieldValue(OPTIONAL, "<p>hello</p>", t)).toBe(
        'customField.values.richTextInvalidShape:{"field":"Notes"}'
      );
    });

    it("refuses a number, a boolean and an array, matching Parse's fail-closed set", () => {
      for (const value of [42, true, ["<p>x</p>"], [{ html: "<p>x</p>" }]]) {
        expect(validateRichTextCustomFieldValue(OPTIONAL, value, t)).toBe(
          'customField.values.richTextInvalidShape:{"field":"Notes"}'
        );
      }
    });

    it("refuses an object whose html is present but not a string", () => {
      // Mirrors `TryReadStringProperty`, which fails the WHOLE payload for a
      // non-string `html` rather than coercing it and rejecting it late.
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html: 7 }, t)).toBe(
        'customField.values.richTextInvalidShape:{"field":"Notes"}'
      );
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html: null }, t)).toBe(
        'customField.values.richTextInvalidShape:{"field":"Notes"}'
      );
    });

    it("refuses an object with no html member -- on an OPTIONAL field too", () => {
      // Deliberately different from the backend, and the difference is recorded
      // rather than accidental: the server PARSES `{}` successfully as an empty
      // value (an absent property reads as null-with-success there). Client-side
      // this shape can only come from stale or out-of-band form state, and it is
      // more useful to name it than to silently treat it as a cleared field --
      // which would submit a delete the operator never asked for. Asserted on an
      // optional field so it cannot be confused with the required check.
      expect(validateRichTextCustomFieldValue(OPTIONAL, {}, t)).toBe(
        'customField.values.richTextInvalidShape:{"field":"Notes"}'
      );
    });

    it("names the field by its LABEL, falling back to its name", () => {
      // The message is shown to an operator, so it has to name what they see. A
      // field with no label falls back to the encoded form key, which is ugly but
      // still identifies the field -- better than an empty interpolation.
      expect(
        validateRichTextCustomFieldValue({ name: "__cf__notes", type: "rich-text" }, 7, t)
      ).toBe('customField.values.richTextInvalidShape:{"field":"__cf__notes"}');
    });
  });

  describe("emptiness", () => {
    it("treats null and undefined as nothing to save on an optional field", () => {
      expect(validateRichTextCustomFieldValue(OPTIONAL, null, t)).toBeNull();
      expect(validateRichTextCustomFieldValue(OPTIONAL, undefined, t)).toBeNull();
    });

    it("reports a required field left blank as required, NOT as a shape error", () => {
      // Two different facts with two different remedies, and the wrong one is
      // actively misleading: "this format cannot be read" over an empty field
      // sends the operator looking for corrupt data.
      expect(validateRichTextCustomFieldValue(REQUIRED, null, t)).toBe("validation.required");
      expect(validateRichTextCustomFieldValue(REQUIRED, { html: "" }, t)).toBe(
        "validation.required"
      );
      expect(validateRichTextCustomFieldValue(REQUIRED, { html: "   \n " }, t)).toBe(
        "validation.required"
      );
    });

    it("treats whitespace-only markup as blank, matching IsEmpty's IsNullOrWhiteSpace", () => {
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html: "   \n " }, t)).toBeNull();
    });

    it("does NOT treat markup that renders to nothing as blank, because the server does not", () => {
      // `<p></p>` is a value the server stores: deciding whether markup renders to
      // nothing means parsing it, which `IsEmpty` declines to do per field per
      // save. So a REQUIRED field holding it is satisfied here -- reporting
      // `validation.required` instead would refuse a save the server accepts,
      // which is the frontend/backend verdict mismatch this whole module exists to
      // avoid.
      expect(validateRichTextCustomFieldValue(REQUIRED, { html: "<p></p>" }, t)).toBeNull();
    });
  });

  describe("the length cap", () => {
    it("refuses markup over the cap, and reports the cap in the message", () => {
      const over = "x".repeat(RICH_TEXT_MAX_CHARACTERS + 1);
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html: over }, t)).toBe(
        `customField.values.richTextTooLong:{"field":"Notes","max":${RICH_TEXT_MAX_CHARACTERS}}`
      );
    });

    it("accepts markup at exactly the cap -- the handler refuses `>`, not `>=`", () => {
      // An off-by-one here refuses a save the server would accept, with a message
      // naming a limit the operator has not passed.
      const exact = "x".repeat(RICH_TEXT_MAX_CHARACTERS);
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html: exact }, t)).toBeNull();
    });

    it("measures the RAW MARKUP, not the visible text the operator can count", () => {
      // The tags are inside the measurement, which is what the server measures
      // (it caps the input BEFORE sanitizing, because handing an unbounded body to
      // an HTML parser is the denial of service). A validator that stripped tags
      // first would accept a payload the server then refuses -- so this value's
      // visible text is comfortably under the cap while its markup is over it.
      const html = `<p>${"x".repeat(RICH_TEXT_MAX_CHARACTERS - 6)}</p>`;
      expect(html.replace(/<[^>]*>/g, "").length).toBeLessThan(RICH_TEXT_MAX_CHARACTERS);
      expect(html.length).toBeGreaterThan(RICH_TEXT_MAX_CHARACTERS);
      expect(validateRichTextCustomFieldValue(OPTIONAL, { html }, t)).toContain(
        "customField.values.richTextTooLong"
      );
    });
  });
});

describe("assertSelectCustomFieldValuesValid -- the rich-text arm", () => {
  it("throws CustomFieldValidationError carrying the already-localized message", () => {
    // The distinct error type is what lets a consumer's catch block tell "we
    // refused this client-side, show ITS message" apart from "the save request
    // failed, show the generic toast".
    expect(() => assertSelectCustomFieldValuesValid([OPTIONAL], { cf_notes: "bare" }, t)).toThrow(
      CustomFieldValidationError
    );
    try {
      assertSelectCustomFieldValuesValid([OPTIONAL], { cf_notes: "bare" }, t);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("customField.values.richTextInvalidShape");
    }
  });

  it("throws for a REQUIRED rich-text field the operator left blank", () => {
    // The reason this arm enforces required-ness at all: the 8 hand-wired sites do
    // not run GenericForm's required pass, so without this a required field left
    // blank was submitted blank and refused on a round trip -- and on a CREATE,
    // only after the owner record had already been written.
    expect(() => assertSelectCustomFieldValuesValid([REQUIRED], {}, t)).toThrow(
      CustomFieldValidationError
    );
  });

  it("defaults an untouched field to null, NOT to the empty string", () => {
    // THE SUBTLE REGRESSION GUARD. `""` is a bare string, which this validator
    // refuses -- so folding rich text into Select's `?? ""` arm would make every
    // untouched OPTIONAL rich-text field fail its own save with a shape error the
    // operator could do nothing about. Nothing is in `values` here, and nothing
    // must be thrown.
    expect(() => assertSelectCustomFieldValuesValid([OPTIONAL], {}, t)).not.toThrow();
  });

  it("honours a field's own defaultValue, which is the value the flow will actually submit", () => {
    // The save flows submit `values[name] ?? defaultValue`, so validating only
    // what the operator touched this session would wave through a stale default.
    expect(() =>
      assertSelectCustomFieldValuesValid(
        [{ ...OPTIONAL, defaultValue: "a stale bare string" }],
        {},
        t
      )
    ).toThrow(CustomFieldValidationError);
  });

  it("accepts a good value and leaves other field types alone in the same list", () => {
    // Called with a whole unfiltered list, which is how every one of the 9 flows
    // calls it. A pass here proves the new arm did not start rejecting its
    // neighbours.
    expect(() =>
      assertSelectCustomFieldValuesValid(
        [
          OPTIONAL,
          { name: "cf_note", label: "Note", type: "text" },
          { name: "cf_body", label: "Body", type: "richtext" },
        ],
        { cf_notes: { html: "<p>fine</p>" }, cf_note: "text", cf_body: "<p>bare is fine here</p>" },
        t
      )
    ).not.toThrow();
  });
});
