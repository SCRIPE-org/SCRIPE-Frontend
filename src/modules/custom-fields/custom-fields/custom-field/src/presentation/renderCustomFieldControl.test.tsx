// renderCustomFieldControl -- Text/Number/Boolean coverage (Wave 2 Step 2.2, Task 2)
//
// Uses `fireEvent`, not `@testing-library/user-event`: the brief's own Step 3
// snippet assumed userEvent, but this repo does not declare
// `@testing-library/user-event` as a dependency (package.json only lists
// @testing-library/jest-dom and @testing-library/react) and no existing
// *.test.tsx in this codebase imports it -- confirmed by grep before writing
// this file. WebhookForm.customfields.test.tsx (the closest component-test
// precedent for this exact custom-fields surface) uses `fireEvent` from
// @testing-library/react, so this file follows that real, already-established
// convention instead.
//
// Mirrors switch.test.tsx's hook-mocking convention: Switch reads switchStyle
// off useSettings() and labels off useI18n(). Both hooks have safe SSR
// fallbacks (no provider required), but the mocks pin deterministic output
// (settings-provider's SSR fallback is real defaults, i18n-provider's SSR
// fallback returns dir="rtl" -- neither matters for these assertions, but
// mocking keeps this test aligned with the project's established pattern for
// rendering @core/ui/switch directly).
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { renderCustomFieldControl, validateSelectCustomFieldValue } from "./renderCustomFieldControl";
import { ALL_VALUE_TYPES, VALUE_TYPE_CATALOG } from "./valueTypeRegistry";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

// jsdom has no ResizeObserver -- GenericSelect's trigger tracks its own width
// (for the panel's --radix-popover-trigger-width CSS var) on mount regardless
// of open state, so this is needed even for tests that never open the panel.
// Same polyfill SubmitDsrModal.customfields.test.tsx already added for its
// own GenericSelect-backed fields.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom also has no scrollIntoView -- cmdk calls it on the highlighted row's
// layout effect as soon as the panel's option list mounts (open the Select,
// and this throws before a single option is even queried).
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

describe("renderCustomFieldControl", () => {
  it("renders a text input for fc.type text and reports changes", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_1", type: "text", label: "Nickname" },
          value: "",
          onChange,
        })}
      </>
    );
    const input = screen.getByLabelText("Nickname");
    fireEvent.change(input, { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("renders a number input for fc.type number", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_2", type: "number", label: "Score" },
          value: 5,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByLabelText("Score")).toHaveAttribute("type", "number");
  });

  it("renders a switch for fc.type switch and reports boolean changes", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_3", type: "switch", label: "Active" },
          value: false,
          onChange,
        })}
      </>
    );
    fireEvent.click(screen.getByRole("switch", { name: "Active" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // D9: isViewMode on the Boolean/Switch branch. Switch's own component
  // contract (switch.tsx) treats `readOnly` as distinct from `disabled` --
  // the control stays focusable and keeps its live colours, it just refuses
  // the change -- which is also what FeatureDefinitionFormView.tsx's real,
  // already-shipped Switch instances use for isViewMode (readOnly, not
  // disabled). So this asserts aria-readonly + a blocked onChange, not
  // toBeDisabled().
  it("marks the switch read-only and blocks onChange when isViewMode is true (D9)", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_4", type: "switch", label: "Active" },
          value: true,
          onChange,
          isViewMode: true,
        })}
      </>
    );
    const control = screen.getByRole("switch", { name: "Active" });
    expect(control).toHaveAttribute("aria-readonly", "true");
    expect(control).not.toBeDisabled();

    fireEvent.click(control);
    expect(onChange).not.toHaveBeenCalled();
  });

  // D9: isViewMode on the Text/Number fallthrough branch. Unlike Switch,
  // every Input instance in FeatureDefinitionFormView.tsx (including its own
  // custom-field Input branch) uses `disabled`, not `readOnly`, for
  // isViewMode -- so this reproduces that real behavior instead of Input's
  // separately-supported (but unused-by-that-site) readOnly mechanism.
  it("disables the text input when isViewMode is true (D9)", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_5", type: "text", label: "Nickname" },
          value: "existing",
          onChange: vi.fn(),
          isViewMode: true,
        })}
      </>
    );
    expect(screen.getByLabelText("Nickname")).toBeDisabled();
  });

  it("renders a DatePicker for fc.type date", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_6", type: "date", label: "Start Date" },
          value: "",
          onChange: vi.fn(),
        })}
      </>
    );
    // The DatePicker renders a hidden input with type="date" and an accessible
    // trigger div with role="combobox". Verify both are present.
    const input = screen.getByLabelText("Start Date");
    expect(input).toHaveAttribute("type", "date");
  });

  it("calls onChange when DatePicker value changes", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_7", type: "date", label: "Start Date" },
          value: "",
          onChange,
        })}
      </>
    );
    const input = screen.getByLabelText("Start Date") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2026-08-17" } });
    expect(onChange).toHaveBeenCalledWith("2026-08-17");
  });

  // D9: isViewMode on the Date branch. FeatureDefinitionFormView.tsx's
  // custom-field DatePicker branch uses `disabled={isViewMode}` (matching
  // Input, not Switch's `readOnly`). This asserts that the trigger div is
  // disabled and onClick/keyboard handlers are blocked.
  it("disables the DatePicker when isViewMode is true (D9)", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_8", type: "date", label: "Start Date" },
          value: "2026-08-17",
          onChange,
          isViewMode: true,
        })}
      </>
    );
    // The DatePicker's trigger div has aria-disabled="true" and tabindex="-1"
    // when disabled. Query by role and aria-disabled.
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(trigger).toHaveAttribute("tabindex", "-1");

    // Attempt to click the trigger -- onChange should not fire
    fireEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();
  });

  // ── fc.type === "select" (Wave 2 Step 2.2, Task 4) ──────────────────────
  const PRIORITY_FIELD = {
    name: "cf_priority",
    type: "select" as const,
    label: "Priority",
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
    ],
  };

  it("renders a GenericSelect for fc.type select, labeled and showing the field's options", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: PRIORITY_FIELD,
          value: "",
          onChange: vi.fn(),
        })}
      </>
    );
    // GenericSelect's trigger is a role="combobox" DIV, not a labellable HTML
    // form element (input/select/textarea/etc.), so the sibling <label
    // htmlFor> above it does NOT itself compute an accessible name (HTML
    // restricts `for`/`htmlFor` association to the labelable-element
    // category, and ARIA's role="combobox" is Name From: author, not Name
    // From: contents). That gap was tracked as finding T1 in Task 4's review
    // and closed in Task 7b via a first-class `aria-label` prop on
    // GenericSelect (see generic-select.tsx) -- this test asserts BOTH the
    // (still-present, still-correct-for-sighted-users) `for`/`id` DOM wiring
    // AND the real accessible name via `getByRole`'s `name` option, which is
    // the discriminating check: it fails without the aria-label wiring and
    // passes with it (verified locally before this fix landed).
    expect(screen.getByText("Priority", { selector: "label" })).toHaveAttribute(
      "for",
      "cf_priority"
    );
    const trigger = screen.getByRole("combobox", { name: "Priority" });
    expect(trigger).toHaveAttribute("id", "cf_priority");

    fireEvent.click(trigger);
    // fc.options flow straight through to the open panel's rows.
    expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
  });

  it("reports the option's LABEL string via onChange when an option is picked (D6)", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: PRIORITY_FIELD,
          value: "",
          onChange,
        })}
      </>
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));

    // D6: the label text itself, not a synthetic id -- mapValueToFieldConfig
    // (customFieldsCrudIntegration.tsx) builds every option as { value: o,
    // label: o }, so this is also the only value GenericSelect could ever
    // have emitted here.
    expect(onChange).toHaveBeenCalledWith("Medium");
  });

  // Task 7b review, M2: FieldConfig["label"] is optional. Without a fallback,
  // an undefined fc.label would make aria-label undefined too -- React omits
  // undefined attributes, so the control would silently go right back to
  // having NO accessible name at all, the exact regression this task exists
  // to prevent, with no error and no failing test unless one specifically
  // constructs a labelless FieldConfig (this one). Mirrors
  // validateSelectCustomFieldValue's own `fc.label ?? fc.name` fallback.
  it("falls back the Select control's accessible name to fc.name when fc.label is undefined (M2)", () => {
    const fieldWithNoLabel = { ...PRIORITY_FIELD, label: undefined };
    render(
      <>
        {renderCustomFieldControl({
          fc: fieldWithNoLabel,
          value: "",
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByRole("combobox", { name: "cf_priority" })).toBeInTheDocument();
  });

  // D9: isViewMode on the Select branch. FeatureDefinitionFormView.tsx's real,
  // already-shipped custom-field Select branch (pre-Task-4, raw Radix
  // `Select`) uses `disabled={isViewMode}`, matching Input/DatePicker rather
  // than Switch's `readOnly`.
  it("disables the GenericSelect when isViewMode is true and blocks selection (D9)", () => {
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: PRIORITY_FIELD,
          value: "Low",
          onChange,
          isViewMode: true,
        })}
      </>
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(trigger).toHaveAttribute("tabindex", "-1");

    // Disabled means the panel never opens, so no option rows exist to click.
    fireEvent.click(trigger);
    expect(screen.queryByRole("option", { name: "Medium" })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // D5: client-side option-membership validation, mirroring the backend's
  // SelectValueTypeHandler.Validate (ordinal, case-sensitive Contains against
  // definition.Options). Pure-function tests -- no rendering involved, since
  // this guards a value already sitting in form state, not a value picked
  // through GenericSelect's own UI (which can only ever emit a listed value).
  describe("validateSelectCustomFieldValue (D5)", () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    it("returns null for an exact-match allowed value", () => {
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, "Medium", t)).toBeNull();
    });

    it("returns null for empty/absent values (required-ness is a separate concern)", () => {
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, "", t)).toBeNull();
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, undefined, t)).toBeNull();
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, null, t)).toBeNull();
    });

    // Regression test (review fix, M1): a whitespace-only value must resolve
    // the SAME way as "" -- valid/empty -- NOT get rejected as "not one of
    // the allowed options". The backend's SelectValueTypeHandler.IsEmpty is
    // string.IsNullOrWhiteSpace-based and is checked before Validate ever
    // runs (Wave 2 Step 2.1's own D35 ruling), so a Select field cleared to
    // "   " is "clear this value" to the backend, not an invalid option --
    // this function must reach the same verdict, not diverge and 400 client-
    // side for something the backend would have accepted.
    it("treats a whitespace-only value as empty/valid, not as an invalid option (M1)", () => {
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, "   ", t)).toBeNull();
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, "\t\n ", t)).toBeNull();
    });

    it("returns null for non-select fc.type (not this function's concern)", () => {
      expect(
        validateSelectCustomFieldValue({ name: "cf_x", type: "text", label: "X" }, "anything", t)
      ).toBeNull();
    });

    it("rejects a value not in fc.options", () => {
      const message = validateSelectCustomFieldValue(PRIORITY_FIELD, "Urgent", t);
      expect(message).not.toBeNull();
      expect(message).toContain("customField.values.selectInvalidOption");
    });

    // Mirrors the backend's own
    // Validate_ShouldPreserveCaseSensitivity_RejectingDifferentCasing test:
    // "medium" must be rejected against a configured "Medium" -- the ordinal
    // (case-sensitive) comparison is deliberate backend behavior, not a bug,
    // and the frontend must reject the SAME way rather than "helpfully"
    // accepting it, which would only move the mismatch to a later 422.
    it("rejects a differently-cased value against a real configured option (D5 case sensitivity)", () => {
      const message = validateSelectCustomFieldValue(PRIORITY_FIELD, "medium", t);
      expect(message).not.toBeNull();
    });

    it("trims surrounding whitespace before comparing, mirroring the backend's own Trim()", () => {
      expect(validateSelectCustomFieldValue(PRIORITY_FIELD, " Medium ", t)).toBeNull();
    });
  });

  // ── fc.type === "textarea" (Wave 3.1 Task 10: LongText) ─────────────────
  describe("fc.type textarea (LongText)", () => {
    it("renders a Textarea and reports changes as a plain string", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_bio", type: "textarea", label: "Bio" },
            value: "",
            onChange,
          })}
        </>
      );
      const control = screen.getByLabelText("Bio");
      expect(control.tagName).toBe("TEXTAREA");
      fireEvent.change(control, { target: { value: "A longer answer." } });
      expect(onChange).toHaveBeenCalledWith("A longer answer.");
    });

    it("disables the Textarea when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_bio", type: "textarea", label: "Bio" },
            value: "existing",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByLabelText("Bio")).toBeDisabled();
    });
  });

  // ── fc.type === "multi-select" (Wave 3.1 Task 10: MultiSelect) ──────────
  describe("fc.type multi-select (MultiSelect)", () => {
    const COLOR_FIELD = {
      name: "cf_colors",
      type: "multi-select" as const,
      label: "Colors",
      options: [
        { value: "Red", label: "Red" },
        { value: "Green", label: "Green" },
        { value: "Blue", label: "Blue" },
      ],
    };

    // TRAP (pre-plan analysis §5.2/TRAP 11): the Select branch's own
    // `toFieldInputValue` stringifies its value (`String(value)`), which
    // would turn an array into "a,b" and destroy its array-ness before
    // GenericSelect ever sees it. This is the discriminating assertion that
    // the MultiSelect branch does NOT reuse that helper.
    it("passes an array value straight through to GenericSelect, not stringified", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: COLOR_FIELD,
            value: ["Red"],
            onChange: vi.fn(),
          })}
        </>
      );
      const trigger = screen.getByRole("combobox", { name: "Colors" });
      // A destroyed-to-string value ("Red") would leave GenericSelect's own
      // `Array.isArray(value)` multi-detection seeing a plain string, not a
      // selection -- the trigger renders a selected-value chip only when it
      // genuinely received an array. Scoped to the (closed) trigger itself
      // so this doesn't ambiguously match an "Red" option row once open.
      expect(within(trigger).getByText("Red")).toBeInTheDocument();
    });

    it("reports a real string[] via onChange when an option is picked, not a joined string", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: COLOR_FIELD,
            value: [],
            onChange,
          })}
        </>
      );
      fireEvent.click(screen.getByRole("combobox", { name: "Colors" }));
      fireEvent.click(screen.getByRole("option", { name: "Blue" }));
      expect(onChange).toHaveBeenCalledWith(["Blue"]);
    });

    it("treats a non-array value defensively as an empty selection rather than throwing", () => {
      expect(() =>
        render(
          <>
            {renderCustomFieldControl({
              fc: COLOR_FIELD,
              value: "",
              onChange: vi.fn(),
            })}
          </>
        )
      ).not.toThrow();
    });

    it("disables the GenericSelect when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: COLOR_FIELD,
            value: ["Red"],
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
    });
  });

  // ── fc.type === "datetime" (Wave 3.1 Task 10: DateTime) ─────────────────
  describe("fc.type datetime (DateTime)", () => {
    const MEETING_FIELD = { name: "cf_meeting", type: "datetime" as const, label: "Meeting" };

    it("renders a datetime-local input", () => {
      render(
        <>
          {renderCustomFieldControl({ fc: MEETING_FIELD, value: null, onChange: vi.fn() })}
        </>
      );
      expect(screen.getByLabelText("Meeting")).toHaveAttribute("type", "datetime-local");
    });

    // TRAP (pre-plan analysis §5.3/R7): the wire value is the two-piece
    // `{ value, timeZoneId }` object, not a bare string -- a branch that
    // reused `toFieldInputValue` (`String(value)`) would stringify it into
    // the useless "[object Object]" instead of reflecting the instant back
    // into the input.
    it("reflects the object value's own `value` piece into the input, not '[object Object]'", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: MEETING_FIELD,
            value: { value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" },
            onChange: vi.fn(),
          })}
        </>
      );
      expect(screen.getByLabelText("Meeting")).toHaveValue("2026-08-18T10:30");
    });

    it("reports a { value, timeZoneId } object via onChange, pairing a fresh instant with a zone", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({ fc: MEETING_FIELD, value: null, onChange })}
        </>
      );
      fireEvent.change(screen.getByLabelText("Meeting"), {
        target: { value: "2026-08-18T10:30" },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      const emitted = onChange.mock.calls[0][0] as { value: string; timeZoneId: string };
      expect(emitted.value).toBe("2026-08-18T10:30");
      expect(typeof emitted.timeZoneId).toBe("string");
      expect(emitted.timeZoneId.length).toBeGreaterThan(0);
    });

    it("preserves the existing timeZoneId when only the instant changes", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: MEETING_FIELD,
            value: { value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" },
            onChange,
          })}
        </>
      );
      fireEvent.change(screen.getByLabelText("Meeting"), {
        target: { value: "2026-08-19T09:00" },
      });
      expect(onChange).toHaveBeenCalledWith({ value: "2026-08-19T09:00", timeZoneId: "Africa/Cairo" });
    });

    it("clears to null (not a zone-only half-blank object) when the instant is cleared", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: MEETING_FIELD,
            value: { value: "2026-08-18T10:30", timeZoneId: "Africa/Cairo" },
            onChange,
          })}
        </>
      );
      fireEvent.change(screen.getByLabelText("Meeting"), { target: { value: "" } });
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});

// Completeness exit-gate (Final whole-branch review, I2 fix). Every prior
// test above renders one hand-picked FieldConfig["type"] and asserts its own
// specific branch -- useful, but nothing tied that set of branches back to
// VALUE_TYPE_CATALOG's actual, live set of fieldConfigType values, and
// nothing failed if a new catalog entry's fieldConfigType had no matching
// branch here at all. The reviewer proved this gap directly: added a
// hypothetical 6th type (`Email`, fieldConfigType: "email") to the catalog,
// added NO renderer branch, and the full suite stayed green -- the shared
// text/number fallthrough silently absorbed it with no signal that a
// dedicated branch was ever supposed to exist.
//
// This iterates ALL_VALUE_TYPES (from valueTypeRegistry.ts, not a hardcoded
// literal list -- a new catalog entry is picked up automatically) and, for
// each one's real VALUE_TYPE_CATALOG[type].fieldConfigType, renders through
// renderCustomFieldControl exactly the way every real consumer site does and
// asserts DOM shape that can only come from that fieldConfigType's own
// dedicated branch (switch role, type="date" input, an open Select panel
// with real option rows, etc.) -- not just "something rendered". A
// fieldConfigType with no matching case below throws instead of silently
// passing, which is what makes this gate actually fail for an unwired 6th
// type instead of rubber-stamping it the way the pre-fix suite did.
describe("renderCustomFieldControl completeness against VALUE_TYPE_CATALOG (Final review I2)", () => {
  it.each(ALL_VALUE_TYPES)(
    "renders a control whose real DOM shape proves %s's own dedicated branch ran, not just that something rendered",
    (valueType) => {
      const entry = VALUE_TYPE_CATALOG[valueType];
      const fc = {
        name: `cf_${valueType.toLowerCase()}`,
        label: valueType,
        type: entry.fieldConfigType,
        ...(entry.hasOptions
          ? {
              options: [
                { value: "Alpha", label: "Alpha" },
                { value: "Beta", label: "Beta" },
              ],
            }
          : {}),
      } as Parameters<typeof renderCustomFieldControl>[0]["fc"];

      const onChange = vi.fn();
      const { unmount } = render(
        <>{renderCustomFieldControl({ fc, value: "", onChange })}</>
      );

      switch (entry.fieldConfigType) {
        case "switch":
          // Boolean's own dedicated branch: a real switch role, and clicking
          // it reports a real boolean, not a string.
          fireEvent.click(screen.getByRole("switch", { name: valueType }));
          expect(onChange).toHaveBeenCalledWith(true);
          break;
        case "date":
          // Date's own dedicated branch: a real <input type="date">.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "date");
          break;
        case "select": {
          // Select's own dedicated branch: an open GenericSelect panel with
          // this fc's own options actually rendered as rows -- not
          // reachable via the generic text/number Input fallthrough at all.
          const trigger = screen.getByRole("combobox", { name: valueType });
          fireEvent.click(trigger);
          expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
          expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
          fireEvent.click(screen.getByRole("option", { name: "Beta" }));
          expect(onChange).toHaveBeenCalledWith("Beta");
          break;
        }
        case "multi-select": {
          // MultiSelect's own dedicated branch (Wave 3.1 Task 10): an open
          // GenericSelect panel in MULTI mode -- picking an option reports a
          // real string[], not the single string the "select" case above
          // asserts, and specifically NOT the array-destroyed
          // `toFieldInputValue` string the shared Input fallthrough would
          // have produced.
          const trigger = screen.getByRole("combobox", { name: valueType });
          fireEvent.click(trigger);
          expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
          expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
          fireEvent.click(screen.getByRole("option", { name: "Beta" }));
          expect(onChange).toHaveBeenCalledWith(["Beta"]);
          break;
        }
        case "textarea":
          // LongText's own dedicated branch (Wave 3.1 Task 10): a real
          // <textarea>, not the single-line Input fallthrough.
          expect(screen.getByLabelText(valueType).tagName).toBe("TEXTAREA");
          break;
        case "datetime":
          // DateTime's own dedicated branch (Wave 3.1 Task 10): a real
          // <input type="datetime-local">, not the "date" branch's
          // date-only input.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "datetime-local");
          break;
        case "number":
          // Number's own distinguishing mark on the shared Input branch:
          // the numeric type attribute.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "number");
          break;
        case "text":
          // Text is DELIBERATELY the generic Input fallthrough's default
          // case (this file's header comment, and renderCustomFieldControl.tsx's
          // own final branch) -- asserted explicitly here, not assumed.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "text");
          break;
        default:
          throw new Error(
            `renderCustomFieldControl completeness gate has no assertion strategy for ` +
              `fieldConfigType "${entry.fieldConfigType}" (value type "${valueType}"). Add a ` +
              `renderCustomFieldControl.tsx branch for it AND a matching case here before this ` +
              `catalog entry can be considered wired.`
          );
      }

      unmount();
    }
  );
});
