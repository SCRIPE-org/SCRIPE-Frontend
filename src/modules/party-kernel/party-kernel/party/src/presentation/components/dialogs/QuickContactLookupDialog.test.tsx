import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuickContactLookupDialog } from "./QuickContactLookupDialog";

// Polyfill ResizeObserver for Radix Dialog in jsdom
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Polyfill scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const mockParties = [
  {
    id: "party-001",
    type: "Person",
    displayName: "Ahmed Al-Farsi",
    fullName: "Ahmed Mansoor Al-Farsi",
  },
  {
    id: "party-002",
    type: "Organization",
    displayName: "Saudi Logistics Co",
    legalName: "Saudi Logistics Closed Joint Stock Company",
  },
];

const mockLookupContacts = vi.fn();

vi.mock("../../../../../di", () => ({
  getPartyKernelContainer: () => ({
    partyRepository: {
      lookupContacts: mockLookupContacts,
      lookupPeople: vi.fn(),
      lookupOrganizations: vi.fn(),
    },
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "party.picker.findExisting": "Quick Contact Lookup",
        "party.picker.searchPlaceholder": "Search contacts by name...",
        "party.picker.typeFilterAll": "All Contacts",
        "party.picker.typeFilterPerson": "People",
        "party.picker.typeFilterOrg": "Organizations",
        "party.picker.noResults": "No contacts found",
        "party.picker.noResultsDesc": "Try adjusting your query or filter",
        "party.picker.searchError": "Unable to load contacts",
        "party.picker.retry": "Retry",
        "party.directory.viewProfile": "View Profile",
        "party.directory.totalParties": "contacts",
      };
      return translations[key] ?? key;
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

describe("QuickContactLookupDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLookupContacts.mockResolvedValue({
      items: mockParties,
      totalCount: mockParties.length,
    });
  });

  it("does not render dialog content when closed", () => {
    renderWithClient(
      <QuickContactLookupDialog
        open={false}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    expect(screen.queryByTestId("quick-contact-lookup-dialog")).not.toBeInTheDocument();
  });

  it("renders non-modal scrim and dialog content when open", async () => {
    const { container } = renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("quick-contact-lookup-dialog")).toBeInTheDocument();
    });

    // Check non-modal scrim existence (renders overlayScrimClasses with data-state="open")
    const scrim = document.querySelector("[data-state='open'].fixed.inset-0.z-overlay");
    expect(scrim).toBeInTheDocument();
    expect(scrim).toHaveAttribute("aria-hidden", "true");
  });

  it("renders search input, filter pills, and contact results", async () => {
    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ahmed Al-Farsi")).toBeInTheDocument();
      expect(screen.getByText("Saudi Logistics Co")).toBeInTheDocument();
    });

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Search contacts by name...");
    expect(screen.getByRole("button", { name: /all contacts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /people/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /organizations/i })).toBeInTheDocument();
  });

  it("filters contacts when type filter pill is clicked", async () => {
    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    const peopleBtn = await screen.findByRole("button", { name: /people/i });
    fireEvent.click(peopleBtn);

    await waitFor(() => {
      expect(mockLookupContacts).toHaveBeenCalledWith(
        expect.objectContaining({ type: "Person" })
      );
    });

    const orgsBtn = screen.getByRole("button", { name: /organizations/i });
    fireEvent.click(orgsBtn);

    await waitFor(() => {
      expect(mockLookupContacts).toHaveBeenCalledWith(
        expect.objectContaining({ type: "Organization" })
      );
    });
  });

  it("calls onSelectContact and closes dialog when a contact is clicked", async () => {
    const handleSelect = vi.fn();
    const handleOpenChange = vi.fn();

    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={handleOpenChange}
        onSelectContact={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ahmed Al-Farsi")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Ahmed Al-Farsi"));

    expect(handleSelect).toHaveBeenCalledWith("party-001");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("navigates options via keyboard ArrowDown/ArrowUp and selects on Enter", async () => {
    const handleSelect = vi.fn();
    const handleOpenChange = vi.fn();

    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={handleOpenChange}
        onSelectContact={handleSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ahmed Al-Farsi")).toBeInTheDocument();
    });

    const input = screen.getByRole("combobox");

    // Arrow down to highlight first contact
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant", "quick-lookup-opt-0");

    // Arrow down to highlight second contact
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant", "quick-lookup-opt-1");

    // Press Enter to select highlighted contact
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleSelect).toHaveBeenCalledWith("party-002");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes dialog when Escape key is pressed", async () => {
    const handleOpenChange = vi.fn();

    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={handleOpenChange}
        onSelectContact={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders empty state when no contacts match", async () => {
    mockLookupContacts.mockResolvedValueOnce({
      items: [],
      totalCount: 0,
    });

    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No contacts found")).toBeInTheDocument();
    });
  });

  it("renders error state with retry button on query failure", async () => {
    mockLookupContacts.mockRejectedValueOnce(new Error("Network connection lost"));

    renderWithClient(
      <QuickContactLookupDialog
        open={true}
        onOpenChange={vi.fn()}
        onSelectContact={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load contacts")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    mockLookupContacts.mockResolvedValueOnce({
      items: mockParties,
      totalCount: mockParties.length,
    });

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(screen.getByText("Ahmed Al-Farsi")).toBeInTheDocument();
    });
  });
});
