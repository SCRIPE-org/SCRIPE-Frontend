/**
 * PermissionModuleMatrix Unit Tests
 *
 * Validates:
 * 1. Rendering of module header and counts with @core/ui/button
 * 2. Accordion expansion toggle
 * 3. Scannable matrix table using @core/ui/table primitives
 * 4. Core action column headers, row select-all, and column select-all via onToggleGroup
 * 5. Individual cell checkbox toggling via onTogglePermission
 * 6. Non-CRUD permissions rendering in Additional Capabilities with category grouping
 * 7. Scope configuration trigger buttons and tooltip integration
 * 8. Custom scope / restricted fields indicators
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { en as coreEn } from "@core/locales/en";
import { en as rolesLocale } from "../../../locales/roles.en";
import { Permission, type PermissionCategoryGroup } from "@modules/identity/permissions";
import { PermissionModuleMatrix } from "./PermissionModuleMatrix";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

vi.mock("@modules/custom-fields/di", () => ({
  getCustomFieldsContainer: () => ({
    customFieldRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
      getEntityTypes: vi.fn().mockResolvedValue([]),
    },
  }),
}));

// Mock i18n
function translate(key: string, params?: Record<string, string | number>): string {
  const getNested = (obj: any, path: string) =>
    path.split(".").reduce((curr, seg) => curr?.[seg], obj);

  let val =
    getNested(rolesLocale, key) ||
    getNested(rolesLocale?.roleDetail, key) ||
    getNested(rolesLocale?.roles, key) ||
    getNested(rolesLocale?.role, key) ||
    getNested(coreEn, key) ||
    getNested(coreEn?.role, key);

  if (typeof val !== "string") val = key;
  if (params) {
    return val
      .replace(/\{\{(\w+)\}\}/g, (_: string, name: string) => String(params[name] ?? `{{${name}}}`))
      .replace(/\{(\w+)\}/g, (_: string, name: string) => String(params[name] ?? `{${name}}`));
  }
  return val;
}

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: translate,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));

// Mock settings provider for density
vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    spacingSize: "default",
    tableHover: "subtle",
  }),
}));

// Radix ResizeObserver mock
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

function renderMatrix(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

function makePerm(props: {
  id: string;
  resource: string;
  action: string;
  code: string;
  category: string;
  nameEn: string;
  module?: string;
}): Permission {
  return new Permission({
    id: props.id,
    resource: props.resource,
    action: props.action,
    code: props.code,
    category: props.category,
    nameEn: props.nameEn,
    module: props.module ?? "Identity",
    defaultScope: "tenant",
    displayOrder: 1,
  });
}

describe("PermissionModuleMatrix", () => {
  const permView = makePerm({
    id: "p1",
    resource: "roles",
    action: "view",
    code: "roles.view",
    category: "Roles",
    nameEn: "View Roles",
  });
  const permCreate = makePerm({
    id: "p2",
    resource: "roles",
    action: "create",
    code: "roles.create",
    category: "Roles",
    nameEn: "Create Roles",
  });
  const permUpdate = makePerm({
    id: "p3",
    resource: "roles",
    action: "update",
    code: "roles.update",
    category: "Roles",
    nameEn: "Update Roles",
  });
  const permDelete = makePerm({
    id: "p4",
    resource: "roles",
    action: "delete",
    code: "roles.delete",
    category: "Roles",
    nameEn: "Delete Roles",
  });
  const permSpecial = makePerm({
    id: "p5",
    resource: "roles",
    action: "assign_permissions",
    code: "roles.assign_permissions",
    category: "Roles",
    nameEn: "Assign Permissions",
  });

  const categories: PermissionCategoryGroup[] = [
    {
      category: "Roles",
      permissions: [permView, permCreate, permUpdate, permDelete, permSpecial],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders module header with title and counts", () => {
    const selected = new Set(["roles.view", "roles.create"]);
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={false}
        selectedPermissionCodes={selected}
        onToggleModule={vi.fn()}
        onTogglePermission={vi.fn()}
        onToggleGroup={vi.fn()}
      />
    );

    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/ 5")).toBeInTheDocument();
  });

  it("calls onToggleModule when module header is clicked", () => {
    const onToggleModule = vi.fn();
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={false}
        selectedPermissionCodes={new Set()}
        onToggleModule={onToggleModule}
        onTogglePermission={vi.fn()}
        onToggleGroup={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /Identity/i });
    fireEvent.click(button);
    expect(onToggleModule).toHaveBeenCalledTimes(1);
  });

  it("renders matrix table with core actions when expanded", () => {
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={true}
        selectedPermissionCodes={new Set(["roles.view"])}
        onToggleModule={vi.fn()}
        onTogglePermission={vi.fn()}
        onToggleGroup={vi.fn()}
      />
    );

    // Header label
    expect(screen.getByText(rolesLocale.roleDetail.resourceCategory)).toBeInTheDocument();

    // Core actions headers
    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    // Row category label
    expect(screen.getByText("Roles")).toBeInTheDocument();

    // Additional capabilities
    expect(screen.getByText(rolesLocale.roleDetail.additionalCapabilities)).toBeInTheDocument();
    expect(screen.getByText("Assign Permissions")).toBeInTheDocument();
    expect(screen.getByText("roles.assign_permissions")).toBeInTheDocument();
  });

  it("calls onTogglePermission when a cell checkbox is toggled", () => {
    const onTogglePermission = vi.fn();
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={true}
        selectedPermissionCodes={new Set()}
        onToggleModule={vi.fn()}
        onTogglePermission={onTogglePermission}
        onToggleGroup={vi.fn()}
      />
    );

    const viewCheckbox = screen.getByRole("checkbox", { name: "View Roles" });
    fireEvent.click(viewCheckbox);
    expect(onTogglePermission).toHaveBeenCalledWith("roles.view");
  });

  it("calls onToggleGroup with row permissions when row select-all is clicked", () => {
    const onToggleGroup = vi.fn();
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={true}
        selectedPermissionCodes={new Set()}
        onToggleModule={vi.fn()}
        onTogglePermission={vi.fn()}
        onToggleGroup={onToggleGroup}
      />
    );

    const rowCheckbox = screen.getByRole("checkbox", { name: "Roles" });
    fireEvent.click(rowCheckbox);
    expect(onToggleGroup).toHaveBeenCalledTimes(1);
    const passedPerms = onToggleGroup.mock.calls[0][0];
    expect(passedPerms.map((p: Permission) => p.code)).toEqual([
      "roles.view",
      "roles.create",
      "roles.update",
      "roles.delete",
    ]);
  });

  it("calls onToggleGroup with column permissions when column select-all is clicked", () => {
    const onToggleGroup = vi.fn();
    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={true}
        selectedPermissionCodes={new Set()}
        onToggleModule={vi.fn()}
        onTogglePermission={vi.fn()}
        onToggleGroup={onToggleGroup}
      />
    );

    // Tooltip label for View column toggle
    const viewColCheckbox = screen.getByRole("checkbox", {
      name: translate("roleDetail.toggleColumnTooltip", { action: "View", module: "Identity" }),
    });
    fireEvent.click(viewColCheckbox);
    expect(onToggleGroup).toHaveBeenCalledTimes(1);
    const passedPerms = onToggleGroup.mock.calls[0][0];
    expect(passedPerms.map((p: Permission) => p.code)).toEqual(["roles.view"]);
  });

  it("shows scope indicator and opens dialog when onUpdateConfig is provided and permission is selected", () => {
    const onUpdateConfig = vi.fn();
    const assignments = new Map<string, PermissionAssignmentJson>([
      [
        "roles.view",
        {
          permissionId: "p1",
          scopeOverride: "tenant",
          restrictedFields: ["salary", "ssn"],
        },
      ],
    ]);

    renderMatrix(
      <PermissionModuleMatrix
        module="Identity"
        categories={categories}
        isExpanded={true}
        selectedPermissionCodes={new Set(["roles.view"])}
        assignments={assignments}
        onToggleModule={vi.fn()}
        onTogglePermission={vi.fn()}
        onToggleGroup={vi.fn()}
        onUpdateConfig={onUpdateConfig}
      />
    );

    // Look for the scope button on the selected cell
    const scopeBtn = screen.getByRole("button", {
      name: /View Roles — Scope Override: Tenant Level \(2 restricted fields\)/i,
    });
    expect(scopeBtn).toBeInTheDocument();

    // Click opens config dialog
    fireEvent.click(scopeBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
