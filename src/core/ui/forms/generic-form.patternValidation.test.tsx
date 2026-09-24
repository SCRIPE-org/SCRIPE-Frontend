import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { GenericForm, type FieldConfig } from "./generic-form";

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

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

describe("GenericForm client-side pattern and API validation error handling", () => {
  it("enforces pattern validation and displays custom patternError", async () => {
    const fields: FieldConfig[] = [
      {
        name: "key",
        label: "Key",
        type: "text",
        required: true,
        pattern: "^[a-z][a-z0-9_]*$",
        patternError: "Key must start with a lowercase letter",
      },
    ];

    const onSubmit = vi.fn();

    render(
      <GenericForm
        fields={fields}
        initialValues={{ key: "123invalid" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Key must start with a lowercase letter")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("catches submission API error and maps field errors to form inputs", async () => {
    const fields: FieldConfig[] = [
      {
        name: "key",
        label: "Key",
        type: "text",
        required: true,
      },
    ];

    const onSubmit = vi.fn().mockRejectedValue({
      details: {
        title: "One or more validation errors occurred.",
        errors: {
          Key: ["A custom field with this key already exists."],
        },
      },
    });

    render(
      <GenericForm
        fields={fields}
        initialValues={{ key: "valid_key" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /save|حفظ/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(document.getElementById("key-error")).toHaveTextContent(
        "A custom field with this key already exists."
      );
    });
  });
});
