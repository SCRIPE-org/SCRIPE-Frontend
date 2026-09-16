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
import { renderCustomFieldControl } from "./renderCustomFieldControl";
import {
  validateSelectCustomFieldValue,
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "./customFieldValueValidation";
import { MULTI_SELECT_MAX_SELECTIONS } from "../controls/MultiSelect/MultiSelectCustomFieldControl";
import { ALL_VALUE_TYPES, VALUE_TYPE_CATALOG } from "../registries/valueTypeRegistry";
import type { FieldConfig } from "@core/ui/forms/generic-form";

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

  it("renders a DatePicker for fc.type date, with a REAL accessible name (Wave 3.1 Task 12 fix)", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_6", type: "date", label: "Start Date" },
          value: "",
          onChange: vi.fn(),
        })}
      </>
    );
    // The discriminating check: the VISIBLE trigger's real, computed
    // accessible name -- not `getByLabelText`, which the pre-plan analysis's
    // §5.4 traces resolves to the HIDDEN `aria-hidden` input via the sibling
    // `<Label htmlFor>` regardless of whether the visible control's own
    // aria-label is correct ("a test that cannot fail"). Before this task's
    // `placeholder` fix, this control's real accessible name was the generic
    // `t("common.selectDate")`, never "Start Date".
    const trigger = screen.getByRole("combobox", { name: "Start Date" });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "common.selectDate" })).not.toBeInTheDocument();

    // The underlying native input (grabbed via the DOM association a sighted
    // dev tool would also find -- NOT used here to assert the accessible
    // name) still carries the real `type="date"`. Scoped to `input`: now
    // that the VISIBLE trigger's own aria-label also reads "Start Date" (the
    // fix under test), a bare `getByLabelText("Start Date")` matches BOTH
    // the hidden input (via `<Label htmlFor>`) and the trigger (via its own
    // aria-label) -- this is itself evidence the fix landed, not a problem
    // to work around silently.
    const input = screen.getByLabelText("Start Date", { selector: "input" });
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
    // Scoped to `input` -- see the comment in the previous test for why a
    // bare `getByLabelText("Start Date")` is now ambiguous (by design).
    const input = screen.getByLabelText("Start Date", { selector: "input" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2026-08-17" } });
    expect(onChange).toHaveBeenCalledWith("2026-08-17");
  });

  it("falls back the Date control's accessible name to fc.name when fc.label is undefined", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_nolabel_date", type: "date" },
          value: "",
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByRole("combobox", { name: "cf_nolabel_date" })).toBeInTheDocument();
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

  // ── validateSelectCustomFieldValue generalized to multi-select (Wave 3.1
  // Task 11) -- mirrors MultiSelectValueTypeHandler.Validate check-for-check:
  // ceiling first, then per-label membership, then duplicates. Task 10's own
  // report flagged this as the "must build" item it deliberately left undone.
  describe("validateSelectCustomFieldValue generalized to multi-select (Task 11)", () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    const COLOR_FIELD: FieldConfig = {
      name: "cf_colors",
      type: "multi-select",
      label: "Colors",
      options: [
        { value: "Red", label: "Red" },
        { value: "Green", label: "Green" },
        { value: "Blue", label: "Blue" },
      ],
    };

    it("returns null for a valid, in-list selection", () => {
      expect(validateSelectCustomFieldValue(COLOR_FIELD, ["Red", "Blue"], t)).toBeNull();
    });

    it("returns null for empty/absent/non-array values (required-ness is separate)", () => {
      expect(validateSelectCustomFieldValue(COLOR_FIELD, [], t)).toBeNull();
      expect(validateSelectCustomFieldValue(COLOR_FIELD, undefined, t)).toBeNull();
      expect(validateSelectCustomFieldValue(COLOR_FIELD, null, t)).toBeNull();
      // Every wired save flow's own `values[fc.name] ?? fc.defaultValue ?? ""`
      // fallback lands here for an untouched MultiSelect field -- must not throw
      // or reject.
      expect(validateSelectCustomFieldValue(COLOR_FIELD, "", t)).toBeNull();
    });

    it("rejects a selection containing a value not in fc.options, reusing selectInvalidOption", () => {
      const message = validateSelectCustomFieldValue(COLOR_FIELD, ["Red", "Purple"], t);
      expect(message).toContain("customField.values.selectInvalidOption");
      expect(message).toContain('"value":"Purple"');
    });

    it("rejects the same option selected twice", () => {
      const message = validateSelectCustomFieldValue(COLOR_FIELD, ["Red", "Red"], t);
      expect(message).toContain("customField.values.multiSelectDuplicateOption");
      expect(message).toContain('"value":"Red"');
    });

    it(`rejects more than ${MULTI_SELECT_MAX_SELECTIONS} selections, checked BEFORE membership`, () => {
      const tooMany = Array.from({ length: MULTI_SELECT_MAX_SELECTIONS + 1 }, (_, i) => `Bogus-${i}`);
      const message = validateSelectCustomFieldValue(COLOR_FIELD, tooMany, t);
      expect(message).toContain("customField.values.multiSelectTooManySelections");
      expect(message).toContain(`"max":${MULTI_SELECT_MAX_SELECTIONS}`);
      // NOT the invalid-option message, even though every entry here is also
      // out-of-list -- the ceiling check must win when both would fire,
      // mirroring the backend's own check order exactly.
      expect(message).not.toContain("selectInvalidOption");
    });

    it(`accepts exactly ${MULTI_SELECT_MAX_SELECTIONS} valid, distinct selections (the boundary)`, () => {
      // Only 3 real options exist on this fc, so reuse a field with enough
      // options to actually reach the boundary without also tripping
      // membership/duplicate checks.
      const manyOptions = Array.from({ length: MULTI_SELECT_MAX_SELECTIONS }, (_, i) => ({
        value: `Opt-${i + 1}`,
        label: `Opt-${i + 1}`,
      }));
      const fc: FieldConfig = { name: "cf_many", type: "multi-select", label: "Many", options: manyOptions };
      expect(
        validateSelectCustomFieldValue(fc, manyOptions.map((o) => o.value), t)
      ).toBeNull();
    });

    it("trims surrounding whitespace per entry before comparing, mirroring the backend's Trim()", () => {
      expect(validateSelectCustomFieldValue(COLOR_FIELD, [" Red ", "Blue"], t)).toBeNull();
    });

    it("is ordinal/case-sensitive per entry, matching Select's own rule", () => {
      const message = validateSelectCustomFieldValue(COLOR_FIELD, ["red"], t);
      expect(message).toContain("customField.values.selectInvalidOption");
    });
  });

  // ── assertSelectCustomFieldValuesValid: the real save-flow integration
  // point, now covering BOTH options-owning types with the SAME loop (Task
  // 11 widened its type filter; the 9 wired save-flow call sites needed no
  // changes at all, since every one already passes its full, unfiltered
  // fieldConfigs list here).
  describe("assertSelectCustomFieldValuesValid covers multi-select (Task 11)", () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    const fieldConfigs: FieldConfig[] = [
      {
        name: "cf_priority",
        type: "select",
        label: "Priority",
        options: [{ value: "Low", label: "Low" }],
      },
      {
        name: "cf_colors",
        type: "multi-select",
        label: "Colors",
        options: [
          { value: "Red", label: "Red" },
          { value: "Blue", label: "Blue" },
        ],
      },
    ];

    it("does not throw when both a select and a multi-select value are valid", () => {
      expect(() =>
        assertSelectCustomFieldValuesValid(
          fieldConfigs,
          { cf_priority: "Low", cf_colors: ["Red", "Blue"] },
          t
        )
      ).not.toThrow();
    });

    it("throws CustomFieldValidationError for a stale/invalid multi-select value, before saveValues would 422", () => {
      expect(() =>
        assertSelectCustomFieldValuesValid(
          fieldConfigs,
          { cf_priority: "Low", cf_colors: ["Red", "Purple"] },
          t
        )
      ).toThrow(CustomFieldValidationError);
    });

    it("still catches an invalid scalar Select value alongside a valid multi-select one", () => {
      expect(() =>
        assertSelectCustomFieldValuesValid(
          fieldConfigs,
          { cf_priority: "Urgent", cf_colors: ["Red"] },
          t
        )
      ).toThrow(CustomFieldValidationError);
    });

    it("does not throw for an untouched multi-select field (no value, no defaultValue)", () => {
      expect(() =>
        assertSelectCustomFieldValuesValid(fieldConfigs, { cf_priority: "Low" }, t)
      ).not.toThrow();
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

  // ── fc.type === "datetime" (Wave 3.1 Task 10 branch, Task 12 real control) ─
  // Every `getByLabelText("Meeting", ...)` call below is scoped to
  // `{ selector: "input" }`: Task 12 gave the VISIBLE trigger its own real
  // aria-label equal to "Meeting" too (fixing the generic "select date"
  // defect §5.4 names), so a bare `getByLabelText("Meeting")` now matches
  // BOTH the hidden native input (via `<Label htmlFor>`) and the trigger
  // (via its own aria-label) -- ambiguous by design, not a regression. The
  // dedicated accessible-name assertions live in
  // DateTimeCustomFieldControl.test.tsx (role="group" and the instant
  // trigger's own `getByRole` name); this file keeps its pre-existing
  // structural (type/value) assertions working against the real input.
  describe("fc.type datetime (DateTime)", () => {
    const MEETING_FIELD = { name: "cf_meeting", type: "datetime" as const, label: "Meeting" };

    it("wraps the control in a labelled group and gives the instant picker a real accessible name", () => {
      render(
        <>
          {renderCustomFieldControl({ fc: MEETING_FIELD, value: null, onChange: vi.fn() })}
        </>
      );
      expect(screen.getByRole("group", { name: "Meeting" })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Meeting" })).toBeInTheDocument();
    });

    it("renders a datetime-local input", () => {
      render(
        <>
          {renderCustomFieldControl({ fc: MEETING_FIELD, value: null, onChange: vi.fn() })}
        </>
      );
      expect(screen.getByLabelText("Meeting", { selector: "input" })).toHaveAttribute("type", "datetime-local");
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
      expect(screen.getByLabelText("Meeting", { selector: "input" })).toHaveValue("2026-08-18T10:30");
    });

    it("reports a { value, timeZoneId } object via onChange, pairing a fresh instant with a zone", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({ fc: MEETING_FIELD, value: null, onChange })}
        </>
      );
      fireEvent.change(screen.getByLabelText("Meeting", { selector: "input" }), {
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
      fireEvent.change(screen.getByLabelText("Meeting", { selector: "input" }), {
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
      fireEvent.change(screen.getByLabelText("Meeting", { selector: "input" }), { target: { value: "" } });
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  // ── fc.type === "email" (Wave 3.2 Batch 3) ───────────────────────────────
  // TRAP (pre-plan analysis, trap #1): the shared Input fallthrough's ternary
  // only special-cases "number" -- everything else, including "email", would
  // silently render type="text" without this branch. Asserted directly here.
  describe("fc.type email (Email)", () => {
    it("renders a real type=\"email\" input and reports changes", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_email", type: "email", label: "Contact Email" },
            value: "",
            onChange,
          })}
        </>
      );
      const input = screen.getByLabelText("Contact Email");
      expect(input).toHaveAttribute("type", "email");
      fireEvent.change(input, { target: { value: "a@b.com" } });
      expect(onChange).toHaveBeenCalledWith("a@b.com");
    });

    it("disables the email input when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_email", type: "email", label: "Contact Email" },
            value: "a@b.com",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByLabelText("Contact Email")).toBeDisabled();
    });
  });

  // ── fc.type === "url" (Wave 3.2 Batch 3) ─────────────────────────────────
  describe("fc.type url (Url)", () => {
    it("renders a real type=\"url\" input and reports changes", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_url", type: "url", label: "Website" },
            value: "",
            onChange,
          })}
        </>
      );
      const input = screen.getByLabelText("Website");
      expect(input).toHaveAttribute("type", "url");
      fireEvent.change(input, { target: { value: "https://example.com" } });
      expect(onChange).toHaveBeenCalledWith("https://example.com");
    });

    it("disables the url input when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_url", type: "url", label: "Website" },
            value: "https://example.com",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByLabelText("Website")).toBeDisabled();
    });
  });

  // ── fc.type === "tel" (Wave 3.2 Batch 3: Phone, wired to core/ui/phone-input.tsx) ─
  describe("fc.type tel (Phone)", () => {
    // THE discriminating check the batch brief asked to verify, not assume:
    // PhoneInput wraps a composite (flag-select button + text input) in a
    // plain div, so whether `id`/`<Label htmlFor>` genuinely binds to the
    // real inner input needed proving, not trusting -- getByRole, never
    // getByLabelText, per the "verify, don't trust" discipline Wave 3.1 Task
    // 11 established for GenericSelect's identical-shaped question.
    it("gives the real underlying number input a REAL accessible name via getByRole (verified, not assumed)", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_phone", type: "tel", label: "Phone" },
            value: "",
            onChange: vi.fn(),
          })}
        </>
      );
      const input = screen.getByRole("textbox", { name: "Phone" });
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    });

    it("reports the raw typed value via onChange", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_phone", type: "tel", label: "Phone" },
            value: "",
            onChange,
          })}
        </>
      );
      const input = screen.getByRole("textbox", { name: "Phone" });
      fireEvent.change(input, { target: { value: "+201234567890" } });
      expect(onChange).toHaveBeenCalledWith("+201234567890");
    });

    it("falls back the accessible name to fc.name when fc.label is undefined", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_phone_nolabel", type: "tel" },
            value: "",
            onChange: vi.fn(),
          })}
        </>
      );
      expect(screen.getByRole("textbox", { name: "cf_phone_nolabel" })).toBeInTheDocument();
    });

    it("disables the phone input when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_phone", type: "tel", label: "Phone" },
            value: "",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("textbox", { name: "Phone" })).toBeDisabled();
    });
  });

  // ── fc.type === "slider" (Wave 3.2 Batch 3: Rating) ──────────────────────
  describe("fc.type slider (Rating)", () => {
    // THE discriminating check: proves the core/ui/slider.tsx fix (forwarding
    // aria-label onto the Radix Thumb, not just the Root) actually landed --
    // this test FAILS against the pre-fix slider.tsx (the Thumb would carry
    // Radix's own generic "Value" fallback label instead).
    it("gives the Radix Slider Thumb a REAL accessible name via getByRole (verified, not assumed)", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_rating", type: "slider", label: "Rating" },
            value: null,
            onChange: vi.fn(),
          })}
        </>
      );
      expect(screen.getByRole("slider", { name: "Rating" })).toBeInTheDocument();
    });

    it("reports a numeric value via onChange when the thumb moves (simulated via keyboard)", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_rating", type: "slider", label: "Rating" },
            value: 2,
            onChange,
          })}
        </>
      );
      const thumb = screen.getByRole("slider", { name: "Rating" });
      thumb.focus();
      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("defaults an empty/untouched value to RATING_MIN for the thumb's position without calling onChange", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_rating", type: "slider", label: "Rating" },
            value: null,
            onChange,
          })}
        </>
      );
      expect(screen.getByRole("slider", { name: "Rating" })).toHaveAttribute("aria-valuenow", "1");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("clamps the accessible value range to 1-5", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_rating", type: "slider", label: "Rating" },
            value: 4,
            onChange: vi.fn(),
          })}
        </>
      );
      const thumb = screen.getByRole("slider", { name: "Rating" });
      expect(thumb).toHaveAttribute("aria-valuemin", "1");
      expect(thumb).toHaveAttribute("aria-valuemax", "5");
      expect(thumb).toHaveAttribute("aria-valuenow", "4");
    });

    it("disables the slider when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_rating", type: "slider", label: "Rating" },
            value: 3,
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("slider", { name: "Rating" })).toHaveAttribute("data-disabled");
    });
  });

  // ── fc.type === "currency" (Wave 3.3 Batch C: Currency) ──────────────────
  // Rich accessible-name/i18n-interpolation assertions for this control live
  // in CurrencyCustomFieldControl.test.tsx itself (which mocks a
  // params-aware `t`) -- this file's own convention (see the "datetime"
  // block above) is to keep assertions here structural: does dispatch reach
  // the real dedicated control, do values/onChange flow through correctly.
  describe("fc.type currency (Currency)", () => {
    const PRICE_FIELD = { name: "cf_price", type: "currency" as const, label: "Price" };

    // The code input queries here say "combobox", not "textbox": an
    // `<input type="text" list="...">` maps to role combobox per HTML-AAM, and
    // the code input carries a `list` for the SUPPORTED_CURRENCIES datalist.
    // Retargeted to the real role, not loosened -- see
    // CurrencyCustomFieldControl.test.tsx's own note on this.
    it("renders two real, independently-labelled amount and currency-code inputs inside a named group", () => {
      render(<>{renderCustomFieldControl({ fc: PRICE_FIELD, value: null, onChange: vi.fn() })}</>);
      expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
      const amountInput = screen.getByRole("spinbutton");
      expect(amountInput).toHaveAttribute("type", "number");
      const codeInput = screen.getByRole("combobox");
      expect(codeInput).toHaveAttribute("maxlength", "3");
    });

    it("emits the new amount via onChange when the amount input changes", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: PRICE_FIELD,
            value: { amount: "50", currencyCode: "USD" },
            onChange,
          })}
        </>
      );
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "100" } });
      expect(onChange).toHaveBeenCalledWith({ amount: "100", currencyCode: "USD" });
    });

    it("uppercases the currency code as it is typed", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: PRICE_FIELD,
            value: { amount: "5", currencyCode: "" },
            onChange,
          })}
        </>
      );
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "usd" } });
      expect(onChange).toHaveBeenCalledWith({ amount: "5", currencyCode: "USD" });
    });

    it("clears to null once the only populated piece is blanked out", () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: PRICE_FIELD,
            value: { amount: "50", currencyCode: "" },
            onChange,
          })}
        </>
      );
      fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("disables both inputs when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: PRICE_FIELD,
            value: { amount: "50", currencyCode: "USD" },
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("spinbutton")).toBeDisabled();
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  // ── fc.type === "duration" (Wave 3.3 Batch C: Duration) ──────────────────
  describe("fc.type duration (Duration)", () => {
    const SETUP_FIELD = { name: "cf_setup", type: "duration" as const, label: "Setup Buffer" };

    it("gives the number input a REAL accessible name via getByRole (verified, not assumed)", () => {
      render(<>{renderCustomFieldControl({ fc: SETUP_FIELD, value: "", onChange: vi.fn() })}</>);
      const input = screen.getByRole("spinbutton", { name: "Setup Buffer" });
      expect(input).toHaveAttribute("type", "number");
    });

    it("shows the minutes unit as visible text beside the input, not folded away", () => {
      render(<>{renderCustomFieldControl({ fc: SETUP_FIELD, value: 90, onChange: vi.fn() })}</>);
      expect(screen.getByText("customField.duration.unitLabel")).toBeInTheDocument();
    });

    it("reports the raw typed value via onChange", () => {
      const onChange = vi.fn();
      render(<>{renderCustomFieldControl({ fc: SETUP_FIELD, value: "", onChange })}</>);
      fireEvent.change(screen.getByRole("spinbutton", { name: "Setup Buffer" }), {
        target: { value: "45" },
      });
      expect(onChange).toHaveBeenCalledWith("45");
    });

    it("disables the input when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: SETUP_FIELD,
            value: 90,
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("spinbutton", { name: "Setup Buffer" })).toBeDisabled();
    });
  });

  // ── fc.type === "time" (Wave 3.3 Batch C: Time, R6's own named trap) ─────
  describe("fc.type time (Time)", () => {
    it('renders a real type="time" input with second-level granularity and reports changes', () => {
      const onChange = vi.fn();
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_time", type: "time", label: "Kickoff" },
            value: "",
            onChange,
          })}
        </>
      );
      // input[type=time] has NO ARIA role mapping at all -- confirmed
      // directly against aria-query's own elementRoles table (date/time/
      // week/month inputs are excluded from every role bucket, unlike
      // type=number's "spinbutton" or type=text's "textbox"), so
      // `getByRole` cannot query this element by any role name; there is no
      // role to ask for. This is a single, genuinely native, directly
      // labelable <input> with no decoy element the way DatePicker/
      // GenericSelect/Slider have (this branch deliberately avoids
      // DatePicker's own broken "time" cast -- see this branch's own
      // comment in renderCustomFieldControl.tsx), so `getByLabelText`'s
      // real `for`/`id` association is itself the correct, non-decoy
      // verification here, not a workaround for a broken pattern.
      const input = screen.getByLabelText("Kickoff");
      expect(input).toHaveAttribute("type", "time");
      expect(input).toHaveAttribute("step", "1");
      fireEvent.change(input, { target: { value: "09:05:30" } });
      expect(onChange).toHaveBeenCalledWith("09:05:30");
    });

    it("falls back the accessible name to fc.name when fc.label is undefined", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_time_nolabel", type: "time" },
            value: "",
            onChange: vi.fn(),
          })}
        </>
      );
      expect(screen.getByLabelText("cf_time_nolabel")).toBeInTheDocument();
    });

    it("disables the time input when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: { name: "cf_time", type: "time", label: "Kickoff" },
            value: "09:05:30",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByLabelText("Kickoff")).toBeDisabled();
    });
  });

  // ── fc.type === "color" (Wave 3.3 Batch C: Color) ─────────────────────────
  describe("fc.type color (Color)", () => {
    const COLOR_FIELD = { name: "cf_color", type: "color" as const, label: "Team Color" };

    it("renders a real, accessibly-named picker trigger (aria-labelledby, not <Label htmlFor> -- verified, not re-solved)", () => {
      render(
        <>
          {renderCustomFieldControl({ fc: COLOR_FIELD, value: "#3b82f6", onChange: vi.fn() })}
        </>
      );
      // ColorPickerField's own accessible-name mechanism is aria-labelledby,
      // concatenating the field label and the live hex-value text -- R5's
      // own "already solves the label trap itself" claim, verified here
      // through this dispatcher rather than re-trusted.
      expect(screen.getByRole("button", { name: "Team Color #3b82f6" })).toBeInTheDocument();
    });

    it("defaults an empty/non-string value to a real hex placeholder rather than an empty swatch", () => {
      render(<>{renderCustomFieldControl({ fc: COLOR_FIELD, value: null, onChange: vi.fn() })}</>);
      expect(screen.getByRole("button", { name: "Team Color #000000" })).toBeInTheDocument();
    });

    it("uses THIS module's own i18n namespace for the picker's internal copy, never the rich-text-editor's editorBlocks.color.*", () => {
      render(
        <>
          {renderCustomFieldControl({ fc: COLOR_FIELD, value: "#3b82f6", onChange: vi.fn() })}
        </>
      );
      fireEvent.click(screen.getByRole("button", { name: "Team Color #3b82f6" }));
      // This file's own top-of-file `t` mock returns the bare key
      // (ignoring params), so a swatch button's REAL computed aria-label IS
      // the key string itself once i18nKeyPrefix is threaded through --
      // the discriminating proof that CustomFields' own "customField.color"
      // prefix reached ColorPickerField, not left at its
      // "editorBlocks.color" default.
      expect(
        screen.queryAllByRole("button", { name: "customField.color.swatch" }).length
      ).toBeGreaterThan(0);
      expect(
        screen.queryByRole("button", { name: "editorBlocks.color.swatch" })
      ).not.toBeInTheDocument();
    });

    it("reports the picked swatch's hex value via onChange", () => {
      const onChange = vi.fn();
      render(<>{renderCustomFieldControl({ fc: COLOR_FIELD, value: "#3b82f6", onChange })}</>);
      fireEvent.click(screen.getByRole("button", { name: "Team Color #3b82f6" }));
      const swatches = screen.getAllByRole("button", { name: "customField.color.swatch" });
      fireEvent.click(swatches[0]);
      expect(onChange).toHaveBeenCalledWith("#3b82f6");
    });

    it("disables the trigger (a real disabled button, not just visually dimmed) when isViewMode is true", () => {
      render(
        <>
          {renderCustomFieldControl({
            fc: COLOR_FIELD,
            value: "#3b82f6",
            onChange: vi.fn(),
            isViewMode: true,
          })}
        </>
      );
      expect(screen.getByRole("button", { name: "Team Color #3b82f6" })).toBeDisabled();
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
          // Date's own dedicated branch: a real <input type="date">, AND
          // (Wave 3.1 Task 12) a real computed accessible name on the
          // VISIBLE trigger -- not just a DOM association to the hidden
          // input `getByLabelText` would also find even if the name were
          // wrong (see this file's dedicated Date test above). Scoped to
          // `input`: the trigger's own aria-label now equals `valueType`
          // too, so a bare `getByLabelText(valueType)` is ambiguous here --
          // by design, since it's the same fix under test.
          expect(screen.getByLabelText(valueType, { selector: "input" })).toHaveAttribute(
            "type",
            "date"
          );
          expect(screen.getByRole("combobox", { name: valueType })).toBeInTheDocument();
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
          // LongText's own dedicated branch: a real <textarea>, not the
          // single-line Input fallthrough. A plain <textarea> genuinely
          // computes its accessible name from <Label htmlFor> (unlike
          // GenericSelect's role="combobox" div), so `getByRole("textbox",
          // { name })` here is a real name assertion, not just a DOM
          // association check.
          expect(screen.getByRole("textbox", { name: valueType }).tagName).toBe("TEXTAREA");
          break;
        case "datetime":
          // DateTime's own dedicated branch (Wave 3.1 Task 12): a real
          // <input type="datetime-local">, wrapped in a labelled
          // role="group" (GOV.UK date-input shape, §5.3) rather than the
          // "date" branch's single date-only input. Scoped to `input` for
          // the same reason as the "date" case above.
          expect(screen.getByLabelText(valueType, { selector: "input" })).toHaveAttribute(
            "type",
            "datetime-local"
          );
          expect(screen.getByRole("group", { name: valueType })).toBeInTheDocument();
          break;
        case "number":
          // Number's own distinguishing mark on the shared Input branch:
          // the numeric type attribute. Percent (Wave 3.2 Batch 3) also
          // resolves to this exact case -- it deliberately shares Number's
          // fieldConfigType and this same code path, not a gap.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "number");
          break;
        case "text":
          // Text is DELIBERATELY the generic Input fallthrough's default
          // case (this file's header comment, and renderCustomFieldControl.tsx's
          // own final branch) -- asserted explicitly here, not assumed.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "text");
          break;
        // ── Wave 3.2 Batch 3 ────────────────────────────────────────────
        case "email":
          // Email's own dedicated branch (trap #1): a real type="email"
          // input, not the shared fallthrough's type="text" default.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "email");
          break;
        case "url":
          // Url's own dedicated branch (trap #1): a real type="url" input.
          expect(screen.getByLabelText(valueType)).toHaveAttribute("type", "url");
          break;
        case "tel":
          // Phone's own dedicated branch: PhoneInput's real underlying
          // number input, reached via getByRole (not getByLabelText) -- the
          // discriminating, verify-don't-trust check for this composite
          // control's accessible name.
          expect(screen.getByRole("textbox", { name: valueType })).toBeInTheDocument();
          break;
        case "slider":
          // Rating's own dedicated branch: a real Radix Slider Thumb with a
          // REAL computed accessible name -- proves the core/ui/slider.tsx
          // aria-label-forwarding fix actually applies through this shared
          // dispatcher, not just in isolation.
          expect(screen.getByRole("slider", { name: valueType })).toBeInTheDocument();
          break;
        // ── Wave 3.3 Batch C ────────────────────────────────────────────
        case "currency": {
          // Currency's own dedicated branch: two real, independently
          // labelled inputs inside a named group -- not reachable via the
          // shared number/text Input fallthrough at all (it has no concept
          // of a paired amount + code control).
          expect(screen.getByRole("group", { name: valueType })).toBeInTheDocument();
          const amountInput = screen.getByRole("spinbutton");
          expect(amountInput).toHaveAttribute("type", "number");
          fireEvent.change(amountInput, { target: { value: "10" } });
          expect(onChange).toHaveBeenCalledWith({ amount: "10", currencyCode: "" });
          break;
        }
        case "duration": {
          // Duration's own dedicated branch: a real accessible name via
          // getByRole, AND the explicit localized unit label rendered
          // visibly beside it -- the discriminating difference from the
          // plain "number" case above, which has no unit annotation at all.
          const input = screen.getByRole("spinbutton", { name: valueType });
          expect(input).toHaveAttribute("type", "number");
          expect(screen.getByText("customField.duration.unitLabel")).toBeInTheDocument();
          break;
        }
        case "time": {
          // Time's own dedicated branch (R6, the trap this batch closes): a
          // real <input type="time"> with second-level granularity, reached
          // through getByLabelText -- input[type=time] has NO ARIA role
          // mapping at all (confirmed against aria-query's own
          // elementRoles table), so getByRole cannot query this element by
          // any name; getByLabelText's real for/id association is the
          // correct, non-decoy check here (see this file's dedicated "time"
          // describe block above for the full reasoning).
          const input = screen.getByLabelText(valueType);
          expect(input).toHaveAttribute("type", "time");
          expect(input).toHaveAttribute("step", "1");
          break;
        }
        case "color": {
          // Color's own dedicated branch (R5): the generalized
          // ColorPickerField, not the bare native <input type="color"> (no
          // hex entry, no presets) the shared fallthrough would otherwise
          // produce for an unbranched "color" fieldConfigType.
          expect(
            screen.getByRole("button", { name: `${valueType} #000000` })
          ).toBeInTheDocument();
          break;
        }
        // ── Wave 4 ──────────────────────────────────────────────────────
        case "entity-reference": {
          // BOTH reference value types resolve to this one case, on purpose:
          // they share a control and differ only in which target key it is
          // fed. The gate builds its FieldConfig from the catalog alone, so it
          // renders with an EMPTY value AND no definition pin -- the one state
          // in which neither target source has an answer. What must be proved
          // here is that the branch reaches a control which says so, rather
          // than falling through to the shared text Input (which would render
          // an empty text box, or, once a value existed, the literal
          // "[object Object]"). Which source wins when they DO have answers is
          // a separate question, pinned in
          // renderCustomFieldControl.referenceTargetEntityTypeKey.test.tsx.
          //
          // Two discriminating facts, neither reachable from the fallthrough:
          // a role="combobox" that is explicitly NOT operable, and the
          // localized explanation of why. An empty dropdown would satisfy
          // neither -- it reads as "the server returned no records", which
          // sends whoever hits it looking in entirely the wrong place.
          const trigger = screen.getByRole("combobox", { name: valueType });
          expect(trigger).toHaveAttribute("aria-disabled", "true");
          expect(
            screen.getByText("customField.entityReference.noTargetConfigured")
          ).toBeInTheDocument();
          break;
        }
        // ── Wave 3.4 ──────────────────────────────────────────
        case "media-file":
        case "media-image": {
          // File and Image's shared control, reached through two dispatch keys.
          // The gate builds its FieldConfig from the catalog alone, so there is
          // no definition pin and no value -- the state in which the field is
          // not pointed at anything yet.
          //
          // THE DISCRIMINATING FACT is a labelled role="group" containing a
          // localized statement. Neither is reachable from the shared text Input
          // fallthrough, which would render an `<input type="text">` -- and once
          // a value existed, the literal "[object Object]" in it. An empty
          // dropdown would not do either: this control has no picker at all, on
          // purpose (no owner-scoped media endpoint exists, and the general
          // reference picker would offer exactly the picks the backend's
          // owner-pair fence refuses), so it says so instead of implying the
          // server returned nothing.
          expect(screen.getByRole("group", { name: valueType })).toBeInTheDocument();
          expect(
            screen.getByText("customField.mediaReference.notConfigured")
          ).toBeInTheDocument();
          // The ONE thing that differs between the two value types at this tier,
          // asserted as a difference rather than as two separate facts: Image
          // states its image-only requirement up front, File does not have one
          // to state. If the two keys were ever collapsed onto one, this is the
          // assertion that fails.
          if (entry.fieldConfigType === "media-image") {
            expect(screen.getByText("customField.mediaReference.imagesOnly")).toBeInTheDocument();
            expect(screen.getByText("customField.mediaReference.noImage")).toBeInTheDocument();
          } else {
            expect(
              screen.queryByText("customField.mediaReference.imagesOnly")
            ).not.toBeInTheDocument();
            expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
          }
          break;
        }
        case "rich-text": {
          // RichText's own dedicated branch, mounting the REAL editor (TipTap
          // runs in jsdom; nothing is stubbed in this file).
          //
          // `getByRole("textbox", { name })` ALONE WOULD NOT DISCRIMINATE -- the
          // shared Input fallthrough renders `<input type="text">`, which is
          // also a named textbox. What no `<input>` can ever carry is
          // `contenteditable` and `aria-multiline`, so those are the assertions
          // that actually distinguish this branch. They also prove the a11y
          // forwarding lands on the element that takes focus rather than on a
          // wrapper: `contenteditable` confers no implicit ARIA role, so a
          // nameless, roleless contenteditable is what this branch produces
          // without RichTextEditor's forwarding props being wired.
          const editor = screen.getByRole("textbox", { name: valueType });
          expect(editor).toHaveAttribute("contenteditable", "true");
          expect(editor).toHaveAttribute("aria-multiline", "true");
          // And the raw-markup counter, which is this control's own furniture --
          // the fallthrough has none.
          expect(screen.getByText("customField.richText.characterCount")).toBeInTheDocument();
          break;
        }
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

// EntityReference / UserReference branch -- Wave 4.
//
// Three decisions live in this branch rather than in the control, so they are
// pinned here rather than in EntityReferenceCustomFieldControl.test.tsx:
//   1. WHERE THE TARGET TYPE COMES FROM. Two sources: the definition's pin
//      (`fc.referenceTargetEntityTypeKey`) and the stored value's own key,
//      which the backend keeps per value so a reference stays interpretable
//      after its definition is re-pointed. The cases below cover the
//      VALUE-sourced ones -- pin present, pin absent, both absent, and which
//      one wins when they disagree, live in
//      renderCustomFieldControl.referenceTargetEntityTypeKey.test.tsx, whose
//      lookup-hook mocks would otherwise change what this file proves.
//   2. VALUE NARROWING. The renderer's `value` is `unknown`. Anything that is
//      not reference-shaped becomes null rather than being handed through,
//      because the control's own fallback for an unrecognised value would put
//      something meaningless in the field.
//   3. isViewMode -> `disabled`, not `readOnly`. This file's header records the
//      family split: Switch takes readOnly, every picker/input family control
//      takes disabled. A reference picker is a picker.
describe("renderCustomFieldControl -- entity-reference branch (Wave 4)", () => {
  const FC = { name: "cf_assignee", type: "entity-reference", label: "Assignee" } as const;

  it("derives the target entity type from the STORED VALUE, so a populated reference is operable", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC },
          value: { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" },
          onChange: vi.fn(),
        })}
      </>
    );

    const trigger = screen.getByRole("combobox", { name: "Assignee" });
    expect(trigger).not.toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByText("customField.entityReference.noTargetConfigured")
    ).not.toBeInTheDocument();
  });

  it("renders the explicit no-target state for an empty value, never an empty dropdown", () => {
    render(<>{renderCustomFieldControl({ fc: { ...FC }, value: null, onChange: vi.fn() })}</>);

    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(
      screen.getByText("customField.entityReference.noTargetConfigured")
    ).toBeInTheDocument();
  });

  it.each([
    ["a bare string", "ENC-1"],
    ["a number", 42],
    ["an array", ["ENC-1"]],
    [
      "an object whose id is misnamed `encryptedEntityId`",
      { entityTypeKey: "hrms.staff-member", encryptedEntityId: "ENC-1" },
    ],
    ["a partial object", { entityTypeKey: "hrms.staff-member" }],
  ])("narrows %s to null instead of handing it to the control", (_label, value) => {
    render(<>{renderCustomFieldControl({ fc: { ...FC }, value, onChange: vi.fn() })}</>);

    // Narrowed to null => no target => the explicit no-target state. The
    // misnamed-id row is the one that matters most, and it is not "the write
    // shape" -- there is no write shape, a reference is `entityId` in both
    // directions. It is simply an object missing `entityId`, i.e. what a
    // renaming bug upstream would produce, and it must not be mistaken for a
    // readable reference.
    expect(
      screen.getByText("customField.entityReference.noTargetConfigured")
    ).toBeInTheDocument();
  });

  it("passes isViewMode through as `disabled`, matching every other picker branch in this file", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { ...FC },
          value: { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" },
          onChange: vi.fn(),
          isViewMode: true,
        })}
      </>
    );

    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("labels the field from fc.label, falling back to fc.name when a definition has no label", () => {
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_unlabelled", type: "entity-reference" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );

    expect(screen.getByRole("combobox", { name: "cf_unlabelled" })).toBeInTheDocument();
  });

  it("renders exactly one label -- the control owns its own, so the branch must not add a second", () => {
    render(<>{renderCustomFieldControl({ fc: { ...FC }, value: null, onChange: vi.fn() })}</>);

    // A duplicated <Label htmlFor> would make getAllByText return two nodes
    // and give the field two visible names.
    expect(screen.getAllByText("Assignee")).toHaveLength(1);
  });
});

// File / Image and RichText branches -- Wave 3.4.
//
// Three decisions live in these branches rather than in the controls, so they
// are pinned here rather than in the controls' own test files:
//   1. VALUE NARROWING. The renderer's `value` is `unknown`, and each branch
//      narrows it with the shape guard for ITS envelope. The case that matters
//      is a shape belonging to the OTHER type, or a bare string -- both must
//      become null rather than reaching a control that would then re-emit them.
//   2. WHICH KEY MEANS "IMAGES ONLY". The two media value types differ only in
//      that flag, and the flag is derived from the dispatch key here because
//      there is no other property that could carry it.
//   3. THE MEDIA TARGET KEY IS READ FROM THE PIN, NOT WRITTEN AS A LITERAL.
describe("renderCustomFieldControl -- media branches (Wave 3.4)", () => {
  const STORED = { entityTypeKey: "media.file", entityId: "ENC-media-1" };

  it("derives imagesOnly from the dispatch key, which is the only thing that carries it", () => {
    // Two renders, one assertion each way. Asserting only the Image side would
    // pass against a control that hardcoded `imagesOnly` true, which is why the
    // File side's NEGATIVE assertion is here: it is the half that fails if the
    // two keys are ever collapsed into one.
    const { unmount } = render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_photo", type: "media-image", label: "Photo" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.imagesOnly")).toBeInTheDocument();
    unmount();

    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.queryByText("customField.mediaReference.imagesOnly")).not.toBeInTheDocument();
  });

  it("narrows a value that is not reference-shaped to null instead of handing it through", () => {
    // The two shapes most likely to arrive by mistake are the ones the
    // pre-existing "image"/"file" FieldConfig arms produce: a base64 string and
    // a browser File. Both must read as "nothing attached" rather than being
    // rendered or re-emitted. Asserted through the state text, because that is
    // the only externally visible consequence of the narrowing.
    const onChange = vi.fn();
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: "data:image/png;base64,AAAA",
          onChange,
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
    expect(screen.queryByText("customField.mediaReference.fileAttached")).not.toBeInTheDocument();
    // And nothing was written back: a render must never mutate the value it was
    // given, which is exactly what the text-input fallthrough did.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("narrows a RICH-TEXT envelope to null on a media field, and the reverse", () => {
    // The two new object envelopes must not be interchangeable. A `{ html }`
    // value on a media field is out-of-band data, not a reference.
    const { unmount } = render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: { html: "<p>not a file</p>" },
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
    unmount();

    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_notes", type: "rich-text", label: "Notes" },
          value: STORED,
          onChange: vi.fn(),
        })}
      </>
    );
    // A reference envelope on a rich-text field renders an EMPTY editor -- and
    // specifically not the encrypted id, which is what `String(value)` or a
    // careless `value.entityId` would have put in the box.
    const editor = screen.getByRole("textbox", { name: "Notes" });
    expect(editor.textContent).not.toContain("ENC-media-1");
    expect(editor.textContent?.trim()).toBe("");
  });

  it("reads the media target key off the definition pin rather than a hardcoded media.file", () => {
    // The control renders `attachUnavailable` when the field IS pointed at
    // something and `notConfigured` when it is not, so the pin's arrival is
    // observable without exposing the key itself. Both directions are asserted:
    // a branch that hardcoded "media.file" would report `attachUnavailable`
    // even with no pin and no value, and the second half is what catches it.
    const { unmount } = render(
      <>
        {renderCustomFieldControl({
          fc: {
            name: "cf_waiver",
            type: "media-file",
            label: "Waiver",
            referenceTargetEntityTypeKey: "media.file",
          },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.attachUnavailable")).toBeInTheDocument();
    unmount();

    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.notConfigured")).toBeInTheDocument();
  });

  it("falls back to the STORED value's own key when the definition has no pin", () => {
    // Same two-source ordering the reference branch documents: a populated field
    // whose definition lost its pin is still a configured, operable field,
    // because the value carries its own key. Without the fallback this renders
    // "not pointed at a file library" over a field that plainly holds a file.
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: STORED,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByText("customField.mediaReference.attachUnavailable")).toBeInTheDocument();
    expect(screen.getByText("customField.mediaReference.fileAttached")).toBeInTheDocument();
  });

  it("passes isViewMode through as disabled, so a view-mode field offers no Remove", () => {
    // The picker-family mapping (`disabled`, not `readOnly`) this file's header
    // records. Withholding ONLY isViewMode and keeping everything else identical
    // is what makes this a test of that prop rather than of the control's
    // general behaviour: the same field WITHOUT it does render Remove, asserted
    // first so the second half cannot pass vacuously.
    const { unmount } = render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: STORED,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(
      screen.getByRole("button", { name: "customField.mediaReference.clear" })
    ).toBeInTheDocument();
    unmount();

    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_waiver", type: "media-file", label: "Waiver" },
          value: STORED,
          onChange: vi.fn(),
          isViewMode: true,
        })}
      </>
    );
    expect(
      screen.queryByRole("button", { name: "customField.mediaReference.clear" })
    ).not.toBeInTheDocument();
  });
});

describe("renderCustomFieldControl -- rich-text branch (Wave 3.4)", () => {
  it("unwraps the { html } envelope for the editor rather than handing it the object", () => {
    // The observable difference between unwrapping and not: the editor is a
    // `value: string` component, so passing the object renders the literal
    // "[object Object]" as the document's text. Asserting the prose is present
    // AND that literal is absent covers both halves.
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_notes", type: "rich-text", label: "Notes" },
          value: { html: "<p>Two-footed tackle drill</p>" },
          onChange: vi.fn(),
        })}
      </>
    );
    const editor = screen.getByRole("textbox", { name: "Notes" });
    expect(editor.textContent).toContain("Two-footed tackle drill");
    expect(editor.textContent).not.toContain("[object Object]");
  });

  it("narrows a BARE STRING to null -- the one shape the write path refuses", () => {
    // A bare string is what "richtext"'s pre-existing GenericForm arm produces
    // and what `RichTextValueTypeHandler.Parse` answers WasExtractable:false for.
    // If it were passed through instead of narrowed, the editor would display it
    // and then re-emit it on the first keystroke, turning stale data into a
    // guaranteed 422. It reads as an empty field instead.
    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_notes", type: "rich-text", label: "Notes" },
          value: "<p>stale bare string</p>",
          onChange: vi.fn(),
        })}
      </>
    );
    const editor = screen.getByRole("textbox", { name: "Notes" });
    expect(editor.textContent).not.toContain("stale bare string");
  });

  it("forwards the field's placeholder to the editor instead of the editor's own default", () => {
    // RichTextEditor falls back to `t("editor.placeholder")` -- a
    // rich-text-editor namespace key -- when given none, so a custom field with
    // its own configured placeholder would silently show generic copy. TipTap
    // renders the placeholder as a `data-placeholder` attribute on the first
    // empty paragraph.
    render(
      <>
        {renderCustomFieldControl({
          fc: {
            name: "cf_notes",
            type: "rich-text",
            label: "Notes",
            placeholder: "Session takeaways",
          },
          value: null,
          onChange: vi.fn(),
        })}
      </>
    );
    expect(document.querySelector('[data-placeholder="Session takeaways"]')).not.toBeNull();
    expect(document.querySelector('[data-placeholder="editor.placeholder"]')).toBeNull();
  });

  it("passes isViewMode through as the editor's readOnly, which also removes the toolbar", () => {
    // Same withhold-exactly-one shape as the media case: the editable render is
    // asserted first, so the read-only assertion cannot pass against a control
    // that never renders a toolbar at all.
    const { unmount } = render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_notes", type: "rich-text", label: "Notes" },
          value: { html: "<p>x</p>" },
          onChange: vi.fn(),
        })}
      </>
    );
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute(
      "contenteditable",
      "true"
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    unmount();

    render(
      <>
        {renderCustomFieldControl({
          fc: { name: "cf_notes", type: "rich-text", label: "Notes" },
          value: { html: "<p>x</p>" },
          onChange: vi.fn(),
          isViewMode: true,
        })}
      </>
    );
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute(
      "contenteditable",
      "false"
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
