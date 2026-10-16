// GenericForm's `entity-reference` field with NO CustomFields module present --
// Wave 4 follow-up.
//
// WHY ITS OWN FILE, and this is load-bearing rather than tidiness:
// `registerCustomFieldsExtension` has no unregister, so a genuinely
// never-registered registry only exists in a module graph nothing has registered
// into. Vitest isolates each test file's module graph, so this file is the only
// honest place to observe that state. (The neighbouring
// generic-form.entityReference.test.tsx registers a fake in `beforeEach` and can
// therefore never reach this branch.)
//
// WHY THE BRANCH MATTERS. `core` is usable with no CustomFields module -- and
// every hand-built `CustomFieldsExtensionApi` test double across this codebase's
// other suites omits `FieldControl`, which is why that member is optional. The one
// thing this path must never do is what the bug did: fall through to `<Input
// type="entity-reference" value={formData[field.name] ?? ""}>`, which paints a
// stored reference object as `[object Object]` in an editable text box and
// destroys it on the first keystroke. So the assertions here are mostly NEGATIVE
// by design, and the load-bearing one is "no text input" -- it finds the
// fallthrough input and fails the moment anyone reintroduces it.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";
import {
  getCustomFieldsExtension,
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";

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

const FIELD: FieldConfig = {
  name: "__cf__assignee",
  label: "Assignee",
  type: "entity-reference",
};

const STORED: unknown = { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" };

/**
 * The copy the fallback shows, composed from the two CORE keys
 * `module-error-boundary.tsx` already composes for the same fact. Outside an
 * I18nProvider `t()` returns the bare key (useI18n's own no-provider fallback),
 * which is the convention this codebase's other tests use deliberately: asserting
 * the BARE KEY proves the key itself is right, where asserting English prose
 * would pass for any key that happened to resolve.
 *
 * A module key (`customField.*`) would have been the wrong choice and this is the
 * test that would not have caught it: those keys are registered by the very module
 * whose absence produces this state, so on the real path they would render as raw
 * keys to the operator.
 */
const UNAVAILABLE_KEY = "errors.module.description";

describe("GenericForm entity-reference field — no extension registered at all", () => {
  it("registry really is empty in this file", () => {
    // Guards the premise. If some import chain ever self-registers an extension,
    // every assertion below would silently start testing the wrong branch.
    expect(getCustomFieldsExtension()).toBeNull();
  });

  it("renders no text input for the field", () => {
    // THE assertion. RED WITHOUT THE FIX: the fallthrough renders
    // `<input type="entity-reference">`, which is what queryByRole("textbox")
    // finds and what the operator typed the stored object away in.
    const { container } = render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="entity-reference"]')).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });

  it("never paints the stored value — the encrypted id must not reach the page", () => {
    // A reference's `entityId` is an encrypted foreign primary key, and the only
    // thing that turns it into a human name is the resolve hook inside the absent
    // module. Printing it would leak an opaque id and read as data corruption.
    const { container } = render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(container.textContent).not.toContain("ENC-1");
    // Checked as a DISPLAY VALUE too, not only as text: an `<input value="...">`
    // contributes nothing to textContent, so the textContent assertions above pass
    // vacuously against the bug. This one is the discriminating half — the
    // fallthrough Input's value is literally the string "[object Object]".
    expect(screen.queryByDisplayValue("[object Object]")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("[object Object]");
  });

  it("says why the field is inoperable, in an inert region wired to the field's label", () => {
    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    const region = screen.getByRole("group", { name: "Assignee" });
    expect(region).toHaveTextContent(UNAVAILABLE_KEY);
    expect(region).toHaveAttribute("aria-disabled", "true");
    // The label still exists and still points at the field, exactly once -- the
    // host suppresses its own label for extension-drawn types, so the fallback
    // owes one.
    expect(container.querySelectorAll(`label[for="${FIELD.name}"]`)).toHaveLength(1);
    expect(region).toHaveAttribute("id", FIELD.name);
  });

  it("keeps the aria-invalid / aria-describedby contract when the required pass rejects the field", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm
        fields={[{ ...FIELD, required: true }]}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() =>
      expect(screen.getByRole("group", { name: "Assignee" })).toHaveAttribute(
        "aria-invalid",
        "true"
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("group", { name: "Assignee" })).toHaveAttribute(
      "aria-describedby",
      `${FIELD.name}-error`
    );
    expect(document.getElementById(`${FIELD.name}-error`)).toBeInTheDocument();
  });

  it("resubmits the stored value untouched — the inert field cannot corrupt it", async () => {
    // There is no onChange path in the fallback, so whatever loaded is still in
    // form state. RED WITHOUT THE FIX: the typing below lands in the fallthrough
    // Input and the submitted value is the string "typed" instead of the
    // reference. With the fix there is no input to find, so the keystroke has
    // nowhere to land. Written as a conditional keystroke rather than an
    // assert-then-type so the FAILURE is the corrupted value, which is the actual
    // defect, not merely "an input exists".
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const stray = container.querySelector<HTMLInputElement>("input");
    if (stray) fireEvent.change(stray, { target: { value: "typed" } });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][FIELD.name]).toEqual(STORED);
  });
});

describe("GenericForm entity-reference field — extension registered WITHOUT FieldControl", () => {
  it("takes the same inert path as a missing module, not the text box", () => {
    // The realistic shape of this: every pre-existing test double in this
    // codebase, and any module build that ships before FieldControl is wired.
    // `FieldControl` being optional means "absent" has two causes and must have
    // one behaviour.
    const legacyApi: CustomFieldsExtensionApi = {
      getFormFields: vi.fn().mockResolvedValue([]),
      saveValues: vi.fn().mockResolvedValue(undefined),
      getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
      InlineAddTrigger: () => null,
    };
    registerCustomFieldsExtension(legacyApi);

    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelector("input")).toBeNull();
    expect(screen.getByRole("group", { name: "Assignee" })).toHaveTextContent(UNAVAILABLE_KEY);
  });
});
