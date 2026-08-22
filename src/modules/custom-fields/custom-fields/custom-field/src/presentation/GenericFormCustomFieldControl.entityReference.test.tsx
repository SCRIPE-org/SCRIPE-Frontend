// The REAL reference picker, drawn by a plain <GenericForm> through the
// CustomFields extension registry -- Wave 4 follow-up, end to end.
//
// WHY THIS FILE EXISTS ALONGSIDE the two core-side files. Those pin the routing
// contract `core` owns, against a fake control: that GenericForm consults the
// registry, passes the six promised props, suppresses its own label, and renders
// an inert explanation when nothing is registered. None of them can prove the
// thing the operator actually cares about -- that the field they get on a generic
// CRUD screen is the SAME working picker the 8 hand-wired sites get -- because a
// fake would pass either way. `core` may not import from `src/modules/*`, so the
// only place that assertion can live is here, on the module side, where both
// halves are importable.
//
// RED WITHOUT THE FIX, in one line: no combobox exists at all, because GenericForm
// had no arm for "entity-reference" and drew `<Input type="entity-reference">`
// instead.
//
// The two entity-lookup hooks are mocked, not the control: they are the only
// things in this path that reach the module's DI container / network. Everything
// between GenericForm and SelectTrigger is real, which is the point -- a
// prop-capture mock of EntityReferenceCustomFieldControl would still pass if the
// registration were wired to the wrong component.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import {
  registerCustomFieldsExtension,
  type CustomFieldsExtensionApi,
} from "@core/crud/customFieldsExtension";
import { GenericFormCustomFieldControl } from "./GenericFormCustomFieldControl";

/** Recorded hook arguments -- `vi.hoisted` because `vi.mock` factories are hoisted above consts. */
const { searchArgs, resolveArgs } = vi.hoisted(() => ({
  searchArgs: [] as Array<{ entityTypeKey?: string | null; enabled?: boolean }>,
  resolveArgs: [] as unknown[],
}));

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

// Same relative specifiers the control itself imports (this file sits beside it),
// so these mocks intercept the real module identity rather than a second copy.
vi.mock("../../../entity-lookup/src/presentation/hooks/useEntityLookupSearch", () => ({
  useEntityLookupSearch: (args: { entityTypeKey?: string | null; enabled?: boolean }) => {
    searchArgs.push(args);
    return {
      query: "",
      setQuery: vi.fn(),
      items: [],
      isLoading: false,
      isLoadingMore: false,
      hasNextPage: false,
      loadMore: vi.fn(),
      error: null,
      reload: vi.fn(),
    };
  },
}));

// Mocked for the same reason as the two below -- it is the third and last thing in
// this path that reaches the module's DI container / network. The control calls it
// unconditionally (an unpinned definition needs the available-type list), so
// leaving it real would make every test in this file attempt a request and make
// their outcome depend on how that request failed.
vi.mock("../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes", () => ({
  useEntityLookupAvailableTypes: () => ({
    types: [{ entityTypeKey: "hrms.staff-member", displayName: "Staff Member" }],
    isLoading: false,
    isError: false,
    isEmpty: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../../entity-lookup/src/presentation/hooks/useResolveEntityReference", () => ({
  useResolveEntityReference: (reference: unknown) => {
    resolveArgs.push(reference);
    return {
      item: reference
        ? { id: "ENC-1", displayName: "Nadia Rashed", secondary: null, isActive: true }
        : null,
      status: reference ? "resolved" : "idle",
      retry: vi.fn(),
    };
  },
}));

// SelectTrigger measures its own width on mount (for the popover width CSS var)
// regardless of open state, and cmdk calls scrollIntoView on the highlighted row.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const FIELD: FieldConfig = {
  name: "__cf__assignee",
  label: "Assignee",
  type: "entity-reference",
  referenceTargetEntityTypeKey: "hrms.staff-member",
};

const STORED = { entityTypeKey: "hrms.staff-member", entityId: "ENC-1" };

beforeEach(() => {
  searchArgs.length = 0;
  resolveArgs.length = 0;
  // The one line under test on the registration side: production wires exactly
  // this component onto exactly this member (customFieldsCrudIntegration.tsx).
  const api: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
    FieldControl: GenericFormCustomFieldControl,
  };
  registerCustomFieldsExtension(api);
});

describe("GenericForm draws the real reference picker through the extension", () => {
  it("renders the picker's combobox, named by the field's own label, and no text input", () => {
    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    // `role="combobox"` is Name From: author, so this name can only come from the
    // control's `aria-label` -- the mechanism `<Label htmlFor>` alone cannot
    // supply for a <div> trigger.
    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="entity-reference"]')).toBeNull();
  });

  it("shows the resolved display name for a stored reference, never the encrypted id", () => {
    const { container } = render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveTextContent("Nadia Rashed");
    expect(container.textContent).not.toContain("ENC-1");
    expect(container.textContent).not.toContain("[object Object]");
  });

  it("hands the stored object to the resolver unchanged — the value is not coerced in transit", () => {
    render(
      <GenericForm
        fields={[FIELD]}
        initialValues={{ [FIELD.name]: STORED }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    // Proves GenericForm's raw `formData[field.name]` pass-through survives the
    // whole chain: without it the resolver would receive "" (the fallthrough's
    // `?? ""`) or a string, and no name would ever render.
    expect(resolveArgs.at(-1)).toEqual(STORED);
  });

  it("feeds the picker the definition's pinned target type", () => {
    render(<GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />);

    // The pin travels on the FieldConfig, and GenericForm passes `field` whole --
    // which is exactly why the extension contract needed no reference-specific
    // prop.
    expect(searchArgs.at(-1)?.entityTypeKey).toBe("hrms.staff-member");
  });

  it("still routes an UNPINNED definition to the module control, never to a text input", () => {
    // An unpinned EntityReference is a legitimate, permanent configuration (any
    // registered type is a legal target), so this must not be treated as a broken
    // field that falls back to something core draws.
    //
    // Deliberately asserts only what THIS layer owns -- that the field is drawn by
    // the module and is not an input. Which state the control itself settles into
    // for an unpinned definition is the control's own contract, pinned by
    // EntityReferenceCustomFieldControl.test.tsx; restating it here would make this
    // file fail every time that behaviour is legitimately revised.
    const { container } = render(
      <GenericForm
        fields={[{ ...FIELD, referenceTargetEntityTypeKey: null }]}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="entity-reference"]')).toBeNull();
  });

  it("blocks submit and marks the real trigger invalid when a required reference is blank", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <GenericForm fields={[{ ...FIELD, required: true }]} onSubmit={onSubmit} onCancel={() => {}} />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
        "aria-invalid",
        "true"
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
    // The host's error node id reaches the trigger's aria-describedby, composed
    // with (not overwritten by) whatever the control adds.
    expect(
      screen.getByRole("combobox", { name: "Assignee" }).getAttribute("aria-describedby")
    ).toContain(`${FIELD.name}-error`);
  });

  it("goes inert in a read-only form", () => {
    render(<GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} readOnly />);

    expect(screen.getByRole("combobox", { name: "Assignee" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("renders exactly one label for the field across the whole chain", () => {
    const { container } = render(
      <GenericForm fields={[FIELD]} onSubmit={async () => {}} onCancel={() => {}} />
    );

    // Both GenericForm and EntityReferenceCustomFieldControl can render a
    // <Label htmlFor>; only one may.
    expect(container.querySelectorAll(`label[for="${FIELD.name}"]`)).toHaveLength(1);
  });
});
