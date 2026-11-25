/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Checkbox } from "../checkbox";
import { Input, READ_ONLY_FIELD } from "../input";
import { Textarea } from "../textarea";
import { OtpInputField } from "../otp-input-field";
import { ImageUploader } from "../image-uploader";

if (typeof (globalThis as any).ResizeObserver === "undefined") {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    checkboxStyle: "default",
    inputStyle: "default",
    borderRadius: "default",
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr",
    language: "en",
  }),
}));

describe("Checkbox, Input, Textarea, and OtpInputField Phase C contracts", () => {
  it("renders Checkbox with >=3:1 resting border, high-contrast checked focus ring, and indeterminate glyph", () => {
    const { rerender } = render(<Checkbox aria-label="Accept terms" checked={false} onCheckedChange={() => {}} />);
    const cb = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(cb.className).toContain("border-nx-line-hi");
    expect(cb.className).toContain("data-[state=checked]:focus-visible:border-nx-on-fill");

    rerender(<Checkbox aria-label="Select partial" checked="indeterminate" onCheckedChange={() => {}} />);
    const indet = screen.getByRole("checkbox", { name: "Select partial" });
    expect(indet).toHaveAttribute("data-state", "indeterminate");
    expect(indet.querySelector("svg")).not.toBeNull();
  });

  it("differentiates editable, readOnly, invalid, and disabled Input and Textarea states", () => {
    render(
      <>
        <Input aria-label="Editable" />
        <Input aria-label="ReadOnly" readOnly defaultValue="locked" />
        <Input aria-label="Invalid" aria-invalid="true" />
        <Textarea aria-label="Notes" readOnly disabled />
      </>
    );

    const editable = screen.getByLabelText("Editable");
    const readonly = screen.getByLabelText("ReadOnly");
    const invalid = screen.getByLabelText("Invalid");
    const notes = screen.getByLabelText("Notes");

    expect(editable.className).toContain("border-nx-line-hi");
    expect(readonly.className).toContain(READ_ONLY_FIELD);
    expect(readonly).not.toBeDisabled();
    expect(invalid.className).toContain("aria-[invalid=true]:border-nx-danger");
    expect(notes.className).toContain("disabled:resize-none");
  });

  it("renders OtpInputField nexus and glass slots with >=3:1 borders and reduced-motion guards", () => {
    const { container, rerender } = render(<OtpInputField value="12" onChange={vi.fn()} />);
    const otpContainer = container.querySelector("[data-input-otp-container]") as HTMLElement | null;
    expect(otpContainer?.className ?? "").toContain("overflow-hidden");
    expect(otpContainer?.className ?? "").toContain("max-w-full");
    const slots = container.querySelectorAll("[data-otp-slot]");
    expect(slots).toHaveLength(6);
    expect(slots[0].className).toContain("w-9");
    expect(slots[0].className).toContain("bg-nx-accent-wash");
    expect(slots[3].className).toContain("border-nx-line-hi");
    expect(slots[3].className).toContain("motion-reduce:transition-none");

    rerender(<OtpInputField value="1" variant="glass" onChange={vi.fn()} />);
    const glassSlots = container.querySelectorAll<HTMLElement>("[data-otp-slot]");
    expect(glassSlots[2].style.border).toContain("rgba(255, 255, 255, 0.42)");
  });

  it("exposes id and forwarded ARIA props on ImageUploader dropzone trigger instead of hidden file input", async () => {
    const { container, rerender } = render(
      <ImageUploader
        id="avatar"
        name="avatar_file"
        aria-label="Profile Photo"
        aria-describedby="avatar-hint"
        onChange={vi.fn()}
      />
    );

    const dropzone = screen.getByRole("button", { name: "Profile Photo" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(dropzone).toHaveAttribute("id", "avatar");
    expect(dropzone).toHaveAttribute("aria-describedby", "avatar-hint");
    expect(dropzone.className).toContain("border-nx-line-hi");
    expect(dropzone.className).toContain("focus-visible:shadow-nx-focus");
    expect(dropzone.parentElement?.className ?? "").not.toContain("overflow-hidden");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(fileInput).not.toHaveAttribute("id");
    expect(fileInput).toHaveAttribute("name", "avatar_file");

    document.getElementById("avatar")?.focus();
    expect(dropzone).toHaveFocus();

    rerender(
      <ImageUploader
        id="avatar"
        name="avatar_file"
        value="https://example.com/avatar.png"
        aria-label="Profile Photo"
        aria-invalid={true}
        aria-describedby="avatar-error"
        onChange={vi.fn()}
      />
    );
    expect(dropzone).toHaveAttribute("aria-invalid", "true");
    expect(dropzone.className).toContain("border-nx-danger");
    await waitFor(() => expect(screen.getAllByRole("button")).toHaveLength(2));
    const removeButton = screen.getAllByRole("button").find((btn) => btn !== dropzone);
    expect(removeButton).toBeDefined();
    expect(dropzone.contains(removeButton!)).toBe(false);
    expect(removeButton!.contains(dropzone)).toBe(false);
  });
});
