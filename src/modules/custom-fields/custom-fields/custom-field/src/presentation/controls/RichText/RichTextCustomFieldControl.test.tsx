// RichTextCustomFieldControl -- the ENVELOPE contract, in both directions.
// Wave 3.4.
//
// THIS FILE COVERS ONE THING AND IT IS THE THING THAT MATTERS MOST ABOUT THIS
// CONTROL: `RichTextEditor` is `value: string` / `onChange(html: string)` and the
// wire is the one-key object `{ html }`, so the control is a translation. Get the
// translation wrong in either direction and the field cannot be saved at all --
// `RichTextValueTypeHandler.Parse` answers `WasExtractable: false` for a bare
// string (because the sanitization middleware's carve-out for the values route is
// the PATH `values.*.html`, so a bare string arrives with its markup already
// stripped), and the save 422s.
//
// WHY THE EDITOR IS MOCKED HERE, and why that is the correct instrument rather
// than a shortcut. The subject is the BOUNDARY: what this control hands down and
// what it emits up. A stub of the editor is the observation point for exactly
// that, and it is the only way to drive the upward direction at all -- ProseMirror
// takes input through DOM mutation observation, which `fireEvent` cannot
// synthesise in jsdom. What the stub deliberately cannot prove is that the a11y
// props reach the real contenteditable; that is a different claim with its own
// file, RichTextCustomFieldControl.a11y.test.tsx, which mounts the REAL editor.
// Neither file is complete alone, and neither pretends to be.
//
// WHAT IS NOT COVERED HERE, stated rather than left to be discovered: the
// throttled `aria-live` announcement's timing (the visible counter's bands are
// covered; the announcement node's contents are asserted only for the over-limit
// case), and the toolbar's own affordances, which belong to `RichTextEditor`.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import {
  RichTextCustomFieldControl,
  RICH_TEXT_MAX_CHARACTERS,
} from "./RichTextCustomFieldControl";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

/**
 * Every prop the editor was handed, newest last. Hoisted so the `vi.mock`
 * factory -- which is lifted above the imports -- can close over it.
 */
const editor = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }));

/**
 * Stands in for `RichTextEditor`. Renders a real `<textarea>` so its `onChange`
 * is drivable by `fireEvent`, which ProseMirror's own contenteditable is not.
 * Reproduces the two parts of the real contract this file depends on and nothing
 * else: `value` is a string in, `onChange` is a string out.
 */
vi.mock("@core/ui/rich-text-editor/RichTextEditor", () => ({
  RichTextEditor: (props: Record<string, unknown>) => {
    editor.props.push(props);
    return (
      <textarea
        data-testid="stub-editor"
        value={props.value as string}
        readOnly={Boolean(props.readOnly)}
        onChange={(e) => (props.onChange as (html: string) => void)(e.target.value)}
      />
    );
  },
}));

/** The props the editor received on the most recent render. */
function lastEditorProps(): Record<string, unknown> {
  return editor.props[editor.props.length - 1];
}

/**
 * The VISIBLE counter's text, distinguished from the `aria-live` node's.
 *
 * Needed rather than a bare `getByText`, and the reason is the design under
 * test: inside the near-limit and over-limit bands BOTH nodes carry the same
 * sentence, so `getByText` finds two elements and throws. Resolving that by
 * switching to `getAllByText` would have hidden the distinction this control's
 * whole counter design turns on -- there are deliberately two nodes, one always
 * accurate and one throttled -- so the helper names which one it is reading.
 */
function visibleCounterText(): string {
  const live = document.querySelector('[aria-live="polite"]');
  const visible = screen
    .getAllByText(/^customField\.richText\./)
    .find((node) => node !== live);
  return visible?.textContent ?? "";
}

beforeEach(() => {
  editor.props = [];
});

describe("RichTextCustomFieldControl -- unwrapping (envelope -> editor)", () => {
  it("hands the editor the html STRING, not the envelope object", () => {
    // The failure this catches is not cosmetic: `RichTextEditor` feeds `value`
    // straight into TipTap's `content`, so passing the object renders the
    // literal "[object Object]" as the document -- and the next keystroke emits
    // that as the field's content.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "<p>Pressing drill</p>" }}
        onChange={vi.fn()}
      />
    );
    expect(lastEditorProps().value).toBe("<p>Pressing drill</p>");
    expect(typeof lastEditorProps().value).toBe("string");
  });

  it("hands the editor an empty string for a null value, never a stringified null", () => {
    // `String(null)` is "null" and `String(undefined)` is "undefined" -- both
    // would appear as literal text inside an editor the operator then has to
    // delete by hand. The assertion is the exact empty string, so a regression
    // to either is a failure rather than a truthiness pass.
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={vi.fn()} />
    );
    expect(lastEditorProps().value).toBe("");
  });

  it("does not emit anything on mount, so opening a form never rewrites a stored value", () => {
    // The defect this guards is the one the text-input fallthrough caused for
    // every object-valued type: the field wrote back a coerced version of what
    // it was given, before the operator touched anything.
    const onChange = vi.fn();
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "<p>Stored</p>" }}
        onChange={onChange}
      />
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("RichTextCustomFieldControl -- wrapping (editor -> wire)", () => {
  it("emits the { html } ENVELOPE, never the bare string the write path refuses", () => {
    // THE LOAD-BEARING TEST OF THIS FILE. The assertion is deliberately in two
    // parts: the exact envelope, and separately that what was emitted is not a
    // string at all. The second half is what fails loudly if someone
    // "simplifies" the emit to `onChange(next)` -- a change that leaves the
    // control looking correct and makes every save 422.
    const onChange = vi.fn();
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={onChange} />
    );

    fireEvent.change(screen.getByTestId("stub-editor"), {
      target: { value: "<p>Two-footed tackle</p>" },
    });

    expect(onChange).toHaveBeenCalledWith({ html: "<p>Two-footed tackle</p>" });
    const emitted = onChange.mock.calls[0][0];
    expect(typeof emitted).not.toBe("string");
  });

  it("emits null when the editor is emptied -- the wire's 'clear this field', not an empty envelope", () => {
    // `{ html: "" }` and `null` are two different requests. Null is a clear;
    // an envelope around an empty string is a value that the server then runs a
    // sanitizer over before deciding it was empty anyway. Emitting null is also
    // what keeps `isRequiredFieldEmpty` and the save-flow validator reading the
    // same fact rather than each having to know blank markup means blank.
    const onChange = vi.fn();
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "<p>x</p>" }}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByTestId("stub-editor"), { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("treats whitespace-only markup as empty, matching RichTextValueTypeHandler.IsEmpty", () => {
    // The backend's `IsEmpty` is `string.IsNullOrWhiteSpace(input.Html)`, so a
    // stray newline left behind by an editor is not a stored value there. Sending
    // it as a value here would make the two tiers disagree about whether the
    // field is filled.
    const onChange = vi.fn();
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={onChange} />
    );

    fireEvent.change(screen.getByTestId("stub-editor"), { target: { value: "   \n  " } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("does NOT treat markup that renders to nothing as empty, because the server does not", () => {
    // `<p></p>` is a real stored value server-side: deciding whether markup
    // renders to nothing means parsing it, which `IsEmpty` declines to do on
    // every field of every save. Emitting null here instead would silently
    // DELETE a value the server would have kept -- a data-loss bug dressed as
    // tidiness, which is why this is asserted as its own case rather than folded
    // into the whitespace one.
    const onChange = vi.fn();
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={onChange} />
    );

    fireEvent.change(screen.getByTestId("stub-editor"), { target: { value: "<p></p>" } });

    expect(onChange).toHaveBeenCalledWith({ html: "<p></p>" });
  });
});

describe("RichTextCustomFieldControl -- the raw-markup counter", () => {
  it("counts the RAW MARKUP, which is what the server caps, not the visible words", () => {
    // The distinction is the whole reason this control does not use the editor's
    // own CharacterCount: that extension measures text characters. Nine visible
    // characters wrapped in tags is 16 characters of markup, and the server's cap
    // applies to the 16. Proven by feeding markup whose tag overhead alone
    // crosses the cap while its visible text is tiny.
    const overByMarkup = `<p>${"x".repeat(RICH_TEXT_MAX_CHARACTERS - 6)}</p>`;
    expect(overByMarkup.replace(/<[^>]*>/g, "").length).toBeLessThan(RICH_TEXT_MAX_CHARACTERS);
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: overByMarkup }}
        onChange={vi.fn()}
      />
    );
    expect(visibleCounterText()).toBe("customField.richText.charactersOverLimit");
  });

  it("does not report an overage at exactly the cap -- the boundary is inclusive, like the handler's", () => {
    // The backend refuses `html.Length > MaxRichTextLength`, so the cap itself is
    // a legal value. An off-by-one here would tell the operator they are over a
    // limit the server accepts.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "x".repeat(RICH_TEXT_MAX_CHARACTERS) }}
        onChange={vi.fn()}
      />
    );
    expect(visibleCounterText()).toBe("customField.richText.characterCount");
    expect(
      screen.queryByText("customField.richText.charactersOverLimit")
    ).not.toBeInTheDocument();
  });

  it("announces the overage to a screen reader, and does not announce an in-band count", () => {
    // Two renders, because the point is the CONTRAST: the live region carries
    // the over-limit sentence and is EMPTY in the safe band. A test that only
    // checked the over-limit case would pass against a control that announced on
    // every keystroke -- the classic character-count a11y failure this split-node
    // design exists to avoid.
    const { unmount } = render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "x".repeat(RICH_TEXT_MAX_CHARACTERS + 1) }}
        onChange={vi.fn()}
      />
    );
    const overLive = document.querySelector('[aria-live="polite"]');
    expect(overLive?.textContent).toBe("customField.richText.charactersOverLimit");
    unmount();

    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "<p>short</p>" }}
        onChange={vi.fn()}
      />
    );
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe("");
  });

  it("marks the editor invalid on a genuine overage even with no host verdict", () => {
    // `invalid` is withheld here on purpose -- the only input differing from a
    // clean render is the length. So this cannot pass by the host's verdict
    // leaking through, which is what makes it a test of the overage rule.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "x".repeat(RICH_TEXT_MAX_CHARACTERS + 1) }}
        onChange={vi.fn()}
      />
    );
    expect(lastEditorProps().ariaInvalid).toBe(true);
  });
});

describe("RichTextCustomFieldControl -- host-owned props", () => {
  it("COMPOSES the host's describedBy with its own counter ids rather than replacing it", () => {
    // `aria-describedby` is an id LIST. Overwriting it silences the host form's
    // error text, which is the only place a GenericForm-drawn field's validation
    // message lives -- so the operator would get a red border and no sentence.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={null}
        onChange={vi.fn()}
        describedBy="host-error-node"
      />
    );
    const describedBy = String(lastEditorProps().ariaDescribedBy);
    expect(describedBy).toContain("host-error-node");
    // And the control's own counter is still in the list -- proving composition
    // rather than the host's id having simply won.
    const counterId = screen.getByText("customField.richText.characterCount").id;
    expect(counterId).not.toBe("");
    expect(describedBy).toContain(counterId);
  });

  it("names the editor from the label, and falls back to the id when there is none", () => {
    const { unmount } = render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={vi.fn()} />
    );
    expect(lastEditorProps().ariaLabel).toBe("Notes");
    unmount();

    // A field with no label must not end up with an unnamed editor: `ariaLabel`
    // is also what switches the role on, so an empty name would leave the region
    // announced as generic content.
    render(<RichTextCustomFieldControl id="cf_notes" value={null} onChange={vi.fn()} />);
    expect(lastEditorProps().ariaLabel).toBe("cf_notes");
  });

  it("forwards disabled as the editor's readOnly, and does not conflate it with invalid", () => {
    // TipTap has no `disabled`; `readOnly` is its editable switch, and it also
    // hides the toolbar. Asserting `error` is untouched here is the half that
    // catches the two being wired to one flag.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={null}
        onChange={vi.fn()}
        disabled
      />
    );
    expect(lastEditorProps().readOnly).toBe(true);
    expect(lastEditorProps().error).toBe(false);
  });

  it("passes the host's invalid verdict through as both the announced and the visual state", () => {
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Notes"
        value={{ html: "<p>fine</p>" }}
        onChange={vi.fn()}
        invalid
      />
    );
    expect(lastEditorProps().ariaInvalid).toBe(true);
    expect(lastEditorProps().error).toBe(true);
  });

  it("turns the source-HTML toggle OFF, so hand-pasted markup cannot be silently dropped on save", () => {
    // `RichTextEditor` defaults `showSourceToggle` to true. Left on, a custom
    // field offers a raw-HTML textarea whose contents the server's allowlist then
    // strips -- it refuses `style` and `img` outright -- so markup would vanish
    // on save with no explanation. Asserted as the exact `false`, not falsy, so
    // removing the prop (which restores the default `true`) fails.
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={vi.fn()} />
    );
    expect(lastEditorProps().showSourceToggle).toBe(false);
  });

  it("does not pass maxLength, which would hard-block pasted content at the wrong count", () => {
    // Two independent defects in one prop, both real: `RichTextEditor` forwards
    // `maxLength` into TipTap's CharacterCount `limit`, which BLOCKS input rather
    // than warning -- silently swallowing a paste -- and it measures TEXT
    // characters while the server caps RAW MARKUP, so any number passed here
    // fires at the wrong time. The counter in this control is the replacement.
    render(
      <RichTextCustomFieldControl id="cf_notes" label="Notes" value={null} onChange={vi.fn()} />
    );
    expect(lastEditorProps().maxLength).toBeUndefined();
  });
});
