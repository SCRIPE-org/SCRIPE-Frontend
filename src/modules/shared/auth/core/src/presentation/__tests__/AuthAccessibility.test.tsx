import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { PasskeyManagementView } from "../views/PasskeyManagementView";

const mockPasskeyVm = vi.hoisted(() => ({
  passkeys: [
    {
      id: "pk-1",
      deviceName: "MacBook Pro",
      displayCreatedDate: "2026-11-01",
      displayLastUsedDate: "2026-11-10",
      isNeverUsed: false,
      isDiscoverable: true,
    },
  ],
  isLoading: false,
  listError: null,
  registerPasskey: vi.fn(),
  isRegistering: false,
  registrationError: null,
  clearRegistrationError: vi.fn(),
  deletePasskey: vi.fn(),
  isDeletingPasskey: false,
  startRename: vi.fn(),
  cancelRename: vi.fn(),
  confirmRename: vi.fn(),
  renamingId: null as string | null,
  renameValue: "",
  setRenameValue: vi.fn(),
  isRenaming: false,
  refetch: vi.fn(),
  isWebAuthnSupported: true,
}));

vi.mock("../viewmodels/usePasskeyManagementViewModel", () => ({
  usePasskeyManagementViewModel: () => mockPasskeyVm,
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

describe("PasskeyManagementView accessibility labels", () => {
  beforeEach(() => {
    mockPasskeyVm.renamingId = null;
    mockPasskeyVm.renameValue = "";
  });

  it("provides accessible labels for PasskeyManagementView rename and delete controls", () => {
    const { rerender } = render(<PasskeyManagementView />);
    expect(screen.getByRole("button", { name: "auth.passkey.rename" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "auth.passkey.delete" })).toBeInTheDocument();

    mockPasskeyVm.renamingId = "pk-1";
    mockPasskeyVm.renameValue = "Work Laptop";
    rerender(<PasskeyManagementView />);
    expect(screen.getByRole("textbox", { name: "auth.passkey.deviceNameLabel" })).toHaveValue(
      "Work Laptop"
    );
    expect(screen.getByRole("button", { name: "common.save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "common.cancel" })).toBeInTheDocument();
  });
});
