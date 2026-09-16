// The REAL RichText and media controls, drawn by a plain <GenericForm> through
// the CustomFields extension registry -- Wave 3.4, end to end.
//
// WHY THIS FILE EXISTS ALONGSIDE the two core-side ones. Those pin the routing
// contract `core` owns, against a FAKE control: that GenericForm consults the
// registry, passes the six promised props, suppresses its own label, and renders
// an inert explanation when nothing is registered. Neither can prove the thing the
// operator actually cares about -- that the field they get on a generic CRUD
// screen is the SAME working control the 8 hand-wired sites get -- because a fake
// would pass either way. `core` may not import from `src/modules/*`, so the only
// place that assertion can live is here, where both halves are importable.
//
// RED WITHOUT THE FIX, in one line: none of the three controls exists in the DOM
// at all, because GenericForm had no arm for "media-file"/"media-image"/
// "rich-text" and drew `<Input type="media-file">` and friends instead -- which
// painted each stored envelope as "[object Object]".
//
// NOTHING IS MOCKED except the permission provider. Both controls are pure
// presentation over `@core/ui` primitives with no DI-container or network reach
// (unlike the reference picker's entity-lookup hooks), and TipTap really mounts in
// jsdom -- so everything between GenericForm and the real contenteditable is real
// here. That is the point: a prop-capture mock of either control would still pass
// if the registration were wired to the wrong component.
//
// WHAT IS *NOT* PROVEN HERE, named so the header cannot be trusted for more than
// it establishes: the rich-text UPWARD path (editor -> `{ html }`) is not driven
// from this file, because ProseMirror takes input through DOM mutation observation
// and `fireEvent` cannot synthesise it. That contract is pinned in
// RichTextCustomFieldControl.test.tsx, against a stub whose whole purpose is to be
// drivable. What this file adds for rich text is the DOWNWARD half against the
// real editor, plus the fact that a stored value survives a submit untouched --
// which is the defect that actually shipped.
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { GenericFormCustomFieldControl } from "./GenericFormCustomFieldControl";

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

/**
 * Registers the REAL bridge, exactly as customFieldsCrudIntegration.tsx does.
 * `getFormFields` is stubbed because this file hands <GenericForm> its fields
 * directly rather than going through a CRUD screen's fetch.
 */
function registerRealBridge(): void {
  const api: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    FieldControl: GenericFormCustomFieldControl,
  };
  registerCustomFieldsExtension(api);
}

const MEDIA_FILE: FieldConfig = {
  name: "__cf__waiver",
  label: "Waiver",
  type: "media-file",
  referenceTargetEntityTypeKey: "media.file",
};
const MEDIA_IMAGE: FieldConfig = {
  name: "__cf__photo",
  label: "Photo",
  type: "media-image",
  referenceTargetEntityTypeKey: "media.file",
};
const RICH_TEXT: FieldConfig = { name: "__cf__notes", label: "Notes", type: "rich-text" };

const STORED_MEDIA = { entityTypeKey: "media.file", entityId: "ENC-must-not-be-rendered" };
const STORED_RICH = { html: "<p>Pressing drill</p>" };

beforeEach(() => {
  registerRealBridge();
});

describe("GenericForm draws the REAL media control", () => {
  it("renders the real control -- a labelled group with the module's own copy, not an input", () => {
    // Two halves. The group with the field's name is what the real control
    // renders; the module's own localized key is what proves it is THAT control
    // rather than any labelled region -- and it is a `customField.*` key, which
    // only this module registers.
    const { container } = render(
      <GenericForm fields={[MEDIA_FILE]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(screen.getByRole("group", { name: "Waiver" })).toBeInTheDocument();
    expect(screen.getByText("customField.mediaReference.attachUnavailable")).toBeInTheDocument();
    expect(container.querySelector("input")).toBeNull();
  });

  it("keeps File and Image distinguishable all the way through the bridge", () => {
    // The two dispatch keys exist ONLY to carry the image-only rule, and the
    // bridge is one more place it could be flattened -- `GenericFormCustomFieldControl`
    // hands the whole `field` to one dispatcher, so a bridge that normalised the
    // type would produce two identical fields. Both directions asserted.
    render(
      <GenericForm
        fields={[MEDIA_FILE, MEDIA_IMAGE]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();
    expect(screen.getByText("customField.mediaReference.noImage")).toBeInTheDocument();
    // Exactly one images-only note across both fields: the Image field's.
    expect(screen.getAllByText("customField.mediaReference.imagesOnly")).toHaveLength(1);
  });

  it("shows a stored reference as attached, and never renders the encrypted id", () => {
    const { container } = render(
      <GenericForm
        fields={[MEDIA_FILE]}
        initialValues={{ [MEDIA_FILE.name]: STORED_MEDIA }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByText("customField.mediaReference.fileAttached")).toBeInTheDocument();
    expect(container.textContent).not.toContain("ENC-must-not-be-rendered");
    expect(container.textContent).not.toContain("[object Object]");
  });

  it("submits a stored reference untouched, with both property names intact", async () => {
    // The end-to-end version of the data-loss defect: load, submit, and the
    // envelope arrives at `onSubmit` byte-identical. A rename anywhere in the
    // chain -- bridge, dispatcher, control -- shows up here.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[MEDIA_FILE]}
        initialValues={{ [MEDIA_FILE.name]: STORED_MEDIA }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][MEDIA_FILE.name]).toEqual(STORED_MEDIA);
  });

  it("clears to null through the real Remove button, and submits the cleared field", async () => {
    // The one edit a media field can actually make, driven through the real
    // control and the real form. `null` is the wire's "clear this field"; an empty
    // string would be a scalar the handler refuses.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[MEDIA_FILE]}
        initialValues={{ [MEDIA_FILE.name]: STORED_MEDIA }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "customField.mediaReference.clear" }));
    expect(screen.getByText("customField.mediaReference.noFile")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][MEDIA_FILE.name]).toBeNull();
  });

  it("blocks submit for a required media field with nothing attached", async () => {
    // Both halves of the required story meet here for the first time: the type
    // must be in `handleSubmit`'s `customTypes` set (it is, via the
    // `EXTENSION_DRAWN_FIELD_TYPES` spread) AND its object-emptiness rule must
    // report an absent value as unfilled. Either one missing and this submits.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...MEDIA_FILE, required: true }]}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(screen.getByText("validation.required")).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders exactly one label per media field", () => {
    const { container } = render(
      <GenericForm
        fields={[MEDIA_FILE, MEDIA_IMAGE]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );
    expect(container.querySelectorAll(`label[for="${MEDIA_FILE.name}"]`)).toHaveLength(1);
    expect(container.querySelectorAll(`label[for="${MEDIA_IMAGE.name}"]`)).toHaveLength(1);
  });
});

describe("GenericForm draws the REAL rich-text control", () => {
  it("renders the real TipTap editor as a NAMED, multiline textbox", () => {
    // The discriminating facts, none of which an `<input>` can carry: a
    // contenteditable, `aria-multiline`, and a name resolved through the real
    // accessibility tree. Together they prove both that the arm exists and that
    // the a11y forwarding survived the trip through the bridge.
    render(<GenericForm fields={[RICH_TEXT]} onSubmit={async () => {}} onCancel={() => {}} />);

    const editable = screen.getByRole("textbox", { name: "Notes" });
    expect(editable).toHaveAttribute("contenteditable", "true");
    expect(editable).toHaveAttribute("aria-multiline", "true");
    expect(editable.id).toBe(RICH_TEXT.name);
  });

  it("unwraps a stored { html } envelope into the editor rather than painting the object", () => {
    render(
      <GenericForm
        fields={[RICH_TEXT]}
        initialValues={{ [RICH_TEXT.name]: STORED_RICH }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    const editable = screen.getByRole("textbox", { name: "Notes" });
    expect(editable.textContent).toContain("Pressing drill");
    expect(editable.textContent).not.toContain("[object Object]");
    // And the markup was parsed into real elements, not shown as text -- which is
    // what proves the editor received a string it could parse rather than an
    // object it stringified.
    expect(editable.querySelector("p")).not.toBeNull();
    expect(editable.textContent).not.toContain("<p>");
  });

  it("submits a stored rich-text envelope untouched, with `html` still spelled `html`", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[RICH_TEXT]}
        initialValues={{ [RICH_TEXT.name]: STORED_RICH }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][RICH_TEXT.name]).toEqual(STORED_RICH);
  });

  it("blocks submit for a required rich-text field left empty", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...RICH_TEXT, required: true }]}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(screen.getByText("validation.required")).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders exactly one label, and does not offer a raw-HTML source textarea", () => {
    // Two facts in one render. The single label is the host's suppression working
    // through the bridge. The absent source toggle is this control's own choice --
    // `RichTextEditor` defaults it ON, and left on it invites pasting markup the
    // server's allowlist then strips with no explanation. Asserted through the DOM
    // rather than through a prop, because that is what the operator meets.
    const { container } = render(
      <GenericForm fields={[RICH_TEXT]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelectorAll(`label[for="${RICH_TEXT.name}"]`)).toHaveLength(1);
    expect(container.querySelector("textarea")).toBeNull();
  });

  it("goes read-only with the form, hiding the toolbar with it", () => {
    render(
      <GenericForm fields={[RICH_TEXT]} onSubmit={async () => {}} onCancel={() => {}} readOnly />
    );

    const editable = screen.getByRole("textbox", { name: "Notes" });
    expect(editable).toHaveAttribute("contenteditable", "false");

    // "No toolbar" is asserted INSIDE the field's own subtree, not across the
    // whole form: a read-only GenericForm still renders its own `common.close`
    // button, so a document-wide button count would be a test of the form's
    // chrome rather than of the editor. The field wrapper is the element holding
    // this field's label, which is exactly the div this control renders.
    const fieldWrapper = document.querySelector(`label[for="${RICH_TEXT.name}"]`)?.parentElement;
    expect(fieldWrapper).not.toBeNull();
    expect(within(fieldWrapper as HTMLElement).queryAllByRole("button")).toHaveLength(0);
    // And the sanity half, so the assertion above is not passing because buttons
    // are missing everywhere: the form's own read-only chrome is still there.
    expect(screen.getByRole("button", { name: "common.close" })).toBeInTheDocument();
  });
});
