/* eslint-disable @typescript-eslint/no-explicit-any */
// TenantPlanStepCustomFields -- Wave 2 Step 2.2, Task 7b
//
// This site had no pre-existing test coverage (confirmed by search across
// src/modules/billing/entitlements/tenant-plans before this task -- no
// *.test.* files existed anywhere in the module). It is a plain
// presentational component (all state comes in via props, no internal
// viewmodel/hook), which makes it the simplest of this task's 3 divergent
// raw-Radix-`Select` sites to exercise directly -- used here as the primary
// proof that the raw-Select-to-GenericSelect conversion (D9) did not
// silently drop the accessible name these sites' `<Label htmlFor>` +
// native `<button>` SelectTrigger genuinely provided pre-conversion (T1,
// Task 4's review finding). See FeatureDefinitionFormView.customfields.test.tsx
// for the same proof repeated against the one site where isViewMode and this
// conversion intersect.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { TenantPlanStepCustomFields } from "./TenantPlanStepCustomFields";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

// jsdom has no ResizeObserver -- GenericSelect's trigger tracks its own width
// on mount regardless of open state (same stub as renderCustomFieldControl.test.tsx).
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

function renderStep(overrides: Partial<React.ComponentProps<typeof TenantPlanStepCustomFields>> = {}) {
  return render(
    <TenantPlanStepCustomFields
      fieldConfigs={[]}
      loading={false}
      values={{}}
      onChange={vi.fn()}
      onFieldCreated={vi.fn()}
      entityDisplayName="Tenant Plan"
      t={(key) => key}
      {...overrides}
    />
  );
}

describe("TenantPlanStepCustomFields", () => {
  it("renders a text input for a custom field and reports changes", () => {
    const onChange = vi.fn();
    renderStep({
      fieldConfigs: [{ name: "cf_nickname", type: "text", label: "Nickname" }],
      onChange,
    });

    fireEvent.change(screen.getByLabelText("Nickname"), { target: { value: "a" } });
    expect(onChange).toHaveBeenCalledWith("cf_nickname", "a");
  });

  // The core proof this task requires: converting this site's Select branch
  // from raw Radix `Select` (native, labelable <button> trigger -- its
  // <Label htmlFor> genuinely worked) onto renderCustomFieldControl's
  // GenericSelect-based branch (a role="combobox" <div>, NOT labelable by
  // `for`/`htmlFor`) would have silently regressed this field's accessible
  // name without the aria-label fix landed on GenericSelect/SelectTrigger
  // and wired from renderCustomFieldControl.tsx's Select branch. getByRole's
  // `name` option performs real accessible-name computation (not a DOM id
  // check) -- it fails without that fix and passes with it.
  it("gives the Select control a real, working accessible name after the GenericSelect conversion (Wave 2 Step 2.2, T1 fix) and reports the picked option's label", () => {
    const onChange = vi.fn();
    renderStep({ fieldConfigs: [PRIORITY_FIELD], onChange });

    const trigger = screen.getByRole("combobox", { name: "Priority" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Medium" }));

    expect(onChange).toHaveBeenCalledWith("cf_priority", "Medium");
  });

  it("renders a switch, a date picker, and a number input for the remaining custom field types", () => {
    renderStep({
      fieldConfigs: [
        { name: "cf_active", type: "switch", label: "Active" },
        { name: "cf_start", type: "date", label: "Start Date" },
        { name: "cf_count", type: "number", label: "Count" },
      ],
    });

    expect(screen.getByRole("switch", { name: "Active" })).toBeInTheDocument();
    // Scoped to `input`: Wave 3.1 Task 12 gave the DatePicker trigger its own
    // real aria-label equal to the field's label, so a bare
    // `getByLabelText("Start Date")` is now ambiguous by design -- see
    // renderCustomFieldControl.tsx's Date branch.
    expect(screen.getByLabelText("Start Date", { selector: "input" })).toHaveAttribute(
      "type",
      "date"
    );
    expect(screen.getByLabelText("Count")).toHaveAttribute("type", "number");
  });

  // Wave 2 Step 2.2, Task 11: the test above only checked presence/attributes
  // for Switch/Date/Number -- unlike the Text and Select tests just above it,
  // it never actually changed a value and confirmed onChange captured it.
  // Combined with those two, this completes round-trip coverage for all 5
  // FieldConfig["type"] kinds this site's shared renderer produces.
  it("reports changes for the switch, date picker, and number input via onChange", () => {
    const onChange = vi.fn();
    renderStep({
      fieldConfigs: [
        { name: "cf_active", type: "switch", label: "Active" },
        { name: "cf_start", type: "date", label: "Start Date" },
        { name: "cf_count", type: "number", label: "Count" },
      ],
      onChange,
    });

    fireEvent.click(screen.getByRole("switch", { name: "Active" }));
    expect(onChange).toHaveBeenCalledWith("cf_active", true);

    fireEvent.change(screen.getByLabelText("Start Date", { selector: "input" }), {
      target: { value: "2026-08-17" },
    });
    expect(onChange).toHaveBeenCalledWith("cf_start", "2026-08-17");

    fireEvent.change(screen.getByLabelText("Count"), { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith("cf_count", "7");
  });

  // customFieldsCrudIntegration.tsx attaches `isVisible` to a field's FieldConfig whenever the
  // definition carries a visibility rule -- but this component used to `.map()` every fieldConfig
  // straight into renderCustomFieldControl with no visibility check at all, so a field the rule
  // said should be hidden rendered anyway. GenericForm's own `visibleFields` filter
  // (generic-form.tsx) is the reference behaviour this reproduces.
  it("hides a field whose isVisible predicate returns false for the current values, and shows it once the predicate flips true", () => {
    const { rerender } = renderStep({
      fieldConfigs: [
        { name: "cf_nickname", type: "text", label: "Nickname" },
        {
          name: "cf_referral_code",
          type: "text",
          label: "Referral Code",
          isVisible: (values: Record<string, unknown>) => values.cf_nickname === "friend",
        },
      ],
      values: { cf_nickname: "" },
    });

    expect(screen.getByLabelText("Nickname")).toBeInTheDocument();
    expect(screen.queryByLabelText("Referral Code")).not.toBeInTheDocument();

    rerender(
      <TenantPlanStepCustomFields
        fieldConfigs={[
          { name: "cf_nickname", type: "text", label: "Nickname" },
          {
            name: "cf_referral_code",
            type: "text",
            label: "Referral Code",
            isVisible: (values: Record<string, unknown>) => values.cf_nickname === "friend",
          },
        ]}
        loading={false}
        values={{ cf_nickname: "friend" }}
        onChange={vi.fn()}
        onFieldCreated={vi.fn()}
        entityDisplayName="Tenant Plan"
        t={(key) => key}
      />
    );

    expect(screen.getByLabelText("Referral Code")).toBeInTheDocument();
  });

  it("shows the empty-state message when there are no custom fields and not loading", () => {
    renderStep({ fieldConfigs: [], loading: false });
    expect(screen.getByText("entitlements.tenantPlans.noCustomFields")).toBeInTheDocument();
  });

  it("does not show the empty-state message while loading", () => {
    renderStep({ fieldConfigs: [], loading: true });
    expect(screen.queryByText("entitlements.tenantPlans.noCustomFields")).not.toBeInTheDocument();
  });
});
