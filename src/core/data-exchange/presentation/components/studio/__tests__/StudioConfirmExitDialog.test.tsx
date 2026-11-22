import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudioConfirmExitDialog } from "../StudioConfirmExitDialog";

// Mock I18n provider
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    direction: "ltr",
    language: "en",
    t: (key: string) => {
      const dict: Record<string, string> = {
        "dataExchange.confirmExit.title": "Discard Unsaved Import Progress?",
        "dataExchange.confirmExit.description": "You have active spreadsheet inspect results and column mappings.",
        "dataExchange.confirmExit.keepEditing": "Keep Editing",
        "dataExchange.confirmExit.discardAndExit": "Discard & Exit",
      };
      return dict[key] || key;
    },
  }),
}));

describe("StudioConfirmExitDialog", () => {
  it("renders confirmation title and actions when open", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <StudioConfirmExitDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByTestId("studio-confirm-exit-dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard Unsaved Import Progress?")).toBeInTheDocument();
    expect(screen.getByTestId("studio-exit-cancel-btn")).toBeInTheDocument();
    expect(screen.getByTestId("studio-exit-confirm-btn")).toBeInTheDocument();
  });

  it("triggers onConfirm when Discard & Exit is clicked", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <StudioConfirmExitDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByTestId("studio-exit-confirm-btn"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers onCancel when Keep Editing is clicked", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <StudioConfirmExitDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByTestId("studio-exit-cancel-btn"));
    expect(onCancel).toHaveBeenCalled();
  });
});
