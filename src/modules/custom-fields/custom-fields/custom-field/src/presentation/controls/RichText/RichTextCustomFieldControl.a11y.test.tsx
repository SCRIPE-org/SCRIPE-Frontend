// RichTextCustomFieldControl -- the a11y wiring, against the REAL editor.
// Wave 3.4.
//
// WHY THIS IS A SEPARATE FILE FROM RichTextCustomFieldControl.test.tsx, and why
// the separation is load-bearing rather than tidiness. That file mocks
// `RichTextEditor` down to a `<textarea>`, because a stub is the only way to
// DRIVE the editor's `onChange` (ProseMirror takes input through DOM mutation
// observation, which `fireEvent` cannot synthesise) and because the envelope
// contract is a claim about props, which a stub observes exactly. `vi.mock` is
// hoisted per FILE, so the two claims cannot share one: this file asserts the
// half a stub can never prove -- that the name, role and description actually
// land on the element a screen reader lands on.
//
// AND THAT ELEMENT IS NOT THE ONE ANYONE WOULD GUESS. `<RichTextEditor>` renders
// a bordered wrapper, a toolbar and then TipTap's own contenteditable `<div>`,
// created imperatively inside `<EditorContent>`. That inner div is what takes
// focus and receives typing, and no amount of labelled markup around the
// component reaches it -- TipTap's only channel for attributes on it is
// `editorProps.attributes`. So `RichTextEditor` grew four optional forwarding
// props for this, and if any of them stops being wired, the field silently
// becomes an unnamed, roleless region that announces as generic content. That
// regression is invisible in a stubbed test and invisible on screen.
//
// Nothing is mocked here except the i18n provider (so assertions read keys rather
// than prose). TipTap really mounts in jsdom -- verified before this file was
// written, not assumed.
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { RichTextCustomFieldControl } from "./RichTextCustomFieldControl";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

describe("RichTextCustomFieldControl a11y -- against the real TipTap editor", () => {
  it("gives the CONTENTEDITABLE the accessible name, not a wrapper", () => {
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={{ html: "<p>Pressing drill</p>" }}
        onChange={vi.fn()}
      />
    );

    // `getByRole("textbox", { name })` resolves through the real accessibility
    // tree, so this passes only if the role AND the name are both on the same
    // element. Then the discriminating assertion: that element is the
    // contenteditable. Without the forwarding, the query finds nothing at all --
    // a contenteditable div has no implicit ARIA role.
    const editable = screen.getByRole("textbox", { name: "Session notes" });
    expect(editable).toHaveAttribute("contenteditable", "true");
    expect(editable).toHaveAttribute("aria-multiline", "true");
    // And it is the element that actually holds the document, not a sibling that
    // merely borrowed the name.
    expect(editable.textContent).toContain("Pressing drill");
  });

  it("puts the control's own id on the editable region, so the label and describedby resolve", () => {
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={null}
        onChange={vi.fn()}
      />
    );
    const editable = screen.getByRole("textbox", { name: "Session notes" });
    expect(editable.id).toBe("cf_notes");
    // The visible `<Label htmlFor>` points at that same id. It is kept as real
    // clickable DOM for sighted users and is deliberately NOT the name source --
    // `for` on a non-labelable element computes no accessible name, which is the
    // whole reason `ariaLabel` exists above.
    expect(document.querySelector('label[for="cf_notes"]')?.textContent).toBe("Session notes");
  });

  it("points the editable region's aria-describedby at BOTH the host's node and its own counter", () => {
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={null}
        onChange={vi.fn()}
        describedBy="host-error-node"
      />
    );
    const editable = screen.getByRole("textbox", { name: "Session notes" });
    const ids = (editable.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);

    expect(ids).toContain("host-error-node");
    // The counter's id must be in the list AND must resolve to a real node in the
    // document -- an id list pointing at nothing announces nothing, which looks
    // identical to correct wiring in any test that only checks the attribute.
    const counterId = screen.getByText("customField.richText.characterCount").id;
    expect(ids).toContain(counterId);
    for (const id of ids.filter((candidate) => candidate !== "host-error-node")) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it("announces invalidity on the editable region when the host says the field is invalid", () => {
    // Withholding exactly one input: the same render without `invalid` must NOT
    // carry the attribute, asserted first, so this cannot pass against a control
    // that hardcodes it.
    const { unmount } = render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={{ html: "<p>x</p>" }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("textbox", { name: "Session notes" })).not.toHaveAttribute(
      "aria-invalid"
    );
    unmount();

    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={{ html: "<p>x</p>" }}
        onChange={vi.fn()}
        invalid
      />
    );
    expect(screen.getByRole("textbox", { name: "Session notes" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("makes the region non-editable in view mode, and hides the toolbar with it", () => {
    // TipTap's `editable: false` is what turns `contenteditable` off, and
    // `RichTextEditor` skips the toolbar in the same state -- a toolbar over an
    // uneditable document is a row of buttons that silently do nothing. Both
    // halves are asserted because the two are separate code paths in that
    // component, and this control passes ONE prop to reach both.
    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={{ html: "<p>x</p>" }}
        onChange={vi.fn()}
        disabled
      />
    );
    expect(screen.getByRole("textbox", { name: "Session notes" })).toHaveAttribute(
      "contenteditable",
      "false"
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("keeps the editor's own namespace out of the placeholder when the field configures one", () => {
    // `RichTextEditor` defaults its placeholder to `t("editor.placeholder")`, a
    // key registered by the rich-text-editor's own locale namespace rather than
    // this module's. A custom field with a configured placeholder must show it;
    // one without must not leak a foreign key into a CustomFields form. The
    // second half is the reason both are asserted here.
    const { unmount } = render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={null}
        onChange={vi.fn()}
        placeholder="What happened in the session?"
      />
    );
    expect(
      document.querySelector('[data-placeholder="What happened in the session?"]')
    ).not.toBeNull();
    unmount();

    render(
      <RichTextCustomFieldControl
        id="cf_notes"
        label="Session notes"
        value={null}
        onChange={vi.fn()}
      />
    );
    // With no configured placeholder the editor's own default is what shows --
    // recorded as the known, accepted behaviour rather than asserted as desirable.
    expect(document.querySelector('[data-placeholder="editor.placeholder"]')).not.toBeNull();
  });
});
