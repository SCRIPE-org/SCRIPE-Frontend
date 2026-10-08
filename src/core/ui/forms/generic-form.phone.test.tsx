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

// Radix primitives inside PhoneInput observe their trigger; jsdom has no ResizeObserver
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

describe("GenericForm PhoneInput integration", () => {
  it("renders PhoneInput component with accessible name for type: 'phone'", () => {
    const fields: FieldConfig[] = [{ name: "phoneNumber", label: "Phone Number", type: "phone" }];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const input = screen.getByRole("textbox", { name: "Phone Number" });
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");

    // The country select button exists
    const countryButton =
      input.closest(".PhoneInput")?.querySelector("button") ||
      screen.getByRole("button", {
        name: /(الولايات المتحدة|united states|search country|بحث عن دولة)/i,
      });
    expect(countryButton).toBeInTheDocument();
  });

  it("renders PhoneInput component for type: 'tel'", () => {
    const fields: FieldConfig[] = [{ name: "phoneNumber", label: "Telephone", type: "tel" }];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const input = screen.getByRole("textbox", { name: "Telephone" });
    expect(input).toBeInTheDocument();
  });

  it("pre-populates with existing international phone number and displays national digits", () => {
    const fields: FieldConfig[] = [{ name: "phoneNumber", label: "Phone Number", type: "phone" }];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ phoneNumber: "+201555186702" }}
        onSubmit={async () => {}}
        onCancel={() => {}}
      />
    );

    const input = screen.getByRole("textbox", { name: "Phone Number" }) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    // Egyptian mobile national number (formatted with spaces in input view)
    expect(input.value.replace(/\s+/g, "")).toContain("1555186702");

    // Egypt calling code +20 should be displayed in the button
    const countryButton =
      screen.queryByRole("button", { name: /(مصر|egypt)/i }) ||
      input.closest(".PhoneInput")?.querySelector("button");
    expect(countryButton).toBeInTheDocument();
    expect(countryButton).toHaveTextContent("+20");
  });

  it("submits the valid phone number to onSubmit callback", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const fields: FieldConfig[] = [
      { name: "username", label: "Username", type: "text" },
      { name: "phoneNumber", label: "Phone Number", type: "phone" },
    ];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ username: "admin_user", phoneNumber: "+201555186702" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "admin_user",
        phoneNumber: "+201555186702",
      })
    );
  });

  it("allows submitting when optional phone number is left empty", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const fields: FieldConfig[] = [
      { name: "username", label: "Username", type: "text" },
      { name: "phoneNumber", label: "Phone Number", type: "phone", required: false },
    ];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ username: "admin_user", phoneNumber: "" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "admin_user",
        phoneNumber: "",
      })
    );
  });

  it("blocks submission and displays error when phone number format is invalid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const fields: FieldConfig[] = [{ name: "phoneNumber", label: "Phone Number", type: "phone" }];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ phoneNumber: "+123" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("validation.invalidPhone")).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission and displays required error when required phone is blank", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const fields: FieldConfig[] = [
      { name: "phoneNumber", label: "Phone Number", type: "phone", required: true },
    ];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ phoneNumber: "" }}
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("validation.required")).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables input and country picker when readOnly is true", () => {
    const fields: FieldConfig[] = [{ name: "phoneNumber", label: "Phone Number", type: "phone" }];
    render(
      <GenericForm
        fields={fields}
        initialValues={{ phoneNumber: "+201555186702" }}
        onSubmit={async () => {}}
        onCancel={() => {}}
        readOnly={true}
      />
    );

    const input = screen.getByRole("textbox", { name: "Phone Number" });
    expect(input).toBeDisabled();

    const countryButton =
      screen.queryByRole("button", { name: /(مصر|egypt)/i }) ||
      input.closest(".PhoneInput")?.querySelector("button");
    expect(countryButton).toBeInTheDocument();
    expect(countryButton).toBeDisabled();
  });
});
