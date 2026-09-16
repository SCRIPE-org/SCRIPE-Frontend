// LongTextCustomFieldControl -- Wave 3.1 Task 12
//
// Mirrors MultiSelectCustomFieldControl.test.tsx's own i18n-mocking
// convention: `t` echoes the key plus its interpolation params (JSON-
// appended), so an assertion can prove the RIGHT numbers were passed, not
// just that some translated string rendered.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  LongTextCustomFieldControl,
  LONG_TEXT_MAX_CHARACTERS,
} from "./LongTextCustomFieldControl";
import type { FieldConfig } from "@core/ui/forms/generic-form";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({ switchStyle: "default", fontSize: "default", inputStyle: "default" }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

const BIO_FIELD: FieldConfig = { name: "cf_bio", type: "textarea", label: "Bio" };

describe("LongTextCustomFieldControl", () => {
  // ── Real accessible name, verified via getByRole (not getByLabelText) ───
  it("computes a real accessible name via <Label htmlFor>, verified by role", () => {
    render(<LongTextCustomFieldControl fc={BIO_FIELD} value="" onChange={vi.fn()} />);
    // A plain <textarea> genuinely gets its name from <Label htmlFor> --
    // unlike GenericSelect's role="combobox" div (see
    // MultiSelectCustomFieldControl.tsx's header comment) -- so this is the
    // real, load-bearing name computation, not a DOM association that
    // happens to also exist alongside a separate aria-label.
    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("reports string changes via onChange", () => {
    const onChange = vi.fn();
    render(<LongTextCustomFieldControl fc={BIO_FIELD} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
      target: { value: "A longer answer." },
    });
    expect(onChange).toHaveBeenCalledWith("A longer answer.");
  });

  it("disables the textarea when isViewMode is true", () => {
    render(
      <LongTextCustomFieldControl fc={BIO_FIELD} value="x" onChange={vi.fn()} isViewMode />
    );
    expect(screen.getByRole("textbox", { name: "Bio" })).toBeDisabled();
  });

  it("threads dir from useI18n() onto the textarea", () => {
    render(<LongTextCustomFieldControl fc={BIO_FIELD} value="" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAttribute("dir", "ltr");
  });

  // ── No maxLength -- over-typing must stay possible, not silently truncated ─
  it("never sets maxLength on the textarea, even far past the cap", () => {
    render(
      <LongTextCustomFieldControl
        fc={BIO_FIELD}
        value={"x".repeat(LONG_TEXT_MAX_CHARACTERS + 500)}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("textbox", { name: "Bio" })).not.toHaveAttribute("maxlength");
  });

  it("reports a value longer than the cap verbatim via onChange, never truncated", () => {
    const onChange = vi.fn();
    const overCap = "y".repeat(LONG_TEXT_MAX_CHARACTERS + 10);
    render(<LongTextCustomFieldControl fc={BIO_FIELD} value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
      target: { value: overCap },
    });
    expect(onChange).toHaveBeenCalledWith(overCap);
  });

  // ── Visible counter, real-time, against the 10,000-char cap ─────────────
  describe("the visible counter", () => {
    it("shows the plain count below the cap", () => {
      render(
        <LongTextCustomFieldControl fc={BIO_FIELD} value={"a".repeat(50)} onChange={vi.fn()} />
      );
      expect(
        screen.getByText(
          `customField.longText.characterCount:${JSON.stringify({
            count: 50,
            max: LONG_TEXT_MAX_CHARACTERS,
          })}`
        )
      ).toBeInTheDocument();
    });

    it("switches to the over-limit message once the cap is exceeded, naming the overage", () => {
      const overBy = 37;
      render(
        <LongTextCustomFieldControl
          fc={BIO_FIELD}
          value={"a".repeat(LONG_TEXT_MAX_CHARACTERS + overBy)}
          onChange={vi.fn()}
        />
      );
      // Matches TWO elements at the cap-crossing instant, by design: the
      // always-visible counter AND the throttled sr-only announcement both
      // show the same message the moment the zone changes (see this file's
      // header comment on why they are separate nodes at all) --
      // `getAllByText` proves at least one real element carries it, without
      // assuming which.
      expect(
        screen.getAllByText(
          `customField.longText.charactersOverLimit:${JSON.stringify({
            overBy,
            max: LONG_TEXT_MAX_CHARACTERS,
          })}`
        ).length
      ).toBeGreaterThanOrEqual(1);
      // The plain in-range message must NOT also be showing.
      expect(
        screen.queryByText(
          `customField.longText.characterCount:${JSON.stringify({
            count: LONG_TEXT_MAX_CHARACTERS + overBy,
            max: LONG_TEXT_MAX_CHARACTERS,
          })}`
        )
      ).not.toBeInTheDocument();
    });

    it("marks the textarea aria-invalid once over the cap, and not before", () => {
      const { rerender } = render(
        <LongTextCustomFieldControl fc={BIO_FIELD} value={"a".repeat(50)} onChange={vi.fn()} />
      );
      expect(screen.getByRole("textbox", { name: "Bio" })).not.toHaveAttribute("aria-invalid");

      rerender(
        <LongTextCustomFieldControl
          fc={BIO_FIELD}
          value={"a".repeat(LONG_TEXT_MAX_CHARACTERS + 1)}
          onChange={vi.fn()}
        />
      );
      expect(screen.getByRole("textbox", { name: "Bio" })).toHaveAttribute("aria-invalid", "true");
    });

    it("associates the counter with the textarea via aria-describedby", () => {
      render(
        <LongTextCustomFieldControl fc={BIO_FIELD} value={"a".repeat(50)} onChange={vi.fn()} />
      );
      const textarea = screen.getByRole("textbox", { name: "Bio" });
      const describedBy = (textarea.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
      expect(describedBy.length).toBe(2);
      const describedText = describedBy.map((id) => document.getElementById(id)?.textContent ?? "").join(" ");
      expect(describedText).toContain("customField.longText.characterCount");
    });
  });

  // ── Throttled aria-live announcement (§5.1: not on every keystroke) ─────
  describe("the throttled aria-live announcement", () => {
    function getLiveRegion(): HTMLElement {
      const region = document.querySelector('[aria-live="polite"]');
      if (!region) throw new Error("expected an aria-live=polite region to exist");
      return region as HTMLElement;
    }

    it("stays silent while safely under the near-limit threshold", () => {
      render(
        <LongTextCustomFieldControl fc={BIO_FIELD} value={"a".repeat(50)} onChange={vi.fn()} />
      );
      expect(getLiveRegion()).toHaveTextContent("");
    });

    it("announces once entering the last 10% of the cap", () => {
      const nearLimitLength = Math.ceil(LONG_TEXT_MAX_CHARACTERS * 0.9);
      render(
        <LongTextCustomFieldControl
          fc={BIO_FIELD}
          value={"a".repeat(nearLimitLength)}
          onChange={vi.fn()}
        />
      );
      expect(getLiveRegion()).toHaveTextContent("customField.longText.characterCount");
    });

    it("announces crossing the limit, naming the overage", () => {
      render(
        <LongTextCustomFieldControl
          fc={BIO_FIELD}
          value={"a".repeat(LONG_TEXT_MAX_CHARACTERS + 5)}
          onChange={vi.fn()}
        />
      );
      expect(getLiveRegion()).toHaveTextContent("customField.longText.charactersOverLimit");
    });

    it("does NOT re-announce on every keystroke within the same zone", () => {
      // A stateful harness re-renders on every change the way a real form
      // does -- if the live region's content changed shape on every single
      // keystroke while still deep in the "safe" zone, that would be the
      // exact per-keystroke-announcement failure §5.1 calls out.
      function Harness() {
        const [value, setValue] = React.useState("a".repeat(10));
        return <LongTextCustomFieldControl fc={BIO_FIELD} value={value} onChange={setValue} />;
      }
      render(<Harness />);
      const before = getLiveRegion().textContent;
      fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
        target: { value: "a".repeat(11) },
      });
      fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
        target: { value: "a".repeat(12) },
      });
      expect(getLiveRegion().textContent).toBe(before);
      expect(getLiveRegion().textContent).toBe("");
    });

    it("clears the announcement once back under the near-limit threshold", () => {
      function Harness() {
        const [value, setValue] = React.useState("a".repeat(LONG_TEXT_MAX_CHARACTERS + 5));
        return <LongTextCustomFieldControl fc={BIO_FIELD} value={value} onChange={setValue} />;
      }
      render(<Harness />);
      expect(getLiveRegion()).toHaveTextContent("customField.longText.charactersOverLimit");

      fireEvent.change(screen.getByRole("textbox", { name: "Bio" }), {
        target: { value: "a".repeat(10) },
      });
      expect(getLiveRegion()).toHaveTextContent("");
    });
  });
});
