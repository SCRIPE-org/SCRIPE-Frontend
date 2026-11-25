/**
 * Nested Sudo Modal Protection, Layering & Form State Preservation Tests
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SudoCancelledError, useSudoStore } from "@core/store/useSudoStore";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericForm } from "@core/ui/forms/generic-form";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@core/ui/popover";
import { Dialog, DialogContent } from "@core/ui/dialog";
import { SectionInfoPopover } from "../../../modules/shared/profile/core/src/presentation/components/SectionInfoPopover";
import { SudoVerificationModal } from "../../../modules/shared/profile/core/src/presentation/components/SudoVerificationModal";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    modalStyle: "centered",
    spacingSize: "default",
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    formStyle: "default",
    inputStyle: "default",
    checkboxStyle: "default",
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({ hasPermission: () => true }),
}));

vi.mock("../../../modules/shared/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel", () => ({
  useSudoViewModel: () => ({
    refreshStatus: vi.fn().mockResolvedValue({
      isElevated: false,
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      allowsPasswordFallback: true,
      availableMethods: ["password"],
    }),
    verifyWithPasskey: vi.fn(),
    verifyWithTotp: vi.fn(),
    verifyWithPassword: vi.fn(),
  }),
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

describe("Sudo modal z-layering & nested dialog state preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.setState({
      modalOpen: false,
      availableMethods: ["password"],
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      allowsPasswordFallback: true,
      isOnDemandChallenge: false,
      error: null,
    });
  });

  afterEach(() => {
    useSudoStore.setState({ modalOpen: false, error: null });
  });

  it("renders Sudo overlay, modal, and info popover strictly on custom z-sudo-* layers without base z-* collisions", async () => {
    useSudoStore.setState({
      modalOpen: true,
      availableMethods: ["password"],
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      allowsPasswordFallback: true,
      isOnDemandChallenge: true,
    });

    render(<SudoVerificationModal />);

    const dialog = await screen.findByTestId("sudo-verification-modal");
    expect(dialog.className).toContain("z-sudo-modal");
    expect(dialog.className).not.toMatch(/\bz-modal\b/);

    const scrim = document.querySelector("[data-radix-dialog-overlay], .z-sudo-overlay") ??
      Array.from(document.querySelectorAll("div")).find((el) =>
        el.className.includes("z-sudo-overlay")
      );
    expect(scrim).toBeTruthy();
    expect(scrim?.className).toContain("z-sudo-overlay");
    expect(scrim?.className).not.toMatch(/\bz-overlay\b/);

    // Verify z-sudo-popover renders above z-sudo-modal without colliding with z-popover
    render(
      <SectionInfoPopover
        i18nPrefix="profile.infoPopover.biometricSudo"
        contentClassName="z-sudo-popover"
        testId="sudo-info-trigger"
      />
    );
    fireEvent.click(screen.getByTestId("sudo-info-trigger"));

    const popoverEl = await screen.findByText("profile.infoPopover.biometricSudo.title");
    const popoverContainer = popoverEl.closest("[role='dialog'], [data-radix-popper-content-wrapper] > div");
    expect(popoverContainer?.className).toContain("z-sudo-popover");
    expect(popoverContainer?.className).not.toMatch(/\bz-popover\b/);

    // Also verify DialogContent & PopoverContent strip base z-* when explicit z-* is passed
    render(
      <Popover open={true}>
        <PopoverTrigger>trigger</PopoverTrigger>
        <PopoverContent className="z-sudo-popover" data-testid="custom-popover">
          body
        </PopoverContent>
      </Popover>
    );
    expect(screen.getByTestId("custom-popover").className).not.toMatch(/\bz-popover\b/);

    render(
      <Dialog open={true}>
        <DialogContent className="z-sudo-modal" data-testid="custom-dialog">
          content
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId("custom-dialog").className).not.toMatch(/\bz-modal\b/);
  });

  it("keeps GenericModal open while Sudo modal is active, constrains scrolling container, and avoids destructive server error banners in GenericForm on SudoCancelledError", async () => {
    const onOpenChange = vi.fn();
    const onConfirmOpenChange = vi.fn();
    useSudoStore.setState({ modalOpen: true });

    const { unmount } = render(
      <GenericModal open={true} onOpenChange={onOpenChange} title="Create Role">
        <GenericForm
          fields={[{ name: "nameEn", label: "Name (EN)", type: "text", required: true }]}
          initialValues={{ nameEn: "Venue Lead" }}
          onSubmit={async () => {
            throw new SudoCancelledError("Sudo verification was cancelled.");
          }}
          onCancel={vi.fn()}
        />
      </GenericModal>
    );

    const dialogPanel = screen.getByRole("dialog", { name: /Create Role/i });
    expect(dialogPanel.className).toContain("overflow-hidden");
    expect(dialogPanel.className).not.toContain("overflow-visible");

    // Outside click while Sudo modal is open must NOT dismiss GenericModal
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // Submitting a form whose onSubmit rejects with SudoCancelledError keeps field value and renders NO error alert banner
    const input = screen.getByDisplayValue("Venue Lead");
    fireEvent.change(input, { target: { value: "Venue Lead Edited" } });
    const submitBtn = screen.getByRole("button", { name: /common\.save/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeEnabled();
    });
    expect(screen.getByDisplayValue("Venue Lead Edited")).toBeInTheDocument();
    expect(screen.queryByText(/Sudo verification was cancelled/i)).toBeNull();

    // Once Sudo closes, GenericModal can close normally
    useSudoStore.setState({ modalOpen: false });
    fireEvent.click(screen.getByRole("button", { name: "common.close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    unmount();

    // ConfirmationDialog also ignores dismissal while Sudo modal is open
    useSudoStore.setState({ modalOpen: true });
    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={onConfirmOpenChange}
        title="Confirm Delete"
        onConfirm={vi.fn()}
        data-testid="guarded-confirm-dialog"
      />
    );
    fireEvent.keyDown(screen.getByTestId("guarded-confirm-dialog"), { key: "Escape" });
    expect(onConfirmOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("prevents AlertDialogAction synchronous auto-close when preventAutoClose is enabled and keeps dialog open on SudoCancelledError", async () => {
    const onOpenChange = vi.fn();
    let rejectFirst!: (reason?: unknown) => void;
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectFirst = reject;
          })
      )
      .mockImplementationOnce(async () => {
        onOpenChange(false);
      });

    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={onOpenChange}
        variant="destructive"
        title="Delete Sensitive Role"
        description="Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onConfirm}
        preventAutoClose={true}
        confirmButtonProps={{ "data-testid": "async-confirm-btn" }}
        cancelButtonProps={{ "data-testid": "async-cancel-btn" }}
      />
    );

    const confirmBtn = screen.getByTestId("async-confirm-btn");
    fireEvent.click(confirmBtn);

    // Must NOT close synchronously on click before async confirmation / Sudo settles
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("async-cancel-btn")).toBeDisabled();

    // Reject with SudoCancelledError -> dialog stays open & becomes interactive for retry
    rejectFirst(new SudoCancelledError("Sudo verification was cancelled."));
    await waitFor(() => {
      expect(screen.getByTestId("async-cancel-btn")).toBeEnabled();
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // Retry succeeds and parent explicitly closes dialog
    fireEvent.click(screen.getByTestId("async-confirm-btn"));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
