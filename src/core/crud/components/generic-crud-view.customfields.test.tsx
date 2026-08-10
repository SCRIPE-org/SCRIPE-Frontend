import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  });
});
