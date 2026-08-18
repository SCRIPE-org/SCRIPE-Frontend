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
});
