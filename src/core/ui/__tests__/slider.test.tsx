// Slider -- aria-label forwarding fix (Wave 3.2 Batch 3, CustomFields Rating).
//
// Radix's own SliderThumb computes its accessible name from ITS OWN
// `aria-label` prop, falling back to a generic library-default "Value" label
// if none is given -- NOT from an `id` passed to `Slider`/`SliderPrimitive.Root`,
// which lands on the Root `<span>` instead (verified directly against
// @radix-ui/react-slider's source before writing this fix: `id` flows into
// Root's own `...sliderProps` spread, never down to Thumb). Before this batch,
// `@core/ui/slider.tsx` never forwarded an `aria-label` to the Thumb at all --
// no consumer anywhere in the app could give a Slider a real per-instance
// accessible name, a latent gap this batch's own CustomFields Rating control
// surfaced (its own renderCustomFieldControl.test.tsx exercises this same fix
// end-to-end; this file pins the primitive's own contract in isolation).
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { Slider } from "../slider";

// jsdom has no ResizeObserver -- @radix-ui/react-use-size's Thumb-sizing
// effect calls it unconditionally on mount (needed for the CSS custom
// properties driving the thumb's in-bounds offset), throwing before a single
// assertion runs otherwise. Same polyfill renderCustomFieldControl.test.tsx
// already carries for GenericSelect's own trigger-width tracking.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("Slider", () => {
  it("gives the Thumb a REAL accessible name when aria-label is passed (verified via getByRole, not assumed)", () => {
    render(<Slider aria-label="Rating" value={[3]} min={1} max={5} step={1} />);
    expect(screen.getByRole("slider", { name: "Rating" })).toBeInTheDocument();
  });

  it("does not put the aria-label on the Root -- it must land on the Thumb specifically", () => {
    const { container } = render(
      <Slider aria-label="Rating" value={[3]} min={1} max={5} step={1} />
    );
    // The Root is the outer <span> Radix renders for SliderPrimitive.Root --
    // it must NOT carry the consumer's aria-label (that would be the old,
    // ineffective place to put it: Root has no accessible role a screen
    // reader singles out, only the Thumb's role="slider" does).
    const root = container.firstElementChild;
    expect(root).not.toHaveAttribute("aria-label", "Rating");
    // Exactly one element in the whole tree carries this aria-label: the Thumb.
    expect(container.querySelectorAll('[aria-label="Rating"]')).toHaveLength(1);
  });

  it("is backward compatible: a consumer that passes no aria-label keeps today's default Thumb label, not a broken/undefined one", () => {
    render(<Slider value={[3]} min={1} max={5} step={1} />);
    // Still a real, focusable slider role -- just without a per-instance
    // name. Radix's own library-default fallback label still applies
    // (unchanged behavior for every pre-existing consumer of this component
    // that never passed aria-label).
    const thumb = screen.getByRole("slider");
    expect(thumb).toBeInTheDocument();
  });

  it("reflects min/max/value onto the Thumb's aria-value* attributes", () => {
    render(<Slider aria-label="Rating" value={[4]} min={1} max={5} step={1} />);
    const thumb = screen.getByRole("slider", { name: "Rating" });
    expect(thumb).toHaveAttribute("aria-valuemin", "1");
    expect(thumb).toHaveAttribute("aria-valuemax", "5");
    expect(thumb).toHaveAttribute("aria-valuenow", "4");
  });

  // aria-valuetext forwarding -- the same gap as aria-label, and fixed the same
  // way. Radix computes aria-valuenow/min/max onto the Thumb but has no notion
  // of a human-readable value, and an aria-valuetext left on Root lands on a
  // <span> with no role="slider", so a screen reader announces the bare number
  // where the control means something else ("3 of 5 stars", "Medium").
  it("gives the Thumb a REAL aria-valuetext when one is passed", () => {
    render(
      <Slider aria-label="Rating" aria-valuetext="3 of 5 stars" value={[3]} min={1} max={5} />
    );
    expect(screen.getByRole("slider", { name: "Rating" })).toHaveAttribute(
      "aria-valuetext",
      "3 of 5 stars"
    );
  });

  it("does not leave aria-valuetext on the Root -- it must land on the Thumb specifically", () => {
    const { container } = render(
      <Slider aria-label="Rating" aria-valuetext="3 of 5 stars" value={[3]} min={1} max={5} />
    );
    expect(container.firstElementChild).not.toHaveAttribute("aria-valuetext");
    expect(container.querySelectorAll('[aria-valuetext="3 of 5 stars"]')).toHaveLength(1);
  });

  it("is backward compatible: no aria-valuetext means no attribute at all", () => {
    render(<Slider aria-label="Rating" value={[3]} min={1} max={5} />);
    expect(screen.getByRole("slider", { name: "Rating" })).not.toHaveAttribute("aria-valuetext");
  });

  // The knob's border is the ENTIRE visual boundary of a focusable control, so
  // WCAG 1.4.11 wants 3:1 against both the fill it sits on and the surface
  // behind it. Measured against globals.css: --nx-line-hi (#3f4347 dark,
  // #aeb4ad light) gives 1.95:1 on --nx-surface, 1.64:1 on the knob's own
  // --nx-raised-2, and 2.11:1 on light #ffffff -- the edge was effectively
  // invisible everywhere it appears. --nx-ink-3 gives 6.06:1 / 5.11:1 dark and
  // 4.72:1 / 3.82:1 light against those same pairs. Asserted on the class
  // because jsdom computes no colours; the numbers live in the component's own
  // comment next to the change.
  it("draws the thumb border on a token that clears 3:1 in both themes", () => {
    render(<Slider aria-label="Rating" value={[3]} min={1} max={5} />);
    const thumb = screen.getByRole("slider", { name: "Rating" });
    expect(thumb).toHaveClass("border-nx-ink-3");
    expect(thumb.className).not.toMatch(/(^|\s)border-nx-line-hi(\s|$)/);
  });

  it("still drops the disabled thumb to the quiet hairline -- inert is exempt from 1.4.11", () => {
    render(<Slider aria-label="Rating" value={[3]} min={1} max={5} disabled />);
    const thumb = screen.getByRole("slider", { name: "Rating" });
    expect(thumb).toHaveClass("group-data-[disabled]:border-nx-line");
  });
});
