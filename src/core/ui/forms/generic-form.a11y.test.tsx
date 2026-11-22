// GenericForm's GenericSelect branches -- accessible-name coverage (Wave 2
// Step 2.2, Task 7b follow-up). Task 4's review (finding T1) and Task 7b's
// fix (see generic-select.tsx's `aria-label` prop doc comment and
// renderCustomFieldControl.tsx's Select branch) established that
// GenericSelect's trigger is a role="combobox" `<div>`, not a labelable HTML
// element -- a sibling `<Label htmlFor>` never computes an accessible name
// for it. That same root cause existed here too: none of this file's 4
// internal `select`/`searchable-select`/`server-select`/`multi-select`/`tree`
// GenericSelect usages passed `aria-label`, so every GenericForm-based form's
// select-family fields across the app were unlabeled for screen readers.
// These tests assert the real accessible name via `getByRole`'s `name`
// option -- the discriminating check that fails without the `aria-label`
// wiring and passes with it, same technique as
// renderCustomFieldControl.test.tsx.
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@core/ui/form";
import { Input } from "@core/ui/input";
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

// Radix primitives inside GenericSelect observe their trigger; jsdom has no
// ResizeObserver. Needed even for tests that never open the panel (Wave 2
// Step 2.2's renderCustomFieldControl.test.tsx hit the same gap).
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// cmdk calls scrollIntoView on the highlighted row as soon as an opened
// panel's option list mounts; jsdom has no implementation.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const OPTIONS: FieldConfig["options"] = [
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
];

describe("GenericForm GenericSelect accessible names", () => {
  it("labels a type: 'select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "priority", label: "Priority", type: "select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const trigger = screen.getByRole("combobox", { name: "Priority" });
    expect(trigger).toHaveAttribute("id", "priority");
  });

  it("labels a type: 'searchable-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "owner", label: "Owner", type: "searchable-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Owner" })).toBeInTheDocument();
  });

  it("labels a type: 'server-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "assignee", label: "Assignee", type: "server-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Assignee" })).toBeInTheDocument();
  });

  it("labels a type: 'multi-select' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "tags", label: "Tags", type: "multi-select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Tags" })).toBeInTheDocument();
  });

  it("labels a type: 'tree' field via aria-label", () => {
    const fields: FieldConfig[] = [
      { name: "category", label: "Category", type: "tree", treeData: [{ value: "a", label: "A" }] },
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
  });

  // Task 7b review, M2: FieldConfig["label"] is optional. Without the
  // `field.label ?? field.name` fallback, an undefined label silently drops
  // the accessible name entirely -- no error, no failing test unless one
  // specifically constructs a labelless field, as this one does.
  it("falls back the accessible name to field.name when label is undefined (M2)", () => {
    const fields: FieldConfig[] = [
      { name: "unlabeled_select", type: "select", options: OPTIONS } as FieldConfig,
    ];
    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole("combobox", { name: "unlabeled_select" })).toBeInTheDocument();
  });

  it("still opens the panel and reports a selection for a labeled select field (no regression)", () => {
    const onSubmit = vi.fn(async () => {});
    const fields: FieldConfig[] = [
      { name: "priority", label: "Priority", type: "select", options: OPTIONS },
    ];
    render(<GenericForm fields={fields} onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Priority" }));
    fireEvent.click(screen.getByRole("option", { name: "High" }));

    expect(screen.getByRole("combobox", { name: "Priority" })).toHaveTextContent("High");
  });
});

function HookOrderFormHarness() {
  const form = useForm({ defaultValues: { title: "" } });
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

describe("GenericForm & @core/ui/form Phase C accessibility & invariants", () => {
  it("renders <form noValidate> and links help + inline error via aria-describedby", async () => {
    const onSubmit = vi.fn(async () => {});
    const fields: FieldConfig[] = [
      {
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        description: "Work address only",
      },
    ];

    render(<GenericForm fields={fields} onSubmit={onSubmit} onCancel={() => {}} />);

    const form = document.querySelector("form");
    expect(form).toHaveAttribute("novalidate");

    const initialInput = screen.getByLabelText(/Email/);
    expect(initialInput.getAttribute("aria-describedby") ?? "").toContain("email-hint");
    expect(document.getElementById("email-hint")).toHaveTextContent("Work address only");

    fireEvent.submit(form!);

    await waitFor(() => {
      const input = screen.getByLabelText(/Email/);
      expect(input).toHaveAttribute("aria-invalid", "true");
      const describedBy = input.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain("email-error");
      expect(document.getElementById("email-error")).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("applies defaultValue to dynamically added fields without overwriting user edits", () => {
    const baseFields: FieldConfig[] = [{ name: "name", label: "Name", type: "text" }];
    const { rerender } = render(
      <GenericForm fields={baseFields} onSubmit={async () => {}} onCancel={() => {}} />
    );

    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Edited Value" } });

    const expandedFields: FieldConfig[] = [
      ...baseFields,
      { name: "code", label: "Code", type: "text", defaultValue: "AUTO-1" },
    ];
    rerender(<GenericForm fields={expandedFields} onSubmit={async () => {}} onCancel={() => {}} />);

    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Edited Value");
    expect((screen.getByLabelText("Code") as HTMLInputElement).value).toBe("AUTO-1");
  });

  it("renders react-hook-form Form/FormField cleanly with unconditional hook order", () => {
    render(<HookOrderFormHarness />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
  });

  it("wires DatePicker ARIA state and focuses its combobox on validation failure", async () => {
    const fields: FieldConfig[] = [
      {
        name: "kickoffDate",
        label: "Kickoff Date",
        type: "date",
        required: true,
        description: "Pick target kickoff date",
      },
    ];

    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const combobox = screen.getByRole("combobox", { name: /Kickoff Date/i });
    expect(combobox.getAttribute("aria-describedby") ?? "").toContain("kickoffDate-hint");

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(combobox).toHaveAttribute("aria-invalid", "true");
      expect(combobox.getAttribute("aria-describedby") ?? "").toContain("kickoffDate-error");
      expect(document.activeElement).toBe(combobox);
    });
  });

  it("wires ImageUploader ARIA attributes and focuses visible dropzone button on validation failure", async () => {
    const fields: FieldConfig[] = [
      {
        name: "avatar",
        label: "Avatar",
        type: "image",
        required: true,
        description: "PNG or JPG avatar",
        placeholder: "Upload avatar",
      },
    ];

    render(<GenericForm fields={fields} onSubmit={async () => {}} onCancel={() => {}} />);

    const dropzone = screen.getByRole("button", { name: /Avatar/i });
    expect(dropzone).toHaveAttribute("id", "avatar");
    expect(dropzone.getAttribute("aria-describedby") ?? "").toContain("avatar-hint");

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(dropzone).toHaveAttribute("aria-invalid", "true");
      expect(dropzone.getAttribute("aria-describedby") ?? "").toContain("avatar-error");
      expect(document.getElementById("avatar-error")).toBeInTheDocument();
      expect(document.activeElement).toBe(dropzone);
    });
  });
});
