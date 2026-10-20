import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CreatePersonDialog } from "./CreatePersonDialog";
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";

// Polyfill ResizeObserver for Radix Dialog in jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const mockPartyRepository = {
  addContactPoint: vi.fn(),
};

const mockContactPointRepository = {
  getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
  create: vi.fn(),
};

vi.mock("../../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: mockPartyRepository,
    contactPointRepository: mockContactPointRepository,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      if (key === "party.dialog.nameRequired") return "Full Name is required";
      if (key === "party.dialog.legalNameRequired") return "Legal Business Name is required";
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

describe("CreatePersonDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables submit button when full name is empty", () => {
    const onSubmit = vi.fn();
    render(<CreatePersonDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Full Name is required")).toBeInTheDocument();
  });

  it("submits person with phone, email, and idempotency key", async () => {
    const onSubmit = vi.fn().mockResolvedValue("party-person-123");
    const onOpenChange = vi.fn();

    render(<CreatePersonDialog open={true} onOpenChange={onOpenChange} onSubmit={onSubmit} />);

    const nameInput = document.getElementById("person-full-name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Amina Al-Hassan" } });

    const phoneInput = document.getElementById("person-phone") as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: "+966501112233" } });

    const emailInput = document.getElementById("person-email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "amina@example.com" } });

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const callArgs = onSubmit.mock.calls[0][0];
    expect(callArgs.fullName).toBe("Amina Al-Hassan");
    expect(callArgs.phone).toBe("+966501112233");
    expect(callArgs.email).toBe("amina@example.com");
    expect(callArgs.idempotencyKey).toBeDefined();
    expect(callArgs.idempotencyKey.length).toBeGreaterThan(0);
  });

  it("handles contact point failure by entering partial save state and retrying with derived key", async () => {
    const onSubmit = vi.fn().mockImplementation(async (params) => {
      params.onContactPointFailure?.(
        new Error("Network timeout on phone write"),
        "party-recovered-456"
      );
      return "party-recovered-456";
    });
    mockPartyRepository.addContactPoint.mockResolvedValue("cp-new-1");

    render(<CreatePersonDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    const nameInput = document.getElementById("person-full-name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Zaid Omar" } });

    const phoneInput = document.getElementById("person-phone") as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: "+966509990000" } });

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    // Dialog enters partial save state showing the recovered canonical Party ID
    await waitFor(() => {
      expect(screen.getByText("party-recovered-456")).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", { name: /retryAttachContact/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(mockPartyRepository.addContactPoint).toHaveBeenCalledWith(
        expect.objectContaining({
          partyId: "party-recovered-456",
          type: "Phone",
          value: "+966509990000",
          idempotencyKey: expect.stringMatching(/:phone$/),
        })
      );
    });
  });
});

describe("CreateOrganizationDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables submit button when legal name is empty", () => {
    const onSubmit = vi.fn();
    render(<CreateOrganizationDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).toBeDisabled();

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Legal Business Name is required")).toBeInTheDocument();
  });

  it("submits organization with legalName, phone, and idempotency key", async () => {
    const onSubmit = vi.fn().mockResolvedValue("org-party-789");
    render(<CreateOrganizationDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    const legalInput = document.getElementById("org-legal-name") as HTMLInputElement;
    fireEvent.change(legalInput, { target: { value: "Riyadh Stars LLC" } });

    const phoneInput = document.getElementById("org-phone") as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: "+966114445566" } });

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const callArgs = onSubmit.mock.calls[0][0];
    expect(callArgs.legalName).toBe("Riyadh Stars LLC");
    expect(callArgs.phone).toBe("+966114445566");
    expect(callArgs.idempotencyKey).toBeDefined();
  });

  it("submits organization with taxId when provided (C1.1)", async () => {
    const onSubmit = vi.fn().mockResolvedValue("org-party-tax-999");
    render(<CreateOrganizationDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />);

    const legalInput = document.getElementById("org-legal-name") as HTMLInputElement;
    fireEvent.change(legalInput, { target: { value: "Riyadh Falcons Academy LLC" } });

    const taxInput = document.getElementById("org-tax-id") as HTMLInputElement;
    fireEvent.change(taxInput, { target: { value: "300112233400003" } });

    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const callArgs = onSubmit.mock.calls[0][0];
    expect(callArgs.legalName).toBe("Riyadh Falcons Academy LLC");
    expect(callArgs.taxId).toBe("300112233400003");
  });
});
