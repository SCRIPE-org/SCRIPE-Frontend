// GenericForm's Wave 3.4 field types with NO CustomFields module present.
//
// WHY ITS OWN FILE, and this is load-bearing rather than tidiness:
// `registerCustomFieldsExtension` has no unregister, so a genuinely
// never-registered registry only exists in a module graph nothing has registered
// into. Vitest isolates each test file's module graph, so this is the only honest
// place to observe that state. (The neighbouring
// generic-form.richTextMedia.test.tsx registers a fake in `beforeEach` and can
// therefore never reach this branch.)
//
// WHY THE BRANCH MATTERS. `core` is usable with no CustomFields module -- and
// every hand-built `CustomFieldsExtensionApi` test double across this codebase's
// other suites omits `FieldControl`, which is why that member is optional. The one
// thing this path must never do is what the bug did: fall through to
// `<Input type={field.type} value={formData[field.name] ?? ""}>`, which paints a
// stored object as `[object Object]` in an editable text box and destroys it on
// the first keystroke. So the assertions here are mostly NEGATIVE by design, and
// the load-bearing one is "no text input" -- it finds the fallthrough input and
// fails the moment anyone reintroduces it.
//
// ONE FACT SPECIFIC TO THIS WAVE. For a media field, "never paint the stored
// value" is not merely a display preference: the value's `entityId` is the Media
// module's ENCRYPTED primary key, and the only thing that could turn it into a
// file name is a lookup provider that does not exist for `media.file` in ANY
// module -- so there is nothing to resolve even when CustomFields IS present.
// Printing it would leak an opaque id into the page and read as data corruption.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";
import { getCustomFieldsExtension } from "@core/crud/customFieldsExtension";

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

const MEDIA_FILE: FieldConfig = { name: "__cf__waiver", label: "Waiver", type: "media-file" };
const MEDIA_IMAGE: FieldConfig = { name: "__cf__photo", label: "Photo", type: "media-image" };
const RICH_TEXT: FieldConfig = { name: "__cf__notes", label: "Notes", type: "rich-text" };

const ALL_THREE: readonly (readonly [string, FieldConfig, unknown, string])[] = [
  [
    "media-file",
    MEDIA_FILE,
    { entityTypeKey: "media.file", entityId: "ENC-must-not-be-painted" },
    "ENC-must-not-be-painted",
  ],
  [
    "media-image",
    MEDIA_IMAGE,
    { entityTypeKey: "media.file", entityId: "ENC-also-must-not-be-painted" },
    "ENC-also-must-not-be-painted",
  ],
  ["rich-text", RICH_TEXT, { html: "<p>Stored prose</p>" }, "Stored prose"],
];

/**
 * The copy the fallback shows, composed from the two CORE locale keys
 * `module-error-boundary.tsx` already composes for the same fact. Outside an
 * I18nProvider `t()` returns the bare key (useI18n's own no-provider fallback),
 * which is the convention this codebase's other tests use deliberately: asserting
 * the BARE KEY proves the key itself is right, where asserting English prose would
 * pass for any key that happened to resolve.
 *
 * A module key (`customField.*`) would have been the wrong choice and this is the
 * test that would not have caught it: those keys are registered by the very module
 * whose absence produced this state, so on the real path they would render as raw
 * keys to the operator.
 */
const UNAVAILABLE_KEY = "errors.module.description";

describe("GenericForm — Wave 3.4 field types with no extension registered at all", () => {
  it("registry really is empty in this file", () => {
    // Guards the premise. If some import chain ever self-registers an extension,
    // every assertion below would silently start testing the wrong branch.
    expect(getCustomFieldsExtension()).toBeNull();
  });

  it.each(ALL_THREE)("renders no input at all for a %s field", (_label, field, stored) => {
    // THE assertion. RED WITHOUT THE FIX: the fallthrough renders
    // `<input type="media-file">` (or the type's own name), which is what
    // queryByRole("textbox") finds and what the operator types the stored object
    // away in.
    const { container } = render(
      <GenericForm
        fields={[field]}
        initialValues={{ [field.name]: stored }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector(`input[type="${field.type}"]`)).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });

  it.each(ALL_THREE)(
    "never paints a stored %s value — not as text and not as an input's display value",
    (_label, field, stored, secret) => {
      const { container } = render(
        <GenericForm
          fields={[field]}
          initialValues={{ [field.name]: stored }}
          onSubmit={async () => {}}
          onCancel={() => {}}
        />
      );

      expect(container.textContent).not.toContain(secret);
      // Checked as a DISPLAY VALUE too, not only as text: an `<input value="...">`
      // contributes nothing to textContent, so the assertion above passes
      // vacuously against the bug. This is the discriminating half -- the
      // fallthrough Input's value is literally the string "[object Object]".
      expect(screen.queryByDisplayValue("[object Object]")).not.toBeInTheDocument();
      expect(container.textContent).not.toContain("[object Object]");
    }
  );

  it.each(ALL_THREE)(
    "says why a %s field is inoperable, in an inert region wired to the field's label",
    (_label, field) => {
      const { container } = render(
        <GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} />
      );

      const region = screen.getByRole("group", { name: field.label });
      expect(region).toHaveTextContent(UNAVAILABLE_KEY);
      expect(region).toHaveAttribute("aria-disabled", "true");
      // The label still exists and still points at the field, exactly once -- the
      // host suppresses its own label for extension-drawn types, so the fallback
      // owes one.
      expect(container.querySelectorAll(`label[for="${field.name}"]`)).toHaveLength(1);
      expect(region).toHaveAttribute("id", field.name);
    }
  );

  it.each(ALL_THREE)(
    "keeps the aria-invalid / aria-describedby contract when the required pass rejects a %s field",
    async (_label, field) => {
      // Reaching this at all depends on the type being in `handleSubmit`'s
      // `customTypes` set, which it is BY CONSTRUCTION via the
      // `EXTENSION_DRAWN_FIELD_TYPES` spread rather than by a second hand-kept
      // list. So this doubles as the proof that the spread actually covers the new
      // members: without it the required pass skips the field, the form submits,
      // and both assertions below fail.
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <GenericForm
          fields={[{ ...field, required: true }]}
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() =>
        expect(screen.getByRole("group", { name: field.label })).toHaveAttribute(
          "aria-invalid",
          "true"
        )
      );
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("group", { name: field.label })).toHaveAttribute(
        "aria-describedby",
        `${field.name}-error`
      );
      expect(document.getElementById(`${field.name}-error`)).toBeInTheDocument();
    }
  );

  it.each(ALL_THREE)(
    "resubmits a stored %s value untouched — the inert field cannot corrupt it",
    async (_label, field, stored) => {
      // There is no onChange path in the fallback, so whatever loaded is still in
      // form state. RED WITHOUT THE FIX: the typing below lands in the fallthrough
      // Input and the submitted value is the string "typed" instead of the
      // envelope. Written as a conditional keystroke rather than an
      // assert-then-type so the FAILURE is the corrupted value, which is the
      // actual defect, not merely "an input exists".
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <GenericForm
          fields={[field]}
          initialValues={{ [field.name]: stored }}
          onSubmit={onSubmit}
          onCancel={() => {}}
        />
      );

      const stray = container.querySelector<HTMLInputElement>("input");
      if (stray) fireEvent.change(stray, { target: { value: "typed" } });

      fireEvent.click(screen.getByRole("button", { name: "common.save" }));

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
      expect(onSubmit.mock.calls[0][0][field.name]).toEqual(stored);
    }
  );
});
