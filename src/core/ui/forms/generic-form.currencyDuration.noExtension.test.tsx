// GenericForm's `currency` and `duration` fields with NO CustomFields module
// present -- Wave 4 follow-up.
//
// WHY ITS OWN FILE, and this is load-bearing rather than tidiness:
// `registerCustomFieldsExtension` has no unregister, so a genuinely
// never-registered registry only exists in a module graph nothing has registered
// into. Vitest isolates each test file's module graph, so this file is the only
// honest place to observe that state. (The neighbouring
// generic-form.currencyDuration.test.tsx registers a fake in `beforeEach` and can
// therefore never reach this branch.)
//
// WHY THE BRANCH MATTERS. `core` is usable with no CustomFields module -- and
// every hand-built `CustomFieldsExtensionApi` test double across this codebase's
// other suites omits `FieldControl`, which is why that member is optional. The
// one thing this path must never do is what the bug did: fall through to
// `<Input type={field.type} value={formData[field.name] ?? ""}>`. For Currency
// that paints the stored two-part object as `[object Object]` in an editable text
// box and destroys it on the first keystroke; for Duration it silently downgrades
// a minutes field to a bare `type=text` box with no unit anywhere on screen. So
// the assertions here are mostly NEGATIVE by design, and the load-bearing one is
// "no input at all" -- it finds the fallthrough and fails the moment anyone
// reintroduces it.
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

const CURRENCY_FIELD: FieldConfig = {
  name: "__cf__price",
  label: "Price",
  type: "currency",
};

const DURATION_FIELD: FieldConfig = {
  name: "__cf__session_length",
  label: "Session Length",
  type: "duration",
};

const STORED_CURRENCY: unknown = { amount: 150.75, currencyCode: "USD" };

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

describe("GenericForm currency/duration — no extension registered at all", () => {
  it("registry really is empty in this file", () => {
    // Guards the premise. If some import chain ever self-registers an extension,
    // every assertion below would silently start testing the wrong branch.
    expect(getCustomFieldsExtension()).toBeNull();
  });

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])("renders no input at all for the field (%s)", (label, field) => {
    // THE assertion. RED WITHOUT THE FIX: the fallthrough renders
    // `<input type="currency">` / `<input type="duration">`, which is what the
    // operator typed over.
    const { container } = render(
      <GenericForm fields={[field]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(container.querySelector(`input[type="${label}"]`)).toBeNull();
    expect(container.querySelector("input")).toBeNull();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("never paints a stored currency object as [object Object]", () => {
    const { container } = render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: STORED_CURRENCY }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    // The discriminating half: an `<input value="...">` contributes nothing to
    // textContent, so the textContent check alone would pass vacuously against
    // the bug.
    expect(screen.queryByDisplayValue("[object Object]")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("[object Object]");
  });

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])(
    "says why the field is inoperable, in an inert region wired to its label (%s)",
    (_l, field) => {
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

  it.each([
    ["currency", CURRENCY_FIELD],
    ["duration", DURATION_FIELD],
  ])(
    "keeps the aria-invalid / aria-describedby contract when the required pass rejects it (%s)",
    async (_l, field) => {
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

  it("resubmits a stored currency untouched — the inert field cannot corrupt it", async () => {
    // There is no onChange path in the fallback, so whatever loaded is still in
    // form state. RED WITHOUT THE FIX: the change below lands in the fallthrough
    // Input and the submitted value is the string "typed" instead of the money
    // object. Written as a conditional keystroke rather than an assert-then-type
    // so the FAILURE is the corrupted value, which is the actual defect.
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <GenericForm
        fields={[CURRENCY_FIELD]}
        initialValues={{ [CURRENCY_FIELD.name]: STORED_CURRENCY }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const stray = container.querySelector<HTMLInputElement>("input");
    if (stray) fireEvent.change(stray, { target: { value: "typed" } });

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0][CURRENCY_FIELD.name]).toEqual(STORED_CURRENCY);
  });
});

describe("GenericForm currency/duration — extension registered WITHOUT FieldControl", () => {
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
      <GenericForm
        fields={[CURRENCY_FIELD, DURATION_FIELD]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(container.querySelector("input")).toBeNull();
    expect(screen.getByRole("group", { name: "Price" })).toHaveTextContent(UNAVAILABLE_KEY);
    expect(screen.getByRole("group", { name: "Session Length" })).toHaveTextContent(
      UNAVAILABLE_KEY
    );
  });
});
