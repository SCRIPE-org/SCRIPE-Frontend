import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InlineAddCustomFieldDialog } from "./InlineAddCustomFieldDialog";
import { getCustomFieldsContainer } from "../../../../di";

vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: vi.fn(),
}));
vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockReturnValue(true),
}));
// GenericForm calls usePermissions() (the plural, RBAC-context hook) directly
// and unconditionally — it throws outside a PermissionProvider, same reason
// generic-crud-view.customfields.test.tsx mocks this module.
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

// jsdom has no ResizeObserver — FIELDS includes a "select" field (Type), and
// Radix's Select primitive calls it (useSize) on mount. Without this stub the
// second test throws before the dialog ever renders.
if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe("InlineAddCustomFieldDialog", () => {
  const createMock = vi.fn().mockResolvedValue({ id: "new-def-id" });

  beforeEach(() => {
    createMock.mockClear();
    vi.mocked(getCustomFieldsContainer).mockReturnValue({
      customFieldRepository: { create: createMock },
    } as any);
  });

  it("does not render the trigger when the user lacks custom-fields.create", async () => {
    const { usePermission } = await import("@core/hooks/use-permission");
    vi.mocked(usePermission).mockReturnValueOnce(false);

    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={vi.fn()} />);

    expect(screen.queryByText(/add custom field/i)).not.toBeInTheDocument();
  });

  it("opens a dialog, submits with entityTypeKey pre-set, and calls onCreated on success", async () => {
    const onCreated = vi.fn();
    render(<InlineAddCustomFieldDialog entityTypeKey="party.person" onCreated={onCreated} />);

    fireEvent.click(screen.getByText(/add custom field/i));

    fireEvent.change(screen.getByLabelText(/key/i), { target: { value: "nationality" } });
    fireEvent.change(screen.getByLabelText(/label \(en\)/i), { target: { value: "Nationality" } });
    fireEvent.click(screen.getByText("common.save"));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ entityTypeKey: "party.person", key: "nationality", labelEn: "Nationality" })
      )
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});
