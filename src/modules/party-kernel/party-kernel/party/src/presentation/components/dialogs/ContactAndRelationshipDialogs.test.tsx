import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditContactDialog } from "./EditContactDialog";
import { AddRelationshipDialog } from "./AddRelationshipDialog";
import { ContactPoint } from "../../../../../contact-point/src/domain/entities/ContactPoint";

// Polyfill ResizeObserver for Radix Dialog in jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const mockPartyRepository = {
  lookupContacts: vi.fn().mockResolvedValue({
    items: [
      {
        id: "target-party-99",
        type: "Person",
        displayName: "Sami Al-Jaber",
        fullName: "Sami Al-Jaber",
      },
    ],
    totalCount: 1,
  }),
};

vi.mock("../../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: mockPartyRepository,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      if (key === "party.dialog.enterIdManually") return "Enter ID Manually";
      if (key === "party.dialog.usePicker") return "Search Directory";
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("EditContactDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const testContact = new ContactPoint({
    id: "cp-1",
    partyId: "party-1",
    type: "Phone",
    value: "+966500000000",
    isPrimary: true,
    createdAt: "2026-02-01T00:00:00Z",
  });

  it("populates existing contact values when opened", () => {
    renderWithClient(
      <EditContactDialog
        open={true}
        contact={testContact}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const input = document.getElementById("edit-contact-val") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("+966500000000");
  });

  it("submits updated contact value through onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    renderWithClient(
      <EditContactDialog
        open={true}
        contact={testContact}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />
    );

    const input = document.getElementById("edit-contact-val") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "+966512345678" } });

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        id: "cp-1",
        type: "Phone",
        value: "+966512345678",
        isPrimary: true,
      });
    });
  });

  it("validates empty value before submitting", async () => {
    const onSubmit = vi.fn();

    renderWithClient(
      <EditContactDialog
        open={true}
        contact={testContact}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const input = document.getElementById("edit-contact-val") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "   " } });

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("AddRelationshipDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows manual target ID input when toggled", async () => {
    const onSubmit = vi.fn().mockResolvedValue("rel-123");
    const onOpenChange = vi.fn();

    renderWithClient(
      <AddRelationshipDialog
        open={true}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
        defaultRelationshipType="Guardian"
      />
    );

    // Click toggle to manual ID input
    const toggleBtn = screen.getByText("Enter ID Manually");
    fireEvent.click(toggleBtn);

    // Verify manual text input is visible
    const input = document.getElementById("rel-target") as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "manual-target-id-456" } });

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        targetPartyId: "manual-target-id-456",
        relationshipType: "Guardian",
        validFrom: undefined,
        validTo: undefined,
      });
    });
  });

  it("blocks submission if target party is not selected or entered", async () => {
    const onSubmit = vi.fn();

    renderWithClient(
      <AddRelationshipDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission if target party equals current party (self-relationship)", async () => {
    const onSubmit = vi.fn();

    renderWithClient(
      <AddRelationshipDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        currentPartyId="party-self-123"
      />
    );

    // Toggle to manual input
    const toggleBtn = screen.getByText("Enter ID Manually");
    fireEvent.click(toggleBtn);

    const input = document.getElementById("rel-target") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "party-self-123" } });

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("A contact cannot have a relationship with itself.")).toBeInTheDocument();
  });
});
