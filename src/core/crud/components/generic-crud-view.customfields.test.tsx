import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
// `vitest.setup.ts` (which registers jest-dom's matchers at runtime for every
// suite) is itself excluded from tsc's project (see tsconfig.json "exclude"),
// and even so, it imports the plain "@testing-library/jest-dom" entry, which
// only augments Jest's global `expect` types, not Vitest's `Assertion<T>`.
// This is the first *.test.tsx in the repo living outside a `__tests__`
// folder (those are excluded from tsc entirely) that calls a jest-dom
// matcher, so it's the first to need this import for `tsc --noEmit` to see
// `toBeInTheDocument` on Vitest's own `expect()` return type.
import "@testing-library/jest-dom/vitest";
import { GenericCrudView, type CrudConfig } from "./generic-crud-view";
import { registerCustomFieldsExtension, type CustomFieldsExtensionApi } from "@core/crud/customFieldsExtension";
import { useAppStore } from "@core/store/useAppStore";

// GenericCrudView (via @core/hooks/use-permissions, a re-export) and
// GenericForm (which imports it directly) both call usePermissions() from
// this module, which throws outside a PermissionProvider — same pattern used
// in core/providers/__tests__/route-guard.test.tsx. Mocking the underlying
// module here covers both call sites. Every other hook these components call
// (useSettings, useI18n, usePermission, useRestrictedFields,
// useEnhancedDelete/Toast) already has an SSR/no-provider fallback and needs no mock.
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

// Minimal viewModel double — only the surface GenericCrudView actually reads.
function makeViewModel(overrides: Record<string, unknown> = {}) {
  return {
    items: [],
    loading: false,
    error: null,
    isCreateModalOpen: true,
    isEditModalOpen: false,
    viewModalOpen: false,
    editingItem: null,
    selectedItems: [],
    pagination: {},
    changePage: vi.fn(),
    changePageSize: vi.fn(),
    searchValue: "",
    handleSearchChange: vi.fn(),
    setIsCreateModalOpen: vi.fn(),
    setSelectedItems: vi.fn(),
    refresh: vi.fn(),
    refreshItems: vi.fn(),
    createItem: vi.fn().mockResolvedValue({ id: "new-record-id" }),
    updateItem: vi.fn().mockResolvedValue({}),
    closeEditModal: vi.fn(),
    // Real useCrudViewModel only does anything on these when the screen's
    // hook opted into { deferSuccessEffects: true } (see useCrudViewModel.ts)
    // — this mock always defines them so GenericCrudView's `?.()` call sites
    // exercise real assertions here instead of silently no-op-ing, but real
    // callers built from a plain useCrudViewModel() with no options would
    // not need them called for correct behavior (the hook's own
    // onCreateSuccess/onUpdateSuccess already closed the modal by then).
    confirmCreateSuccess: vi.fn(),
    confirmUpdateSuccess: vi.fn(),
    ...overrides,
  };
}

function registerFakeCustomFieldsExtension(): CustomFieldsExtensionApi {
  const fake: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([
      { name: "__cf__nationality", label: "Nationality", type: "text", section: "Custom Fields" },
    ]),
    saveValues: vi.fn().mockResolvedValue(undefined),
    // Empty by default -- these form-focused tests never populate table rows,
    // so useCustomFieldColumns' own ownerIds.length === 0 gate means this is
    // never actually called here; it only needs to exist to satisfy the type.
    getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
    InlineAddTrigger: () => null,
  };
  registerCustomFieldsExtension(fake);
  return fake;
}

describe("GenericCrudView + entityTypeKey", () => {
  it("appends the custom field to the create form and saves its value after a successful create", async () => {
    const extension = registerFakeCustomFieldsExtension();
    const vm = makeViewModel();
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(vm.createItem).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Jane" })
    ));
    // The namespaced custom-field key must NOT leak into the entity's own create payload.
    expect(vm.createItem).not.toHaveBeenCalledWith(
      expect.objectContaining({ "__cf__nationality": expect.anything() })
    );
    await waitFor(() => expect(extension.saveValues).toHaveBeenCalledWith(
      "party.person", "new-record-id", { nationality: "Egyptian" }
    ));
    // The wrapper must confirm success itself, sequenced AFTER saveValues
    // settles — not rely solely on the viewmodel's own onCreateSuccess, which
    // (for a screen NOT opted into deferSuccessEffects) fires before
    // saveValues even runs. confirmCreateSuccess is what fires the toast AND
    // closes the modal for a deferSuccessEffects screen; GenericCrudView
    // itself never calls setIsCreateModalOpen directly on this path.
    await waitFor(() => expect(vm.confirmCreateSuccess).toHaveBeenCalled());
  });

  it("renders without crashing when a screen sets neither createFields nor entityTypeKey (the real-screen shape: UsersView, DsrView, InvoiceListView, EditionsView, TenantPlansView, TenantFeatureDefinitionsView, ThemeManagementView, ConnectOnboardingView)", async () => {
    const extension = registerFakeCustomFieldsExtension();
    const vm = makeViewModel();
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      // Deliberately no createFields, no entityTypeKey — createFields is
      // `undefined` at runtime here, which used to crash createFieldsWithCustom's
      // unguarded spread.
    };

    expect(() => render(<GenericCrudView viewModel={vm} config={config} />)).not.toThrow();

    // No entityTypeKey means the extension must never be consulted.
    expect(extension.getFormFields).not.toHaveBeenCalled();
  });

  it("appends the custom field to the edit form and saves its value keyed by the editing item's id", async () => {
    const extension = registerFakeCustomFieldsExtension();
    const editingItem = { id: "existing-record-id", firstName: "Jane" };
    const vm = makeViewModel({
      isCreateModalOpen: false,
      isEditModalOpen: true,
      editingItem,
    });
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Janet" } });
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(vm.updateItem).toHaveBeenCalledWith(
      "existing-record-id",
      expect.objectContaining({ firstName: "Janet" })
    ));
    // The namespaced custom-field key must NOT leak into the entity's own update payload.
    expect(vm.updateItem).not.toHaveBeenCalledWith(
      "existing-record-id",
      expect.objectContaining({ "__cf__nationality": expect.anything() })
    );
    await waitFor(() => expect(extension.saveValues).toHaveBeenCalledWith(
      "party.person", "existing-record-id", { nationality: "Egyptian" }
    ));
    // Same sequencing requirement as create: confirm (toast + close) only
    // after saveValues has actually settled, not driven by the viewmodel's
    // own auto-close.
    await waitFor(() => expect(vm.confirmUpdateSuccess).toHaveBeenCalled());
  });

  it("does not confirm success (no toast, edit modal stays open) when saveValues fails after updateItem succeeds", async () => {
    const extension = registerFakeCustomFieldsExtension();
    vi.mocked(extension.saveValues).mockRejectedValueOnce(new Error("Custom field values could not be saved"));
    const vm = makeViewModel({
      isCreateModalOpen: false,
      isEditModalOpen: true,
      editingItem: { id: "existing-record-id", firstName: "Jane" },
    });
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);
    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(vm.updateItem).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/could not be saved/i)).toBeInTheDocument());
    expect(vm.confirmUpdateSuccess).not.toHaveBeenCalled();
    expect(vm.closeEditModal).not.toHaveBeenCalled();
  });

  it("sends null (not \"\") when the user clears a custom field, so the backend clears it instead of 422-ing", async () => {
    const extension = registerFakeCustomFieldsExtension();
    const vm = makeViewModel({
      isCreateModalOpen: false,
      isEditModalOpen: true,
      editingItem: { id: "existing-record-id", firstName: "Jane" },
    });
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());

    // Type something, then clear it — exactly what "remove this value" looks
    // like from the UI. The control submits "".
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(extension.saveValues).toHaveBeenCalledWith(
      "party.person", "existing-record-id", { nationality: null }
    ));
  });

  it("surfaces an error instead of silently dropping custom values when createItem returns no id", async () => {
    const extension = registerFakeCustomFieldsExtension();
    // A screen whose createItem resolves without { id } — the shape that used
    // to make the typed custom values vanish with no toast and no error.
    const vm = makeViewModel({ createItem: vi.fn().mockResolvedValue(undefined) });
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.click(screen.getByText("common.save"));

    // ErrorMessage renders its own role="alert" inside GenericForm's wrapper,
    // so the outermost one is the server-error banner.
    await waitFor(() => expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
      /create response did not return an id/i
    ));
    expect(extension.saveValues).not.toHaveBeenCalled();
  });

  it("keeps the create modal open and does not swallow the error when saveValues fails after createItem succeeds", async () => {
    const extension = registerFakeCustomFieldsExtension();
    vi.mocked(extension.saveValues).mockRejectedValueOnce(new Error("Custom field values could not be saved"));
    const vm = makeViewModel();
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);
    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() => expect(vm.createItem).toHaveBeenCalled());
    // The confirm call driven by this wrapper (toast + close, for a
    // deferSuccessEffects screen) must NOT fire when saveValues rejects.
    await waitFor(() => expect(screen.getByText(/could not be saved/i)).toBeInTheDocument());
    expect(vm.confirmCreateSuccess).not.toHaveBeenCalled();
    expect(vm.setIsCreateModalOpen).not.toHaveBeenCalledWith(false);
  });

  it("keeps what the user already typed when the inline add-custom-field trigger adds a field mid-form", async () => {
    const nationality = {
      name: "__cf__nationality", label: "Nationality", type: "text", section: "Custom Fields",
    };
    const shirtSize = {
      name: "__cf__shirtSize", label: "Shirt Size", type: "text", section: "Custom Fields",
    };
    // First load returns one custom field; the refetch triggered by the inline
    // dialog's onCreated returns two.
    const getFormFields = vi
      .fn()
      .mockResolvedValueOnce([nationality])
      .mockResolvedValue([nationality, shirtSize]);
    const fake: CustomFieldsExtensionApi = {
      getFormFields,
      saveValues: vi.fn().mockResolvedValue(undefined),
      getBulkColumnValues: vi.fn().mockResolvedValue({ columns: [], valuesByOwnerId: {} }),
      InlineAddTrigger: ({ onCreated }) => (
        <button type="button" onClick={onCreated}>inline-add</button>
      ),
    };
    registerCustomFieldsExtension(fake);

    const vm = makeViewModel();
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    await waitFor(() => expect(screen.getByLabelText("Nationality")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Nationality"), { target: { value: "Egyptian" } });

    fireEvent.click(screen.getByText("inline-add"));

    // The new field shows up...
    await waitFor(() => expect(screen.getByLabelText("Shirt Size")).toBeInTheDocument());
    // ...and the form was NOT remounted, so nothing the user typed was lost.
    expect(screen.getByLabelText("First Name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Nationality")).toHaveValue("Egyptian");
  });

  it("fetches the read-only View dialog's custom-field values keyed by the viewed item's id, not editingItem's (which may be null or a different record entirely)", async () => {
    const extension = registerFakeCustomFieldsExtension();
    const vm = makeViewModel({
      isCreateModalOpen: false,
      viewModalOpen: true,
      viewItem: { id: "viewed-record-id", firstName: "Jane" },
      closeViewModal: vi.fn(),
      // editingItem deliberately null: View opened on its own, not mid-edit.
      // Before the fix, the View dialog's custom fields were sourced from a
      // hook keyed on editingItem.id, so this scenario fetched with an
      // undefined ownerId and always rendered the section empty.
      editingItem: null,
    });
    const config: CrudConfig<{ id: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [{ key: "id", label: "Id" }],
      createFields: [{ name: "firstName", label: "First Name", type: "text" }],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    // customFieldsForCreate/Edit are unconditional hooks too (Rules of Hooks)
    // and legitimately also call getFormFields with an undefined ownerId
    // here — create always does, and edit does because editingItem is null.
    // That's expected, not the regression under test. What the fix actually
    // guarantees is that a THIRD call exists, keyed on the view item's own
    // id — before the fix, no call anywhere used "viewed-record-id".
    await waitFor(() => expect(extension.getFormFields).toHaveBeenCalledWith(
      "party.person", "viewed-record-id"
    ));
  });
});

describe("GenericCrudView + dynamic custom-field table columns", () => {
  function registerFakeColumnsExtension(response: {
    columns: Array<{
      key: string;
      labelEn: string;
      labelAr: string | null;
      valueType: string;
      options: string[] | null;
      sortOrder: number;
    }>;
    valuesByOwnerId: Record<string, Record<string, unknown>>;
  }): CustomFieldsExtensionApi {
    const fake: CustomFieldsExtensionApi = {
      getFormFields: vi.fn().mockResolvedValue([]),
      saveValues: vi.fn().mockResolvedValue(undefined),
      getBulkColumnValues: vi.fn().mockResolvedValue(response),
      InlineAddTrigger: () => null,
    };
    registerCustomFieldsExtension(fake);
    return fake;
  }

  it("appends dynamic custom-field columns after the screen's own columns, with correct per-row values, and the empty-state marker for a row missing from valuesByOwnerId", async () => {
    const extension = registerFakeColumnsExtension({
      columns: [
        {
          key: "shirt_size",
          labelEn: "Shirt Size",
          labelAr: null,
          valueType: "Text",
          options: null,
          sortOrder: 0,
        },
      ],
      valuesByOwnerId: {
        "row-1": { shirt_size: "M" },
        // "row-2" deliberately absent — the server couldn't verify it (wrong
        // tenant, deleted between the list query and this call, malformed).
      },
    });
    const vm = makeViewModel({
      isCreateModalOpen: false,
      items: [
        { id: "row-1", firstName: "Jane" },
        { id: "row-2", firstName: "John" },
      ],
    });
    const config: CrudConfig<{ id: string; firstName: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [
        { key: "id", label: "Id" },
        { key: "firstName", label: "First Name" },
      ],
      entityTypeKey: "party.person",
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    // Dependent bulk fetch: keyed on the current page's row ids.
    await waitFor(() =>
      expect(extension.getBulkColumnValues).toHaveBeenCalledWith("party.person", ["row-1", "row-2"])
    );

    // GenericTable renders both a desktop <table> and a mobile card list at
    // the same time (CSS breakpoints hide one, not conditional rendering),
    // and jsdom in this suite has no stylesheet loaded to resolve that CSS —
    // so every assertion below is scoped to the one semantic <table> to avoid
    // matching the mobile card view's duplicate copy of the same text.
    const table = await screen.findByRole("table");
    await waitFor(() => {
      const headerLabels = within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent);
      // Appended AFTER the screen's own static columns, not before.
      expect(headerLabels).toEqual(["Id", "First Name", "Shirt Size"]);
    });

    const rows = within(table).getAllByRole("row");
    // rows[0] is the header row; data rows follow in viewModel.items order.
    expect(within(rows[1]).getByText("M")).toBeInTheDocument();
    expect(within(rows[2]).getByText("—")).toBeInTheDocument();
  });

  it("does not fetch or render any dynamic columns when entityTypeKey is unset, even with rows present (existing screens stay unaffected)", async () => {
    const extension = registerFakeColumnsExtension({ columns: [], valuesByOwnerId: {} });
    const vm = makeViewModel({
      isCreateModalOpen: false,
      items: [{ id: "row-1", firstName: "Jane" }],
    });
    const config: CrudConfig<{ id: string; firstName: string }> = {
      titleKey: "t", subtitleKey: "s",
      columns: [
        { key: "id", label: "Id" },
        { key: "firstName", label: "First Name" },
      ],
      // Deliberately no entityTypeKey — the vast majority of existing screens.
    };

    render(<GenericCrudView viewModel={vm} config={config} />);

    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Jane")).toBeInTheDocument());

    expect(extension.getBulkColumnValues).not.toHaveBeenCalled();
    expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Id",
      "First Name",
    ]);
  });
});

describe("GenericCrudView + field-level security on custom-field columns (Tier 1 slice 5)", () => {
  // Custom-field columns used to be EXEMPT from the FLS column filter, on the
  // stated grounds that a custom field's key had "no relationship to" the screen's
  // static field names. It does: `buildCustomFieldColumn` uses the definition's
  // real machine key, which is exactly the string an admin types into the
  // restricted-field list and exactly what the server matches on.
  //
  // These cases drive the REAL store (useAppStore.restrictedFields, the shape the
  // /me response populates) rather than mocking the hook, so they fail if either
  // the filter or the store wiring regresses.

  function registerColumns(
    columns: Array<{ key: string; labelEn: string }>,
    valuesByOwnerId: Record<string, Record<string, unknown>>
  ): CustomFieldsExtensionApi {
    const fake: CustomFieldsExtensionApi = {
      getFormFields: vi.fn().mockResolvedValue([]),
      saveValues: vi.fn().mockResolvedValue(undefined),
      getBulkColumnValues: vi.fn().mockResolvedValue({
        columns: columns.map((c, i) => ({
          key: c.key,
          labelEn: c.labelEn,
          labelAr: null,
          valueType: "Text",
          options: null,
          sortOrder: i,
        })),
        valuesByOwnerId,
      }),
      InlineAddTrigger: () => null,
    };
    registerCustomFieldsExtension(fake);
    return fake;
  }

  function baseConfig(): CrudConfig<{ id: string; firstName: string }> {
    return {
      titleKey: "t",
      subtitleKey: "s",
      resource: "party-people",
      columns: [
        { key: "id", label: "Id" },
        { key: "firstName", label: "First Name" },
      ],
      entityTypeKey: "party.person",
    };
  }

  function rows() {
    return makeViewModel({
      isCreateModalOpen: false,
      items: [{ id: "row-1", firstName: "Jane" }],
    });
  }

  afterEach(() => useAppStore.setState({ restrictedFields: {}, permissions: [] }));

  async function headersFor(restrictedFields: Record<string, string[]>) {
    // `resource` is what makes the FLS lookup possible, but it also engages
    // GenericCrudView's canView fallback (`{resource}.view` via usePermission,
    // which reads the store, NOT the mocked permission-provider). Without the
    // permission the screen renders the Lock EmptyState and there is no table to
    // assert on at all.
    useAppStore.setState({
      restrictedFields,
      permissions: ["party-people.view"] as never,
    });
    registerColumns(
      [
        { key: "salary", labelEn: "Salary" },
        { key: "shirt_size", labelEn: "Shirt Size" },
      ],
      { "row-1": { salary: "99000", shirt_size: "M" } }
    );

    render(<GenericCrudView viewModel={rows()} config={baseConfig()} />);

    const table = await screen.findByRole("table");
    // Wait on the one custom-field column that is never restricted in any case
    // below, NOT on a header count: two of these cases legitimately end with
    // fewer headers than the screen started with, and a count-based guard would
    // either race the async fetch or assert against a table that never loaded —
    // letting "the column is absent" pass vacuously.
    await waitFor(() =>
      expect(
        within(table)
          .getAllByRole("columnheader")
          .map((cell) => cell.textContent)
      ).toContain("Shirt Size")
    );
    return within(table).getAllByRole("columnheader").map((cell) => cell.textContent);
  }

  it("hides a restricted custom-field column while keeping the unrestricted ones", async () => {
    const headers = await headersFor({ "party-people": ["salary"] });

    expect(headers).toEqual(["Id", "First Name", "Shirt Size"]);
    expect(headers).not.toContain("Salary");
  });

  it("hides a restricted custom-field column when the admin typed the key in a different case", async () => {
    // The server matches OrdinalIgnoreCase, so the client must too — otherwise the
    // column renders against a server that is already withholding the value, and
    // the blank cells look like missing data rather than security.
    const headers = await headersFor({ "party-people": ["Salary"] });

    expect(headers).toEqual(["Id", "First Name", "Shirt Size"]);
  });

  it("hides a restricted STATIC column and a restricted custom-field column together", async () => {
    const headers = await headersFor({ "party-people": ["firstName", "salary"] });

    expect(headers).toEqual(["Id", "Shirt Size"]);
  });

  it("renders every custom-field column when the resource has no restrictions", async () => {
    const headers = await headersFor({ "some-other-resource": ["salary"] });

    // A restriction on an unrelated resource must not reach this screen.
    expect(headers).toEqual(["Id", "First Name", "Salary", "Shirt Size"]);
  });
});
