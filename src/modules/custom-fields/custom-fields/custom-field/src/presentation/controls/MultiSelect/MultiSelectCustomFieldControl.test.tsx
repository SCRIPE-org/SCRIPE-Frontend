// MultiSelectCustomFieldControl -- Wave 3.1 Task 11
//
// Mirrors renderCustomFieldControl.test.tsx's own mocking/polyfill
// conventions (same settings-provider/i18n-provider mocks, same
// ResizeObserver/scrollIntoView jsdom polyfills GenericSelect needs even
// when a test never opens the panel) since this control is built on the
// exact same GenericSelect/Popover/cmdk stack.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  MultiSelectCustomFieldControl,
  MULTI_SELECT_MAX_SELECTIONS,
} from "./MultiSelectCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

// Unlike renderCustomFieldControl.test.tsx's bare key-echoing mock, this one
// also echoes the interpolation params (JSON-appended) -- several assertions
// below need to prove the RIGHT numbers (count/max) were actually passed to
// `t`, not just that some translated string rendered.
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const COLOR_OPTIONS = [
  { value: "Red", label: "Red" },
  { value: "Green", label: "Green" },
  { value: "Blue", label: "Blue" },
];

const COLOR_FIELD: FieldConfig = {
  name: "cf_colors",
  type: "multi-select",
  label: "Colors",
  options: COLOR_OPTIONS,
};

/** N synthetic options, "Opt-1".."Opt-N", for ceiling tests. */
function manyOptions(n: number) {
  return Array.from({ length: n }, (_, i) => ({ value: `Opt-${i + 1}`, label: `Opt-${i + 1}` }));
}

/**
 * A real, stateful harness -- MultiSelectCustomFieldControl is a controlled
 * component (parent owns `value`), so proving ORDER PRESERVATION across
 * several picks requires actually re-rendering with the updated value after
 * each one, the way a real form's onChange handler would, not just a single
 * static render.
 */
function StatefulHarness({
  fc,
  initial = [],
  onChangeSpy,
}: {
  fc: FieldConfig;
  initial?: string[];
  onChangeSpy?: (v: string[]) => void;
}) {
  const [value, setValue] = React.useState<string[]>(initial);
  return (
    <MultiSelectCustomFieldControl
      fc={fc}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChangeSpy?.(v);
      }}
    />
  );
}

describe("MultiSelectCustomFieldControl", () => {
  // ── Accessible name (brief's fact #1: <Label htmlFor> is inert here) ────
  it("computes a real accessible name via aria-label, not via <Label htmlFor> alone", () => {
    render(<StatefulHarness fc={COLOR_FIELD} />);
    // The sibling <label htmlFor> is still real DOM wiring for sighted users...
    expect(screen.getByText("Colors", { selector: "label" })).toHaveAttribute("for", "cf_colors");
    // ...but the DISCRIMINATING check is the trigger's actual accessible name,
    // which only aria-label (not htmlFor) computes for a role="combobox" div.
    expect(screen.getByRole("combobox", { name: "Colors" })).toHaveAttribute("id", "cf_colors");
  });

  it("falls back the accessible name to fc.name when fc.label is undefined", () => {
    render(<StatefulHarness fc={{ ...COLOR_FIELD, label: undefined }} />);
    expect(screen.getByRole("combobox", { name: "cf_colors" })).toBeInTheDocument();
  });

  // ── Selection order preserved, never re-sorted to definition order ──────
  it("renders chips in the order the user selected them, not fc.options' order", () => {
    render(<StatefulHarness fc={COLOR_FIELD} />);
    const trigger = screen.getByRole("combobox", { name: "Colors" });

    // Definition order is Red, Green, Blue. Pick Blue, then Red -- the
    // OPPOSITE of definition order. Multi-select never auto-closes the panel
    // on a pick (generic-select.tsx's own handleSelect), so both picks happen
    // in the same open session -- re-clicking the trigger in between would
    // just toggle the panel closed again.
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Blue" }));
    fireEvent.click(screen.getByRole("option", { name: "Red" }));

    // Selection order (Blue, Red), never re-sorted back to definition order
    // (Red, Green, Blue) -- the exact regression the brief warns against.
    const triggerText = trigger.textContent ?? "";
    expect(triggerText.indexOf("Blue")).toBeGreaterThanOrEqual(0);
    expect(triggerText.indexOf("Blue")).toBeLessThan(triggerText.indexOf("Red"));
  });

  it("keeps the remaining selections in order after removing one from the middle", () => {
    const onChangeSpy = vi.fn();
    render(<StatefulHarness fc={COLOR_FIELD} initial={["Blue", "Red", "Green"]} onChangeSpy={onChangeSpy} />);

    // Remove "Red" (the middle one) via its chip's own remove button -- a
    // real, keyboard-reachable <button> with its own accessible name
    // (select.chip.remove, interpolated with the chip's label under this
    // file's param-echoing `t` mock), not a mouse-only affordance.
    const removeButton = screen.getByRole("button", {
      name: 'select.chip.remove:{"label":"Red"}',
    });
    expect(removeButton.tagName).toBe("BUTTON");
    fireEvent.click(removeButton);

    expect(onChangeSpy).toHaveBeenCalledWith(["Blue", "Green"]);
  });

  // ── The 19-selection ceiling: PREVENT, not just describe ────────────────
  describe(`the ${MULTI_SELECT_MAX_SELECTIONS}-selection ceiling`, () => {
    it(`disables every UNSELECTED option once exactly ${MULTI_SELECT_MAX_SELECTIONS} are already selected`, () => {
      const options = manyOptions(25);
      const atCapValues = options.slice(0, MULTI_SELECT_MAX_SELECTIONS).map((o) => o.value);
      const onChangeSpy = vi.fn();
      render(
        <StatefulHarness
          fc={{ name: "cf_many", type: "multi-select", label: "Many", options }}
          initial={atCapValues}
          onChangeSpy={onChangeSpy}
        />
      );
      fireEvent.click(screen.getByRole("combobox", { name: "Many" }));

      // The 20th option (not yet selected) must be disabled -- both visibly
      // (aria-disabled) and functionally (cmdk attaches no click handler at
      // all to a disabled option, so a click can never select it).
      const untouched = screen.getByRole("option", { name: "Opt-20" });
      expect(untouched).toHaveAttribute("aria-disabled", "true");

      fireEvent.click(untouched);
      expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("keeps already-selected options enabled at the cap, so they stay removable via the panel", () => {
      const options = manyOptions(20);
      const atCapValues = options.slice(0, MULTI_SELECT_MAX_SELECTIONS).map((o) => o.value);
      const onChangeSpy = vi.fn();
      render(
        <StatefulHarness
          fc={{ name: "cf_many", type: "multi-select", label: "Many", options }}
          initial={atCapValues}
          onChangeSpy={onChangeSpy}
        />
      );
      fireEvent.click(screen.getByRole("combobox", { name: "Many" }));

      // NOT queried by accessible name: a SELECTED row's name is prefixed
      // with the sr-only "common.selected" text (select-option-row.tsx's own
      // deliberate second text channel for the chosen state, distinct from
      // cmdk's own aria-selected keyboard highlight -- see that file's
      // header comment), which under this test's echoing `t` mock collides
      // with "Opt-1" as a literal substring match. cmdk's own `data-value`
      // (`${label} ${value}`) identifies the row unambiguously instead.
      const firstSelected = screen
        .getAllByRole("option")
        .find((el) => el.getAttribute("data-value") === "Opt-1 Opt-1") as HTMLElement;
      expect(firstSelected).not.toHaveAttribute("aria-disabled", "true");
      fireEvent.click(firstSelected);
      // Deselecting drops it, leaving the other 18 in their original order --
      // proving the row was genuinely interactive, not just visually "not
      // greyed out", and that removal never reorders the survivors.
      expect(onChangeSpy).toHaveBeenCalledWith(atCapValues.slice(1));
    });

    it(`does not disable anything below the ${MULTI_SELECT_MAX_SELECTIONS} cap`, () => {
      const options = manyOptions(25);
      const belowCapValues = options.slice(0, MULTI_SELECT_MAX_SELECTIONS - 1).map((o) => o.value);
      render(
        <StatefulHarness
          fc={{ name: "cf_many", type: "multi-select", label: "Many", options }}
          initial={belowCapValues}
        />
      );
      fireEvent.click(screen.getByRole("combobox", { name: "Many" }));
      expect(screen.getByRole("option", { name: "Opt-20" })).not.toHaveAttribute(
        "aria-disabled",
        "true"
      );
    });

    // ── Communicating the limit, not just enforcing it ────────────────────
    it("announces the plain selection count below the cap", () => {
      render(<StatefulHarness fc={COLOR_FIELD} initial={["Red"]} />);
      expect(
        screen.getByText(
          `customField.multiSelect.selectionCount:${JSON.stringify({
            count: 1,
            max: MULTI_SELECT_MAX_SELECTIONS,
          })}`
        )
      ).toBeInTheDocument();
    });

    it("switches to the max-reached message once the cap is hit", () => {
      const options = manyOptions(MULTI_SELECT_MAX_SELECTIONS);
      render(
        <StatefulHarness
          fc={{ name: "cf_many", type: "multi-select", label: "Many", options }}
          initial={options.map((o) => o.value)}
        />
      );
      expect(
        screen.getByText(
          `customField.multiSelect.maxSelectionsReached:${JSON.stringify({
            max: MULTI_SELECT_MAX_SELECTIONS,
          })}`
        )
      ).toBeInTheDocument();
    });

    it("associates the counter with the combobox via aria-describedby", () => {
      render(<StatefulHarness fc={COLOR_FIELD} initial={["Red"]} />);
      const trigger = screen.getByRole("combobox", { name: "Colors" });
      const describedBy = trigger.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent(
        "customField.multiSelect.selectionCount"
      );
    });
  });

  // ── Defensive posture, matching renderCustomFieldControl's own contract ─
  it("treats a non-array value as an empty selection rather than throwing", () => {
    expect(() =>
      render(
        <MultiSelectCustomFieldControl fc={COLOR_FIELD} value={undefined} onChange={vi.fn()} />
      )
    ).not.toThrow();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("disables the whole control when isViewMode is true", () => {
    render(
      <MultiSelectCustomFieldControl
        fc={COLOR_FIELD}
        value={["Red"]}
        onChange={vi.fn()}
        isViewMode
      />
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-disabled", "true");
  });
});
