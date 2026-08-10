import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    ...overrides,
  };
}

function registerFakeCustomFieldsExtension(): CustomFieldsExtensionApi {
  const fake: CustomFieldsExtensionApi = {
    getFormFields: vi.fn().mockResolvedValue([
      { name: "__cf__nationality", label: "Nationality", type: "text", section: "Custom Fields" },
    ]),
    saveValues: vi.fn().mockResolvedValue(undefined),
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
    // The wrapper must drive the close itself, sequenced AFTER saveValues
    // settles — not rely solely on the viewmodel's own onCreateSuccess, which
    // (for the real useCrudViewModel hook) fires before saveValues even runs.
    await waitFor(() => expect(vm.setIsCreateModalOpen).toHaveBeenCalledWith(false));
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
    // The modal-close call driven by this wrapper must NOT fire when saveValues rejects.
    await waitFor(() => expect(screen.getByText(/could not be saved/i)).toBeInTheDocument());
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
});
