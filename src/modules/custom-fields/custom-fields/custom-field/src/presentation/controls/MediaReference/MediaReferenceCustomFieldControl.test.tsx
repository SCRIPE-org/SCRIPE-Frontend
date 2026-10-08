// MediaReferenceCustomFieldControl -- Wave 3.4.
//
// WHAT THIS CONTROL IS FOR, so the tests below are not mistaken for a stub's
// tests. File and Image are reference types whose target is a `media.file` row,
// and the backend accepts a value only if that row's OWNER PAIR is the record
// being edited -- the fence that makes `media.file` a legal reference target at
// all, given that `MediaFile.TenantId` is nullable and therefore visible
// cross-tenant through the ambient filter. Nothing on this tier can ask "which
// media belongs to this record": the lookup search route takes no owner filter,
// no `IEntityLookupProvider` is registered for `media.file` at all (so the row
// can be neither searched nor resolved), and on a create form there is no owner
// record yet. So the control has no picker, deliberately, and pinning the
// general reference picker at `media.file` was refused rather than shipped: it
// would offer every readable media row including tenant-global ones, i.e.
// exactly the picks the fence then refuses.
//
// THE THREE THINGS IT DOES DO are what these tests are about, and each one has a
// real defect behind it:
//   1. PRESERVE a stored value. The text-input fallthrough this type would
//      otherwise land on painted the object as "[object Object]" and replaced it
//      with a string on the first keystroke.
//   2. CLEAR one -- and emit `null`, not "" and not a browser `File`.
//   3. SAY why attaching is unavailable, rather than showing an empty dropdown
//      that reads as "the server returned no records".
//
// WHAT IS NOT COVERED HERE, named rather than implied: the owner-pair rule and
// Image's content-type rule are SERVER verdicts and are not checked on this tier
// at all (the value carries no content type and no owner), so no test below
// asserts them. The client-side completeness rule that IS checkable lives in
// customFieldValueValidation.mediaReference.test.ts.
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { MediaReferenceCustomFieldControl } from "./MediaReferenceCustomFieldControl";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({ t: (key: string) => key, language: "en", direction: "ltr" }),
}));

const STORED = { entityTypeKey: "media.file", entityId: "ENC-must-not-be-rendered" };
const CLEAR_BUTTON = "customField.mediaReference.clear";

describe("MediaReferenceCustomFieldControl -- the emitted wire shape", () => {
  it("emits null when cleared -- never an empty string, a File, or a base64 string", () => {
    // THE LOAD-BEARING TEST. `null` is the wire's "clear this field"; `""` is a
    // scalar the handler answers `unsupportedType` for, and the two shapes this
    // type is most likely to be mis-wired to (a browser `File` from
    // FieldConfig's `"file"` arm, a base64 string from its `"image"` arm) are
    // both refused outright. The second and third assertions are what fail if
    // someone "helpfully" emits an emptied envelope or a blank string instead.
    const onChange = vi.fn();
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: CLEAR_BUTTON }));

    expect(onChange).toHaveBeenCalledWith(null);
    const emitted = onChange.mock.calls[0][0];
    expect(typeof emitted).not.toBe("string");
    expect(emitted).not.toEqual({ entityTypeKey: "media.file", entityId: "" });
  });

  it("never writes back on mount, so opening a form cannot destroy a stored reference", () => {
    // The precise defect: `<Input value={formData[name] ?? ""}>` rendered the
    // object as "[object Object]" and replaced it with that string the moment
    // anyone typed. A control that emits nothing until the operator acts is the
    // fix, and this is the assertion that keeps it.
    const onChange = vi.fn();
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={onChange}
      />
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("MediaReferenceCustomFieldControl -- what it shows and what it refuses to show", () => {
  it("NEVER renders the encrypted media id", () => {
    // The id is the Media module's primary key. It means nothing to a reader, and
    // rendering it puts it in every screenshot, export and support ticket. There
    // is also no name to show instead: no lookup provider is registered for
    // `media.file`, so there is no endpoint that would return one -- which is
    // exactly why the "attached" state is a sentence rather than a filename.
    const { container } = render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
      />
    );
    expect(container.textContent).not.toContain("ENC-must-not-be-rendered");
    // And not blank either: a filled field must never look like an empty one.
    expect(screen.getByText("customField.mediaReference.fileAttached")).toBeInTheDocument();
  });

  it("distinguishes attached from unattached, rather than looking the same either way", () => {
    // Two renders differing in ONE input. Asserting only the attached state would
    // pass against a control that always says "a file is attached".
    const { unmount } = render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.fileAttached")).toBeInTheDocument();
    unmount();

    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
    expect(screen.queryByText("customField.mediaReference.fileAttached")).not.toBeInTheDocument();
  });

  it("reads a HALF-BLANK reference as unattached, and does not rewrite it to null", () => {
    // `{ entityTypeKey, entityId: "" }` is a value the backend refuses with its
    // own `referenceIncomplete` message. Two wrong answers are available here and
    // both are refused: treating it as attached (which would offer a Remove
    // button for nothing), and silently emitting null (which IS the wire's
    // delete, so the client would be destroying data to tidy up a display).
    const onChange = vi.fn();
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={{ entityTypeKey: "media.file", entityId: "" }}
        onChange={onChange}
      />
    );
    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: CLEAR_BUTTON })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("explains that attaching happens elsewhere, instead of showing an empty picker", () => {
    // The alternative was a dropdown with nothing in it, which reads as "the
    // server has no records" and sends the operator looking in the wrong place.
    // Same decision, same reasoning, as the reference control's
    // `noTargetConfigured` state.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        targetEntityTypeKey="media.file"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.attachUnavailable")).toBeInTheDocument();
    // And there is genuinely no picker to open -- asserted, not assumed, because
    // "we decided not to ship a picker" is only true if none is rendered.
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("says the field is not pointed at anything only when it genuinely is not", () => {
    // Two states with two different remedies: `notConfigured` is an admin's job
    // (the definition has no target), `attachUnavailable` is nobody's (the
    // product has no attach affordance yet). Collapsing them would send an
    // operator to reconfigure a field that is configured correctly.
    const { unmount } = render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.notConfigured")).toBeInTheDocument();
    unmount();

    // A stored value counts as configured on its own, even with no pin: the value
    // carries its own target key, so the field is plainly pointed at something.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.attachUnavailable")).toBeInTheDocument();
    expect(screen.queryByText("customField.mediaReference.notConfigured")).not.toBeInTheDocument();
  });
});

describe("MediaReferenceCustomFieldControl -- the image-only distinction", () => {
  it("states the image requirement up front for Image and not for File", () => {
    // The server refuses a non-image with `mediaReferenceNotAnImage` AFTER the
    // owner-pair fence passes, and this tier cannot pre-empt that check -- the
    // value carries no content type. Saying the requirement before anyone acts on
    // it is the useful thing available. Both directions asserted: the File
    // negative is what fails if `imagesOnly` is ever hardcoded or the two
    // dispatch keys are collapsed.
    const { unmount } = render(
      <MediaReferenceCustomFieldControl
        id="cf_photo"
        label="Photo"
        imagesOnly
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.imagesOnly")).toBeInTheDocument();
    expect(screen.getByText("customField.mediaReference.noImage")).toBeInTheDocument();
    unmount();

    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByText("customField.mediaReference.imagesOnly")).not.toBeInTheDocument();
    expect(screen.queryByText("customField.mediaReference.noImage")).not.toBeInTheDocument();
  });

  it("uses the image wording for an attached value too, not just for the empty state", () => {
    render(
      <MediaReferenceCustomFieldControl
        id="cf_photo"
        label="Photo"
        imagesOnly
        value={STORED}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("customField.mediaReference.imageAttached")).toBeInTheDocument();
    expect(screen.queryByText("customField.mediaReference.fileAttached")).not.toBeInTheDocument();
  });
});

describe("MediaReferenceCustomFieldControl -- when Remove is withheld", () => {
  it("offers Remove on an optional, enabled field with a value", () => {
    // The positive baseline. Every negative case below withholds exactly ONE
    // thing from this render, which is what makes each of them a test of that one
    // thing rather than of the button's existence.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: CLEAR_BUTTON })).toBeInTheDocument();
  });

  it("withholds Remove on a REQUIRED field, because the removal could not be undone here", () => {
    // The reference control's own `allowClear={!required}` precedent, and the
    // argument is stronger here: with no picker, a cleared media value cannot be
    // re-attached from this form at all, so the clear is irreversible in the
    // session rather than merely trading a value for a validation error.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
        required
      />
    );
    expect(screen.queryByRole("button", { name: CLEAR_BUTTON })).not.toBeInTheDocument();
  });

  it("withholds Remove when the field is disabled, and marks the region aria-disabled", () => {
    // `aria-disabled` rather than `disabled`: there is no single widget here to
    // disable, only a region containing a statement, and `role="group"` is what
    // makes the attribute meaningful on a div.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={STORED}
        onChange={vi.fn()}
        disabled
      />
    );
    expect(screen.queryByRole("button", { name: CLEAR_BUTTON })).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Waiver" })).toHaveAttribute("aria-disabled", "true");
  });

  it("withholds Remove when there is nothing to remove", () => {
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: CLEAR_BUTTON })).not.toBeInTheDocument();
  });
});

describe("MediaReferenceCustomFieldControl -- a11y wiring", () => {
  it("names the region through the group's aria-label, since a for/id pair cannot name a div", () => {
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    // Resolved through the accessibility tree, so this fails if the name is only
    // in a `<Label htmlFor>` -- which computes nothing for a non-labelable
    // element, the mechanism the reference control documents for its own trigger.
    const group = screen.getByRole("group", { name: "Waiver" });
    expect(group.id).toBe("cf_waiver");
    // The visible label is still real, clickable DOM, and is not what names it.
    expect(document.querySelector('label[for="cf_waiver"]')?.textContent).toBe("Waiver");
  });

  it("falls back to the id when the field has no label, rather than leaving the region unnamed", () => {
    render(<MediaReferenceCustomFieldControl id="cf_waiver" value={null} onChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: "cf_waiver" })).toBeInTheDocument();
  });

  it("COMPOSES the host's describedBy with its own note rather than replacing it", () => {
    // `aria-describedby` is an id list. Overwriting it silences the host form's
    // error text, which for a GenericForm-drawn field is the only place the
    // validation message appears.
    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
        describedBy="host-error-node"
      />
    );
    const ids = (
      screen.getByRole("group", { name: "Waiver" }).getAttribute("aria-describedby") ?? ""
    )
      .split(" ")
      .filter(Boolean);

    expect(ids).toContain("host-error-node");
    // The control's own note must be in the list AND resolve to a real node: an
    // id list pointing at nothing announces nothing, and looks identical to
    // correct wiring if only the attribute is checked.
    const own = ids.filter((id) => id !== "host-error-node");
    expect(own.length).toBeGreaterThan(0);
    for (const id of own) {
      expect(document.getElementById(id)).not.toBeNull();
    }
    expect(document.getElementById(own[0])?.textContent).toContain(
      "customField.mediaReference.notConfigured"
    );
  });

  it("marks the region invalid only when the host says so", () => {
    const { unmount } = render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("group", { name: "Waiver" })).not.toHaveAttribute("aria-invalid");
    unmount();

    render(
      <MediaReferenceCustomFieldControl
        id="cf_waiver"
        label="Waiver"
        value={null}
        onChange={vi.fn()}
        invalid
      />
    );
    expect(screen.getByRole("group", { name: "Waiver" })).toHaveAttribute("aria-invalid", "true");
  });
});
