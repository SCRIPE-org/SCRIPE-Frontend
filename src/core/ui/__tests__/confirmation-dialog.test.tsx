import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "../confirmation-dialog";

describe("ConfirmationDialog", () => {
  it("renders destructive confirm button without primary AlertDialogAction accent class collision", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        variant="destructive"
        title="Delete Resource"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={onConfirm}
        onCancel={onCancel}
        data-testid="confirm-dialog"
        confirmButtonProps={{
          className: "custom-confirm",
          "data-testid": "confirm-btn",
        }}
        cancelButtonProps={{
          className: "custom-cancel",
          "data-testid": "cancel-btn",
        }}
      />
    );

    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();

    const confirmBtn = screen.getByTestId("confirm-btn");
    expect(confirmBtn).toHaveClass("bg-destructive");
    expect(confirmBtn).toHaveClass("border-destructive");
    expect(confirmBtn).toHaveClass("text-destructive-foreground");
    expect(confirmBtn).toHaveClass("min-w-20");
    expect(confirmBtn).toHaveClass("custom-confirm");
    expect(confirmBtn).not.toHaveClass("bg-nx-accent-fill");
    expect(confirmBtn).not.toHaveClass("border-nx-accent-fill");
    expect(confirmBtn).not.toHaveClass("text-nx-on-fill");

    const cancelBtn = screen.getByTestId("cancel-btn");
    expect(cancelBtn).toHaveClass("border-nx-line-hi");
    expect(cancelBtn).toHaveClass("custom-cancel");
    expect(cancelBtn).not.toHaveClass("bg-nx-accent-fill");
    expect(cancelBtn).not.toHaveClass("border-nx-accent-fill");

    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders default variant with primary accent button tokens", () => {
    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={vi.fn()}
        variant="default"
        title="Proceed"
        onConfirm={vi.fn()}
        confirmButtonProps={{ "data-testid": "default-confirm-btn" }}
      />
    );

    const confirmBtn = screen.getByTestId("default-confirm-btn");
    expect(confirmBtn).toHaveClass("bg-nx-accent-fill");
    expect(confirmBtn).toHaveClass("border-nx-accent-fill");
    expect(confirmBtn).toHaveClass("text-nx-on-fill");
    expect(confirmBtn).toHaveClass("min-w-20");
  });
});
